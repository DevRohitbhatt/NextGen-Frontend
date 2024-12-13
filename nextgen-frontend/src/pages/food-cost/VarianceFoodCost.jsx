import { useEffect, useState, useRef } from 'react';
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
import dateFormat from 'dateformat';
import varianceFoodCost from './../../assets/introJSSteps/varianceFoodCost';

const columnHelper = createColumnHelper();

const VarianceFoodCost = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
	} = useSelector((state) => state.globalState);
	const [varianceFoodCostData, setVarianceFoodCostData] = useState([]);
	const [filteredVarianceFoodCostData, setFilteredVarianceFoodCostData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isDateLoading, setIsDateLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Variance Food Cost Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setShowUnitModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [fromDateOptions, setFromDateOptions] = useState([]);
	const [selectedToDate, setSelectedToDate] = useState();
	const [toDateOptions, setToDateOptions] = useState([]);
	const [showDateModal, setShowDateModal] = useState(false);

	const [showQuantities, setShowQuantities] = useState(true);
	const [showDollarAmounts, setShowDollarAmounts] = useState(true);
	const [showWarnings, setShowWarnings] = useState(false);

	const [isShowHideDepartmentsModalVisible, setIsShowHideDepartmentsModalVisible] = useState(false);
	const [checkedItemsLoaded, setCheckedItemsLoaded] = useState(false);
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
	const countDropdownOptions = [{ name: 'Daily' }, { name: 'Monthly' }, { name: 'Shift' }, { name: 'Weekly' }];
	const [viewby, setViewBy] = useState('Department');
	const viewOptions = [
		{ name: 'Department', row: 1 },
		{ name: 'Sub Department', row: 2 },
		{ name: 'Inventory Item', row: 3 },
	];
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const moreOptionsDropdown = useRef(null);
	const [tableState, setTableState] = useState();

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
		columnHelper.accessor('actualNumber', {
			id: 'actualNumber',
			header: 'Actual #',
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			cell: ({ getValue }) => getValue()?.toFixed(2),
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
			cell: ({ getValue }) =>
				getValue() !== undefined ? `$${parseFloat(getValue()?.toFixed(2)).toLocaleString('en-US')}` : '',
			size: 150,
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
												(item?.includeInGrandTotal && subsubsubrow.original[field]
													? Number(subsubsubrow.original[field])
													: 0),
											0
										)
									);
								} else {
									const item = checkedItems.find(
										(item) => item.name.split('/')[1] === subrow.original.subDepartment
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
		if (varianceFoodCostData.length > 0) {
			handleShowHideDepartments();
		}
	}, [varianceFoodCostData]);

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

	const fetchVarianceFoodCost = async () => {
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

			if (result?.data && result?.data?.length === 0) {
				setVarianceFoodCostData([]);
			} else {
				const newData = result.data?.flatMap((department) =>
					department.subDepartments.flatMap((subDepartment) =>
						subDepartment.varianceFoodCostModels.map((item) => ({
							finalDepartment: 'TOTAL',
							comparisonName: item.comparisonName || 'Net Sales',
							comparisonSales: item.comparisonSales || 0,
							department: item.department,
							subDepartment: item.subDepartment,
							description: item.description,
							countDisplayUnitName: item.countDisplayUnitName,
							actualNumber: item.actualQuant,
							actualDollar: item.actualCost,
							actualPct: item.actualCostPct * 100,
							idealNumber: item.idealQuant,
							idealDollar: item.idealCost,
							idealPct: item.salesNet ? (item.idealCost / item.salesNet) * 100 : 0,
							varianceNumber: item.varianceQuant,
							varianceDollar: item.varianceCost,
							variancePct: item.salesNet ? (item.varianceCost / item.salesNet) * 100 : 0,
							wasteNumber: item.wasteCountCases,
							wasteDollar: item.wasteCountCost,
							wastePct: item.salesNet ? (item.wasteCountCost / item.salesNet) * 100 : 0,
						}))
					)
				);

				setVarianceFoodCostData(newData);
				setFilteredVarianceFoodCostData(newData);
			}
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
		setShowUnitModal(false);
	};

	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleCountTypeChange = (option) => {
		setView(option);
		setCountType(viewMap[option]);
	};

	const fetchCountsheets = async (isEnding = false) => {
		try {
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(
						new Date(new Date(selectedToDate).setDate(new Date(selectedToDate).getDate() + 1)),
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
			alignmentID: alignmentID,
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

	const handleShowHideDepartments = () => {
		setIsShowHideDepartmentsModalVisible(false);
		const newVarianceFoodCostData = varianceFoodCostData.filter((item) =>
			checkedItems.some(
				(checkedItem) =>
					checkedItem.name === `${item.department}/${item.subDepartment}` && checkedItem.showOnReport
			)
		);
		setIsTableRendered(false);
		setFilteredVarianceFoodCostData(newVarianceFoodCostData);
	};

	const handleShowColumns = (status, type) => {
		if (type === '#') {
			setShowQuantities(!showQuantities);
		} else {
			setShowDollarAmounts(!showDollarAmounts);
		}

		const updatedColumns = columns.map((column) => {
			if (column.header && column.header.includes(type)) {
				console.log(column);

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
		fetchVarianceFoodCost();
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

		console.log('pdfData', pdfData);

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const formatNumber = (num, prefix = '') => ({
			value: `${prefix}${num.toFixed(2).toLocaleString('en-US')}`,
			cellType: 'number',
		});

		const formatPercent = (num) => ({
			value: `${Number(num).toFixed(2).toLocaleString('en-US')}%`,
			cellType: 'number',
		});

		const body = [
			{
				type: 'table',

				widths: new Array(columns.slice(1).length).fill('auto'),
				dataTypes: columns.slice(1).map((column) => column.dataType),
				data: {
					columnHeaders: [
						'Department',
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
					rows: varianceFoodCostData.map((row) => [
						{ value: row.department, cellType: 'string', columnName: 'Department' },
						{ value: row.subDepartment, cellType: 'string', columnName: 'Sub Department' },
						{ value: row.description, cellType: 'string', columnName: 'Description' },
						{ value: row.countDisplayUnitName, cellType: 'string', columnName: 'UOM' },
						{ ...formatNumber(row.actualNumber), columnName: 'Actual #' },
						{ ...formatNumber(row.actualDollar, '$'), columnName: 'Actual $' },
						{ ...formatPercent(row.actualPct), columnName: 'Actual %' },
						{ ...formatNumber(row.idealNumber), columnName: 'Ideal #' },
						{ ...formatNumber(row.idealDollar, '$'), columnName: 'Ideal $' },
						{ ...formatPercent(row.idealPct), columnName: 'Ideal %' },
						{ ...formatNumber(row.varianceNumber), columnName: 'Variance #' },
						{ ...formatNumber(row.varianceDollar, '$'), columnName: 'Variance $' },
						{ ...formatPercent(row.variancePct), columnName: 'Variance %' },
						{ ...formatNumber(row.wasteNumber), columnName: 'Waste #' },
						{ ...formatNumber(row.wasteDollar, '$'), columnName: 'Waste $' },
						{ ...formatPercent(row.wastePct), columnName: 'Waste %' },
						{ value: row.comparisonName, cellType: 'string', columnName: 'Comparison Name' },
						{ value: row.comparisonSales, cellType: 'number', columnName: 'Comparison Sales' },
					]),
				},
			},
		];

		return body;
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: '',
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
				data: varianceFoodCostData.map((row) => ({
					Department: row.department,
					'Sub Department': row.subDepartment,
					Description: row.description,
					UOM: row.countDisplayUnitName,
					'Actual #': row.actualNumber?.toFixed(2),
					'Actual $': row.actualDollar?.toFixed(2),
					'Actual %': row.actualPct?.toFixed(2),
					'Ideal #': row.idealNumber?.toFixed(2),
					'Ideal $': row.idealDollar?.toFixed(2),
					'Ideal %': row.idealPct?.toFixed(2),
					'Variance #': row.varianceNumber?.toFixed(2),
					'Variance $': row.varianceDollar?.toFixed(2),
					'Variance %': row.variancePct?.toFixed(2),
					'Waste #': row.wasteNumber?.toFixed(2),
					'Waste $': row.wasteDollar?.toFixed(2),
					'Waste %': row.wastePct?.toFixed(2),
					'Comparison Name': row.comparisonName,
					'Comparison Sales': row.comparisonSales?.toFixed(2),
				})),
			},
		];

		const filename = `varianceFoodCost_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Variance Food Cost';
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
			data={filteredVarianceFoodCostData}
			view={viewOptions.find((option) => option.name === viewby)?.row}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			setTableState={setTableState}
			headerPosition='left'
			dataPosition='text-left'
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
					<div className='flex items-center'>
						<UnitSelector
							companyID={companyID}
							alignmentID={alignmentID}
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
								options={countDropdownOptions}
								title='Count Type'
								selectedOption={view}
								onOptionChange={handleCountTypeChange}
							/>
						</div>
						<div className='run-button' onClick={fetchVarianceFoodCost}>
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

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<>
						{varianceFoodCostData.length > 0 && (
							<div className='flex flex-row items-center space-x-3'>
								<div className='w-48'>
									<Dropdown
										title='View Totals By'
										options={viewOptions}
										selectedOption={viewby}
										onOptionChange={(option) => setViewBy(option)}
									/>
								</div>
								{/* start  */}
								<div className='flex items-center justify-center w-28 py-3 text-center capitalize cursor-pointer whitespace-nowrap rounded-3xl  mt-[31px] '>
									<div
										onClick={() => setIsDropdownVisible(!isDropdownVisible)}
										className='items-center justify-center w-full px-6 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
									>
										<span className='cursor-pointer mt-[47px]'> More....</span>
									</div>
									{isDropdownVisible && (
										<div className='more-container !mt-[32px]' ref={moreOptionsDropdown}>
											<div
												className='option mb-2 w-[258px]'
												onClick={() => setIsShowHideDepartmentsModalVisible(true)}
											>
												<button className='w-[100%] bg-[#f9f9f9]'>Show/Hide Departments</button>
											</div>
											<div className='option mb-2 w-[258px]'>
												<button
													className='w-[100%] bg-[#f9f9f9]'
													onClick={() => {
														fetchCountsheets(); // For Beginning Countsheet
														setIsDropdownVisible(false);
													}}
												>
													View Beginning Countsheet
												</button>
											</div>
											<div className='option mb-2 w-[258px]'>
												<button
													className='w-[100%] bg-[#f9f9f9]'
													onClick={() => {
														fetchCountsheets(true); // For Ending Countsheet
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
														handleViewPurchase(selectedFromDate, selectedToDate, true); // For view Purchase
														setIsDropdownVisible(false);
													}}
												>
													View Purchases
												</button>
											</div>
										</div>
									)}
								</div>
								{((tableState?.expanded && Object.keys(tableState.expanded).length > 2) ||
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
						)}
						<div className='relative w-full min-h-56'>
							<Loader loading={isLoading} />
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
						isOpen={isShowHideDepartmentsModalVisible}
						onClose={() => setIsShowHideDepartmentsModalVisible(false)}
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

export default VarianceFoodCost;
