import { useEffect, useMemo, useState, useRef } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
	Dropdown,
	Modal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import actualFoodCosts from '../../assets/introJSSteps/actualFoodCosts';
import { useNavigate } from 'react-router-dom';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const ActualFoodCost = () => {
	const { companyID, alignmentID, unitsAndAreas, defaultUnitID, defaultUnitName } = useSelector(
		(state) => state.globalState
	);
	const [actualFoodCostData, setActualFoodCostData] = useState([]);
	const [filteredActualFoodCostData, setFilteredActualFoodCostData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isDateLoading, setIsDateLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Actual Food Cost Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [fromDateOptions, setFromDateOptions] = useState([]);
	const [selectedToDate, setSelectedToDate] = useState();
	const [toDateOptions, setToDateOptions] = useState([]);
	const [showDateModal, setShowDateModal] = useState(false);

	const [showQuantities, setShowQuantities] = useState(true);
	const [showDollarAmounts, setShowDollarAmounts] = useState(true);
	const [showWarnings, setShowWarnings] = useState(false);

	const [isShowHideDepartments, setIsShowHideDepartments] = useState(false);
	const [checkedItems, setCheckedItems] = useState([
		{ name: 'DO NOT COUNT/DO NOT COUNT', showOnReport: false, includeInGrandTotal: false },
		{ name: 'FOOD/BEVERAGES', showOnReport: true, includeInGrandTotal: true },
		{ name: 'FOOD/BREAD', showOnReport: true, includeInGrandTotal: true },
		{ name: 'FOOD/DAIRY', showOnReport: true, includeInGrandTotal: true },
		{ name: 'FOOD/GROCERY', showOnReport: true, includeInGrandTotal: true },
		{ name: 'FOOD/MEAT', showOnReport: true, includeInGrandTotal: true },
		{ name: 'FOOD/PRODUCE', showOnReport: true, includeInGrandTotal: true },
		{ name: 'PREP/PREP', showOnReport: false, includeInGrandTotal: false },
		{ name: 'SUPPLY/CLEANING', showOnReport: true, includeInGrandTotal: true },
		{ name: 'SUPPLY/PAPER', showOnReport: true, includeInGrandTotal: true },
	]);

	//dropdown variables
	const [view, setView] = useState('Weekly');
	const [countType, setCountType] = useState('WE');
	const dropdownOptions = [{ name: 'Daily' }, { name: 'Monthly' }, { name: 'Shift' }, { name: 'Weekly' }];
	const [viewby, setViewBy] = useState('Department');
	const viewOptions = [
		{ name: 'Department', row: 1 },
		{ name: 'Sub Department', row: 2 },
		{ name: 'Inventory Item', row: 3 },
	];
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);

	const [isExportFilteredViewDropDownVisible, setIsExportFilteredViewDropDownVisible] = useState(false);
	const [checkedItemsLoaded, setCheckedItemsLoaded] = useState(false);
	const [tableState, setTableState] = useState(false);

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

	const [columns, setColumns] = useState([]);

	const generatedColumns = [
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
			showDepth: 2,
			dataType: 'string',
		}),
		columnHelper.accessor('description', {
			id: 'description',
			header: 'Description',
			showDepth: 3,
			dataType: 'string',
			size: 300,
		}),
		columnHelper.accessor('countDisplayUnitName', {
			id: 'countDisplayUnitName',
			header: 'UOM',
			showDepth: 3,
			dataType: 'string',
			size: 200,
		}),
		columnHelper.accessor('begCountDisplayUnits', {
			id: 'begCountDisplayUnits',
			header: 'Beg #',
			showDepth: 3,
			dataType: 'number',
			cell: ({ getValue }) => getValue()?.toFixed(2),
			size: 90,
		}),
		columnHelper.accessor('begCountCost', {
			id: 'begCountCost',
			header: 'Beg $',
			dataType: 'number',
			cell: ({ row, getValue }) => calculateSum(row, 'begCountCost', getValue),
			size: 90,
		}),
		columnHelper.accessor('purchaseDisplayUnits', {
			id: 'purchaseDisplayUnits',
			header: 'Pur #',
			showDepth: 3,
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			showDepth: 3,
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			showDepth: 3,
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			showDepth: 3,
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			showDepth: 3,
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			showDepth: 3,
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			header: 'Comparison Net Sales',
			dataType: 'number',
			cell: ({ getValue }) =>
				getValue() !== undefined ? `$${parseFloat(getValue().toFixed(2)).toLocaleString('en-US')}` : '',
			size: 100,
		}),
	];

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
									const item = checkedItems.find(
										(item) => item.name.split('/')[1] === subSubrow.original.subDepartment
									);
									return (
										subAcc +
										subSubrow.subRows.reduce(
											(subsubAcc, subsubsubrow) =>
												subsubAcc +
												(item.includeInGrandTotal && subsubsubrow.original[field]
													? Number(subsubsubrow.original[field])
													: 0),
											0
										)
									);
								} else {
									let item = checkedItems.find(
										(item) => item?.name.split('/')[1] === subrow.original.subDepartment
									);

									return (
										subAcc +
										(item?.includeInGrandTotal && subSubrow.original[field]
											? Number(subSubrow.original[field])
											: 0)
									);
								}
							}, 0)
						);
					} else {
						return acc + (subrow.original[field] ? Number(subrow.original[field]) : 0);
					}
				}, 0)
				.toFixed(2);
			if (isPercentage) {
				return `${parseFloat(sum).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}%`;
			}
			return sum < 0
				? `-$${Math.abs(parseFloat(sum)).toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
				  })}`
				: `$${parseFloat(sum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
		} else {
			const value = getValue();
			if (!value) return isPercentage ? '0.00%' : '$0.00';
			if (isPercentage) {
				return `${parseFloat(value).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}%`;
			}
			return value < 0
				? `-$${Math.abs(parseFloat(value)).toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
				  })}`
				: `$${parseFloat(value).toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
				  })}`;
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

	useEffect(() => {
		setColumns(generatedColumns);
	}, [checkedItemsLoaded]);

	useEffect(() => {
		if (actualFoodCostData.length > 0) {
			handleShowHideDepartments();
		}
	}, [actualFoodCostData]);

	useEffect(() => {
		setViewBy(viewby);
	}, [isTableRendered]);

	useEffect(() => {
		const fetchDates = async () => {
			try {
				setIsDateLoading(true);
				const getData = {
					url: 'getCountsheetDates',
					urlParams: {
						companyId: companyID,
						unitId: selectedUnit,
						countType: countType,
					},
				};

				const result = await getCall(getData);

				const fromOptions = result.data.fromDates.map((option) => ({
					name: dateFormat(option, 'mm-dd-yyyy'),
				}));
				const toOptions = result.data.toDates.map((option) => ({
					name: dateFormat(option, 'mm-dd-yyyy'),
				}));

				if (fromOptions.length === 1 || toOptions.length === 1) {
					setShowWarnings(true);
				}

				setSelectedFromDate(fromOptions[0].name);
				setSelectedToDate(toOptions[0].name);

				setFromDateOptions(fromOptions);
				setToDateOptions(toOptions);
				setIsDateLoading(false);
			} catch (error) {
				console.error('Error in fetching date options', error);
			} finally {
				setIsDateLoading(false);
			}
		};
		if (selectedUnit) {
			fetchDates();
		}
	}, [selectedUnit, countType]);

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
									usageCostPct: foodCost.usageCostPct * 100,
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
				setFilteredActualFoodCostData(newData);
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

	const handleShowColumns = (status, type) => {
		if (type === '#') {
			setShowQuantities(!showQuantities);
		} else {
			setShowDollarAmounts(!showDollarAmounts);
		}

		const updatedColumns = columns.map((column) => {
			if (column.header && column.header.includes(type)) {
				return {
					...column,
					show: status,
				};
			} else {
				return {
					...column,
				};
			}
		});

		setColumns((prev) => [...updatedColumns]);
		fetchActualFoodCostReport();
	};

	const handleShowHideDepartments = () => {
		setIsShowHideDepartments(false);

		const newActualFoodCostData = actualFoodCostData.map((item) => {
			const filteredSubRows = item.subRows
				.map((subItem) => {
					const filteredSubSubRows = subItem.subRows.filter(
						(subSubItem) =>
							!checkedItems.some(
								(checkedItem) =>
									checkedItem.name === `${subItem.department}/${subSubItem.subDepartment}` &&
									!checkedItem.showOnReport
							)
					);
					const updatedSubItem = { ...subItem, subRows: filteredSubSubRows };
					return filteredSubSubRows.length > 0 ? updatedSubItem : null;
				})
				.filter((subItem) => subItem !== null);
			return { ...item, subRows: filteredSubRows };
		});
		setIsTableRendered(false);

		setFilteredActualFoodCostData(newActualFoodCostData);
	};

	// Function to handle the PDF export
	const handlePDFClick = (type) => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!actualFoodCostData || actualFoodCostData.length === 0) {
			console.error('Actual report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Actual Food Cost Report',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(type),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = (type) => {
		const rowsPerTable = 28;
		const body = [];
		const data = type === 'filtered' ? filteredActualFoodCostData : actualFoodCostData;

		data.forEach((row) => {
			row.subRows.forEach((subRow) => {
				const allRows = subRow.subRows.flatMap((subDept) =>
					subDept.subRows.map((item) => ({
						subDepartment: subDept.subDepartment,
						...item,
					}))
				);

				const totalRows = allRows.length;

				const allColumns = [
					{ id: 'subDepartment', header: 'Sub Department', dataType: 'string' },
					{ id: 'description', header: 'Description', dataType: 'string' },
					{ id: 'countDisplayUnitName', header: 'UOM', dataType: 'string' },
					{ id: 'begCountDisplayUnits', header: 'Beg #', dataType: 'number' },
					{ id: 'begCountCost', header: 'Beg $', dataType: 'number' },
					{ id: 'purchaseDisplayUnits', header: 'Pur #', dataType: 'number' },
					{ id: 'purchaseCost', header: 'Pur $', dataType: 'number' },
					{ id: 'iTinCountDisplayUnits', header: 'Trans In#', dataType: 'number' },
					{ id: 'iTinCountCost', header: 'Trans In $', dataType: 'number' },
					{ id: 'iToutCountDisplayUnits', header: 'Trans Out#', dataType: 'number' },
					{ id: 'iToutCountCost', header: 'Trans Out $', dataType: 'number' },
					{ id: 'endCountDisplayUnits', header: 'End #', dataType: 'number' },
					{ id: 'endCountCost', header: 'End $', dataType: 'number' },
					{ id: 'usageCountDisplayUnits', header: 'Actual Usage #', dataType: 'number' },
					{ id: 'usageCost', header: 'Actual Usage $', dataType: 'number' },
					{ id: 'usageCostPct', header: 'Actual Usage %', dataType: 'number' },
					{ id: 'wasteCountDisplayUnits', header: 'Waste #', dataType: 'number' },
					{ id: 'wasteCountCost', header: 'Waste $', dataType: 'number' },
					{ id: 'comparisonName', header: 'Comparison Name', dataType: 'string' },
					{ id: 'comparisonSales', header: 'Comparison Sales', dataType: 'number' },
				];

				for (let i = 0; i < totalRows; i += rowsPerTable) {
					const chunkedColumns = [];
					for (let j = 0; j < allColumns.length; j += 13) {
						chunkedColumns.push(allColumns.slice(j, j + 13));
					}

					chunkedColumns.forEach((columnChunk) => {
						body.push({
							type: 'table/SeperatePage',
							title: subRow.department,
							widths: columnChunk.map(() => 'auto'),
							dataTypes: columnChunk.map((column) => column.dataType),
							data: {
								columnHeaders: columnChunk.map((column) => column.header),
								rows: allRows.slice(i, i + rowsPerTable).map((row) =>
									columnChunk.map((column) => ({
										value:
											column.header?.includes('$') || column.header === 'Comparison Sales'
												? `$${parseFloat(
														formatCellValue(row[column.id], column.dataType)
												  ).toLocaleString('en-US')}`
												: formatCellValue(row[column.id], column.dataType),
										cellType: column.dataType,
										columnName: column.header,
									}))
								),
							},
						});
					});
				}
			});
		});

		return body;
	};

	const formatCellValue = (value, dataType) => {
		if (value === undefined || value === null) return '';
		if (dataType === 'number') {
			return typeof value === 'number' ? value.toFixed(2) : value;
		}
		return value;
	};

	const togglePopup = () => {
		setIsDropdownVisible(!isDropdownVisible);
	};

	// // Function to handle the Excel export
	const handleExcelClick = (type) => {
		const data = [
			{
				name: '',
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
				data: (type === 'filtered' ? filteredActualFoodCostData : actualFoodCostData).flatMap((row) =>
					row.subRows.flatMap((department) =>
						department.subRows.flatMap((subDepartment) =>
							subDepartment.subRows.map((item) => ({
								department: department.department,
								subDepartment: subDepartment.subDepartment,
								description: item.description,
								UOM: item.countDisplayUnitName,
								begNumber: item.begCountDisplayUnits?.toFixed(2),
								begDollar: item.begCountCost?.toFixed(2),
								purNumber: item.purchaseDisplayUnits?.toFixed(2),
								purDollar: item.purchaseCost?.toFixed(2),
								trInNumber: item.iTinCountDisplayUnits?.toFixed(2),
								trInDollar: item.iTinCountCost?.toFixed(2),
								trOutNumber: item.iToutCountDisplayUnits?.toFixed(2),
								trOutDollar: item.iToutCountCost?.toFixed(2),
								endNumber: item.endCountDisplayUnits?.toFixed(2),
								endDollar: item.endCountCost?.toFixed(2),
								useNumber: item.usageCountDisplayUnits?.toFixed(2),
								useDollar: item.usageCost?.toFixed(2),
								usePct: item.usageCostPct?.toFixed(2),
								wasteNumber: item.wasteCountDisplayUnits?.toFixed(2),
								wasteDollar: item.wasteCountCost?.toFixed(2),
								wasteCostPct: item.wasteCostPct?.toFixed(2),
								comparisonName: item.comparisonName,
								comparisonSales: item.comparisonSales?.toFixed(2),
							}))
						)
					)
				),
			},
		];

		const filename = `ActualFoodCost_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Actual Food Cost';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
			setIsExportFilteredViewDropDownVisible(false);
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
			data={filteredActualFoodCostData}
			view={viewOptions.find((option) => option.name === viewby)?.row}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			setTableState={setTableState}
		/>
	);

	const handleCountsheet = async (fromDate, toDate, isEnding = false) => {
		const begCountsheetChannel = new BroadcastChannel('begCountsheet_channel');
		const endCountsheetChannel = new BroadcastChannel('endCountsheet_channel');
		try {
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: dateFormat(fromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(
						new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)),
						'yyyy-mm-dd'
					),
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

			const dataToSend = { companyID: companyID, countsheet: countsheet, timestamp: Date.now() };

			if (isEnding) {
				endCountsheetChannel.onmessage = (event) => {
					if (event.data === 'ready') {
						endCountsheetChannel.postMessage(dataToSend);
					}
				};
			} else {
				begCountsheetChannel.onmessage = (event) => {
					if (event.data === 'ready') {
						begCountsheetChannel.postMessage(dataToSend);
					}
				};
			}

			window.open(
				`${window.location.origin}/CountsheetDesigner?type=${isEnding ? 'endCountsheet' : 'begCountsheet'}`,
				'_blank'
			);
		} catch (error) {
			console.error('Error getting Countsheet data: ', error);
		}
	};

	const handleViewPurchase = async (fromDate, toDate) => {
		const purchaseChannel = new BroadcastChannel('purchase_channel');
		const dataToSend = {
			companyId: companyID,
			alignmentID: alignmentID,
			selectedUnit: selectedUnit,
			selectedUnitName: selectedUnitName,
			fromDate: dateFormat(fromDate, 'yyyy-mm-dd'),
			toDate: dateFormat(toDate, 'yyyy-mm-dd'),
			vendorId: 0,
			unitsAndAreasList: unitsAndAreas,
			timestamp: Date.now(),
		};

		purchaseChannel.onmessage = (event) => {
			if (event.data === 'ready') {
				purchaseChannel.postMessage(dataToSend);
			}
		};

		window.open(`${window.location.origin}/PurchaseAnalysis?pageKey=1`, '_blank');
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

						<div className='flex gap-2 date-selector'>
							<div className='w-44'>
								<Dropdown
									title='From Date'
									options={fromDateOptions}
									selectedOption={isDateLoading ? 'Loading...' : selectedFromDate}
									onOptionChange={(date) => setSelectedFromDate(date)}
								/>
							</div>
							<div className='w-44'>
								<Dropdown
									title='To Date'
									options={toDateOptions}
									selectedOption={isDateLoading ? 'Loading...' : selectedToDate}
									onOptionChange={(date) => setSelectedToDate(date)}
								/>
							</div>
						</div>
						<div className='ml-2 w-36 countType-selector'>
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
							<div className='flex flex-row items-center justify-between'>
								<div className='flex items-center gap-3'>
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
											<div className='more-container !mt-[32px]' ref={moreOptionsDropdown}>
												<div
													className='option mb-2 w-[258px]'
													onClick={() => setIsShowHideDepartments(true)}
												>
													<button className='w-[100%] bg-[#f9f9f9]'>
														Show/Hide Departments
													</button>
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
															handleCountsheet(selectedFromDate, selectedToDate, true); // For Ending Countsheet
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
									{((tableState?.expanded &&
										Object.keys(tableState.expanded).some((key) => /^\d+\.\d+\.\d+$/.test(key))) ||
										viewby === 'Inventory Item') && (
										<div className='flex items-center mt-[31px] gap-3'>
											<div>
												<input
													className='mr-1 accent-[var(--tw-primary)]'
													type='checkbox'
													checked={showQuantities}
													onChange={(e) => handleShowColumns(e.target.checked, '#')}
												/>
												Show Quantities
											</div>
											<div>
												<input
													className='mr-1 accent-[var(--tw-primary)]'
													type='checkbox'
													checked={showDollarAmounts}
													onChange={(e) => handleShowColumns(e.target.checked, '$')}
												/>
												Show Dollar Amounts
											</div>
										</div>
									)}
								</div>
								<div className='flex items-center justify-center w-48 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl mt-[31px] select-none'>
									<div
										onClick={() =>
											setIsExportFilteredViewDropDownVisible(!isExportFilteredViewDropDownVisible)
										}
										className='items-center justify-center w-full px-6 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
									>
										<span className='cursor-pointer'> Export Filtered View</span>
									</div>
									{isExportFilteredViewDropDownVisible && (
										<div className='more-container !mr-[80px] !mt-[32px]' ref={moreOptionsDropdown}>
											<div className='mb-2 option' onClick={() => handleExcelClick('filtered')}>
												<button className='w-[100%] bg-[#f9f9f9]'>Export to Excel</button>
											</div>
											<div
												className='option mb-2 w-[258px]'
												onClick={() => handlePDFClick('filtered')}
											>
												<button className='w-[100%] bg-[#f9f9f9]'>Export to PDF</button>
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
					<Modal
						title={'Show/Hide Departments'}
						isOpen={isShowHideDepartments}
						onClose={() => setIsShowHideDepartments(false)}
					>
						<div className='p-4'>
							<table className='w-full border-collapse table-auto select-none'>
								<thead className='sticky top-0 z-[2] w-full bg-white shadow-[0_-1px_0_var(--tw-primary)_inset]'>
									<tr className='grid grid-cols-3 '>
										<th>Department/Subdepartment</th>
										<th>Show on Report</th>
										<th>Include in Grand Total</th>
									</tr>
								</thead>
								<tbody>
									{checkedItems.map((item, index) => (
										<tr
											key={index}
											className='relative text-sm grid grid-cols-3 font-normal py-1 border-y-[0.5px] hover:bg-gray-100 '
										>
											<td className=''>{item.name}</td>
											<td className='text-center'>
												<input
													className='accent-[var(--tw-primary)]'
													type='checkbox'
													checked={item.showOnReport}
													onChange={(e) =>
														setCheckedItems((prev) => {
															const newItems = [...prev];
															newItems[index].showOnReport = e.target.checked;
															newItems[index].includeInGrandTotal = e.target.checked;
															return newItems;
														})
													}
												/>
											</td>
											<td className='text-center'>
												<input
													className='accent-[var(--tw-primary)]'
													checked={item.includeInGrandTotal}
													type='checkbox'
													onChange={(e) =>
														setCheckedItems((prev) => {
															const newItems = [...prev];
															newItems[index].includeInGrandTotal = e.target.checked;
															return newItems;
														})
													}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<div className='flex justify-between mt-4'>
								<div className='flex items-center gap-1 accent-[var(--tw-primary)]'>
									<input type='checkbox' />
									Save as Company Defaults
								</div>
								<button
									className='flex items-center gap-2 px-4 py-2 border-solid text-[var(--tw-primary)] focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button'
									onClick={handleShowHideDepartments}
								>
									Update Report
								</button>
							</div>
						</div>
					</Modal>
					<Modal title={'Warning'} isOpen={showWarnings} onClose={() => setShowWarnings(false)}>
						<div className='p-4 w-[340px]'>
							<p className='text-center'>
								{`Not enough countsheets of ${Object.keys(viewMap).find(
									(key) => viewMap[key] === countType
								)} type to compare for ${selectedUnitName}.`}{' '}
								<br /> Please select a different type or a different date range.
							</p>
						</div>
					</Modal>
				</div>
			</div>
		</>
	);
};

export default ActualFoodCost;
