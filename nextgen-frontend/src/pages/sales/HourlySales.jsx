import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import hourlySales from '../../assets/introJSSteps/hourlySales';
import {
	Dropdown,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC2,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const HourlySales = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [hourlySalesData, setHourlySalesData] = useState([]);
	const [renderCount, setRenderCount] = useState(0); // Controls re-render
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

	// Effect to trigger re-render after the table is first formed
	useEffect(() => {
		if (renderCount === 0) {
			// This will re-render the component once after the initial render
			setRenderCount(1);
		}
	}, [renderCount]);

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
	const handleHourlySales = async () => {
		try {
			setIsLoading(true);
			setIsError(false);

			const getData = {
				url: 'hourlySales',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
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
			const hourLabels = [
				'12 AM',
				'1 AM',
				'2 AM',
				'3 AM',
				'4 AM',
				'5 AM',
				'6 AM',
				'7 AM',
				'8 AM',
				'9 AM',
				'10 AM',
				'11 AM',
				'12 PM',
				'1 PM',
				'2 PM',
				'3 PM',
				'4 PM',
				'5 PM',
				'6 PM',
				'7 PM',
				'8 PM',
				'9 PM',
				'10 PM',
				'11 PM',
			];

			// Dynamically generate columns based on the received data
			const generatedColumns = [
				// Conditionally add Hour column only if reportType is not 'Hour and Day'
				...(reportType === 'Hour and Day'
					? [
							columnHelper.accessor('Hour', {
								id: 'Hour',
								header: 'Hour',
								footer: 'Summary:',
							}),
					  ]
					: []),
				// Conditionally add Unit Name column only if reportType is not 'Hour and Day'
				...(reportType !== 'Hour and Day'
					? [
							columnHelper.accessor('UnitName', {
								id: 'UnitName',
								header: 'Unit Name',
								footer: reportType === 'Unit, Hour and Day' ? null : 'Summary:',
							}),
					  ]
					: []),

				// Conditionally add the Date and HoursSales column only if reportType is 'Unit, Hour and Day'
				...(reportType === 'Unit, Hour and Day'
					? [
							columnHelper.accessor('Date', {
								id: 'Date',
								header: 'Date',
							}),
							columnHelper.accessor('HoursSales', {
								id: 'HoursSales',
								header: 'Hours w/Sales',
							}),
					  ]
					: []),

				columnHelper.accessor('Total', {
					id: 'Total',
					header: 'Total',
					footer: ({ table }) =>
						reportType === 'Unit, Hour and Day' ? null : (
							<div className='text-center'>
								{`$ ${table
									.getRowModel()
									.rows.reduce((acc, row) => acc + row.original.Total, 0)
									.toFixed(2)}`}
							</div>
						),
				}),
				...Object.keys(newData[0] || {})
					.filter((key) => !['UnitID', 'UnitName', 'Date', 'Total', 'HoursSales', 'Hour'].includes(key))
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
							cell: ({ getValue }) => (getValue() === null ? 0 : getValue() === '00' ? 0 : getValue()),
							footer: ({ table }) =>
								reportType !== 'Hour and Day' ? null : item === 'Mins' ? (
									''
								) : (
									<div className='text-center'>
										{`${salesType !== 'Transaction' ? '$' : ''} ${table
											.getRowModel()
											.rows.reduce((acc, row) => acc + row.original[item], 0)
											.toFixed(2)}`}
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
			console.error('Error getting voids report data: ', error);
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
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedFromDate, 'mm-dd-yyyy')}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: columns.map(() => 'auto'),
					data: {
						columnHeaders: columns.map((column) => column.header),
						rows: hourlySalesData.map((row) =>
							columns.map((column) => ({
								value: row[column.id],
								cellType: '',
								columnName: column.header,
							}))
						),
					},
				},
			],
		};

		PdfBuilder(pdfData);
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (hourlySalesData.length === 0) return;

		const data = [
			{
				name: '',
				columns: columns.map((column) => ({ name: column.header })),
				data: hourlySalesData.map((subRow) => columns.map((column) => subRow[column.id])),
			},
		];

		const filename = 'hourlySales';
		const spreadSheetTitle = 'Hourly Sales';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedFromDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC2 columns={columns} data={hourlySalesData} isFooter={true} />;
	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Hourly Sales</h2>
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
					<div className='w-56 reportType-selector'>
						<Dropdown
							title='Report Type'
							options={reportTypeOptions}
							selectedOption={reportType}
							onOptionChange={handleReportTypeChange}
						/>
					</div>
					<div className='w-40 salesType-selector'>
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
					<div className='w-36 viewType-selector'>
						<Dropdown
							title='View By'
							options={viewByOptions}
							selectedOption={viewBy}
							onOptionChange={(option) => setViewBy(option)}
							isEditable={isViewByEditable}
						/>
					</div>
					<div className='run-button' onClick={handleHourlySales}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
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

			{isLoading ? (
				<div>Loading...</div>
			) : isError ? (
				<div>{errorMessage}</div>
			) : (
				hourlySalesData.length > 0 && <div className='paged-table'>{Table}</div>
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
