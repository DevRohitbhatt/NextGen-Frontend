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
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
	Dropdown,
	Modal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import actualFoodCosts from '../../assets/introJSSteps/actualFoodCosts';
import dateFormat from 'dateformat';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

const tooltips = {
	begDollar:
		'The inventory value from the beginning countsheet of the selected date range. \n\n Tip: Double-check the mapping if an item’s value is considerably higher or lower than expected.',
	purDollar:
		'The value of invoiced purchases received during the selected date range. \n\n Tip: Missing purchases can mean invoice(s) weren’t entered or it was mapped incorrectly.',
	transInDollar:
		'The inventory value of items from all transfers IN during the selected date range. \n\n $’s calculated using the latest pricing from the transferring location.',
	transOutDollar:
		'The inventory value of items from all transfers OUT during the selected date range. \n\n $’s calculated using the latest pricing from your location.',
	endDollar:
		'The inventory value from the ending count sheet of the selected date range. \n\n Tip: Double-check the mapping if an item’s value is considerably higher or lower than expected.',
	actualUsageDollar:
		'The value of the inventory used during the selected date range, calculated by: \n\n Beg $ + Pur $ + Tr In $ – Tr Out $ – End $ / Comparison Sales',
	actualUsagePercent:
		'Actual Usage $ / Comparison Sales $ \n\n Tip: Negative Usage indicates a “growth” in inventory, possibly due to missing purchases or missing counts.',
	wasteDollar: 'The inventory value of items entered in waste countsheets during the selected date range.',
	wasterPercent: 'Waste $ / Comparison Sales $',
	comparisonName: 'Names the sales value used for comparison against inventory. \n\n (Default is Net Sales)',
	comparisonSales:
		'Comparison Sales configured for this Department and/or Sub-department. i.e., Net Sales, Department Sales, etc.',
	direction: 'above',
};

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
	const [isBreakDownModal, setIsBreakDownModal] = useState(false);
	const [showQuantities, setShowQuantities] = useState(true);
	const [showDollarAmounts, setShowDollarAmounts] = useState(true);
	const [showWarnings, setShowWarnings] = useState(false);
	const [showAndHideBreakDown, setShowAndHideBreakDown] = useState({
		ideal: true,
		Actual: true,
		Variance: true,
		purchaseBetween: false,
	});
	const [isShowHideDepartments, setIsShowHideDepartments] = useState(false);
	const [checkedItems, setCheckedItems] = useState([]);

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
	const [costBreakActualDetails, setCostBreakActualDetails] = useState({});
	const [costBreakdownIdealDetails, setCostBreakDownIdeatDetails] = useState([]);
	const [breakDownIdealDetails, setBreakDownIdealDetails] = useState([]);
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
				row.getCanExpand() && row.depth === 0 ? (
					<div
						{...{
							style: { cursor: 'pointer', paddingLeft: `${row.depth * 2}rem` },
							className: 'flex items-center gap-2 font-bold capitalize',
						}}
					>
						{row.getIsExpanded() ? (
							<CiSquareMinus className='text-[20px]' />
						) : (
							<CiSquarePlus className='text-[20px]' />
						)}
						{row.original.finalDepartment}
					</div>
				) : null,
			groupBy: true,
			size: '80',
		}),
		columnHelper.accessor('department', {
			id: 'department',
			header: 'Department',
			cell: ({ row }) =>
				row.getCanExpand() ? (
					<div
						{...{
							style: { cursor: 'pointer', width: '100%' },
							className: 'flex items-center gap-2 font-bold capitalize',
						}}
					>
						{row.getIsExpanded() ? (
							<CiSquareMinus className='text-[20px]' />
						) : (
							<CiSquarePlus className='text-[20px]' />
						)}
						{row.original.department}
					</div>
				) : null,
			groupBy: true,
			dataType: 'string',
		}),
		columnHelper.accessor('subDepartment', {
			id: 'subDepartment',
			header: 'Sub Department',
			cell: ({ row }) =>
				row.getCanExpand() ? (
					<div
						{...{
							style: { cursor: 'pointer', width: '100%' },
							className: 'flex items-center gap-2 font-bold capitalize',
						}}
					>
						{row.getIsExpanded() ? (
							<CiSquareMinus className='text-[20px]' />
						) : (
							<CiSquarePlus className='text-[20px]' />
						)}
						{row.original.subDepartment}
					</div>
				) : null,
			groupBy: true,
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
			tooltip: tooltips.begDollar,
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
			tooltip: tooltips.purDollar,
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
			tooltip: tooltips.transInDollar,
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
			tooltip: tooltips.transOutDollar,
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
			tooltip: tooltips.endDollar,
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
			tooltip: tooltips.actualUsageDollar,
		}),
		columnHelper.accessor('usageCostPct', {
			id: 'usageCostPct',
			header: 'Actual Usage %',
			dataType: 'percent',
			cell: ({ row, getValue }) => calculateSum(row, 'usageCostPct', getValue, true),
			size: 90,
			tooltip: tooltips.actualUsagePercent,
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
			tooltip: tooltips.wasteDollar,
		}),
		columnHelper.accessor('wasteCostPct', {
			id: 'wasteCostPct',
			header: 'Waste %',
			dataType: 'percent',
			cell: ({ row, getValue }) => calculateSum(row, 'wasteCostPct', getValue, true),
			size: 90,
			tooltip: tooltips.wasterPercent,
		}),
		columnHelper.accessor('comparisonName', {
			id: 'comparisonName',
			header: 'Comparison Name',
			cell: ({ row, getValue }) =>
				row.getCanExpand() ? row.original?.comparisonName : getValue() !== undefined ? getValue() : '',
			dataType: 'string',
			size: 100,
			tooltip: tooltips.comparisonName,
		}),
		columnHelper.accessor('comparisonSales', {
			id: 'comparisonSales',
			header: 'Comparison Net Sales',
			dataType: 'number',
			cell: ({ row, getValue }) =>
				row.getCanExpand()
					? `$${row.original?.comparisonSales?.toFixed(2)}`
					: getValue() !== undefined
					? `$${parseFloat(getValue().toFixed(2)).toLocaleString('en-US')}`
					: '',
			size: 100,
			tooltip: tooltips.comparisonSales,
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
										(item) => item.name.split(/\/(.+)/)[1] === subSubrow.original.subDepartment
									);
									return (
										subAcc +
										subSubrow.subRows.reduce(
											(subsubAcc, subsubsubrow) =>
												subsubAcc +
												(item?.includeInGrandTotal && subsubsubrow.original[field]
													? Number(subsubsubrow.original[field])
													: 0),
											0
										)
									);
								} else {
									return subAcc + (subSubrow.original[field] ? Number(subSubrow.original[field]) : 0);
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
				: `$${parseFloat(sum).toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
				  })}`;
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
		console.log('checkedItemsLoaded', checkedItemsLoaded);

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
		if (new Date(selectedToDate) < new Date(selectedFromDate)) {
			const toDate = new Date(selectedToDate);
			const newFromDate = fromDateOptions
				.map((option) => new Date(option.name))
				.filter((date) => date < toDate)
				.sort((a, b) => b - a)[0];
			if (newFromDate) {
				setSelectedFromDate(dateFormat(newFromDate, 'mm-dd-yyyy'));
			}
		}
	}, [selectedToDate]);

	useEffect(() => {
		if (new Date(selectedFromDate) > new Date(selectedToDate)) {
			const fromDate = new Date(selectedFromDate);
			const toDate = new Date(selectedToDate);

			if (fromDate > toDate) {
				const newToDate = toDateOptions
					.map((option) => new Date(option.name))
					.filter((date) => date > fromDate)
					.sort((a, b) => a - b)[0];
				if (newToDate) {
					setSelectedToDate(dateFormat(newToDate, 'mm-dd-yyyy'));
				}
			}
		}
	}, [selectedFromDate]);

	useEffect(() => {
		const fetchShowHideDepartments = async () => {
			try {
				setCheckedItemsLoaded(false);
				const getData = {
					url: 'getShowHideDepartments',
					urlParams: {
						companyId: companyID,
					},
				};

				const result = await getCall(getData);

				const checkedItems = result.data.map((item) => ({
					name: `${item.department}/${item.subdepartment}`,
					showOnReport: item.includeInReport,
					includeInGrandTotal: item.includeInTotal,
				}));

				setCheckedItems(checkedItems);
				setCheckedItemsLoaded(true);
			} catch (error) {
				console.error('Error getting Show Hide Departments data: ', error);
			}
		};

		fetchShowHideDepartments();
	}, []);

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
				const newData = result.data?.flatMap((department) =>
					department.subDepartments.flatMap((subDepartment) =>
						subDepartment.actualFoodCosts.map((foodCost) => ({
							finalDepartment: 'TOTAL',
							department: foodCost.department,
							subDepartment: foodCost.subDepartment,
							comparisonName: foodCost?.comparisonName || '',
							comparisonSales: foodCost?.comparisonSales || 0,
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
							wasteCostPct: foodCost.salesNet ? (foodCost.wasteCountCost / foodCost.salesNet) * 100 : 0,
							endCountDisplayUnits: foodCost.endCountDisplayUnits,
							endCountCases: foodCost.endCountCases,
							endCountCost: foodCost.endCountCost,
							usageCases: foodCost.usageCases,
							usageCountDisplayUnits: foodCost.usageCountDisplayUnits,
							usageCost: foodCost.usageCost,
							usageCostPct: foodCost.usageCostPct * 100,
							salesNet: foodCost.salesNet,
							yieldPerCase: foodCost.yieldPerCase,
							yieldPerCountDisplayUnit: foodCost.yieldPerCountDisplayUnit,
							qsrInventoryItemID: foodCost.qsrInventoryItemID,
						}))
					)
				);

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
		setFilteredActualFoodCostData((prev) => [...actualFoodCostData]);
		setViewBy('Inventory Item');
		setIsTableRendered(false);
	};

	const handleShowHideDepartments = () => {
		setIsShowHideDepartments(false);

		const newActualFoodCostData = actualFoodCostData.filter((item) =>
			checkedItems.some(
				(checkedItem) =>
					checkedItem.name === `${item.department}/${item.subDepartment}` && checkedItem.showOnReport
			)
		);

		setIsTableRendered(false);
		setColumns(generatedColumns);
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

		const data = type === 'filtered' ? filteredActualFoodCostData : actualFoodCostData;

		const headers = columns.slice(1);
		const body = [];

		// Loop through the data and create tables
		for (let i = 0; i < data.length; i += rowsPerTable) {
			// Split columns into chunks of 13
			const chunkedColumns = [];
			for (let j = 0; j < headers.length; j += 13) {
				chunkedColumns.push(headers.slice(j, j + 13));
			}

			// Create a table for each chunk of columns
			chunkedColumns.forEach((columnChunk) => {
				body.push({
					type: 'table/SeperatePage',
					widths: columnChunk.map(() => 'auto'),
					dataTypes: columnChunk.map((column) => column.dataType),
					data: {
						columnHeaders: columnChunk.map((column) => column.header),
						rows: data.slice(i, i + rowsPerTable).map((row) =>
							columnChunk.map((column) => ({
								value:
									column.header?.includes('$') || column.header === 'Comparison Sales'
										? formattingData(row[column.id])
										: formatCellValue(row[column.id], column.dataType),
								cellType: column.dataType,
								columnName: column.header,
							}))
						),
					},
				});
			});
		}

		return body;
	};

	const formatCellValue = (value, dataType) => {
		if (value === undefined || value === null) return '';
		if (dataType === 'number') {
			return typeof value === 'number' ? value.toFixed(2) : value;
		}
		if (dataType === 'percent') {
			return typeof value === 'number' ? value.toFixed(2) : value;
		}
		return value;
	};

	const formattingData = (value) => {
		return value < 0
			? `-$${Math.abs(parseFloat(value)).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })}`
			: `$${parseFloat(value).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })}`;
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
				data: (type === 'filtered' ? filteredActualFoodCostData : actualFoodCostData).map((row) => ({
					department: row.department,
					subDepartment: row.subDepartment,
					description: row.description,
					UOM: row.countDisplayUnitName,
					begNumber: row.begCountDisplayUnits?.toFixed(2),
					begDollar: row.begCountCost?.toFixed(2),
					purNumber: row.purchaseDisplayUnits?.toFixed(2),
					purDollar: row.purchaseCost?.toFixed(2),
					trInNumber: row.iTinCountDisplayUnits?.toFixed(2),
					trInDollar: row.iTinCountCost?.toFixed(2),
					trOutNumber: row.iToutCountDisplayUnits?.toFixed(2),
					trOutDollar: row.iToutCountCost?.toFixed(2),
					endNumber: row.endCountDisplayUnits?.toFixed(2),
					endDollar: row.endCountCost?.toFixed(2),
					useNumber: row.usageCountDisplayUnits?.toFixed(2),
					useDollar: row.usageCost?.toFixed(2),
					usePct: row.usageCostPct?.toFixed(2),
					wasteNumber: row.wasteCountDisplayUnits?.toFixed(2),
					wasteDollar: row.wasteCountCost?.toFixed(2),
					wasteCostPct: row.wasteCostPct?.toFixed(2),
					comparisonName: row.comparisonName,
					comparisonSales: row.comparisonSales?.toFixed(2),
				})),
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
			headerPosition='left'
			dataPosition='text-left'
			onCallBack={(e) => {
				getGetActualFoodCostBreakdownIdealReportData(e);
			}}
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

			window.open(
				`${window.location.origin}/CountsheetDesigner?companyID=${companyID}&countsheet=${encodeURIComponent(
					JSON.stringify(countsheet)
				)}`,
				'_blank'
			);
		} catch (error) {
			console.error('Error getting Countsheet data: ', error);
		}
	};

	const handleViewPurchase = async (fromDate, toDate) => {
		const dataToSend = {
			companyId: companyID,
			alignmentId: alignmentID,
			selectedUnit: selectedUnit,
			selectedUnitName: selectedUnitName,
			fromDate: fromDate,
			toDate: toDate,
			vendorId: 0,
			timestamp: Date.now(),
		};

		window.open(
			`${window.location.origin}/PurchaseAnalysis?companyID=${companyID}&countsheet=${encodeURIComponent(
				JSON.stringify(dataToSend)
			)}`,
			'_blank'
		);
	};

	const getGetActualFoodCostBreakdownIdealReportData = async (row) => {
		let { qsrInventoryItemID = '' } = row;
		setCostBreakActualDetails(row);
		try {
			setIsBreakDownModal(true);
			const getData = {
				url: 'GetActualFoodCostBreakdownIdealReportData',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: selectedFromDate,
					toDate: selectedToDate,
					QSRInventoryItemID: qsrInventoryItemID,
				},
			};

			const result = await getCall(getData);

			const getDataBreakDown = {
				url: 'GetActualFoodCostBreakdownReportData',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: selectedFromDate,
					toDate: selectedToDate,
					QSRInventoryItemID: qsrInventoryItemID,
				},
			};

			const resultBreakDown = await getCall(getDataBreakDown);
			if (resultBreakDown.data) {
				setBreakDownIdealDetails(resultBreakDown.data);
			}

			if (result.data) {
				setCostBreakDownIdeatDetails(result.data);
			}
		} catch (error) {
			console.log('er', error);
		}
	};

	const renderBreakdownModal = () => {
		const sumOfCost = (value, valu2) => {
			let sum = value * valu2;
			return sum.toFixed(2);
		};

		const openCollapse = (name) => {
			let oldShow = showAndHideBreakDown;
			oldShow[name] = oldShow[name] ? false : true;
			setShowAndHideBreakDown({ ...oldShow });
		};

		const calculateMasterItemQuantityTotalSum = (data, name) => {
			if (!data || !Array.isArray(data)) {
				throw new Error('Invalid input data. Ensure the data is an array.');
			}

			// Use the reduce function to calculate the sum
			const totalSum = data.reduce((sum, item) => {
				const quantity = parseFloat(item[name]);
				return sum + (isNaN(quantity) ? 0 : quantity);
			}, 0);

			return totalSum;
		};

		function calculateTotalCost(data) {
			if (!data || !Array.isArray(data)) {
				throw new Error('Invalid input data. Ensure the data is an array.');
			}

			// Use the reduce function to calculate the total cost
			const totalCost = data.reduce((sum, item) => {
				const quantity = parseFloat(item.MasterItemQuantityTotal);
				const cost = parseFloat(item.MasterItemIdealUOMCost);

				// Add to the sum only if both values are valid numbers
				return sum + (isNaN(quantity) || isNaN(cost) ? 0 : quantity * cost);
			}, 0);

			return totalCost;
		}

		const totalVariance = () => {
			let totalVarica =
				costBreakActualDetails?.usageCost?.toFixed(2) -
				calculateTotalCost(costBreakdownIdealDetails).toFixed(2);
			return totalVarica.toFixed(2);
		};

		const totalVariancecs = () => {
			let totalCs =
				costBreakActualDetails?.usageCases?.toFixed(2) -
				calculateMasterItemQuantityTotalSum(costBreakdownIdealDetails, 'MasterItemQuantityTotal').toFixed(2);
			return totalCs.toFixed(2);
		};

		return (
			<div className='max-w-5xl mx-auto my-0 p-1 rounded-lg shadow-lg border bg-white min-w-[750px]'>
				{/* Header */}
				<div className='text-center '>
					<p className='text-sm text-gray-600'>{costBreakActualDetails.description}</p>
					<p className='text-sm text-gray-600'>
						Store #{selectedUnit} {selectedFromDate} to {selectedToDate} ({view})
					</p>
				</div>

				{/* Actual Section */}
				<div className='my-1'>
					<h3
						onClick={(e) => {
							e.preventDefault(), openCollapse('Actual');
						}}
						className='text-base font-semibold bg-blue-100 py-[4px] px-1 rounded-t-md flex justify-between cursor-pointer'
					>
						<span>Actual</span>{' '}
						<span className='m-1 '>
							{showAndHideBreakDown.Actual == true ? <IoIosArrowUp /> : <IoIosArrowDown />}
						</span>
					</h3>
					{showAndHideBreakDown.Actual == true && (
						<div className=''>
							<table className='w-full border border-collapse'>
								<thead className='bg-gray-100'>
									<tr>
										<th className='p-2 text-left border'></th>
										<td></td>
										<th className='border text-right  p-[3px]  text-nowrap text-sm'># UOM</th>
										<th className='border text-right  p-[3px]  text-nowrap text-sm'>Value</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td className='border text-left  p-[3px]  text-nowrap text-sm'>
											<div className='flex align-middle'>
												<div className='p-1'>
													<CiSquarePlus />
												</div>
												Beginning On-Hand Count: {selectedFromDate}
											</div>
										</td>
										<td className='border   p-[3px]  text-nowrap text-sm text-center'></td>
										<td className='border text-right  p-[3px]  text-nowrap text-sm'>
											{costBreakActualDetails?.begCountDisplayUnits?.toFixed(4)}
										</td>
										<td className='border text-right  p-[3px]  text-nowrap text-sm'>
											${costBreakActualDetails?.begCountCost?.toFixed(2)}
										</td>
									</tr>
									<tr
										className='cursor-pointer'
										onClick={(e) => {
											e.preventDefault(), openCollapse('purchaseBetween');
										}}
									>
										<td className='border text-left  p-[3px]  text-nowrap text-sm '>
											<div className='flex align-middle'>
												{showAndHideBreakDown.purchaseBetween ? (
													<div className='p-1'>
														<CiSquareMinus />
													</div>
												) : (
													<div className='p-1'>
														<CiSquarePlus />
													</div>
												)}{' '}
												Purchases between {selectedFromDate} and {selectedToDate}
											</div>
										</td>
										<td className='border   p-[3px]  text-nowrap text-sm text-center'>+</td>
										<td className='border text-right  p-[3px]  text-nowrap text-sm'>
											{costBreakActualDetails?.purchaseCases?.toFixed(4)}
										</td>
										<td className='border text-right  p-[3px]  text-nowrap text-sm'>
											${costBreakActualDetails?.purchaseCost?.toFixed(2)}
										</td>
									</tr>
									{showAndHideBreakDown.purchaseBetween == true && (
										<tr className='ml-[10px] '>
											<td colSpan={4}>
												<table className='w-[97%] ml-[3%]'>
													<thead className='bg-gray-100'>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															Vendor
														</th>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															Date
														</th>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															Invoices #
														</th>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															#
														</th>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															UOM
														</th>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															Price
														</th>
														<th className='border text-left  p-[3px]  text-nowrap text-sm'>
															Total
														</th>
													</thead>
													<tbody>
														{breakDownIdealDetails.map((item) => (
															<tr>
																<td className='border text-left  p-[3px]  text-nowrap text-sm'>
																	{item.VendorName}
																</td>
																<td className='border text-right  p-[3px]  text-nowrap text-sm'>
																	{dateFormat(item.InvoiceDate, 'mm-dd-yyyy')}
																</td>
																<td className='border text-right  p-[3px]  text-nowrap text-sm'>
																	{item.VendorInvoiceReference}
																</td>
																<td className='border text-center  p-[3px]  text-nowrap text-sm'>
																	{item.Quantity.toFixed(6)}
																</td>
																<td className='border text-center  p-[3px]  text-nowrap text-sm'>
																	{item.UnitOfMeasure}
																</td>
																<td className='border text-right  p-[3px]  text-nowrap text-sm'>
																	${item.Price.toFixed(2)}
																</td>
																<td className='border text-right  p-[3px]  text-nowrap text-sm'>
																	${item.TotalPrice.toFixed(2)}
																</td>
															</tr>
														))}
														{breakDownIdealDetails.length === 0 && (
															<td colSpan={7}>
																There is no any purchases in this period.
															</td>
														)}
													</tbody>
												</table>
											</td>
										</tr>
									)}
									<tr>
										<td className='border p-[3px]  text-nowrap text-sm'>
											<div className='flex align-middle'>
												<div className='p-1'>
													<CiSquarePlus />
												</div>{' '}
												Transferred In
											</div>
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-center'>+</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											{costBreakActualDetails?.iTinCountCases}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											${costBreakActualDetails?.iTinCountCost}
										</td>
									</tr>
									<tr>
										<td className='border p-[3px]  text-nowrap text-sm'>
											<div className='flex align-middle'>
												<div className='p-1'>
													<CiSquarePlus />
												</div>{' '}
												Transferred Out
											</div>
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-center'>-</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											{costBreakActualDetails?.iToutCountCases}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											${costBreakActualDetails?.iToutCountCost}
										</td>
									</tr>
									<tr>
										<td className='border p-[3px]  text-nowrap text-sm'>
											<div className='flex align-middle'>
												<div className='p-1'>
													<CiSquarePlus />
												</div>{' '}
												Ending On-Hand Count: {selectedToDate}
											</div>
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-center'>-</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											{costBreakActualDetails?.endCountCases}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											${costBreakActualDetails?.endCountCost}
										</td>
									</tr>
								</tbody>
								<tfoot>
									<tr className='bg-gray-200'>
										<td className='border p-[3px]  text-nowrap text-sm text-left' colSpan={2}>
											Actual Usage{' '}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											{costBreakActualDetails?.usageCases?.toFixed(2)}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											${costBreakActualDetails?.usageCost?.toFixed(2)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					)}
				</div>

				{/* Ideal Section */}
				<div className='my-1'>
					<h3
						onClick={(e) => {
							e.preventDefault(), openCollapse('ideal');
						}}
						className='text-base font-semibold bg-green-100 py-[4px] px-1 rounded-t-md flex justify-between cursor-pointer'
					>
						<span>Ideal</span>{' '}
						<span className='m-1 '>
							{showAndHideBreakDown.ideal == true ? <IoIosArrowUp /> : <IoIosArrowDown />}
						</span>
					</h3>
					{showAndHideBreakDown.ideal == true && (
						<div className='tableHOC pr-1 max-h-[20vh] overflow-auto'>
							<table className='w-full border-collapse '>
								<thead className='sticky top-0 bg-gray-100'>
									<tr>
										<th className=' p-[3px] text-left text-sm'>Menu Item</th>
										<th className=' p-[3px] text-left text-nowrap text-sm'>Recipe</th>
										<th className=' p-[3px] text-right text-nowrap text-sm'># Sold</th>
										<th className=' p-[3px] text-right text-nowrap text-sm'>
											#{costBreakdownIdealDetails[0]?.MasterItemRecipeUOMName} in Recipe
										</th>
										<th className=' p-[3px] text-right text-nowrap text-sm'>
											# {costBreakdownIdealDetails[0]?.MasterItemUOM}
										</th>
										<th className=' p-[3px] text-righ text-nowrapt text-sm'>
											Total # {costBreakdownIdealDetails[0]?.MasterItemUOM}
										</th>
										<th className=' p-[3px] text-right text-nowrap text-sm'>Cost</th>
									</tr>
								</thead>
								<tbody>
									{costBreakdownIdealDetails.map((item) => (
										<tr>
											<td className='border p-[3px] text-sm'>{item.MenuItemDescription}</td>
											<td className='border p-[3px] text-sm'>{item.VariantLabel}</td>
											<td className='border p-[3px] text-right text-sm'>
												{item.MenuItemQuantitySold}
											</td>
											<td className='border p-[3px] text-right text-sm'>
												{item.MasterItemRecipeUOMPerRecipe}
											</td>
											<td className='border p-[3px] text-right text-sm'>
												{item.MasterItemQuantityPerRecipe.toFixed(4)}
											</td>
											<td className='border p-[3px] text-right text-sm'>
												{item.MasterItemQuantityTotal.toFixed(2)}
											</td>
											<td className='border p-[3px] text-right text-sm'>
												${sumOfCost(item.MasterItemQuantityTotal, item.MasterItemIdealUOMCost)}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className='sticky bottom-0 bg-gray-200'>
										<td className='border p-[3px]  text-nowrap text-sm text-left' colSpan={5}>
											Ideal Usage{' '}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											{calculateMasterItemQuantityTotalSum(
												costBreakdownIdealDetails,
												'MasterItemQuantityTotal'
											).toFixed(2)}
										</td>
										<td className='border p-[3px]  text-nowrap text-sm text-right'>
											${calculateTotalCost(costBreakdownIdealDetails).toFixed(2)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					)}
				</div>

				{/* Variance Section */}
				<div className='my-1'>
					<h3
						onClick={(e) => {
							e.preventDefault(), openCollapse('Variance');
						}}
						className='text-base font-semibold bg-orange-100 py-[4px] px-1 rounded-t-md flex justify-between cursor-pointer'
					>
						<span> Variance</span>
						<span className='m-1 '>
							{showAndHideBreakDown.Variance == true ? <IoIosArrowUp /> : <IoIosArrowDown />}
						</span>
					</h3>
					{showAndHideBreakDown.Variance == true && (
						<table className='w-full border border-collapse'>
							<thead className='bg-gray-100'>
								<tr>
									<th className='border p-[3px] text-left text-sm'>Details</th>
									<th className='border p-[3px] text-left text-sm'>
										#{costBreakdownIdealDetails[0]?.MasterItemUOM}
									</th>
									<th className='border p-[3px] text-left text-sm'>Cost</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className='border p-[3px] text-left text-sm'>Actual Usage</td>
									<td className='border p-[3px]  text-nowrap text-sm  text-right'>
										{costBreakActualDetails?.usageCases?.toFixed(2)}
									</td>
									<td className='border p-[3px]  text-nowrap text-sm  text-right'>
										${costBreakActualDetails?.usageCost?.toFixed(2)}
									</td>
								</tr>
								<tr>
									<td className='border p-[3px] text-left text-sm'>Ideal Usage</td>
									<td className='border p-[3px]  text-nowrap text-sm  text-right'>
										{calculateMasterItemQuantityTotalSum(
											costBreakdownIdealDetails,
											'MasterItemQuantityTotal'
										).toFixed(2)}
									</td>
									<td className='border p-[3px]  text-nowrap text-sm  text-right'>
										${calculateTotalCost(costBreakdownIdealDetails).toFixed(2)}
									</td>
								</tr>
								<tr>
									<td className='border p-[3px] text-left text-sm'>Variance Usage</td>
									<td className='border p-[3px] text-right text-sm'>{totalVariancecs()}</td>
									<td className='border p-[3px]  text-nowrap text-sm text-right'>
										${totalVariance()}
									</td>
								</tr>
							</tbody>
						</table>
					)}
				</div>
			</div>
		);
	};

	return (
		<>
			<div className='w-[98%] mx-auto pageContainer'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-2 text-[18px] leading-tight text-left pageTitle'>Actual Food Cost</h2>
				<header className='optionsBar flex justify-between items-center mb-0 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
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
							<div className='py-2 ml-3 text-[14px] font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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
									<div className='flex items-center justify-center w-28  py-2 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl  mt-[28px] '>
										<div
											onClick={togglePopup}
											className='items-center justify-center w-full px-6 py-2 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid text-[16px]'
										>
											<span className='cursor-pointer '> More....</span>
										</div>
										{isDropdownVisible && (
											<div className='more-container !mt-[32px]' ref={moreOptionsDropdown}>
												<div
													className='option mb-2 w-[200px] text-[14px]'
													onClick={() => setIsShowHideDepartments(true)}
												>
													<button className='w-[100%] bg-[#f9f9f9] text-[14px]'>
														Show/Hide Departments
													</button>
												</div>
												<div className='option mb-2 w-[200px] text-[14px]'>
													<button
														className='w-[100%] bg-[#f9f9f9] text-[14px]'
														onClick={() => {
															handleCountsheet(selectedFromDate, selectedToDate); // For Beginning Countsheet
															setIsDropdownVisible(false);
														}}
													>
														View Beginning Countsheet
													</button>
												</div>
												<div className='option mb-2 w-[200px] bg-[#f9f9f9] text-[14px]'>
													<button
														className='w-[100%] text-[14px]'
														onClick={() => {
															handleCountsheet(selectedFromDate, selectedToDate, true); // For Ending Countsheet
															setIsDropdownVisible(false);
														}}
													>
														View Ending Countsheet
													</button>
												</div>
												<div className='option text-[14px]'>
													<button
														className='w-[100%] bg-[#f9f9f9] text-[14px]'
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
										className='items-center justify-center w-full px-6 py-2 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
									>
										<span className='cursor-pointer text-[14px]'> Export Filtered View</span>
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
					<Modal
						title={'Food Cost Breakdown'}
						isOpen={isBreakDownModal}
						onClose={() => setIsBreakDownModal(false)}
					>
						{renderBreakdownModal()}
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
