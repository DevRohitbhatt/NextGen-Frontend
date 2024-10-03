import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
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
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [businessSummaryData, setBusinessSummaryData] = useState([]);
	const [columns, setColumns] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Inventory Transfer Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [DOWType, setDOWType] = useState('All');
	const [salesType, setSalesType] = useState('Net Sales');
	const [summaryBy, setSummaryBy] = useState('Day');
	const summaryByOptions = [{ name: 'Day' }, { name: 'Unit' }];
	const salesTypeOptions = [{ name: 'Net Sales' }, { name: 'Gross Sales' }];
	const DOWTypeOptions = [
		{ name: 'All' },
		{ name: 'Monday' },
		{ name: 'Tuesday' },
		{ name: 'Wednesday' },
		{ name: 'Thursday' },
		{ name: 'Friday' },
		{ name: 'Saturday' },
		{ name: 'Sunday' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: businessSummary(),
		initialStep: 0,
		stepsEnabled: false,
	});

	useEffect(() => {
		// Fetch initial data
		if (!selectedUnit) {
			let parameters = decodeURIComponent(window.location.search.replace('?data=', ''));
			if (parameters) {
				parameters = JSON.parse(parameters);
				setCompanyId(parameters.CompanyId);
				setAlignmentId(parameters.AlignmentId);
				localStorage.setItem('companyId', parameters.CompanyId);
				localStorage.setItem('alignmentId', parameters.AlignmentId);
				fetchData(parameters.CompanyID, parameters.AlignmentId);
			} else if (localStorage.getItem('groupOrUnitAccess')) {
				setCompanyId(parseInt(localStorage.getItem('companyId')));
				setAlignmentId(parseInt(localStorage.getItem('alignmentId')));
				fetchData(localStorage.getItem('companyId'), localStorage.getItem('alignmentId'));
			} else {
				console.log('testing mode');
				setCompanyId(1021);
				setAlignmentId(1110);
				setMemberId(5199);
				setSelectedUnit(0);
				fetchData(1021, 1110, 5199);
			}
		} else {
			setErrorMessage('There was an issue loading your orders, please try again later.');
		}
	}, []);

	const fetchData = async (companyId, alignmentId, selectedUnit) => {
		setIsLoading(true);
		await Promise.all([fetchUnits(companyId, alignmentId, selectedUnit)]);
		setIsLoading(false);
	};

	// Fetching Units and Areas
	const fetchUnits = async (companyId, alignmentId, memberId) => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'unitsAndArea',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: memberId,
				},
			};

			const result = await getCall(getData);
			setUnitsAndAreasList(result.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your units, please try again later.');
			console.error('Error getting units: ', error);
		}
	};

	// Function to get the voids report
	const handleBusinessSummary = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'businessSummary',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					DOW:
						DOWType === 'All'
							? 0
							: DOWType === 'Sunday'
							? 1
							: DOWType === 'Monday'
							? 2
							: DOWType === 'Tuesday'
							? 3
							: DOWType === 'Wednesday'
							? 4
							: DOWType === 'Thursday'
							? 5
							: DOWType === 'Friday'
							? 6
							: 7,
					summaryBy: summaryBy,
					salesType: salesType === 'Net Sales' ? 'SalesNet' : 'SalesGross',
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((data) => {
				let updatedData;

				updatedData = {
					...data,
					...Object.fromEntries(
						Object.entries(data.dateValues).map(([key, value]) => [key, value.toFixed(2)])
					),
					total: Number(
						Object.values(data.dateValues)
							.reduce((acc, curr) => acc + curr, 0)
							.toFixed(2)
					),
				};

				// Format the Variable Labor % and Food Cost %
				if (data.description === 'Variable Lbr %' || data.description === 'Food Cost %') {
					Object.keys(updatedData).forEach((key) => {
						if (key !== 'description') {
							updatedData[key] = `${Number(updatedData[key]).toFixed(2)} %`;
						}
					});
				}
				delete updatedData.dateValues;
				return updatedData;
			});

			// Calculate the Variable Labor % and Check Average
			newData.forEach((data) => {
				if (data.description === 'Variable Lbr %' || data.description === 'Check Average') {
					const variableLabor = newData.find((item) => item.description === 'Variable Labor');
					const checkAverage = newData.find((item) => item.description === 'Check Average');
					const netSales = newData.find((item) => item.description === 'Net Sales');
					if (variableLabor && netSales) {
						data.total = ((variableLabor.total / netSales.total) * 100).toFixed(2) + ' %';
					} else if (checkAverage && netSales) {
						data.total = ((checkAverage.total / netSales.total) * 100).toFixed(2);
					}
				}
				return data;
			});

			// Generate the columns for the table
			const generatedColumns = [
				columnHelper.accessor('description', {
					id: 'description',
					header: 'Description',
				}),
				columnHelper.accessor('total', {
					id: 'total',
					header: 'Total',
					cell: ({ getValue }) => getValue().toLocaleString('en-US'),
				}),
				...Object.keys(newData[0])
					.filter((key) => !['description', 'total'].includes(key))
					.map((item) =>
						columnHelper.accessor(item, {
							id: item,
							header: summaryBy === 'Day' ? dateFormat(item, 'dddd mm/dd/yy') : item,
							dataType: 'number',
							cell: ({ getValue }) => getValue().toLocaleString('en-US'),
							size: summaryBy === 'Day' ? 100 : 150,
						})
					),
			];

			setColumns(generatedColumns);
			setBusinessSummaryData(newData);
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
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
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
		const rowsPerTable = 28; // Define how many rows you want per table
		const totalRows = businessSummaryData.length; // Get total number of rows
		const body = []; // Initialize the body array

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
									typeof row[column.id] === 'number'
										? row[column.id].toLocaleString('en-US')
										: row[column.id],
								cellType: '',
								columnName: column.header,
							}))
						),
					},
				});
			});
		}

		// Now the `body` array contains all the tables for the report
		return body;
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = columns.map((column) => column.header);
		const csvData = businessSummaryData.map((row) =>
			columns
				.map((column) =>
					typeof row[column.id] === 'number'
						? `"${row[column.id].toLocaleString('en-US')}"`
						: `"${row[column.id]}"`
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
				name: `Business Summary | ${salesType} | ${DOWType} | ${summaryBy}`,
				columns: columns.map((column) => ({ name: column.header, filterButton: true })),
				data: businessSummaryData.map((row) =>
					columns.map((column) =>
						typeof row[column.id] === 'number' ? row[column.id].toLocaleString('en-US') : row[column.id]
					)
				),
			},
		];

		const filename = 'businessSummary';
		const spreadSheetTitle = 'Business Summary';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={businessSummaryData} />;

	return (
		<>
			<Loader loading={isLoading} />
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Business Summary</h2>
				<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyId={companyId}
							alignmentId={alignmentId}
							memberId={selectedUnit}
							memberName={selectedUnitName}
							includeAreas={true}
							setMemberName={setselectedUnitName}
							onClick={() => setUnitShowModal(true)}
						/>
						<DateSelector
							toDate={selectedToDate}
							fromDate={selectedFromDate}
							isDateRange={true}
							onClick={() => setShowDateModal(true)}
						/>
						<div className='w-44 DOWType-selector'>
							<Dropdown
								title='DOW'
								options={DOWTypeOptions}
								selectedOption={DOWType}
								onOptionChange={(option) => setDOWType(option)}
							/>
						</div>
						<div className='w-40 salesType-selector'>
							<Dropdown
								title='Sales Type'
								options={salesTypeOptions}
								selectedOption={salesType}
								onOptionChange={(option) => setSalesType(option)}
							/>
						</div>
						<div className='w-36 summaryBy-selector'>
							<Dropdown
								title='Summary by'
								options={summaryByOptions}
								selectedOption={summaryBy}
								onOptionChange={(option) => setSummaryBy(option)}
							/>
						</div>
						<div className='run-button' onClick={handleBusinessSummary}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
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
					!isLoading &&
					(businessSummaryData.length > 0 ? (
						<div className='paged-table'>{Table}</div>
					) : !selectedUnit ? (
						<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
					) : (
						<div className='mt-10 text-xl font-medium text-center'>No data available</div>
					))
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
