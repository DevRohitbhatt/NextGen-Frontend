import { useEffect, useMemo, useState, useRef } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import varianceFoodCost from './../../assets/introJSSteps/varianceFoodCost';

const columnHelper = createColumnHelper();

const VarianceFoodCost = () => {
	const { companyID, alignmentID, unitsAndAreas: unitsAndAreasList, defaultUnitID, defaultUnitName } = useSelector((state) => state.globalState);
	const [varianceFoodCostData, setVarianceFoodCostData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	const navigate = useNavigate();

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Variance Food Cost Report, please try again later.'
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

	//dropdown variables
	const [view, setView] = useState('Weekly');
	const [countType, setCountType] = useState('WE');
	const countDropdownOptions = [{ name: 'Daily' }, { name: 'Monthly' }, { name: 'Shift' }, { name: 'Weekly' }];
	const [viewby, setViewBy] = useState('Department');
	const viewOptions = [{ name: 'Department' }, { name: 'Sub Department' }, { name: 'Inventory Item' }];
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const popupRef = useRef(null);

	const viewMap = {
		Weekly: 'WE',
		Monthly: 'MO',
		Daily: 'DA',
		Shift: 'SH',
	};

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: varianceFoodCost(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) =>
					row.getCanExpand() ? (
						<div
							{...{
								style: { cursor: 'pointer', paddingLeft: `${row.depth * 2}rem` },
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
			}),
			columnHelper.accessor('subDepartment', {
				id: 'subDepartment',
				header: 'Sub Department',
				dataType: 'string',
			}),
			columnHelper.accessor('description', {
				id: 'description',
				header: 'Description',
				dataType: 'string',
				size: 300,
			}),
			columnHelper.accessor('countDisplayUnitName', {
				id: 'countDisplayUnitName',
				header: 'UOM',
				dataType: 'string',
				size: 200,
			}),
			columnHelper.accessor('actualNumber', {
				id: 'actualNumber',
				header: 'Actual #',
				dataType: 'number',
				size: 90,
			}),
			columnHelper.accessor('actualDollar', {
				id: 'actualDollar',
				header: 'Actual $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'actualDollar', getValue),
				size: 90,
			}),
			columnHelper.accessor('actualPct', {
				id: 'actualPct',
				header: 'Actual %',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'actualPct', getValue, true),
				size: 90,
			}),
			columnHelper.accessor('idealNumber', {
				id: 'idealNumber',
				header: 'Ideal #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue().toFixed(2)),
				dataType: 'number',
				size: 90,
			}),
			columnHelper.accessor('idealDollar', {
				id: 'idealDollar',
				header: 'Ideal $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'idealDollar', getValue),
				size: 90,
			}),
			columnHelper.accessor('idealPct', {
				id: 'idealPct',
				header: 'Ideal %',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'idealPct', getValue, true),
				size: 90,
			}),
			columnHelper.accessor('varianceNumber', {
				id: 'varianceNumber',
				header: 'Variance #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue().toFixed(2)),
				dataType: 'number',
				size: 100,
			}),
			columnHelper.accessor('varianceDollar', {
				id: 'varianceDollar',
				header: 'Variance $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'varianceDollar', getValue),
				size: 100,
			}),
			columnHelper.accessor('variancePct', {
				id: 'variancePct',
				header: 'Variance %',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'variancePct', getValue, true),
				size: 100,
			}),
			columnHelper.accessor('wasteNumber', {
				id: 'wasteNumber',
				header: 'Waste #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue().toFixed(2)),
				dataType: 'number',
				size: 90,
			}),
			columnHelper.accessor('wasteDollar', {
				id: 'wasteDollar',
				header: 'Waste $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'wasteDollar', getValue),
				size: 90,
			}),
			columnHelper.accessor('wastePct', {
				id: 'wastePct',
				header: 'Waste %',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'wastePct', getValue, true),
				size: 90,
			}),
			columnHelper.accessor('comparisonName', {
				id: 'comparisonName',
				header: 'Comparison Name',
				dataType: 'string',
				size: 160,
			}),
			columnHelper.accessor('comparisonSales', {
				id: 'comparisonSales',
				header: 'Comparison Sales',
				dataType: 'number',
				cell: ({ getValue }) => (getValue() !== undefined ? `$${getValue().toFixed(2)}` : ''),
				size: 150,
			}),
		],
		[]
	);

	// calculate the sum of the subrows
	const calculateSum = (row, field, getValue, isPercentage = false) => {
		if (row.getCanExpand()) {
			const sum = row.subRows
				.reduce((acc, subrow) => {
					if (subrow.getCanExpand()) {
						return (
							acc +
							subrow.subRows.reduce((subAcc, subSubrow) => {
								if (subSubrow.getCanExpand()) {
									return (
										subAcc +
										subSubrow.subRows.reduce(
											(subsubAcc, subsubsubrow) =>
												subsubAcc +
												(subsubsubrow.original[field]
													? Number(subsubsubrow.original[field]) * (isPercentage ? 100 : 1)
													: 0),
											0
										)
									);
								} else {
									return (
										subAcc +
										(subSubrow.original[field]
											? Number(subSubrow.original[field]) * (isPercentage ? 100 : 1)
											: 0)
									);
								}
							}, 0)
						);
					} else {
						return (
							acc +
							(subrow.original[field] ? Number(subrow.original[field]) * (isPercentage ? 100 : 1) : 0)
						);
					}
				}, 0)
				.toFixed(2);
			return isPercentage ? `${sum}%` : `$${sum}`;
		} else {
			return isPercentage ? `${getValue().toFixed(2)}%` : `$${getValue().toFixed(2)}`;
		}
	};

	useEffect(() => {
		if (defaultUnitID) {
			setSelectedUnit(defaultUnitID);
		}
		if (defaultUnitName) {
			setSelectedUnitName(defaultUnitName);
		}
	}, [defaultUnitID, defaultUnitName]);

	// Function to get the voids report
	const handleRun = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
			const getData = {
				url: 'varianceFoodCost',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					countType: countType,
				},
			};

			const result = await getCall(getData);
			const newData = [
				{
					department: 'TOTAL',
					subRows: result.data.map((department) => ({
						department: department.department,
						comparisonName:
							department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonName || 'Net Sales',
						comparisonSales: department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonSales || 0,
						subRows: department.subDepartments.map((subDepartment) => ({
							subDepartment: subDepartment.subDepartment,
							comparisonName: 'Net Sales',
							comparisonSales:
								department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonSales || 0,
							subRows: subDepartment.varianceFoodCostModels.map((foodCost) => ({
								description: foodCost.description,
								countDisplayUnitName: foodCost.countDisplayUnitName,
								actualNumber: foodCost.actualQuant,
								actualDollar: foodCost.actualCost,
								actualPct: foodCost.actualCostPct,
								idealNumber: foodCost.idealQuant,
								idealDollar: foodCost.idealCost,
								idealPct: foodCost.salesNet ? (foodCost.idealCost / foodCost.salesNet) * 100 : 0,
								varianceNumber: foodCost.varianceQuant,
								varianceDollar: foodCost.varianceCost,
								variancePct: foodCost.salesNet ? (foodCost.varianceCost / foodCost.salesNet) * 100 : 0,
								wasteNumber: foodCost.wasteCountCases,
								wasteDollar: foodCost.wasteCountCost,
								wastePct: foodCost.salesNet ? (foodCost.wasteCountCost / foodCost.salesNet) * 100 : 0,
							})),
						})),
					})),
				},
			];

			setVarianceFoodCostData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Variance Food Cost Report data: ', error);
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

	const handleCountType = (option) => {
		setView(option);
		setCountType(viewMap[option]);
	};

	const handleCountsheet = async (isEnding = false) => {
		try {
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);

			const countsheet = result.data.reduce((selectedCountsheet, countsheet) => {
				if (isEnding) {
					// Find the latest countsheet for Ending Countsheet
					if (
						(!selectedCountsheet || countsheet.dateTime > selectedCountsheet.dateTime) &&
						countsheet.countType === countType
					) {
						selectedCountsheet = countsheet;
					}
				} else {
					// Find the earliest countsheet for Beginning Countsheet
					if (
						!selectedCountsheet ||
						(countsheet.dateTime < selectedCountsheet.dateTime && countsheet.countType === countType)
					) {
						selectedCountsheet = countsheet;
					}
				}
				return selectedCountsheet;
			}, null);

			navigate('/CountsheetDesigner', { state: { companyID: companyID, countsheet: countsheet } });
		} catch (error) {
			console.error('Error getting Countsheet data: ', error);
		}
	};

	const handleViewPurchase = async (fromDate, toDate) => {
		try {
			const getData = {
				url: 'PurchaseAnalysis',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: fromDate.toLocaleDateString('en-CA'),
					toDate: toDate.toLocaleDateString('en-CA'),
					vendorId: 0,
				},
			};

			const result = await getCall(getData);

			navigate('/Purchase', {
				state: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: fromDate.toLocaleDateString('en-CA'),
					toDate: toDate.toLocaleDateString('en-CA'),
					vendorId: 0,
					unitsAndAreasList: unitsAndAreasList,
					purchaseData: result,
				},
			});
		} catch (error) {
			console.error('Error getting Countsheet data: ', error);
		}
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!varianceFoodCostData || varianceFoodCostData.length === 0) {
			console.error('Variance Food Cost report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Variance Food Cost Report',
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
		let body = [];
		varianceFoodCostData.flatMap((row) => [
			(body = row.subRows.flatMap((subRow) => {
				return {
					type: 'table',
					title: subRow.department,
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
					],
					data: formatPDFData(subRow),
				};
			})),
		]);
		return body;
	};

	const formatPDFData = (data) => {
		const newData = {
			columnHeaders: [
				'Sub Department',
				'Description',
				'UOM',
				'Actual #',
				'Actual $',
				'Actual %',
				'Ideal #',
				'Ideal $',
				'Ideal %',
				'Variance #',
				'Variance $',
				'Variance %',
				'Waste #',
				'Waste $',
				'Waste %',
				'Comparison Name',
				'Comparison Sales',
			],
			rows: data.subRows.flatMap((subRow) =>
				subRow.subRows.map((subSubRow) => [
					{ value: subRow.subDepartment, cellType: 'string', columnName: 'Sub Department' },
					{ value: subSubRow.description, cellType: 'string', columnName: 'Description' },
					{ value: subSubRow.countDisplayUnitName, cellType: 'string', columnName: 'Description' },
					{ value: subSubRow.actualNumber, cellType: 'number', columnName: 'Actual #' },
					{ value: subSubRow.actualDollar, cellType: 'number', columnName: 'Actual $' },
					{ value: Number(subSubRow.actualPct).toFixed(2), cellType: 'number', columnName: 'Actual %' },
					{ value: subSubRow.idealNumber, cellType: 'number', columnName: 'Ideal #' },
					{ value: subSubRow.idealDollar, cellType: 'number', columnName: 'Ideal $' },
					{ value: Number(subSubRow.idealPct).toFixed(2), cellType: 'number', columnName: 'Ideal %' },
					{ value: subSubRow.varianceNumber, cellType: 'number', columnName: 'Variance #' },
					{ value: subSubRow.varianceDollar, cellType: 'number', columnName: 'Variance $' },
					{
						value: Number(subSubRow.variancePct).toFixed(2),
						cellType: 'number',
						columnName: 'Variance %',
					},
					{ value: subSubRow.wasteNumber, cellType: 'number', columnName: 'Waste #' },
					{ value: subSubRow.wasteDollar, cellType: 'number', columnName: 'Waste $' },
					{ value: Number(subSubRow.wastePct).toFixed(2), cellType: 'number', columnName: 'Waste %' },
					{ value: subRow.comparisonName, cellType: 'string', columnName: 'Comparison Name' },
					{ value: subRow.comparisonSales, cellType: 'number', columnName: 'Comparison Sales' },
				])
			),
		};

		return newData;
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: 'Variance Food Cost Report',
				columns: [
					{ name: 'Department', filter: 'text' },
					{ name: 'Sub Department', filter: 'text' },
					{ name: 'Description', filter: 'text' },
					{ name: 'UOM', filter: 'text' },
					{ name: 'Actual #', filter: 'number' },
					{ name: 'Actual $', filter: 'number' },
					{ name: 'Actual %', filter: 'number' },
					{ name: 'Ideal #', filter: 'number' },
					{ name: 'Ideal $', filter: 'number' },
					{ name: 'Ideal %', filter: 'number' },
					{ name: 'Variance #', filter: 'number' },
					{ name: 'Variance $', filter: 'number' },
					{ name: 'Variance %', filter: 'number' },
					{ name: 'Waste #', filter: 'number' },
					{ name: 'Waste $', filter: 'number' },
					{ name: 'Waste %', filter: 'number' },
					{ name: 'Comparison Name', filter: 'text' },
					{ name: 'Comparison Sales', filter: 'number' },
				],
				data: varianceFoodCostData.flatMap((row) =>
					// Skip the top-level "Total" department and go to the inner "FOOD" department
					row.subRows.flatMap((department) =>
						department.subRows.flatMap((subDepartment) =>
							subDepartment.subRows.map((item) => ({
								Department: department.department,
								'Sub Department': subDepartment.subDepartment,
								Description: item.description,
								UOM: item.countDisplayUnitName,
								'Actual #': item.actualNumber,
								'Actual $': item.actualDollar,
								'Actual %': item.actualPct,
								'Ideal #': item.idealNumber,
								'Ideal $': item.idealDollar,
								'Ideal %': item.idealPct,
								'Variance #': item.varianceNumber,
								'Variance $': item.varianceDollar,
								'Variance %': item.variancePct,
								'Waste #': item.wasteNumber,
								'Waste $': item.wasteDollar,
								'Waste %': item.wastePct,
								'Comparison Name': subDepartment.comparisonName,
								'Comparison Sales': subDepartment.comparisonSales,
							}))
						)
					)
				),
			},
		];

		const filename = 'varianceFoodCost';
		const spreadSheetTitle = 'Variance Food Cost Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const handleClickOutside = (event) => {
		if (popupRef.current && !popupRef.current.contains(event.target)) {
			setIsPopupVisible(false);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const Table = (
		<TableHOC
			columns={columns}
			data={varianceFoodCostData}
			view={viewby}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
		/>
	);

	return (
		<>

			<div className='w-10/12 mx-auto pageContainer'>

				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Variance Food Cost</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyID={companyID}
							alignmentID={alignmentID}
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
						/>

						<div className='w-36'>
							<Dropdown
								options={countDropdownOptions}
								title='Count Type'
								selectedOption={view}
								onOptionChange={handleCountType}
							/>
						</div>
						<div className='run-button' onClick={handleRun}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<>
						{varianceFoodCostData.length > 0 && (
							<div className='w-52 display-flex'>
								<Dropdown
									title='Expand View'
									options={viewOptions}
									selectedOption={viewby}
									onOptionChange={(option) => setViewBy(option)}
								/>
								{/* start  */}
								<div className='flex items-center justify-center w-full  py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl  mt-[31px] '>
									<div 	onClick={() => setIsPopupVisible(!isPopupVisible)}className='items-center justify-center w-full px-6 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid' >
										<span
											// onClick={() => setIsPopupVisible(!isPopupVisible)}
											className='cursor-pointer mt-[47px]'
										>
											{' '}
											More....
										</span>
									</div>
									{isPopupVisible && (
										<div className='more-container !mt-[32px]' ref={popupRef}>
											<div className='option mb-2 w-[258px]'>
												<button className='w-[100%]'>Show/Hide Departments</button>
											</div>
											<div className='option mb-2 w-[258px]'>
												<button
													className='w-[100%]'
													onClick={() => {
														handleCountsheet(); // For Beginning Countsheet
														setIsPopupVisible(false);
													}}
												>
													View Beginning Countsheet
												</button>
											</div>
											<div className='option mb-2 w-[258px]'>
												<button
													className='w-[100%]'
													onClick={() => {
														handleCountsheet(true); // For Ending Countsheet
														setIsPopupVisible(false);
													}}
												>
													View Ending Countsheet
												</button>
											</div>
											<div className='option'>
												<button
													className='w-[100%]'
													onClick={() => {
														handleViewPurchase(selectedFromDate, selectedToDate, true); // For view Purchase
														setIsPopupVisible(false);
													}}
												>
													View Purchases
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						)}
						<div className='relative w-full min-h-56'><Loader loading={isLoading} />
							{!isLoading &&
								(varianceFoodCostData.length > 0 ? (
									<div className='paged-table'>{Table}</div>
								) : !selectedUnit ? (
									<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
								) : (
									<div className='mt-10 text-xl font-medium text-center'>No data available</div>
								))}
						</div>
					</>
				)}
				<div>
					<UnitModal
						unitData={unitsAndAreasList}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showModal}
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

export default VarianceFoodCost;
