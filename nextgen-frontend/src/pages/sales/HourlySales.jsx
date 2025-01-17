import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import hourlySales from '../../assets/introJSSteps/hourlySales';
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
import { formattingData, formattingDataWithoutDollr } from '../../functions/formatingCurrency';

const columnHelper = createColumnHelper();

const HourlySales = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [hourlySalesData, setHourlySalesData] = useState([]);
	const [renderCount, setRenderCount] = useState(0); // Controls re-render
	const [columns, setColumns] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Hourly Sales Report, please try again later.'
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
	const [reportType, setReportType] = useState('Hour and Day');
	const [salesType, setSalesType] = useState('Net Sales');
	const [DOWType, setDOWType] = useState('All');
	const [viewBy, setViewBy] = useState('Hour');
	const [isSalesEditable, setIsSalesEditable] = useState(true);
	const [isDOWEditable, setIsDOWEditable] = useState(false);
	const [isViewByEditable, setIsViewByEditable] = useState(true);
	const reportTypeOptions = [{ name: 'Hour and Day' }, { name: 'Unit' }, { name: 'Unit, Hour and Day' }];
	const salesTypeOptions = [{ name: 'Net Sales' }, { name: 'Gross Sales' }, { name: 'Transaction' }];
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
	const [viewByOptions, setViewByOptions] = useState([{ name: 'Hour' }, { name: 'Half-Hour' }, { name: 'Qtr-Hour' }]);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: hourlySales(),
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

	useEffect(() => {
		if (renderCount === 0) {
			setRenderCount(1);
		}
	}, [renderCount]);

	//Default date get
	const getDefaultDates = async () => {
		try {
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
			console.error('Error getting default dates: ', error);
		}
	};

	useEffect(() => {
		getDefaultDates();
	}, []);

	const fetchHourlySalesReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);

			const getData = {
				url: 'hourlySales',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					reportType: reportType === 'Hour and Day' ? 1 : reportType === 'Unit' ? 2 : 3,
					sumType:
						viewBy === 'Hour'
							? 'HOUR'
							: viewBy === 'Half-Hour'
							? 'HALF-HOUR'
							: viewBy === 'Qtr-Hour'
							? 'QTR-HOUR'
							: viewBy === 'Sum'
							? 'SUM'
							: 'AVG',
					salesType:
						salesType === 'Net Sales'
							? 'SalesNet'
							: salesType === 'Gross Sales'
							? 'SalesGross'
							: 'Transactions',
					DOW:
						DOWType === 'All'
							? '1234567'
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
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((data) => {
				const updatedData = {
					...data,
					Date: new Date(data.Date).toLocaleDateString('en-CA'),
					Avg: data.Total / Object.keys(data).filter((key) => /^\d{2}\/\d{2}\/\d{4}$/.test(key)).length,
				};

				Object.keys(data).forEach((key) => {
					if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) {
						let currentDate = new Date(selectedFromDate);
						while (currentDate <= selectedToDate) {
							const formattedDate = dateFormat(currentDate, 'mm/dd/yyyy');
							updatedData[formattedDate] = data[formattedDate] || 0;
							currentDate.setDate(currentDate.getDate() + 1); // Increment the date
						}
					}
				});

				updatedData.HoursSales =
					data.SalesYN01 +
					data.SalesYN02 +
					data.SalesYN03 +
					data.SalesYN04 +
					data.SalesYN05 +
					data.SalesYN06 +
					data.SalesYN07 +
					data.SalesYN08 +
					data.SalesYN09 +
					data.SalesYN10 +
					data.SalesYN11 +
					data.SalesYN12 +
					data.SalesYN13 +
					data.SalesYN14 +
					data.SalesYN15 +
					data.SalesYN16 +
					data.SalesYN17 +
					data.SalesYN18 +
					data.SalesYN19 +
					data.SalesYN20 +
					data.SalesYN21 +
					data.SalesYN22 +
					data.SalesYN23 +
					data.SalesYN24;

				return updatedData;
			});

			// Define readable hour labels
			const hourLabels = Array.from({ length: 24 }, (_, i) =>
				new Date(0, 0, 0, i).toLocaleTimeString('en-US', {
					hour: 'numeric',
					hour12: true,
				})
			);

			const generatedColumns = [
				...(reportType === 'Hour and Day'
					? [
							columnHelper.accessor('Hour', {
								id: 'Hour',
								header: 'Hour',
								pinDirection: 'left',
								footer: 'Summary:',
								size: 100,
							}),
					  ]
					: [
							columnHelper.accessor('UnitName', {
								id: 'UnitName',
								header: 'Unit Name',
								cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
								pinDirection: 'left',
								size: 180,
								footer: reportType === 'Unit, Hour and Day' ? null : 'Summary:',
							}),
					  ]),

				...(reportType === 'Hour and Day' && viewBy !== 'Hour'
					? [
							columnHelper.accessor('Mins', {
								id: 'Mins',
								header: 'Mins',
								pinDirection: 'left',
							}),
					  ]
					: []),

				...(reportType === 'Unit, Hour and Day'
					? [
							columnHelper.accessor('Date', {
								id: 'Date',
								header: 'Date',
								pinDirection: 'left',
							}),
							columnHelper.accessor('HoursSales', {
								id: 'HoursSales',
								header: 'Hours w/Sales',
								pinDirection: 'left',
							}),
					  ]
					: []),

				columnHelper.accessor('Total', {
					id: 'Total',
					header: 'Total',
					pinDirection: 'left',
					cell: ({ getValue }) => (
						salesType === 'Transaction' ? formattingDataWithoutDollr(parseFloat(getValue())) : formattingData(parseFloat(getValue()))
					),
					size: 100,
					footer: ({ table }) =>
						reportType === 'Unit, Hour and Day' ? null : (
							<div className='text-center'>
								{`${
									salesType === 'Transaction' ?
										formattingDataWithoutDollr(parseFloat((table
											.getRowModel()
											.rows.reduce((acc, row) => acc + row.original.Total, 0))))
										:
										formattingData(parseFloat((table
											.getRowModel()
											.rows.reduce((acc, row) => acc + row.original.Total, 0))))
								}`}
							</div>
						),
				}),
				...(reportType === 'Hour and Day'
					? [
							columnHelper.accessor('Avg', {
								id: 'Avg',
								header: 'Avg',
								pinDirection: 'left',
								cell: ({ getValue }) => (
									salesType === 'Transaction' ? formattingDataWithoutDollr(parseFloat(getValue())) : formattingData(parseFloat(getValue()))
								),
								size: 100,
								footer: ({ table }) => (
									<div className='text-center'>
										{`${
											salesType === 'Transaction' ?
												formattingDataWithoutDollr(parseFloat((table
													.getRowModel()
													.rows.reduce((acc, row) => acc + row.original.Avg, 0))))
												:
												formattingData(parseFloat((table
													.getRowModel()
													.rows.reduce((acc, row) => acc + row.original.Avg, 0))))
										}`}
									</div>
								),
							}),
					  ]
					: []),
				...Object.keys(newData[0] || {})
					.filter(
						(key) =>
							!['UnitID', 'UnitName', 'Date', 'Total', 'HoursSales', 'Hour', 'Avg', 'Mins'].includes(key)
					)
					.filter((key) =>
						reportType !== 'Hour and Day' ? key.startsWith('Hour') || key.startsWith('SalesYN') : !null
					) // Filter hour and SalesYN keys
					.map((item) =>
						columnHelper.accessor(item, {
							id: item,
							header: item.startsWith('SalesYN')
								? `Sales YN${item.replace('SalesYN', '')}`
								: item.startsWith('Hour')
								? hourLabels[parseInt(item.replace('Hour', ''), 10)]
								: /\d{2}\/\d{2}\/\d{4}/.test(item)
								? item.replace(/\//g, '-')
								: item,
							dataType: 'number',
							size: 120,
							cell: ({ getValue }) =>
								getValue() === null
									? 0
									: getValue() === '00'
									? 0
									: salesType === 'Transaction' ? formattingDataWithoutDollr(parseFloat((getValue()))) : formattingData(parseFloat((getValue()))),
							footer: ({ table }) =>
								reportType !== 'Hour and Day' ? null : item === '' ? (
									''
								) : (
									<div className='text-center'>
										{`${salesType === 'Transaction' ? '' : ''} ${ salesType === 'Transaction'  ? formattingDataWithoutDollr(parseFloat((table
											.getRowModel()
											.rows.reduce((acc, row) => acc + row.original[item], 0)))) :formattingData(parseFloat((table
											.getRowModel()
											.rows.reduce((acc, row) => acc + row.original[item], 0))))}`}
									</div>
								),
						})
					),
			];

			setColumns(generatedColumns);
			setHourlySalesData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Hourly Sales data: ', error);
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

	const handleReportTypeChange = (option) => {
		setReportType(option);
		if (option === 'Hour and Day') {
			setIsSalesEditable(true);
			setIsDOWEditable(false);
			setIsViewByEditable(true);
			setViewBy('Hour');
			setViewByOptions([{ name: 'Hour' }, { name: 'Half-Hour' }, { name: 'Qtr-Hour' }]);
		} else if (option === 'Unit') {
			setIsSalesEditable(true);
			setIsDOWEditable(true);
			setIsViewByEditable(true);
			setViewBy('Sum');
			setViewByOptions([{ name: 'Sum' }, { name: 'Avg' }]);
		} else if (option === 'Unit, Hour and Day') {
			setIsSalesEditable(false);
			setIsDOWEditable(false);
			setIsViewByEditable(false);
		}
	};

	//  Function to handle the PDF export
	const handlePDFClick = () => {
		if (hourlySalesData.length === 0) return;

		const pdfData = {
			title: 'Hourly Sales',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: generateBody(),
		};

		PdfBuilder(pdfData);
	};

	const generateBody = () => {
		const rowsPerTable = 28; // Define how many rows you want per table
		const totalRows = hourlySalesData.length; // Get total number of rows
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
						rows: hourlySalesData.slice(i, i + rowsPerTable).map((row) =>
							columnChunk.map((column) => ({
								value:
									row[column.id] - Math.floor(row[column.id]) !== 0
										? typeof row[column.id] === 'number'
											? row[column.id].toFixed(2)
											: row[column.id]
										: row[column.id] || '0 ',
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

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (hourlySalesData.length === 0) return;

		const data = [
			{
				name: '',
				columns: columns.map((column) => ({ name: column.header })),
				data: hourlySalesData.map((subRow) =>
					columns.map((column) =>
						subRow[column.id] - Math.floor(subRow[column.id]) !== 0
							? typeof subRow[column.id] === 'number'
								? subRow[column.id].toFixed(2)
								: subRow[column.id]
							: subRow[column.id] || '0'
					)
				),
			},
		];

		const filename = `HourlySales_${selectedUnitName}_${dateFormat(selectedFromDate, 'mm-dd-yyyy')}_to_${dateFormat(
			selectedToDate,
			'mm-dd-yyyy'
		)}`;
		const spreadSheetTitle = 'Hourly Sales';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={hourlySalesData} isFooter={true} />;
	return (
		<div className='w-[98%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='my-2 text-[18px] leading-tight text-left pageTitle'>Hourly Sales</h2>
			<header className='optionsBar flex justify-between items-center mb-0 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex flex-col '>
					<div className='flex items-center space-x-1'>
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
						<div className='w-56 reportType-selector'>
							<Dropdown
								title='Report Type'
								options={reportTypeOptions}
								selectedOption={reportType}
								onOptionChange={handleReportTypeChange}
							/>
						</div>
						<div className='ml-3 run-button' onClick={fetchHourlySalesReport}>
							<div className='py-2 ml-2 text-[14px] font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
								Run
							</div>
						</div>
					</div>
					<div className='flex items-center space-x-2'>
						<div className='w-44 salesType-selector'>
							<Dropdown
								title='Sales Type'
								options={salesTypeOptions}
								selectedOption={salesType}
								onOptionChange={(option) => setSalesType(option)}
								isEditable={isSalesEditable}
							/>
						</div>
						<div className='w-36 DOWType-selector'>
							<Dropdown
								title='DOW'
								options={DOWTypeOptions}
								selectedOption={DOWType}
								onOptionChange={(option) => setDOWType(option)}
								isEditable={isDOWEditable}
							/>
						</div>
						<div className='w-44 viewType-selector'>
							<Dropdown
								title='View By'
								options={viewByOptions}
								selectedOption={viewBy}
								onOptionChange={(option) => setViewBy(option)}
								isEditable={isViewByEditable}
							/>
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includePDF={true}
						handlePDFClick={handlePDFClick}
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
						(hourlySalesData.length > 0 ? (
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
	);
};

export default HourlySales;
