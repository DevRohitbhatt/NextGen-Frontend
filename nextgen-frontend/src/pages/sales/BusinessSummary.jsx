import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import businessSummary from '../../assets/introJSSteps/businessSummary';
import {
	Dropdown,
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const BusinessSummary = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [businessSummaryData, setBusinessSummaryData] = useState([]);
	const [columns, setColumns] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Business Summary Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [selectedToDate, setSelectedToDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [DOWType, setDOWType] = useState('All');
	const [salesType, setSalesType] = useState('Net Sales');
	const [summaryBy, setSummaryBy] = useState('Day');
	const summaryByOptions = [{ name: 'Day' }, { name: 'Unit' }];
	const salesTypeOptions = [{ name: 'Net Sales' }, { name: 'Gross Sales' }];
	const DOWTypeOptions = [
		{ name: 'All' },
		{ name: 'Sunday' },
		{ name: 'Monday' },
		{ name: 'Tuesday' },
		{ name: 'Wednesday' },
		{ name: 'Thursday' },
		{ name: 'Friday' },
		{ name: 'Saturday' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: businessSummary(),
		initialStep: 0,
		stepsEnabled: false,
	});

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	//Default date get
	const getDefaultDates = async () => {
		try {
			setIsLoading(true);
			const getData = {
				url: 'getCurrentPeriodDates',
				urlParams: {
					companyId: companyID,
				},
			};

			const result = await getCall(getData, false);
			if (result?.data?.weekMaxDate) {
				const maxDate = new Date(result?.data?.weekMaxDate);
				const minDate = new Date(result?.data?.weekMinDate);
				setSelectedFromDate(minDate);
				setSelectedToDate(maxDate);
			}
		} catch (error) {
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getDefaultDates();
	}, []);

	const fetchBusinessSummaryReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'businessSummary',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					DOW: DOWTypeOptions.findIndex((option) => option.name === DOWType),
					summaryBy,
					salesType: salesType === 'Net Sales' ? 'SalesNet' : 'SalesGross',
				},
			};

			const result = await getCall(getData);

			if (result.data.length === 0) {
				setBusinessSummaryData([]);
			} else {
				const newData = result.data.map((data) => {
					let updatedData;

					updatedData = {
						...data,
						...Object.fromEntries(
							Object.entries(data.dateValues).map(([key, value]) => [
								key,
								Number.isInteger(value) ? value : value.toFixed(2),
							])
						),
						total: Number(
							Object.values(data.dateValues)
								.reduce((acc, curr) => acc + curr, 0)
								.toFixed(2)
						),
					};

					delete updatedData.dateValues;
					return updatedData;
				});

				// Calculate the total for Variable Labor %, Check Average and Food Cost %
				newData.forEach((data) => {
					if (
						data.description === 'Variable Lbr %' ||
						data.description === 'Check Average' ||
						data.description === 'Food Cost %'
					) {
						const variableLabor = newData.find((item) => item.description === 'Variable Labor');
						const foodCostPct = newData.find((item) => item.description === 'Food Cost %');
						const netSales = newData.find((item) => item.description === salesType);
						const transactions = newData.find((item) => item.description === 'Transactions');
						if (variableLabor && netSales && data.description === 'Variable Lbr %') {
							data.total = ((variableLabor.total / netSales.total) * 100).toFixed(2) + ' %';
							Object.keys(data)
								.filter((key) => !['description', 'total'].includes(key))
								.forEach((key) => {
									data[key] = Number(data[key]).toFixed(2).toLocaleString('en-US') + ' %';
								});
						} else if (data.description === 'Check Average') {
							data.total = (netSales.total / transactions.total).toFixed(2);
						} else if (foodCostPct && data.description === 'Food Cost %') {
							data.total =
								(
									foodCostPct.total /
									Object.keys(data).filter((key) => !['description', 'total'].includes(key)).length
								).toFixed(2) + ' %';
							Object.keys(data)
								.filter((key) => !['description', 'total'].includes(key))
								.forEach((key) => {
									data[key] = Number(data[key]).toFixed(2).toLocaleString('en-US') + ' %';
								});
						}
					}
					return data;
				});

				// Generate the columns for the table
				const generatedColumns = [
					columnHelper.accessor('description', {
						id: 'description',
						header: 'Description',
						size: 120,
					}),
					columnHelper.accessor('total', {
						id: 'total',
						header: 'Total',
						cell: ({ getValue }) => getValue(),
						size: 120,
					}),
					...Object.keys(newData[0])
						.filter((key) => !['description', 'total'].includes(key))
						.map((item) =>
							columnHelper.accessor(item, {
								id: item,
								header: summaryBy === 'Day' ? dateFormat(item, 'dddd mm/dd/yy') : item,
								dataType: 'number',
								cell: ({ getValue }) =>
									typeof getValue() === 'string' && getValue().includes('%')
										? getValue()
										: Number(getValue()),
								size: summaryBy === 'Day' ? 90 : 120,
							})
						),
				];

				setColumns(generatedColumns);
				setBusinessSummaryData(newData);
			}
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting business summary report data: ', error);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleSummaryByChange = (option) => {
		setSummaryBy(option);
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!businessSummaryData || businessSummaryData.length === 0) {
			console.error('Business Summary data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Business Summary',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: generateBody(),
		};

		PdfBuilder(pdfData);
	};

	const generateBody = () => {
		const rowsPerTable = 28;
		const totalRows = businessSummaryData.length;
		const body = [];

		// Loop through the data and create tables
		for (let i = 0; i < totalRows; i += rowsPerTable) {
			const chunkedColumns = [];
			for (let j = 0; j < columns.length; j += 13) {
				chunkedColumns.push(columns.slice(j, j + 13));
			}
			chunkedColumns.forEach((columnChunk) => {
				body.push({
					type: 'table/SeperatePage',
					widths: columnChunk.map(() => 'auto'),
					dataTypes: columnChunk.map((column) => column.dataType),
					data: {
						columnHeaders: columnChunk.map((column) => column.header),
						rows: businessSummaryData.slice(i, i + rowsPerTable).map((row) =>
							columnChunk.map((column) => ({
								value:
									typeof row[column.id] === 'string' &&
									(row[column.id].includes('%') || column.id === 'description')
										? row[column.id]
										: Number(row[column.id]).toLocaleString('en-US'),
								cellType: '',
								columnName: column.header,
							}))
						),
					},
				});
			});
		}

		return body;
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = columns.map((column) => column.header);
		const csvData = businessSummaryData.map((row) =>
			columns
				.map((column) =>
					typeof row[column.id] === 'string' && (row[column.id].includes('%') || column.id === 'description')
						? `"${row[column.id]}"`
						: `"${Number(row[column.id]).toLocaleString('en-US')}"`
				)
				.join(',')
		);

		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'businessSummary.csv');
		tempLink.click();
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: '',
				columns: columns.map((column) => ({
					name: column.header,
					filterButton: true,
				})),
				data: businessSummaryData.map((row) =>
					columns.map((column) =>
						typeof row[column.id] === 'string' &&
						(row[column.id].includes('%') || column.id === 'description')
							? row[column.id]
							: Number(row[column.id]).toLocaleString('en-US')
					)
				),
			},
		];

		const filename = `businessSummary_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Business Summary';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={businessSummaryData} />;

	return (
		<>
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Business Summary</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center'>
						<UnitSelector
							companyId={companyID}
							alignmentId={alignmentID}
							memberID={selectedUnit}
							memberName={selectedUnitName}
							includeAreas={true}
							setMemberName={setSelectedUnitName}
							onClick={() => setUnitShowModal(true)}
						/>
						<DateSelector
							toDate={selectedToDate}
							fromDate={selectedFromDate}
							isDateRange={true}
							onClick={() => setShowDateModal(true)}
							extraClass={'w-[219px]'}
						/>
						<div className='w-44 DOWType-selector'>
							<Dropdown
								title='DOW'
								options={DOWTypeOptions}
								selectedOption={DOWType}
								onOptionChange={(option) => setDOWType(option)}
							/>
						</div>
						<div className='w-40 ml-2 salesType-selector'>
							<Dropdown
								title='Sales Type'
								options={salesTypeOptions}
								selectedOption={salesType}
								onOptionChange={(option) => setSalesType(option)}
							/>
						</div>
						<div className='ml-2 w-36 summaryBy-selector'>
							<Dropdown
								title='Summary by'
								options={summaryByOptions}
								selectedOption={summaryBy}
								onOptionChange={handleSummaryByChange}
							/>
						</div>
						<div className='run-button' onClick={fetchBusinessSummaryReport}>
							<div className='py-3 ml-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
								Run
							</div>
						</div>
					</div>
					<div>
						<ExportOptions
							includePDF={true}
							handlePDFClick={handlePDFClick}
							includeCSV={true}
							handleCSVClick={handleCSVClick}
							includeExcel={true}
							handleExcelClick={handleExcelClick}
							includeHelp={true}
							handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
						/>
					</div>
				</header>

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						{!isLoading &&
							(businessSummaryData.length > 0 ? (
								<div className='paged-table'>{Table}</div>
							) : !selectedUnit ? (
								<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
							) : (
								<div className='mt-10 text-xl font-medium text-center'>No data available</div>
							))}
					</div>
				)}

				<div>
					<UnitModal
						unitData={unitsAndAreasList}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showModal}
						includeAreas={true}
						handleClose={() => {
							setUnitShowModal(false);
						}}
						handleUnitSelection={handleUnitSelection}
					/>
					<CalendarModal
						handleClose={() => setShowDateModal(false)}
						modalOpen={showDateModal}
						isDateRange={true}
						handleDateSelection={handleDateSelection}
						handleFromDateChange={(fromDate) => setSelectedFromDate(fromDate)}
						handleToDateChange={(toDate) => setSelectedToDate(toDate)}
						selectedFromDate={selectedFromDate}
						selectedToDate={selectedToDate}
					/>
				</div>
			</div>
		</>
	);
};

export default BusinessSummary;
