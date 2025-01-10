import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import mgmtSalesCoverage from '../../assets/introJSSteps/mgmtSalesCoverage';
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
	Modal,
} from '../../components';
import Chart from 'react-apexcharts';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import { formattingDataWithoutDollr } from '../../functions/formatingCurrency';

const columnHelper = createColumnHelper();

const ManagementSalesCoverage = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [mgmtSalesCoverageData, setMgmtSalesCoverageData] = useState([]);
	const [isChartModalOpen, setIsChartModalOpen] = useState(false);
	const [chartData, setChartData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isChartLoading, setIsChartLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Management Sales Coverage Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [selectedToDate, setSelectedToDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	const [jobType, setJobType] = useState('');
	const [isJobTypeLoading, setIsJobTypeLoading] = useState(false);
	const [jobTypeOptions, setJobTypeOptions] = useState([]);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: mgmtSalesCoverage(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = [
		columnHelper.accessor('date', {
			id: 'date',
			header: 'Work Week',
			cell: ({ row, getValue }) =>
				row.getCanExpand() ? (
					<div
						{...{
							style: {
								cursor: 'pointer',
								paddingLeft: `${row.depth * 2}rem`,
							},
							className: 'flex items-center gap-4',
						}}
					>
						{row.getIsExpanded() ? (
							<CiSquareMinus className='text-[20px]' />
						) : (
							<CiSquarePlus className='text-[20px]' />
						)}
						{row.depth === 0 ? (
							<div>{row.original.week}</div>
						) : (
							<div>
								<span className='mr-1 font-bold'>Unit:</span>
								{row.original?.unit}
							</div>
						)}
					</div>
				) : (
					getValue()
				),
		}),
		columnHelper.accessor('projectedSalesPerCoverage', {
			id: 'projectedSalesPerCoverage',
			header: 'Projected Sales % Coverage',
			cell: ({ row, getValue }) =>
				row.getCanExpand() ? (
					row.depth === 1 ? (
						<div>
							<span className='mr-1 font-bold'>Projected Sales % Coverage:</span>
							{formattingDataWithoutDollr(row.original?.projectedSalesPerCoverage)}%
						</div>
					) : null
				) : (
					`${formattingDataWithoutDollr(getValue())}%`
				),
		}),
		columnHelper.accessor('actualSalesPerCoverage', {
			id: 'actualSalesPerCoverage',
			header: 'Actual Sales % Coverage',
			cell: ({ row, getValue }) =>
				row.getCanExpand() ? (
					row.depth === 1 ? (
						<div>
							<span className='mr-1 font-bold'>Actual Sales % Coverage:</span>
							{formattingDataWithoutDollr(row.original?.actualSalesPerCoverage)}%
						</div>
					) : null
				) : (
					`${formattingDataWithoutDollr(getValue())}%`
				),
		}),
		columnHelper.accessor('scheduledShifts', {
			id: 'scheduledShifts',
			header: 'Scheduled shifts',
		}),
		columnHelper.accessor('actualShifts', {
			id: 'actualShifts',
			header: 'Actual shifts',
		}),
	];

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	useEffect(() => {
		const fetchLaborJobType = async () => {
			try {
				setIsJobTypeLoading(true);
				const getData = {
					url: 'getLaborJobType',
					urlParams: {
						companyId: companyID,
					},
				};

				const result = await getCall(getData);
				const newData = result?.data?.sort((a, b) => a.description.localeCompare(b.description));

				setJobTypeOptions(
					newData?.map((item) => ({
						jobId: item.jobID,
						name: item.description,
					}))
				);

				setJobType(newData[0]?.description);
				setIsJobTypeLoading(false);
			} catch (error) {
				console.error('Error fetching labor job types:', error);
			}
		};

		fetchLaborJobType();
	}, []);

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
			console.error('Error fetching default dates:', error);
		}
	};

	useEffect(() => {
		getDefaultDates();
	}, []);

	const fetchMgmtSalesCoverageReport = async () => {
		try {
			setIsError(false);
			setIsLoading(true);
			const getData = {
				url: 'getMgmtSalesCoverage',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					jobId: jobTypeOptions.find((item) => item.name === jobType)?.jobId,
				},
			};

			const result = await getCall(getData);
			if (result?.data.length > 0) {
				const newData = result?.data?.map((week) => ({
					week: `${week.weekNumber}: ${dateFormat(week.weekStartDate, 'mm/dd/yyyy')} - ${dateFormat(
						week.weekEndDate,
						'mm/dd/yyyy'
					)}`,
					subRows: week.managementSalesCoverageReportUnitModels
						.map((unit) => ({
							unitId: unit.unitId,
							unit: unitsAndAreasList?.units?.find((item) => item.unitID === unit.unitId)?.unitName,
							projectedSalesPerCoverage: unit.projectedSalesPerCoverage,
							actualSalesPerCoverage: unit.actualSalesPerCoverage,
							subRows: unit.managementSalesCoverageReportDateModels
								.map((date) => ({
									unit: unitsAndAreasList?.units?.find((item) => item.unitID === unit.unitId)
										?.unitName,
									date: dateFormat(date.date, 'mm/dd/yyyy'),
									projectedSalesPerCoverage: date.projectedSalesPerCoverage,
									actualSalesPerCoverage: date.actualSalesPerCoverage,
									scheduledShifts:
										date.scheduledShifts?.trim() === '12:00 AM - 12:00 AM'
											? ''
											: date.scheduledShifts,
									actualShifts: date.actualShifts,
									projectedDailySales:
										date.projectedDailySales === null ? 0 : date.projectedDailySales,
									actualDailySales: date.actualDailySales === null ? 0 : date.actualDailySales,
									projectedManagementWork:
										date.projectedManagementWork === null ? 0 : date.projectedManagementWork,
									actualManagementWork:
										date.actualManagementWork === null ? 0 : date.actualManagementWork,
								}))
								.sort((a, b) => new Date(a.date) - new Date(b.date)),
						}))
						.sort((a, b) => a.unitId - b.unitId),
				}));

				setMgmtSalesCoverageData(newData);
			} else {
				setMgmtSalesCoverageData([]);
			}
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching Management Sales Coverage Report:', error);
			setIsError(true);
			setErrorMessage(
				'There was an error trying to load the Management Sales Coverage Report, please try again later.'
			);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setShowUnitModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleChart = (row) => {
		if (!row) return;
		setIsChartLoading(true);
		const chartData = {
			series: [
				{
					name: 'Sales',
					data: [row.projectedDailySales, row.actualDailySales, null, null],
				},
				{
					name: 'Management Sales',
					data: [null, null, row.projectedManagementWork, row.actualManagementWork],
				},
			],
			options: {
				xaxis: {
					categories: [
						'Projected Daily Sales',
						'Actual Daily Sales',
						'Projected Management Work',
						'Actual Management Work',
					],
				},
				yaxis: {
					labels: {
						showAlways: true,
						formatter: function (value) {
							return `$${Math.round(value)}`;
						},
					},
					axisBorder: {
						show: true,
					},
					axisTicks: {
						show: true,
					},
					tickAmount: 20,
					title: {
						text: 'Sales in $',
						style: {
							fontSize: '18px',
							fontWeight: '600',
						},
					},
				},
				fill: {
					colors: ['#4F81BD', '#FF0000'],
					type: 'solid',
					opacity: 0.5,
				},
				stroke: {
					curve: 'straight',
					width: 2,
				},
				colors: ['#4F81BD', '#FF0000'],
				legend: {
					show: true,
					position: 'top',
					horizontalAlign: 'left',
					floating: true,
					fontWeight: '600',
					customLegendItems: ['Sales', 'Management Sales'],
				},
				chart: {
					toolbar: {
						show: false,
					},
					animation: {
						enabled: false,
					},
				},
				grid: {
					padding: {
						top: 40,
					},
				},
				tooltip: {
					custom: function ({ series, seriesIndex, dataPointIndex, w }) {
						return (
							'<div class="arrow_box" style="padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 5px;">' +
							'<span style="font-size: 14px; font-weight: bold;">' +
							w.globals.categoryLabels[dataPointIndex] +
							': $' +
							(series[seriesIndex][dataPointIndex] !== null ? series[seriesIndex][dataPointIndex] : 0) +
							'</span>' +
							'</div>'
						);
					},
				},
				title: {
					text: `${row.unit} Sales Details for ${row.date}`,
					align: 'center',
					margin: 6,
					style: {
						fontSize: '18px',
					},
				},
			},
		};

		setChartData(chartData);
		setIsChartModalOpen(true);
		setIsChartLoading(false);
	};

	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!mgmtSalesCoverageData || mgmtSalesCoverageData.length === 0) {
			console.error('Management Sales Coverage data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Management Sales Coverage Report',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = mgmtSalesCoverageData.map((row) => {
			const title = row.week;
			return {
				type: 'table',
				title: title,
				widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
				dataTypes: ['string', 'date', 'number', 'number', 'number', 'number'],
				data: formatPDFData(row.subRows),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: [
				'Unit',
				'Date',
				'Projected Sales % Coverage',
				'Actual Sales % Coverage',
				'Scheduled shifts',
				'Actual shifts',
			],
			rows: data.flatMap((row) =>
				row.subRows.map((subRow) => [
					{
						value: row.unit,
						cellType: 'text',
						columnName: 'Unit',
					},
					{
						value: subRow.date,
						cellType: 'text',
						columnName: 'Date',
					},
					{
						value: `${formattingDataWithoutDollr(subRow.projectedSalesPerCoverage)}%` || '0.00%',
						cellType: 'text',
						columnName: 'Projected Sales % Coverage',
					},
					{
						value: `${formattingDataWithoutDollr(subRow.actualSalesPerCoverage)}%` || '0.00%',
						cellType: 'text',
						columnName: 'Actual Sales % Coverage',
					},
					{
						value: subRow.scheduledShifts,
						cellType: 'text',
						columnName: 'Scheduled shifts',
					},
					{
						value: subRow.actualShifts,
						cellType: 'text',
						columnName: 'Actual shifts',
					},
				])
			),
		};
	};

	const handleExcelClick = () => {
		const data = [
			{
				name: '',
				columns: [
					{ name: 'Work Week', filter: 'text' },
					{ name: 'Unit', filter: 'text' },
					{ name: 'Date', filter: 'text' },
					{ name: 'Projected Sales % Coverage', filter: 'text' },
					{ name: 'Actual Sales % Coverage', filter: 'text' },
					{ name: 'Scheduled shifts', filter: 'text' },
					{ name: 'Actual shifts', filter: 'text' },
				],
				data: mgmtSalesCoverageData.flatMap((week) =>
					week.subRows.flatMap((unit) =>
						unit.subRows.map((date) => ({
							week: week.week,
							unit: unit.unit,
							date: date.date,
							projectedSalesPerCoverage: formattingDataWithoutDollr(date.projectedSalesPerCoverage),
							actualSalesPerCoverage: formattingDataWithoutDollr(date.actualSalesPerCoverage),
							scheduledShifts: date.scheduledShifts,
							actualShifts: date.actualShifts,
						}))
					)
				),
			},
		];

		const filename = `Management_Sales_Coverage_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Management Sales Coverage Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={mgmtSalesCoverageData}
			expandCollapseButtons={true}
			onCallBack={(row) => handleChart(row)}
		/>
	);

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Management Sales Coverage</h2>
			<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center'>
					<UnitSelector
						companyId={companyID}
						alignmentId={alignmentID}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						includeAreas={true}
						setMemberName={setSelectedUnitName}
						onClick={() => setShowUnitModal(true)}
					/>
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
						extraClass={'w-[219px]'}
					/>
					<div className='w-72 jobType-selector'>
						<Dropdown
							title={'Job Type'}
							options={jobTypeOptions}
							selectedOption={isJobTypeLoading ? 'Loading...' : jobType}
							onOptionChange={(option) => setJobType(option)}
						/>
					</div>
					<div className='run-button' onClick={fetchMgmtSalesCoverageReport}>
						<div className='py-3 ml-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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

			{isError ? (
				<div>{errorMessage}</div>
			) : (
				<div className='relative w-full min-h-56'>
					<Loader loading={isLoading} />
					{!isLoading &&
						(mgmtSalesCoverageData.length > 0 ? (
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
					show={showUnitModal}
					includeAreas={true}
					handleClose={() => {
						setShowUnitModal(false);
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
				<Modal
					title={'Management Sales Details Chart'}
					isOpen={isChartModalOpen}
					onClose={() => setIsChartModalOpen(!isChartModalOpen)}
				>
					<div className='m-4 w-[60rem] border border-solid border-black '>
						{isChartLoading ? (
							<Loader loading={isChartLoading} />
						) : (
							<Chart options={chartData.options} series={chartData.series} type='area' height={550} />
						)}
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default ManagementSalesCoverage;
