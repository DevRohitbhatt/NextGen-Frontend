import { useEffect, useMemo, useState, useRef } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
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
import actualFoodCosts from '../../assets/introJSSteps/actualFoodCosts';
import { useNavigate } from 'react-router-dom';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const ActualFoodCost = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);
	const [actualFoodCostData, setActualFoodCostData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Actual Food Cost Report, please try again later.'
	);
	const navigate = useNavigate();
	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

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
	const viewOptions = [
		{ name: 'Department', row: 1 },
		{ name: 'Sub Department', row: 2 },
		{ name: 'Inventory Item', row: 3 },
	];
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: actualFoodCosts(),
		initialStep: 0,
		stepsEnabled: false,
	});
	const moreOptionsDropdown = useRef(null);
	const viewMap = {
		Weekly: 'WE',
		Daily: 'DA',
		Monthly: 'MO',
		Shift: 'SH',
	};

	const handleViewChange = (option) => {
		setView(option);
		setCountType(viewMap[option] || '');
	};
	const handleTotalViewChange = (option) => {
		setViewBy(option);
	};

	useEffect(() => {}, [countType]);

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
			columnHelper.accessor('begCountDisplayUnits', {
				id: 'begCountDisplayUnits',
				header: 'Beg #',
				dataType: 'number',
				cell: ({ getValue }) => getValue()?.toFixed(2),
				size: 90,
			}),
			columnHelper.accessor('begCountCost', {
				id: 'begCountCost',
				header: 'Beg $',
				dataType: 'number',
				cell: ({ row, getValue }) => `${calculateSum(row, 'begCountCost', getValue)}`,
				size: 90,
			}),
			columnHelper.accessor('purchaseDisplayUnits', {
				id: 'purchaseDisplayUnits',
				header: 'Pur #',
				dataType: 'number',
				size: 60,
			}),
			columnHelper.accessor('purchaseCost', {
				id: 'purchaseCost',
				header: 'Pur $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'purchaseCost', getValue),
				size: 60,
			}),
			columnHelper.accessor('iTinCountDisplayUnits', {
				id: 'iTinCountDisplayUnits',
				header: 'Trans In #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
				size: 60,
			}),
			columnHelper.accessor('iTinCountCost', {
				id: 'iTinCountCost',
				header: 'Trans In $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'iTinCountCost', getValue),
				size: 60,
			}),
			columnHelper.accessor('iToutCountDisplayUnits', {
				id: 'iToutCountDisplayUnits',
				header: 'Trans Out #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
				size: 80,
			}),
			columnHelper.accessor('iToutCountCost', {
				id: 'iToutCountCost',
				header: 'Trans Out $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'iToutCountCost', getValue),
				size: 80,
			}),
			columnHelper.accessor('endCountDisplayUnits', {
				id: 'endCountDisplayUnits',
				header: 'End #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
				size: 60,
			}),
			columnHelper.accessor('endCountCost', {
				id: 'endCountCost',
				header: 'End $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'endCountCost', getValue),
				size: 60,
			}),
			columnHelper.accessor('usageCountDisplayUnits', {
				id: 'usageCountDisplayUnits',
				header: 'Actual Usage #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
				size: 80,
			}),
			columnHelper.accessor('usageCost', {
				id: 'usageCost',
				header: 'Actual Usage $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'usageCost', getValue),
				size: 80,
			}),
			columnHelper.accessor('usageCostPct', {
				id: 'usageCostPct',
				header: 'Actual Usage %',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'usageCostPct', getValue, true),
				size: 90,
			}),
			columnHelper.accessor('wasteCountDisplayUnits', {
				id: 'wasteCountDisplayUnits',
				header: 'Waste #',
				dataType: 'number',
				size: 80,
			}),
			columnHelper.accessor('wasteCountCost', {
				id: 'wasteCountCost',
				header: 'Waste $',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'wasteCountCost', getValue),
				size: 80,
			}),
			columnHelper.accessor('wasteCostPct', {
				id: 'wasteCostPct',
				header: 'Waste %',
				dataType: 'number',
				cell: ({ row, getValue }) => calculateSum(row, 'wasteCostPct', getValue, true),
				size: 90,
			}),
			columnHelper.accessor('comparisonName', {
				id: 'comparisonName',
				header: 'Comparison Name',
				dataType: 'string',
				size: 100,
			}),
			columnHelper.accessor('comparisonSales', {
				id: 'comparisonSales',
				header: 'Comparison Sales',
				dataType: 'number',
				cell: ({ getValue }) => (getValue() !== undefined ? `$${getValue().toFixed(2)}` : ''),
				size: 100,
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
			return isPercentage ? `${getValue()?.toFixed(2)}%` : `$${getValue()?.toFixed(2)}`;
		}
	};

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	const fetchActualFoodCostReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);

			const getData = {
				url: 'ActualFoodCost',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					countType: countType,
				},
			};

			const result = await getCall(getData);
			if (result?.data && result?.data?.length === 0) {
				setActualFoodCostData([]);
			} else {
				const newData = [
					{
						department: 'TOTAL',
						subRows: result.data.map((department) => ({
							department: department.department,
							comparisonName: department.subDepartments[0]?.actualFoodCosts[0]?.comparisonName || '',
							comparisonSales: department.subDepartments[0]?.actualFoodCosts[0]?.comparisonSales || 0,
							subRows: department.subDepartments.map((subDepartment) => ({
								subDepartment: subDepartment.subDepartment,
								comparisonName: department.subDepartments[0]?.actualFoodCosts[0]?.comparisonName || '',
								comparisonSales: department.subDepartments[0]?.actualFoodCosts[0]?.comparisonSales || 0,
								subRows: subDepartment.actualFoodCosts.map((foodCost) => ({
									description: foodCost.description,
									caseUnitName: foodCost.caseUnitName,
									countDisplayUnitName: foodCost.countDisplayUnitName,
									begCountDisplayUnits: foodCost.begCountDisplayUnits,
									begCountCases: foodCost.begCountCases,
									begCountCost: foodCost.begCountCost,
									purchaseCases: foodCost.purchaseCases,
									purchaseDisplayUnits: foodCost.purchaseDisplayUnits,
									purchaseCost: foodCost.purchaseCost,
									iTinCountDisplayUnits: foodCost.iTinCountDisplayUnits,
									iTinCountCases: foodCost.iTinCountCases,
									iTinCountCost: foodCost.iTinCountCost,
									iToutCountDisplayUnits: foodCost.iToutCountDisplayUnits,
									iToutCountCases: foodCost.iToutCountCases,
									iToutCountCost: foodCost.iToutCountCost,
									wasteCountDisplayUnits: foodCost.wasteCountDisplayUnits,
									wasteCountCases: foodCost.wasteCountCases,
									wasteCountCost: foodCost.wasteCountCost,
									wasteCostPct: foodCost.salesNet
										? (foodCost.wasteCountCost / foodCost.salesNet) * 100
										: 0,
									endCountDisplayUnits: foodCost.endCountDisplayUnits,
									endCountCases: foodCost.endCountCases,
									endCountCost: foodCost.endCountCost,
									usageCases: foodCost.usageCases,
									usageCountDisplayUnits: foodCost.usageCountDisplayUnits,
									usageCost: foodCost.usageCost,
									usageCostPct: foodCost.usageCostPct,
									salesNet: foodCost.salesNet,
									comparisonName: foodCost.comparisonName,
									comparisonSales: foodCost.comparisonSales,
									yieldPerCase: foodCost.yieldPerCase,
									yieldPerCountDisplayUnit: foodCost.yieldPerCountDisplayUnit,
								})),
							})),
						})),
					},
				];

				setActualFoodCostData(newData);
			}
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Actual Food Cost data: ', error);
		}
	};

	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setShowUnitModal(false);
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
		let body = [];
		actualFoodCostData.flatMap((row) => [
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
						'string',
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
				'Comparison Name',
				'Comparison Sales',
			],
			rows: data.subRows.flatMap((subRow) =>
				subRow.subRows.map((subSubRow) => [
					{ value: subRow.subDepartment, cellType: 'string', columnName: 'Sub Department' },
					{ value: subSubRow.description, cellType: 'string', columnName: 'Description' },
					{ value: subSubRow.countDisplayUnitName, cellType: 'string', columnName: 'UOM' },
					{ value: subSubRow.begCountDisplayUnits, cellType: 'number', columnName: 'Beg #' },
					{ value: subSubRow.begCountCost, cellType: 'number', columnName: 'Beg $' },
					{ value: subSubRow.purchaseDisplayUnits, cellType: 'number', columnName: 'Pur #' },
					{ value: subSubRow.purchaseCost, cellType: 'number', columnName: 'Pur $' },
					{ value: subSubRow.iTinCountDisplayUnits, cellType: 'number', columnName: 'Trans In#' },
					{ value: subSubRow.iTinCountCost, cellType: 'number', columnName: 'Trans In $' },
					{ value: subSubRow.iToutCountDisplayUnits, cellType: 'number', columnName: 'Trans Out #' },
					{ value: subSubRow.iToutCountCost, cellType: 'number', columnName: 'Trans Out $' },
					{ value: subSubRow.endCountDisplayUnits, cellType: 'number', columnName: 'End #' },
					{ value: subSubRow.endCountCost, cellType: 'number', columnName: 'End $' },
					{ value: subSubRow.usageCountDisplayUnits, cellType: 'number', columnName: 'Actual Usage #' },
					{ value: subSubRow.usageCost, cellType: 'number', columnName: 'Actual Usage $' },
					{ value: subSubRow.usageCostPct, cellType: 'number', columnName: 'Actual Usage %' },
					{ value: subSubRow.wasteCountDisplayUnits, cellType: 'number', columnName: 'Waste #' },
					{ value: subSubRow.wasteCountCost, cellType: 'number', columnName: 'Waste $' },
					{ value: subSubRow.comparisonName, cellType: 'string', columnName: 'Comparison Name' },
					{ value: subSubRow.comparisonSales, cellType: 'number', columnName: 'Comparison Sales' },
				])
			),
		};

		return newData;
	};

	const togglePopup = () => {
		setIsDropdownVisible(!isDropdownVisible);
	};

	// // Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: 'Actual Food Cost Report',
				columns: [
					{ name: 'Department', filter: 'text' },
					{ name: 'Sub Department', filter: 'text' },
					{ name: 'Description', filter: 'text' },
					{ name: 'UOM', filter: 'text' },
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
					{ name: 'Comparison Sales', filter: 'text' },
				],
				data: actualFoodCostData.flatMap((row) =>
					row.subRows.flatMap((department) =>
						department.subRows.flatMap((subDepartment) =>
							subDepartment.subRows.map((item) => ({
								department: department.department,
								subDepartment: subDepartment.subDepartment,
								description: item.description,
								UOM: item.countDisplayUnitName,
								begNumber: item.begCountDisplayUnits,
								begDollar: item.begCountCost,
								purNumber: item.purchaseDisplayUnits,
								purDollar: item.purchaseCost,
								trInNumber: item.iTinCountDisplayUnits,
								trInDollar: item.iTinCountCost,
								trOutNumber: item.iToutCountDisplayUnits,
								trOutDollar: item.iToutCountCost,
								endDollar: item.endCountDisplayUnits,
								useNumber: item.endCountCost,
								useDollar: item.usageCountDisplayUnits,
								salesNet: item.usageCost,
								usePct: item.usageCostPct,
								wasteNumber: item.wasteCountDisplayUnits,
								wasteDollar: item.wasteCountCost,
								wasteCostPct: item.wasteCostPct,
								comparisonName: item.comparisonName,
								comparisonSales: item.comparisonSales,
							}))
						)
					)
				),
			},
		];

		const filename = 'ActualFoodCost';
		const spreadSheetTitle = 'Actual Food Cost Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
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
			data={actualFoodCostData}
			view={viewOptions.find((option) => option.name === viewby)?.row}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
		/>
	);

	const handleCountsheet = async (fromDate, toDate, isEnding = false) => {
		try {
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: fromDate.toLocaleDateString('en-CA'),
					toDate: toDate.toLocaleDateString('en-CA'),
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

			navigate('/CountsheetDesigner', { state: { companyId: companyID, countsheet: countsheet } });
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

			navigate('/PurchaseAnalysis', {
				state: {
					companyId: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: fromDate.toLocaleDateString('en-CA'),
					toDate: toDate.toLocaleDateString('en-CA'),
					vendorId: 0,
					unitsAndAreasList: unitsAndAreas,
					purchaseData: result,
				},
			});
		} catch (error) {
			console.error('Error getting Countsheet data: ', error);
		}
	};

	return (
		<>
			<div className='w-10/12 mx-auto pageContainer'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Actual Food Cost</h2>
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
						/>
						<div className='w-36'>
							<Dropdown
								title='Count Type'
								options={dropdownOptions}
								selectedOption={view}
								onOptionChange={handleViewChange}
							/>
						</div>

						<div className='run-button' onClick={fetchActualFoodCostReport}>
							<div className='py-3 ml-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<>
						{actualFoodCostData.length > 0 && (
							<div className='flex flex-row items-center space-x-2 '>
								<div className='w-48'>
									<Dropdown
										title='Expand View'
										options={viewOptions}
										selectedOption={viewby}
										onOptionChange={handleTotalViewChange}
									/>
								</div>
								<div className='flex items-center justify-center w-28  py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl  mt-[31px] '>
									<div
										onClick={togglePopup}
										className='items-center justify-center w-full px-6 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
									>
										<span className='cursor-pointer '> More....</span>
									</div>
									{isDropdownVisible && (
										<div className='more-container z-9 !mt-[32px]' ref={moreOptionsDropdown}>
											<div className='option mb-2 w-[258px]'>
												<button className='w-[100%] bg-[#f9f9f9]'>Show/Hide Departments</button>
											</div>
											<div className='option mb-2 w-[258px]'>
												<button
													className='w-[100%] bg-[#f9f9f9]'
													onClick={() => {
														handleCountsheet(selectedFromDate, selectedToDate); // For Beginning Countsheet
														setIsDropdownVisible(false);
													}}
												>
													View Beginning Countsheet
												</button>
											</div>
											<div className='option mb-2 w-[258px] bg-[#f9f9f9]'>
												<button
													className='w-[100%]'
													onClick={() => {
														handleCountsheet(selectedToDate, selectedToDate, true); // For Ending Countsheet
														setIsDropdownVisible(false);
													}}
												>
													View Ending Countsheet
												</button>
											</div>
											<div className='option'>
												<button
													className='w-[100%] bg-[#f9f9f9]'
													onClick={() => {
														handleViewPurchase(selectedFromDate, selectedToDate, true); // For View Purchase
														setIsDropdownVisible(false);
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

						{/* Display the table if there is no error and the data is not loading */}
						<div className='relative w-full min-h-56'>
							<Loader loading={isLoading} />

							{!isLoading &&
								(actualFoodCostData.length > 0 ? (
									<div className='paged-table'>{Table}</div>
								) : !selectedUnit ? (
									<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
								) : (
									<div className='mt-10 text-xl font-medium text-center'>No data available</div>
								))}
						</div>
					</>
				)}{' '}
				<div>
					<UnitModal
						unitData={unitsAndAreas}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showUnitModal}
						includeAreas={false}
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
				</div>
			</div>
		</>
	);
};

export default ActualFoodCost;
