import { useEffect, useMemo, useState, useRef } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useNavigate } from 'react-router-dom';
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
import varianceFoodCost from './../../assets/introJSSteps/varianceFoodCost';

const columnHelper = createColumnHelper();

const VarianceFoodCost = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [varianceFoodCostData, setVarianceFoodCostData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	const navigate = useNavigate();

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Variance Food Cost Report, please try again later.'
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
			columnHelper.accessor('actualNumber', {
				id: 'actualNumber',
				header: 'Actual #',
				dataType: 'number',
			}),
			columnHelper.accessor('actualDollar', {
				id: 'actualDollar',
				header: 'Actual $',
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
															(subsubsubrow.original.actualDollar
																? Number(subsubsubrow.original.actualDollar)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.actualDollar
														? Number(subSubrow.original.actualDollar)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.actualDollar ? Number(subrow.original.actualDollar) : 0)
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
			columnHelper.accessor('actualPct', {
				id: 'actualPct',
				header: 'Actual %',
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
															(subsubsubrow.original.actualPct
																? Number(subsubsubrow.original.actualPct * 100)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.actualPct
														? Number(subSubrow.original.actualPct * 100)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.actualPct ? Number(subrow.original.actualPct * 100) : 0)
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
			columnHelper.accessor('idealNumber', {
				id: 'idealNumber',
				header: 'Ideal #',
				dataType: 'number',
			}),
			columnHelper.accessor('idealDollar', {
				id: 'idealDollar',
				header: 'Ideal $',
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
															(subsubsubrow.original.idealDollar
																? Number(subsubsubrow.original.idealDollar)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.idealDollar
														? Number(subSubrow.original.idealDollar)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.idealDollar ? Number(subrow.original.idealDollar) : 0)
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
			columnHelper.accessor('idealPct', {
				id: 'idealPct',
				header: 'Ideal %',
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
															(subsubsubrow.original.idealPct
																? Number(subsubsubrow.original.idealPct)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.idealPct
														? Number(subSubrow.original.idealPct)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return acc + (subrow.original.idealPct ? Number(subrow.original.idealPct) : 0);
								}
							}, 0)
							.toFixed(2);
						return `${sum}%`;
					} else {
						return `${(getValue() ?? 0).toFixed(2)}%`;
					}
				},
			}),
			columnHelper.accessor('varianceNumber', {
				id: 'varianceNumber',
				header: 'Variance #',
				dataType: 'number',
			}),
			columnHelper.accessor('varianceDollar', {
				id: 'varianceDollar',
				header: 'Variance $',
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
															(subsubsubrow.original.varianceDollar
																? Number(subsubsubrow.original.varianceDollar)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.varianceDollar
														? Number(subSubrow.original.varianceDollar)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc +
										(subrow.original.varianceDollar ? Number(subrow.original.varianceDollar) : 0)
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
			columnHelper.accessor('variancePct', {
				id: 'variancePct',
				header: 'Variance %',
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
															(subsubsubrow.original.variancePct
																? Number(subsubsubrow.original.variancePct)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.variancePct
														? Number(subSubrow.original.variancePct)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.variancePct ? Number(subrow.original.variancePct) : 0)
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
			columnHelper.accessor('wasteNumber', {
				id: 'wasteNumber',
				header: 'Waste #',
				dataType: 'number',
			}),
			columnHelper.accessor('wasteDollar', {
				id: 'wasteDollar',
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
															(subsubsubrow.original.wasteDollar
																? Number(subsubsubrow.original.wasteDollar)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.wasteDollar
														? Number(subSubrow.original.wasteDollar)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return (
										acc + (subrow.original.wasteDollar ? Number(subrow.original.wasteDollar) : 0)
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
			columnHelper.accessor('wastePct', {
				id: 'wastePct',
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
															(subsubsubrow.original.wastePct
																? Number(subsubsubrow.original.wastePct)
																: 0),
														0
													)
												);
											} else {
												return (
													subAcc +
													(subSubrow.original.wastePct
														? Number(subSubrow.original.wastePct)
														: 0)
												);
											}
										}, 0)
									);
								} else {
									return acc + (subrow.original.wastePct ? Number(subrow.original.wastePct) : 0);
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
	const handleVarianceFoodCost = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
			const getData = {
				url: 'varianceFoodCost',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
					countType: countType,
				},
			};

			const result = await getCall(getData);
			const newData = [
				{
					department: 'Total',
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
								idealPct: (foodCost.idealCost / foodCost.salesNet) * 100,
								varianceNumber: foodCost.varianceQuant,
								varianceDollar: foodCost.varianceCost,
								variancePct: (foodCost.varianceCost / foodCost.salesNet) * 100,
								wasteNumber: foodCost.wasteCountCases,
								wasteDollar: foodCost.wasteCountCost,
								wastePct: (foodCost.wasteCountCost / foodCost.salesNet) * 100,
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
		setselectedUnitName(unitName);
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
					companyID: companyId,
					alignmentID: alignmentId,
					memberID: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
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

			navigate('/CountsheetDesigner', { state: { companyId: companyId, countsheet: countsheet } });
		} catch (error) {
			console.error('Error getting Countsheet data: ', error);
		}
	};

	const handleViewPurchase = async (fromDate, toDate) => {
		try {
			const getData = {
				url: 'PurchaseAnalysis',
				urlParams: {
					companyID: companyId,
					alignmentID: alignmentId,
					memberID: selectedUnit,
					fromDate: fromDate.toLocaleDateString('en-CA'),
					toDate: toDate.toLocaleDateString('en-CA'),
					vendorId: 0,
				},
			};

			const result = await getCall(getData);

			navigate('/Purchase', {
				state: {
					companyId: companyId,
					alignmentID: alignmentId,
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
			console.error('Variance Food COst report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Variance Food Cost Report',
			subHeaders: [
				`${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		console.log('pdfData', pdfData);

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = varianceFoodCostData.flatMap((row) => {
			return {
				type: 'table',
				title: row.department,
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
				data: formatPDFData(row.subRows),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
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
			rows: data.flatMap((row) =>
				row.subRows.flatMap((subRow) =>
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
				)
			),
		};
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
		const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

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
		<TableHOC2
			columns={columns}
			data={varianceFoodCostData}
			view={viewby}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
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
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Variance Food Cost</h2>
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
					<div className='run-button' onClick={handleVarianceFoodCost}>
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
				<>
					{varianceFoodCostData.length > 0 && (
						<div className='w-52 display-flex'>
							<Dropdown
								title='Expand View'
								options={viewOptions}
								selectedOption={viewby}
								onOptionChange={(option) => setViewBy(option)}
							/>
							<span
								onClick={() => setIsPopupVisible(!isPopupVisible)}
								className='cursor-pointer mt-[47px]'
							>
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
					)}

					{varianceFoodCostData.length > 0 && <div className='paged-table'>{Table}</div>}
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

export default VarianceFoodCost;
