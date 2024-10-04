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
	const globalState = useSelector((state) => state.globalState);
	const companyID = useSelector((state) => state.globalState.companyID);
	const alignmentID = useSelector((state) => state.globalState.alignmentID);
	const unitsAndAreasList = useSelector((state) => state.globalState.unitsAndAreas);

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
	const [selectedUnitName, setSelectedUnitName] = useState('No Unit Selected');
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
	const [isPopupVisible, setIsPopupVisible] = useState(false);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: actualFoodCosts(),
		initialStep: 0,
		stepsEnabled: false,
	});
	const popupRef = useRef(null);
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
			}),
			columnHelper.accessor('countDisplayUnitName', {
				id: 'countDisplayUnitName',
				header: 'UOM',
				dataType: 'string',
			}),
			columnHelper.accessor('begCountDisplayUnits', {
				id: 'begCountDisplayUnits',
				header: 'Beg #',
				dataType: 'number',
			}),
			columnHelper.accessor('begCountCost', {
				id: 'begCountCost',
				header: 'Beg $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.begCountCost
																? Number(subsubsubrow.original.begCountCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.begCountCost
														? Number(subSubrow.original.begCountCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.begCountCost ? Number(subrow.original.begCountCost) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('purchaseDisplayUnits', {
				id: 'purchaseDisplayUnits',
				header: 'Pur #',
				dataType: 'number',
			}),
			columnHelper.accessor('purchaseCost', {
				id: 'purchaseCost',
				header: 'Pur $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.purchaseCost
																? Number(subsubsubrow.original.purchaseCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.purchaseCost
														? Number(subSubrow.original.purchaseCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.purchaseCost ? Number(subrow.original.purchaseCost) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('iTinCountDisplayUnits', {
				id: 'iTinCountDisplayUnits',
				header: 'Trans In #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
			}),
			columnHelper.accessor('iTinCountCost', {
				id: 'iTinCountCost',
				header: 'Trans In $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.iTinCountCost
																? Number(subsubsubrow.original.iTinCountCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.iTinCountCost
														? Number(subSubrow.original.iTinCountCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc +
										(subrow.original.iTinCountCost ? Number(subrow.original.iTinCountCost) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('iToutCountDisplayUnits', {
				id: 'iToutCountDisplayUnits',
				header: 'Trans Out #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
			}),
			columnHelper.accessor('iToutCountCost', {
				id: 'iToutCountCost',
				header: 'Trans Out $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.iToutCountCost
																? Number(subsubsubrow.original.iToutCountCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.iToutCountCost
														? Number(subSubrow.original.iToutCountCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc +
										(subrow.original.iToutCountCost ? Number(subrow.original.iToutCountCost) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('endCountDisplayUnits', {
				id: 'endCountDisplayUnits',
				header: 'End #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
			}),
			columnHelper.accessor('endCountCost', {
				id: 'endCountCost',
				header: 'End $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.endCountCost
																? Number(subsubsubrow.original.endCountCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.endCountCost
														? Number(subSubrow.original.endCountCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.endCountCost ? Number(subrow.original.endCountCost) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('usageCountDisplayUnits', {
				id: 'usageCountDisplayUnits',
				header: 'Actual Usage #',
				cell: ({ row, getValue }) => (row.getCanExpand() ? getValue() : getValue()?.toFixed(2)),
				dataType: 'number',
			}),
			columnHelper.accessor('usageCost', {
				id: 'usageCost',
				header: 'Actual Usage $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.usageCost
																? Number(subsubsubrow.original.usageCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.usageCost
														? Number(subSubrow.original.usageCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return acc + (subrow.original.usageCost ? Number(subrow.original.usageCost) : 0);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('usageCostPct', {
				id: 'usageCostPct',
				header: 'Actual Usage %',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.usageCostPct
																? Number(subsubsubrow.original.usageCostPct * 100)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.usageCostPct
														? Number(subSubrow.original.usageCostPct * 100)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc +
										(subrow.original.usageCostPct ? Number(subrow.original.usageCostPct * 100) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() * 100 ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('wasteCountDisplayUnits', {
				id: 'wasteCountDisplayUnits',
				header: 'Waste #',
				dataType: 'number',
			}),
			columnHelper.accessor('wasteCountCost', {
				id: 'wasteCountCost',
				header: 'Waste $',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.wasteCountCost
																? Number(subsubsubrow.original.wasteCountCost)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.wasteCountCost
														? Number(subSubrow.original.wasteCountCost)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc +
										(subrow.original.wasteCountCost ? Number(subrow.original.wasteCountCost) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return (getValue() ?? 0).toFixed(2);
					}
				},
			}),
			columnHelper.accessor('wasteCostPct', {
				id: 'wasteCostPct',
				header: 'Waste %',
				dataType: 'number',
				cell: ({ row, getValue }) => {
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
															(subsubsubrow.original.wasteCostPct
																? Number(subsubsubrow.original.wasteCostPct)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.wasteCostPct
														? Number(subSubrow.original.wasteCostPct)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.wasteCostPct ? Number(subrow.original.wasteCostPct) : 0)
									);
								}
							}, 0)
							.toFixed(2);
						return `${sum}%`;
					} else {
						return `${(getValue() ?? 0).toFixed(2)}%`;
					}
				},
			}),
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
		if (globalState.groupOrUnitAccess || globalState.defaultUnitID) {
			setSelectedUnit(globalState.groupOrUnitAccess || globalState.defaultUnitID);
		}
		if (globalState.groupOrUnitAccessName || globalState.defaultUnitName) {
			setSelectedUnitName(globalState.groupOrUnitAccessName || globalState.defaultUnitName);
		}
	}, [
		globalState.defaultUnitID,
		globalState.groupOrUnitAccess,
		globalState.defaultUnitName,
		globalState.groupOrUnitAccessName,
	]);

	// Function to get the voids report
	const handleRun = async () => {
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

			const newData = [
				{
					department: 'Total',
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

		console.log('actualFoodCostData', actualFoodCostData);

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
		setIsPopupVisible(!isPopupVisible);
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
		const spreadSheetTitle = 'Actual FoodCost Report';
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
			data={actualFoodCostData}
			view={viewby}
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

			navigate('/Purchase', {
				state: {
					companyId: companyID,
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
				<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Actual Food Cost</h2>
				<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
					<div className='flex items-center space-x-3 '>
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
						/>
						<div className='w-36'>
							<Dropdown
								title='Count Type'
								options={dropdownOptions}
								selectedOption={view}
								onOptionChange={handleViewChange}
							/>
						</div>

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
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<>
						{actualFoodCostData.length > 0 && (
							<div className='w-52 display-flex'>
								<Dropdown
									title='Expand View'
									options={viewOptions}
									selectedOption={viewby}
									onOptionChange={handleTotalViewChange}
								/>
								<span onClick={togglePopup} className='cursor-pointer mt-[47px]'>
									{' '}
									More....
								</span>
								{isPopupVisible && (
									<div className='more-container' ref={popupRef}>
										<div className='option mb-2 w-[258px]'>
											<button className='w-[100%]'>Show/Hide Departments</button>
										</div>
										<div className='option mb-2 w-[258px]'>
											<button
												className='w-[100%]'
												onClick={() => {
													handleCountsheet(selectedFromDate, selectedToDate); // For Beginning Countsheet
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
													handleCountsheet(selectedToDate, selectedToDate, true); // For Ending Countsheet
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
													handleViewPurchase(selectedFromDate, selectedToDate, true); // For View Purchase
													setIsPopupVisible(false);
												}}
											>
												View Purchases
											</button>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Display the table if there is no error and the data is not loading */}
						{!isLoading &&
							(actualFoodCostData.length > 0 ? (
								<div className='paged-table'>{Table}</div>
							) : !selectedUnit ? (
								<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
							) : (
								<div className='mt-10 text-xl font-medium text-center'>No data available</div>
							))}
					</>
				)}{' '}
				<div>
					<UnitModal
						unitData={unitsAndAreasList}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showModal}
						includeAreas={false}
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

export default ActualFoodCost;
