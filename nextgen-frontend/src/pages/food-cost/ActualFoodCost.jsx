import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC2,
	Dropdown,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import ActualFoodCosts from '../../assets/introJSSteps/ActualFoodCost';

const columnHelper = createColumnHelper();

const ActualFoodCost = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [actualFoodCostData, setActualFoodCostData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);
	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Actual Food Cost Report, please try again later.'
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
	const [view, setView] = useState('Weekly');
	const [countType, setCountType] = useState('WE');
	const dropdownOptions = [{ name: 'Daily' }, { name: 'Monthly' }, { name: 'Shift' }];
	const [viewby, setViewBy] = useState('Department');
	const viewOptions = [{ name: 'Department' }, { name: 'Sub Department' }, { name: 'Inventory Item' }];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: ActualFoodCosts(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const viewMap = {
		'Weekly': 'WE',
		'Daily': 'DA',
		'Monthly': 'MO',
		'Shift': 'SH'
	};
	
	const handleViewChange = (option) => {	
		setView(option);	
		setCountType(viewMap[option] || '');
	};
	const handleTotalViewChange = (option) => {	
		setViewBy(option);	
	};

	useEffect(() => {
	}, [countType]); 
	
	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) =>
					row.getCanExpand() ? (
						<div
							{...{
								onClick: row.getToggleExpandedHandler(),
								style: { cursor: 'pointer', paddingLeft: `${row.depth * 2}rem` },
								className: 'inline-block',
							}}
						>
							{row.getIsExpanded() ? (
								<CiSquareMinus className='text-[20px]' />
							) : (
								<CiSquarePlus className='text-[20px]' />
							)}
							
						</div>
					) : null,
				size: '80',
			}),
			columnHelper.accessor('department', {
				id: 'department',
				header: 'Department',
				dataType: 'string',
				size: '250',
			}),
			columnHelper.accessor('begNumber', {
				id: 'begNumber',
				header: 'Beg $',
				dataType: 'number',
			}),
			columnHelper.accessor('trInNumber', {
				id: 'trInNumber',
				header: 'Trans In $',
				dataType: 'number',
			}),
			columnHelper.accessor('trOutDollar', {
				id: 'trOutDollar',
				header: 'Trans Out $',
				dataType: 'number',
			}),
			columnHelper.accessor('endDollar', {
				id: 'endDollar',
				header: 'End $',
				dataType: 'number',
			}),
			columnHelper.accessor('useDollar', {
				id: 'useDollar',
				header: 'Actual Uses $',
				dataType: 'number',
			}),
			columnHelper.accessor('wasteDollar', {
				id: 'wasteDollar',
				header: 'waste $',
				dataType: 'number',
			}),
			
			// columnHelper.accessor('wasteNumber', {
			// 	id: 'wasteNumber',
			// 	header: 'Waste Number',
			// 	dataType: 'number',
			// }),
		
			columnHelper.accessor('comparisonName', {
				id: 'comparisonName',
				header: 'Comparison Name',
				dataType: 'string',
			}),
			columnHelper.accessor('comparisonSales', {
				id: 'comparisonSales',
				header: 'Comparison Sales',
				dataType: 'number',
			}),
		],
		[]
	);
	

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
				setCompanyId(1021);
				setAlignmentId(1110);
				setMemberId(51);
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
	const handleRun = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
	
			const getData = {
				url: 'ActualFoodCost',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: 51,
					fromDate: selectedFromDate.toISOString().split('T')[0],
					toDate: selectedToDate.toISOString().split('T')[0],
					countType: countType
				},
			};
	
			const result = await getCall(getData);
	
			const newData = result.data.map((department) => ({
				department: department.department,
				subRows: department.subDepartments.map((subDept) => ({
					subDepartment: subDept.subDepartment,
					subRows: subDept.actualFoodCosts.map((cost) => ({
						department: cost.department,
						description: cost.description,
						begDollar: cost.begDollar,
						purDollar: cost.purDollar,
						trInDollar: cost.trInDollar,
						trOutDollar: cost.trOutDollar,
						endDollar: cost.endDollar,
						useDollar: cost.useDollar,
						salesNet: cost.salesNet,
						wasteDollar: cost.wasteDollar,
						wasteNumber: cost.wasteNumber,
						comparisonName: cost.comparisonName,
						comparisonSales: cost.comparisonSales,
					}))
				}))
			}));

			setActualFoodCostData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Labor By Pay Period Report data: ', error);
		}
	};
	

	const handleUnitSelection = (unitName, unitID) => {
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

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

		if (!actualFoodCostData || actualFoodCostData.length === 0) {
			console.error('Voids report data is not defined or empty');
			return;
		}

     console.log("actualFoodCostData",actualFoodCostData);

		const pdfData = {
			title: 'Actual Food Cost Report',
			subHeaders: [
				`${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = actualFoodCostData.map((row) => {
			const unit = unitsAndAreasList?.units?.find((unit) => unit.unitName === row.unitName);
			const title = unit ? unit.unitName : '';
			return {
				type: 'table',
				title: title,
				widths: [
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto'
				],
				dataTypes: [
					'string',
					'string',
					'string',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
                    'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'string',
					'string'
				],
				data: formatPDFData(row.subRows),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: [
				'Department',
				'Sub Department',
				'Description',
				'UOM',
				'Beg #',
				'Beg $',
				'Pur #',
				'Pur $',
				'Trans In#',
				'Trans In $',
                'Trans Out#',
                'Trans Out $',
                'End #',
                'End $',
				'Actual Usage #',
                'Actual Usage $',
				'Actual Usage %',
                'Waste #',
                'Waste $',
				'Waste %',
				'Comparison Name',
                'Comparison Sales'
			],
			rows: data.flatMap((row) =>
				row.subRows.map((subRow) => [
					{ value: row.department, cellType: 'string', columnName: 'Department' },
					{ value: row.subDepartment , cellType: 'string', columnName: 'Sub Department' },
					{ value: subRow.description, cellType: 'string', columnName: 'Description' },
					{ value: subRow.unit, cellType: 'string', columnName: 'UOM' },
					{ value: subRow.begNumber, cellType: 'number', columnName: 'Beg #' },
					{ value: subRow.begDollar, cellType: 'number', columnName: 'Beg $' },
					{ value: subRow.purNumber, cellType: 'number', columnName: 'Pur #' },
					{ value: subRow.purDollar, cellType: 'number', columnName: 'Pur $' },
					{ value: subRow.trInNumber, cellType: 'number', columnName: 'Trans In#' },
					{ value: subRow.trInDollar, cellType: 'number', columnName: 'Trans In $' },
					{ value: subRow.trOutDollar, cellType: 'number', columnName: 'Trans Out #' },
					{ value: subRow.trOutDollar, cellType: 'number', columnName: 'Trans Out $' },
					{ value: subRow.endNumber, cellType: 'number', columnName: 'End #' },
					{ value: subRow.endDollar, cellType: 'number', columnName: 'End $' },
					{ value: subRow.useNumber, cellType: 'number', columnName: 'Actual Usage #' },
					{ value: subRow.useDollar, cellType: 'number', columnName: 'Actual Usage $' },
					{ value: subRow.salesNet, cellType: 'number', columnName: 'Actual Usage %' },
					{ value: subRow.usePct, cellType: 'number', columnName: 'Waste #' },
					{ value: subRow.wasteNumber, cellType: 'number', columnName: 'Waste $' },
					{ value: subRow.wasteDollar, cellType: 'number', columnName: 'Waste %' },
					{ value: subRow.comparisonName, cellType: 'string', columnName: 'Comparison Name' },
					{ value: subRow.comparisonSales, cellType: 'number', columnName: 'Comparison Sales' }
				])
			),
		};
	};

	// // Function to handle the Excel export
	const handleExcelClick = () => {
		console.log("actualFoodCostData",actualFoodCostData);
		
		const data = [
			{
				name: 'Actual Food Cost Report',
				columns: [
					{ name: 'Department', filter: 'text' },
					{ name: 'Sub Department', filter: 'text' },
					{ name: 'Description', filter: 'text' },
					{ name: 'Beg #', filter: 'text' },
					{ name: 'Beg $', filter: 'text' },
					{ name: 'Pur #', filter: 'text' },
					{ name: 'Pur $', filter: 'text' },
					{ name: 'Trans In#', filter: 'text' },
					{ name: 'Trans In $', filter: 'text' },
					{ name: 'Trans Out #', filter: 'text' },
					{ name: 'Trans Out $', filter: 'text' },
					{ name: 'End #', filter: 'text' },
					{ name: 'End $', filter: 'text' },
					{ name: 'Actual Usage #', filter: 'text' },
					{ name: 'Actual Usage $', filter: 'text' },
					{ name: 'Actual Usage %', filter: 'text' },
					{ name: 'Waste #', filter: 'text' },
					{ name: 'Waste $', filter: 'text' },
					{ name: 'Waste %', filter: 'text' },
					{ name: 'Comparison Name', filter: 'text' },
					{ name: 'Comparison Sales', filter: 'text' }

				],
				data: actualFoodCostData.flatMap((unit) =>
					unit.subRows.flatMap((employee) =>
						employee.subRows.map((period) => ({
							department: period.department,
							subDepartment: period.subDepartment,
							description: period.description,
							begNumber: period.begNumber,
							begDollar: period.begDollar,
							purNumber: period.purNumber,
							purDollar: period.purDollar,
							trInNumber: period.trInNumber,
							trInDollar: period.trInDollar,
							trOutNumber: period.trOutNumber,
							trOutDollar: period.trOutDollar,
							endDollar: period.endDollar,
							useNumber: period.useNumber,
							useDollar:period.useDollar,
							salesNet: period.salesNet,
							usePct: period.usePct,
                            wasteNumber: period.wasteNumber,
                            wasteDollar: period.wasteDollar,
                            wastePct: period.wastePct,
                            comparisonName: period.comparisonName,
							comparisonSales: period.comparisonSales
						}))
					)
				),
			},
		];

		const filename = 'ActualFoodCost';
		const spreadSheetTitle = 'Actual FoodCost Report';
		const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = TableHOC2(columns, actualFoodCostData, false, viewby, isTableRendered, setIsTableRendered);

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Actual Food Cost</h2>
			<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
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
					<div className='w-52'>
						<Dropdown
							title='Count Type'
							options={dropdownOptions}
							selectedOption={view}
							onOptionChange={handleViewChange}
						/>
					</div>
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
					/>
					
					<div className='run-button' onClick={handleRun}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includePDF={true}
						handlePDFClick={handlePDFClick}
						includeCSV={false}
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
	<>
		{actualFoodCostData.length > 0 && (
			<div className='w-52'>
				<Dropdown
					title='Expand View'
					options={viewOptions}
					selectedOption={viewby}
					onOptionChange={handleTotalViewChange}
				/>
			</div>
		)}

		{actualFoodCostData.length > 0 && <div className='paged-table'>{Table}</div>}
	</>
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

export default ActualFoodCost;
