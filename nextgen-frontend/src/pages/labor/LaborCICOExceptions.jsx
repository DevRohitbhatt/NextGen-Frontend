import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
	Dropdown,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import laborCICOExceptions from '../../assets/introJSSteps/laborCICOExceptions';

const columnHelper = createColumnHelper();

const LaborCICOExceptions = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [laborCICOExceptionsData, setLaborCICOExceptionsData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(false);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Labor Clock In - Clock Out Exceptions Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	const [groupBy, setGroupBy] = useState('None');
	const groupByOptions = [{ name: 'None' }, { name: 'Date' }, { name: 'Employee' }, { name: 'Unit' }];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: laborCICOExceptions(),
		initialStep: 0,
		stepsEnabled: false,
	});

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

	// columns for tableHOC
	const memoizedColumns = useMemo(
		() => [
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit Name',
				dataType: 'string',
				size: 180,
			}),
			columnHelper.accessor('businessDate', {
				id: 'businessDate',
				header: 'Business Date',
				dataType: 'string',
				size: 120,
			}),
			columnHelper.accessor('employeeName', {
				id: 'employeeName',
				header: 'Employee Name',
				dataType: 'string',
				size: 120,
			}),
			columnHelper.accessor('jobDescription', {
				id: 'jobDescription',
				header: 'Job Description',
				dataType: 'string',
			}),
			columnHelper.accessor('shiftName', {
				id: 'shiftName',
				header: 'Shift Name',
				dataType: 'string',
				size: 100,
			}),
			columnHelper.accessor('reportType', {
				id: 'reportType',
				header: 'Report Type',
				dataType: 'string',
				size: 100,
			}),

			columnHelper.accessor('exceptionDetail', {
				id: 'exceptionDetail',
				header: 'Exception Detail',
				dataType: 'string',
				size: 400,
			}),
			columnHelper.accessor('totalCost', {
				id: 'totalCost',
				header: 'Total Cost',
				cell: ({ getValue }) => `$${getValue()}`,
				dataType: 'number',
				footer: ({ table }) => (
					<div className='font-bold text-start'>
						$
						{table
							.getCoreRowModel()
							.rows.reduce((acc, row) => acc + parseFloat(row.original.totalCost), 0)
							.toFixed(2)}
					</div>
				),
			}),
		],
		[]
	);
	const [columns, setColumns] = useState(memoizedColumns);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	const fetchLaborCICOExceptionsData = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
			const getData = {
				url: 'laborCICOExceptions',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);

			const newData = result.data.flatMap((unit) =>
				unit.employees.flatMap((employee) =>
					employee.employees.map((data) => ({
						unitName: unit.unitName,
						businessDate: dateFormat(data.businessDate, 'mm-dd-yyyy'),
						employeeName: data.employeeFullName,
						jobDescription: data.jobDescription,
						shiftName: data.shiftName,
						reportType: data.exceptionType,
						exceptionDetail: data.exceptionDetail,
						totalCost: Math.abs(data.totalAmount)?.toFixed(2),
					}))
				)
			);

			setLaborCICOExceptionsData(newData);
			setIsLoading(false);
			setIsTableRendered(true);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Labor Clock In - Clock Out Exceptions data: ', error);
		}
	};

	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleGroupByChange = (option) => {
		setGroupBy(option);
		const groupByColumns = {
			None: [],
			Date: ['businessDate'],
			Employee: ['unitName', 'employeeName'],
			Unit: ['unitName'],
		};

		const selectedGroupByColumns = groupByColumns[option] || [];
		const newColumns = memoizedColumns.map((column) =>
			selectedGroupByColumns.includes(column.id) ? { ...column, groupBy: true, show: false } : column
		);

		const calculateTotalCost = (rows) =>
			rows.reduce((acc, subRow) => acc + parseFloat(subRow.original.totalCost || 0), 0);

		// Helper function to handle depth-0 case where subRows have further nested subRows
		const calculateNestedTotalCost = (rows) =>
			rows.reduce((acc, subRow) => acc + calculateTotalCost(subRow.subRows), 0);

		if (option !== 'None') {
			newColumns.unshift(
				columnHelper.display({
					id: 'actions',
					cell: ({ row }) => {
						if (!row.getCanExpand()) return null;

						const label =
							row.depth < selectedGroupByColumns.length
								? `${columns.find((col) => col.id === selectedGroupByColumns[row.depth])?.header}: ${
										row.original[selectedGroupByColumns[row.depth]]
								  } ($${
										selectedGroupByColumns.length === 1
											? calculateTotalCost(row.subRows).toFixed(2)
											: row.depth === 0
											? calculateNestedTotalCost(row.subRows).toFixed(2) // For depth-0 rows, process nested subrows
											: calculateTotalCost(row.subRows).toFixed(2)
								  })`
								: '';

						return (
							<div
								{...{
									style: {
										cursor: 'pointer',
										paddingLeft: `${row.depth * 2}rem`,
										width: '100%',
									},
									className: 'flex items-center gap-2 font-bold absolute bg-white inset-0 capitalize',
								}}
							>
								{row.getIsExpanded() ? (
									<CiSquareMinus className='text-[20px]' />
								) : (
									<CiSquarePlus className='text-[20px]' />
								)}
								{label}
							</div>
						);
					},
					size: 20,
				})
			);
		}

		setColumns(newColumns);

		if (isTableRendered) {
			fetchLaborCICOExceptionsData();
		}
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		const pdfData = {
			title: 'Labor Clock In - Clock Out Exceptions Report',
			subHeaders: [
				`Unit:${selectedUnitName} | Date Range:${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: new Array(columns.length).fill('auto'),
					dataTypes: columns.map((column) => column.dataType),
					data: {
						columnHeaders: columns.map((column) => column.header),
						rows: laborCICOExceptionsData.map((row) =>
							columns.map((column) => ({
								value: column.id === 'totalCost' ? '$' + row[column.id] : row[column.id],
								cellType: column.dataType,
								columnName: column.header,
							}))
						),
					},
				},
			],
		};

		PdfBuilder(pdfData);
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = columns.map((column) => column.header);
		const csvData = laborCICOExceptionsData.map((row) => columns.map((column) => `"${row[column.id]}"`).join(','));
		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'laborCICOExceptions.csv');
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
				data: laborCICOExceptionsData.map((row) => columns.map((column) => row[column.id])),
			},
		];

		const filename = `laborCICOExceptions_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Labor Clock In - Clock Out Exceptions Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={laborCICOExceptionsData}
			headerPosition='left'
			dataPosition='left'
			isFooter={true}
			isPaginated={true}
		/>
	);

	return (
		<>
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Clock In - Clock Out Exceptions</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
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
						<div className='w-36 group-by'>
							<Dropdown
								title='Group By'
								options={groupByOptions}
								selectedOption={groupBy}
								onOptionChange={handleGroupByChange}
							/>
						</div>
						<div className='run-button' onClick={fetchLaborCICOExceptionsData}>
							<div className='py-3 ml-2 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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
							(laborCICOExceptionsData.length > 0 ? (
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

export default LaborCICOExceptions;
