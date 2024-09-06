import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { Link, useNavigate } from 'react-router-dom';
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
	const [showMoreModel, setShowMoreModel] = useState(false);

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
	const [countType, setCountType] = useState('Weekly');
	const countDropdownOptions = [{ name: 'Daily' }, { name: 'Monthly' }, { name: 'Shift' }, { name: 'Weekly' }];
	// const [viewTotal, setViewTotal] = useState('Department');
	// const ViewDropdownOptions = [{ name: 'Department' }, { name: 'Sub-Department' }, { name: 'Inventory Item' }];

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
			columnHelper.accessor('actualNumber', {
				id: 'actualNumber',
				header: 'Actual #',
				dataType: 'number',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
								if (subrow.getCanExpand()) {
									return (
										acc +
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
			columnHelper.accessor('idealNumber', {
				id: 'idealNumber',
				header: 'Ideal #',
				dataType: 'number',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
								if (subrow.getCanExpand()) {
									return (
										acc +
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
			columnHelper.accessor('varianceNumber', {
				id: 'varianceNumber',
				header: 'Variance #',
				dataType: 'number',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
								if (subrow.getCanExpand()) {
									return (
										acc +
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
			columnHelper.accessor('wasteNumber', {
				id: 'wasteNumber',
				header: 'Waste #',
				dataType: 'number',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
								if (subrow.getCanExpand()) {
									return (
										acc +
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
										subrow.subRows.reduce(
											(subAcc, subSubrow) =>
												subAcc +
												subSubrow.subRows.reduce(
													(subsubAcc, subsubsubrow) =>
														subsubAcc +
														(subsubsubrow.original.actualNumber
															? Number(subsubsubrow.original.actualNumber)
															: 0),
													0
												),
											0
										)
									);
								} else {
									return (
										acc + (subrow.original.actualNumber ? Number(subrow.original.actualNumber) : 0)
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
	const handleLaborByPayPeriod = async () => {
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
					fromDate: selectedFromDate.toISOString().split('T')[0],
					toDate: selectedToDate.toISOString().split('T')[0],
					countType:
						countType === 'Weekly'
							? 'WE'
							: countType === 'Monthly'
							? 'MO'
							: countType === 'Daily'
							? 'DA'
							: countType === 'Shift'
							? 'SH'
							: countType,
				},
			};

			const result = await getCall(getData);
			const newData = [
				{
					department: 'Total',
					subRows: result.data.map((department) => ({
						department: department.department,
						comparisonName: department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonName || '',
						comparisonSales: department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonSales || 0,
						subRows: department.subDepartments.map((subDepartment) => ({
							subDepartment: subDepartment.subDepartment,
							comparisonName:
								department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonName || '',
							comparisonSales:
								department.subDepartments[0]?.varianceFoodCostModels[0]?.comparisonSales || 0,
							subRows: subDepartment.varianceFoodCostModels.map((foodCost) => ({
								description: foodCost.description,
								actualNumber: foodCost.actualNumber,
								actualDollar: foodCost.actualDollar,
								actualPct: foodCost.actualPct,
								idealNumber: foodCost.idealNumber,
								idealDollar: foodCost.idealDollar,
								idealPct: foodCost.idealPct,
								varianceNumber: foodCost.varianceNumber,
								varianceDollar: foodCost.varianceDollar,
								variancePct: foodCost.variancePct,
								wasteNumber: foodCost.wasteNumber,
								wasteDollar: foodCost.wasteDollar,
								wastePct: foodCost.wastePct,
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

	const handleBeginnerCountsheet = async () => {
		try {
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyId,
					alignmentID: alignmentId,
					memberID: selectedUnit,
					fromDate: selectedFromDate.toISOString().split('T')[0],
					toDate: selectedToDate.toISOString().split('T')[0],
				},
			};

			const result = await getCall(getData);
			console.log('Countsheet data: ', result.data);

			const minCountsheet = result.data.reduce((minCountsheet, countsheet) => {
				if (
					!minCountsheet ||
					countsheet.dateTime < minCountsheet.dateTime ||
					(countsheet.dateTime === minCountsheet.dateTime &&
						countsheet.saveDateTime > minCountsheet.saveDateTime)
				) {
					minCountsheet = countsheet;
				}
				return minCountsheet;
			}, null);

			navigate('/Countsheets', { state: { companyId: companyId, countsheet: minCountsheet } });
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
				],
				dataTypes: [
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
						{ value: subRow.subDepartment, cellType: 'number', columnName: 'Sub Department' },
						{ value: subSubRow.description, cellType: 'string', columnName: 'Description' },
						{ value: subSubRow.actualNumber, cellType: 'number', columnName: 'Actual #' },
						{ value: subSubRow.actualDollar, cellType: 'number', columnName: 'Actual $' },
						{ value: subSubRow.actualPct, cellType: 'number', columnName: 'Actual %' },
						{ value: subSubRow.idealNumber, cellType: 'number', columnName: 'Ideal #' },
						{ value: subSubRow.idealDollar, cellType: 'number', columnName: 'Ideal $' },
						{ value: subSubRow.idealPct, cellType: 'number', columnName: 'Ideal %' },
						{ value: subSubRow.varianceNumber, cellType: 'number', columnName: 'Variance #' },
						{ value: subSubRow.varianceDollar, cellType: 'number', columnName: 'Variance $' },
						{ value: subSubRow.variancePct, cellType: 'number', columnName: 'Variance %' },
						{ value: subSubRow.wasteNumber, cellType: 'number', columnName: 'Waste #' },
						{ value: subSubRow.wasteDollar, cellType: 'number', columnName: 'Waste $' },
						{ value: subSubRow.wastePct, cellType: 'number', columnName: 'Waste %' },
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

	const Table = <TableHOC2 columns={columns} data={varianceFoodCostData} />;

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
							selectedOption={countType}
							onOptionChange={(option) => setCountType(option)}
						/>
					</div>
					{/* <div className='w-52'>
						<Dropdown
							title='View Total By'
							options={ViewDropdownOptions}
							selectedOption={viewTotal}
							onOptionChange={(option) => setViewTotal(option)}
						/>
					</div> */}
					<div className='run-button' onClick={handleLaborByPayPeriod}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
					<button className='relative' onClick={() => setShowMoreModel(!showMoreModel)}>
						more..
						{showMoreModel && (
							<ul className='absolute left-0 w-56 p-4 mt-2 space-y-3 text-left rounded-lg top-full bg-secondary'>
								<li
									onClick={handleBeginnerCountsheet}
									className='p-2 hover:bg-primary hover:text-white'
								>
									Beginning Countsheet
								</li>
								<li className='p-2 hover:bg-primary hover:text-white'>Ending Countsheet</li>
							</ul>
						)}
					</button>
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
				varianceFoodCostData.length > 0 && <div className='paged-table'>{Table}</div>
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
