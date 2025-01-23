import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
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
	Run,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import discounts from '../../assets/introJSSteps/discounts';
import { formattingData, formattingDataWithoutDollr } from '../../functions/formatingCurrency';

const columnHelper = createColumnHelper();

const Discounts = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [discountsData, setDiscountsData] = useState([]);
	const [discountTypesData, setDiscountTypesData] = useState([]);
	const [columns, setColumns] = useState([]);
	const [summaryColumns, setSummaryColumns] = useState([]);
	const [isDiscountTypesLoading, setIsDiscountTypesLoading] = useState(false);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Discounts, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [selectedToDate, setSelectedToDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	const [viewBy, setViewBy] = useState('Summary');
	const viewByOptions = [
		{ name: 'Date' },
		{ name: 'Unit' },
		{ name: 'Week' },
		{ name: 'Summary' },
		{ name: 'Detail' },
	];
	const [discountType, setDiscountType] = useState('All-All Discounts');
	const discountTypeOptions = discountTypesData?.map((type) => ({
		name: `${type.type} - ${type.name}`,
		typeName: type.name,
		type: type.type,
	}));
	discountTypeOptions.unshift(
		{ name: 'All-All Discounts' },
		{ name: 'All-All Comps', type: 'Comp' },
		{ name: 'All-All promos', type: 'Promo' }
	);
	const [groupBy, setGroupBy] = useState('None');
	const [isGroupByEditable, setIsGroupByEditable] = useState(true);
	const [groupByOptions, setGroupByOptions] = useState([{ name: 'None' }, { name: 'Discount Type' }]);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: discounts(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const memoizedColumns = useMemo(() => {
		const baseColumns = [
			columnHelper.accessor('discountType', {
				id: 'discountType',
				header: 'Discount Type',
				cell: ({ getValue }) => getValue(),
				dataType: 'string',
				size: 250,
			}),
			columnHelper.accessor('discountedChecks', {
				id: 'discountedChecks',
				header: 'Discounted Checks',
				dataType: 'number',
				footer: ({ table }) => (
					<div className='text-center'>
						{calculateFooterSum(table, 'discountedChecks').toLocaleString('en-US')}
					</div>
				),
			}),
			columnHelper.accessor('totalDiscountAmount', {
				id: 'totalDiscountAmount',
				header: 'Total Discount Amount',
				cell: ({ getValue }) => {
					return `${formattingData(getValue())}`;
				},
				dataType: 'price',
				footer: ({ table }) => (
					<div className='text-center'>
						{formattingData(calculateFooterSum(table, 'totalDiscountAmount'))}
					</div>
				),
			}),
			columnHelper.accessor('discountedItems', {
				id: 'discountedItems',
				header: 'Discounted Items',
				dataType: 'number',
				footer: ({ table }) => (
					<div className='text-center'>{calculateFooterSum(table, 'discountedItems')}</div>
				),
			}),
			columnHelper.accessor('salesGenerated', {
				id: 'salesGenerated',
				header: 'Sales $ Generated',
				cell: ({ row, getValue }) =>
					row.getCanExpand()
						? ''
						: `${getValue() !== null && getValue() !== undefined ? formattingData(getValue()) : '0.00'}`,
				dataType: 'price',
				footer: ({ table }) => (
					<div className='text-center'>{formattingData(calculateFooterSum(table, 'salesGenerated'))}</div>
				),
			}),
			columnHelper.accessor('discountedTickets', {
				id: 'discountedTickets',
				header: 'Disc Cost %',
				cell: ({ getValue, row }) => (row.getCanExpand() ? '' : `${formattingDataWithoutDollr(getValue())}%`),
				dataType: 'percent',
				footer: ({ table }) => (
					<div className='text-center'>{formattingDataWithoutDollr(calculatePctFooter(table))}%</div>
				),
			}),
		];

		if (viewBy === 'Date') {
			baseColumns.unshift(
				columnHelper.accessor('date', {
					id: 'date',
					header: 'Date',
					dataType: 'string',
					size: 80,
				})
			);
		} else if (viewBy === 'Unit') {
			baseColumns.unshift(
				columnHelper.accessor('unit', {
					id: 'unit',
					header: 'Unit',
					dataType: 'string',
					size: 180,
				})
			);
		} else if (viewBy === 'Week') {
			baseColumns.unshift(
				columnHelper.accessor('week', {
					id: 'week',
					header: 'Week',
					dataType: 'string',
					size: 80,
				})
			);
		} else if (viewBy === 'Detail') {
			baseColumns.length = 0;
			baseColumns.unshift(
				columnHelper.accessor('unit', {
					id: 'unit',
					header: 'Unit ID',
					dataType: 'string',
					size: 80,
				}),
				columnHelper.accessor('date', {
					id: 'date',
					header: 'Date',
					dataType: 'string',
					size: 80,
				}),
				columnHelper.accessor('checkID', {
					id: 'checkID',
					header: 'Check ID',
					dataType: 'string',
					size: 150,
				}),
				columnHelper.accessor('price', {
					id: 'price',
					header: 'Price',
					cell: ({ row }) => formattingData(calculateSum(row, 'price')),
					dataType: 'price',
					footer: ({ table }) => (
						<div className='text-center'>{formattingData(calculateFooterSum(table, 'price'))}</div>
					),
					size: 80,
				}),
				columnHelper.accessor('amountDiscount', {
					id: 'amountDiscount',
					header: 'Amount Discount',
					cell: ({ row }) => formattingData(calculateSum(row, 'amountDiscount')),
					dataType: 'price',
					footer: ({ table }) => (
						<div className='text-center'>{formattingData(calculateFooterSum(table, 'amountDiscount'))}</div>
					),
					size: 180,
				}),
				columnHelper.accessor('itemID', {
					id: 'itemID',
					header: 'Item ID',
					dataType: 'string',
					size: 80,
				}),
				columnHelper.accessor('salesCategory', {
					id: 'salesCategory',
					header: 'Sales Category',
					dataType: 'number',
					size: 100,
				}),
				columnHelper.accessor('menuItem', {
					id: 'menuItem',
					header: <div className='w-full text-left'>Menu Item</div>,
					cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
					dataType: 'string',
					size: 180,
				}),
				columnHelper.accessor('discountType', {
					id: 'discountType',
					header: <div className='w-full text-left'>Discount Type</div>,
					cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
					dataType: 'string',
					size: 120,
				}),
				columnHelper.accessor('employee', {
					id: 'employee',
					header: <div className='w-full text-left'>Employee</div>,
					cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
					dataType: 'string',
					size: 80,
				})
			);
		}
		return baseColumns;
	}, [viewBy]);

	useEffect(() => {
		setColumns(memoizedColumns);
	}, [memoizedColumns]);
	//getDefaultDates
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
			console.error('Error getting default dates: ', error);
		}
	};

	useEffect(() => {
		getDefaultDates();
	}, []);

	const calculateSum = (row, accessor) => {
		if (row.getCanExpand()) {
			const sum = row.subRows.reduce((acc, subrow) => {
				if (subrow.getCanExpand()) {
					return (
						acc +
						subrow.subRows.reduce(
							(subAcc, subSubrow) => subAcc + parseFloat(subSubrow.original[accessor]),
							0
						)
					);
				} else {
					return acc + parseFloat(subrow.original[accessor]);
				}
			}, 0);
			return accessor === 'variableLaborMinutes' ? sum : formattingData(sum);
		} else {
			return row.original[accessor];
		}
	};

	const calculatePctFooter = (table, weekId) => {
		let totalSalesGenerated;
		let discountAmount;
		if (viewBy === 'Summary' && weekId !== 'total') {
			totalSalesGenerated = table
				.getCoreRowModel()
				.rows.reduce((acc, row) => {
					const weekData = row.original.weeks.find((week) => week[`salesGenerated_${weekId}`] !== undefined);
					return acc + (weekData ? weekData[`salesGenerated_${weekId}`] : 0);
				}, 0)
				.toFixed(2);

			discountAmount = table
				.getCoreRowModel()
				.rows.reduce((acc, row) => {
					const weekData = row.original.weeks.find((week) => week[`discountAmount_${weekId}`] !== undefined);
					return acc + (weekData ? weekData[`discountAmount_${weekId}`] : 0);
				}, 0)
				.toFixed(2);
		} else {
			totalSalesGenerated = table.getCoreRowModel().rows.reduce((acc, row) => {
				const value = parseFloat(row.original['salesGenerated'] || row.original['totalSalesGenerated']);
				return acc + (isNaN(value) ? 0 : value);
			}, 0);

			discountAmount = table.getCoreRowModel().rows.reduce((acc, row) => {
				const value = parseFloat(row.original['totalDiscountAmount']);
				return acc + (isNaN(value) ? 0 : value);
			}, 0);
		}

		return ((discountAmount / totalSalesGenerated) * 100).toFixed(2);
	};

	const calculateFooterSum = (table, accessor) => {
		let footerSum;
		if (viewBy === 'Summary' && !accessor.startsWith('total')) {
			footerSum = table
				.getCoreRowModel()
				.rows.reduce((acc, row) => {
					const weekData = row.original.weeks.find((week) => week[accessor] !== undefined);
					return acc + (weekData ? parseFloat(weekData[accessor]) : 0);
				}, 0)
				.toFixed(accessor.startsWith('discountedItems') || accessor.startsWith('discountedChecks') ? 0 : 2);
		} else {
			footerSum = table
				.getCoreRowModel()
				.rows.reduce((acc, row) => acc + parseFloat(row.original[accessor]), 0)
				.toFixed(accessor === 'discountedChecks' || accessor === 'discountedItems' ? 0 : 2);
		}
		return footerSum;
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
		fetchDiscountTypes();
	}, []);

	const fetchDiscountTypes = async () => {
		try {
			setIsDiscountTypesLoading(true);
			setIsError(false);
			const getData = {
				url: 'discountTypes',
				urlParams: {
					companyId: companyID,
				},
			};

			const result = await getCall(getData);
			const discountTypesData = result.data.map((type) => ({
				name: type.TypeItemName,
				type: type.TypeName,
			}));
			setDiscountTypesData(discountTypesData);
			setIsDiscountTypesLoading(false);
		} catch (error) {
			console.error('Error getting Discount Types: ', error);
		}
	};

	const fetchDiscountsReportData = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'discounts',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					viewBy: viewBy,
					type: 1,
				},
			};

			const result = await getCall(getData);

			if (viewBy === 'Summary') {
				const filterItems = discountTypesData.filter(
					(item) => item.type === discountTypeOptions.find((option) => option.name === discountType)?.type
				);

				const filterData =
					discountType === 'All-All Discounts'
						? result.data
						: result.data.filter((row) => filterItems.find((item) => item.name === row.discountType));

				const newData =
					discountType === 'All-All Discounts' ||
					discountType === 'All-All promos' ||
					discountType === 'All-All Comps'
						? filterData
						: result.data.filter(
								(row) =>
									row.discountType ===
									discountTypeOptions.find((option) => option.name === discountType)?.typeName
						  );

				setDiscountsData(newData);

				const uniqueWeeks = Array.from(
					new Set(result.data.flatMap((item) => item.weeks.map((week) => week.weekId)))
				).sort();

				const weeks = uniqueWeeks.map((weekId) => {
					const startDate = new Date(selectedFromDate.getFullYear(), 0, 1 + (weekId - 2) * 7);
					const endDate = new Date(startDate);
					endDate.setDate(endDate.getDate() + 6);
					return {
						weekId,
						WeekStartDate: dateFormat(startDate, 'mm-dd-yy'),
						WeekEndDate: dateFormat(endDate, 'mm-dd-yy'),
					};
				});

				const generatedColumns = [
					columnHelper.accessor('discountType', {
						id: 'discountType',
						header: 'Discount Name',
						cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
						dataType: 'string',
					}),
					columnHelper.group({
						header: 'Total',
						columns: [
							columnHelper.accessor('totalDiscountAmount', {
								id: 'totalDiscountAmount',
								header: 'Disc Amount',
								cell: ({ getValue }) => `${formattingData(getValue())}`,
								dataType: 'number',
								footer: ({ table }) => (
									<div className='text-center'>
										{formattingData(calculateFooterSum(table, 'totalDiscountAmount'))}
									</div>
								),
							}),
							columnHelper.accessor('totalDiscountedChecks', {
								id: 'totalDiscountedChecks',
								header: 'Disc Checks',
								dataType: 'number',
								cell: ({ getValue }) => `${formattingDataWithoutDollr(getValue())}`,
								footer: ({ table }) => (
									<div className='text-center'>
										{formattingDataWithoutDollr(calculateFooterSum(table, 'totalDiscountedChecks'))}
									</div>
								),
							}),
							columnHelper.accessor('totalDiscountedItems', {
								id: 'totalDiscountedItems',
								header: 'Disc Items',
								dataType: 'number',
								cell: ({ getValue }) => `${formattingDataWithoutDollr(getValue())}`,
								footer: ({ table }) => (
									<div className='text-center'>
										{formattingDataWithoutDollr(calculateFooterSum(table, 'totalDiscountedItems'))}
									</div>
								),
							}),

							columnHelper.accessor('totalSalesGenerated', {
								id: 'totalSalesGenerated',
								header: 'Sales $ Gen',
								cell: ({ getValue }) => `${formattingData(getValue())}`,
								dataType: 'price',
								footer: ({ table }) => (
									<div className='text-center'>
										{formattingData(calculateFooterSum(table, 'totalSalesGenerated'))}
									</div>
								),
							}),
							columnHelper.accessor('totaldiscountedTickets', {
								id: 'totaldiscountedTickets',
								header: 'Disc Cost %',
								cell: ({ getValue }) => `${formattingDataWithoutDollr(getValue())}%`,
								dataType: 'percent',
								footer: ({ table }) => (
									<div className='text-center'>
										{formattingDataWithoutDollr(calculatePctFooter(table, 'total'))}%
									</div>
								),
							}),
						],
					}),
					...uniqueWeeks.map((weekId) =>
						columnHelper.group({
							header: `Week ${weekId} (${weeks.find((week) => week.weekId === weekId).WeekStartDate} - ${
								weeks.find((week) => week.weekId === weekId).WeekEndDate
							})`,
							columns: [
								columnHelper.accessor(
									(row) => {
										const weekData = row.weeks.find((week) => week.weekId === weekId);
										return weekData ? weekData[`discountAmount_${weekId}`] : 0;
									},
									{
										id: `discountAmount_${weekId}`,
										header: 'Disc Amount',
										cell: ({ getValue }) => {
											let discAmount = formattingData(getValue());
											return discAmount;
										},
										dataType: 'number',
										footer: ({ table }) => (
											<div className='text-center'>
												{formattingData(calculateFooterSum(table, `discountAmount_${weekId}`))}
											</div>
										),
									}
								),
								columnHelper.accessor(
									(row) => {
										const weekData = row.weeks.find((week) => week.weekId === weekId);
										return weekData ? weekData[`discountedChecks_${weekId}`] : 0;
									},
									{
										id: `discountedChecks_${weekId}`,
										header: 'Disc Checks',
										dataType: 'number',
										cell: ({ getValue }) => `${formattingDataWithoutDollr(getValue())}`,
										footer: ({ table }) => (
											<div className='text-center'>
												{formattingDataWithoutDollr(
													calculateFooterSum(table, `discountedChecks_${weekId}`)
												)}
											</div>
										),
									}
								),
								columnHelper.accessor(
									(row) => {
										const weekData = row.weeks.find((week) => week.weekId === weekId);
										return weekData ? weekData[`discountedItems_${weekId}`] : 0;
									},
									{
										id: `discountedItems_${weekId}`,
										header: 'Disc Items',
										dataType: 'number',
										cell: ({ getValue }) => `${formattingDataWithoutDollr(getValue())}`,
										footer: ({ table }) => (
											<div className='text-center'>
												{formattingDataWithoutDollr(
													calculateFooterSum(table, `discountedItems_${weekId}`)
												)}
											</div>
										),
									}
								),
								columnHelper.accessor(
									(row) => {
										const weekData = row.weeks.find((week) => week.weekId === weekId);
										return weekData ? weekData[`salesGenerated_${weekId}`] : 0;
									},
									{
										id: `salesGenerated_${weekId}`,
										header: 'Sales $ Gen',
										cell: ({ getValue }) => formattingData(getValue()),
										dataType: 'price',
										footer: ({ table }) => (
											<div className='text-center'>
												{formattingData(calculateFooterSum(table, `salesGenerated_${weekId}`))}
											</div>
										),
									}
								),
								columnHelper.accessor(
									(row) => {
										const weekData = row.weeks.find((week) => week.weekId === weekId);
										return weekData ? weekData[`discountedTickets_${weekId}`] : 0;
									},
									{
										id: `discountedTickets_${weekId}`,
										header: 'Disc Cost %',
										cell: ({ getValue }) => `${formattingDataWithoutDollr(getValue())}%`,
										dataType: 'percent',
										footer: ({ table }) => (
											<div className='text-center'>
												{formattingDataWithoutDollr(calculatePctFooter(table, weekId))}%
											</div>
										),
									}
								),
							],
						})
					),
				];
				handleGroupByChange(viewBy === 'Summary' || viewBy === 'Detail' ? groupBy : viewBy, generatedColumns);
			} else {
				const newData = result.data.map((row) => {
					if (viewBy === 'Detail') {
						return {
							unit: row.UnitID,
							date: row.DATE,
							checkID: row.Value,
							price: row.Price,
							amountDiscount: row.AmountDiscount.toFixed(2),
							itemID: row.ItemID,
							salesCategory: row.Category,
							menuItem: row.FullDescription,
							discountType: row.TypeName + ': ' + row.TypeItemName,
							employee: row.LastName + ', ' + row.FirstName,
							typeName: row.TypeName,
						};
					} else {
						return {
							discountType: row.TypeItemName,
							discountedChecks: row.TicketDiscountQuantity,
							totalDiscountAmount: row.DiscountedItemsAmount,
							discountedItems: row.ItemDiscountQuantity,
							salesGenerated: row.DiscountedTicketAmount,
							discountedTickets:
								row.DiscountedItemsAmount && row.DiscountedTicketAmount
									? ((row.DiscountedItemsAmount / row.DiscountedTicketAmount) * 100).toFixed(2)
									: 0,
							week: row.WeekID,
							date: row.Date,
							type: row.Type,
							typeName: row.TypeName,
							unit: row.Unit,
						};
					}
				});

				const filterItems = discountTypesData.filter(
					(item) => item.type === discountTypeOptions.find((option) => option.name === discountType)?.type
				);

				const filterData =
					discountType === 'All-All Discounts'
						? newData.sort((a, b) => new Date(a.date) - new Date(b.date))
						: newData
								.filter((row) => filterItems.find((item) => item.name === row.discountType))
								.sort((a, b) => new Date(a.date) - new Date(b.date));

				const newFilteredData =
					discountType === 'All-All Discounts' ||
					discountType === 'All-All promos' ||
					discountType === 'All-All Comps'
						? filterData
						: newData.filter(
								(row) =>
									row.discountType ===
									discountTypeOptions.find((option) => option.name === discountType)?.typeName
						  );

				handleGroupByChange(viewBy === 'Summary' || viewBy === 'Detail' ? groupBy : viewBy, columns);
				setDiscountsData(newFilteredData);
			}

			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Discounts data: ', error);
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

	const handleGroupByChange = (option, columnsPassed) => {
		const groupByColumns = {
			None: [],
			Date: ['date'],
			Employee: ['employee'],
			Unit: ['unit'],
			Week: ['week'],
			'Discount Type': ['discountType'],
			'Menu Item': ['menuItem'],
			'Sales Category': ['salesCategory'],
		};

		const selectedGroupByColumns = groupByColumns[option] || [];
		const newColumns = columnsPassed.map((column) =>
			selectedGroupByColumns.includes(column.id) ? { ...column, groupBy: true, show: false } : column
		);

		if (option !== 'None') {
			const firstNonGroupByColumnIndex = newColumns.findIndex((col) => !col.groupBy);

			if (firstNonGroupByColumnIndex !== -1) {
				const updateColumn = (column) => ({
					...column,
					cell: ({ row, getValue }) => {
						const label =
							row.depth < selectedGroupByColumns.length
								? `${
										columnsPassed?.find((col) => col.id === selectedGroupByColumns[row.depth])
											?.header
								  }: ${row.original[selectedGroupByColumns[row.depth]]} `
								: '';

						console.log('row', columnsPassed);

						return row.getCanExpand() ? (
							<div
								style={{
									cursor: 'pointer',
									paddingLeft: `${row.depth * 2}rem`,
									width: '100%',
								}}
								className={`flex items-center absolute gap-2 font-bold top-0 bottom-0 capitalize ${
									viewBy === 'Summary' ? 'bg-white' : ''
								}`}
							>
								{row.getIsExpanded() ? (
									<CiSquareMinus className='text-[20px]' />
								) : (
									<CiSquarePlus className='text-[20px]' />
								)}
								{label}
							</div>
						) : column.header === 'Disc Amount' ? (
							`$${getValue()}`
						) : (
							<div className={`${column.header === 'Discount Type' ? 'text-left px-6' : ''}`}>
								{getValue()}
							</div>
						);
					},
				});

				if (viewBy === 'Summary') {
					newColumns[firstNonGroupByColumnIndex].columns[firstNonGroupByColumnIndex - 1] = updateColumn(
						newColumns[firstNonGroupByColumnIndex].columns[firstNonGroupByColumnIndex - 1]
					);
				} else {
					newColumns[firstNonGroupByColumnIndex] = updateColumn(newColumns[firstNonGroupByColumnIndex]);
				}
			}
		} else {
			newColumns.forEach((column) => {
				column.groupBy = false;
				column.show = true;
			});
		}

		if (viewBy === 'Summary' && newColumns.length > 0) {
			setSummaryColumns(newColumns);
		} else {
			setColumns(newColumns);
		}
	};

	const handleReportTypeChange = (option) => {
		setDiscountType(option);
	};

	const handleViewByChange = (option) => {
		setViewBy(option);
		setDiscountsData([]);
		if (option === 'Summary' || option === 'Detail') {
			setIsGroupByEditable(true);
			if (option === 'Summary') {
				setGroupByOptions([{ name: 'None' }, { name: 'Discount Type' }]);
				setGroupBy('None');
			} else {
				setGroupByOptions([
					{ name: 'None' },
					{ name: 'Unit' },
					{ name: 'Employee' },
					{ name: 'Discount Type' },
					{ name: 'Menu Item' },
					{ name: 'Date' },
					{ name: 'Sales Category' },
				]);
			}
		} else {
			setIsGroupByEditable(false);
		}
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		const flattenColumns = (columns) => {
			let flatColumns = [];
			columns.forEach((column) => {
				if (column.columns) {
					flatColumns = flatColumns.concat(
						flattenColumns(column.columns).map((subCol) => ({
							...subCol,
							parentHeader: column.header,
						}))
					);
				} else {
					flatColumns.push(column);
				}
			});
			return flatColumns;
		};

		const generateBody = (columns, data) => {
			const rowsPerTable = 28;
			const totalRows = data.length;
			const body = [];

			for (let i = 0; i < totalRows; i += rowsPerTable) {
				const chunkedColumns = [];
				for (let j = 0; j < columns.length; j += 13) {
					chunkedColumns.push(columns.slice(j, j + 13));
				}
				chunkedColumns.forEach((columnChunk) => {
					body.push({
						type: 'table/SeperatePage',
						widths: columnChunk.map(() => 'auto'),
						dataTypes: columnChunk.map((column) => column.dataType),
						data: {
							columnHeaders: columnChunk.map((column) =>
								column.parentHeader ? `${column.parentHeader} - ${column.header}` : column.header
							),
							rows: data.slice(i, i + rowsPerTable).map((row) =>
								columnChunk.map((column) => {
									const isMetricColumn =
										column.id.startsWith('discounted') ||
										column.id.startsWith('salesGenerated') ||
										column.id.startsWith('discountAmount') ||
										column.id.startsWith('discountedTickets');

									let value = isMetricColumn
										? row.weeks?.find((week) => week[column.id])?.[column.id] ?? 0
										: row[column.id] ?? 0;

									if (column.dataType === 'price') {
										value = `${formattingData(value)}`;
									} else if (column.dataType === 'percent') {
										value = `${formattingDataWithoutDollr(value)}`;
									}

									return {
										value: value.toString(),
										cellType: column.dataType,
										columnName: column.parentHeader
											? `${column.parentHeader} - ${column.header}`
											: column.header,
									};
								})
							),
						},
					});
				});
			}
			return body;
		};

		const pdfData = {
			title: 'Discounts',
			subHeaders: [
				`Unit: ${selectedUnitName} | View: ${viewBy} | Date Range: ${dateFormat(
					selectedFromDate,
					'mm-dd-yyyy'
				)} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body:
				viewBy === 'Summary'
					? generateBody(flattenColumns(summaryColumns), discountsData)
					: [
							{
								type: 'table',
								widths: new Array(columns.length).fill('auto'),
								dataTypes: columns.map((column) => column.dataType),
								data: {
									columnHeaders: columns.map((column) => column.header),
									rows: discountsData.map((row) =>
										columns.map((column) => ({
											value:
												column.dataType === 'price'
													? `${formattingData(row[column.id])}`
													: column.dataType === 'percent'
													? `${formattingDataWithoutDollr(row[column.id])}`
													: row[column.id],
											cellType: column.dataType,
											columnName: column.header,
										}))
									),
								},
							},
					  ],
		};

		PdfBuilder(pdfData);
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		if (viewBy !== 'Summary') {
			const csvHeaders = columns.map((column) => column.header);
			const csvData = discountsData.map((row) => columns.map((column) => `"${row[column.id]}"`).join(','));
			const csvString = [csvHeaders.join(','), ...csvData].join('\n');
			const blob = new Blob([csvString], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const tempLink = document.createElement('a');
			tempLink.href = url;
			tempLink.setAttribute('download', 'discounts.csv');
			tempLink.click();
		} else {
			const flattenColumns = (columns) => {
				let flatColumns = [];
				columns.forEach((column) => {
					if (column.columns) {
						flatColumns = flatColumns.concat(
							flattenColumns(column.columns).map((subCol) => ({
								...subCol,
								parentHeader: column.header,
							}))
						);
					} else {
						flatColumns.push(column);
					}
				});
				return flatColumns;
			};

			const flattenedColumns = flattenColumns(summaryColumns);

			const generateCSVData = () => {
				const csvHeaders = flattenedColumns.map((column) =>
					column.parentHeader ? `${column.parentHeader} - ${column.header}` : column.header
				);
				const csvData = discountsData.map((row) =>
					flattenedColumns
						.map((column) => {
							const value =
								column.id.startsWith('discounted') ||
								column.id.startsWith('salesGenerated') ||
								column.id.startsWith('discountAmount') ||
								column.id.startsWith('discountedTickets')
									? row.weeks.find((week) => week[column.id])?.[column.id] || '0'
									: row[column.id] || '0';
							return `"${value}"`;
						})
						.join(',')
				);
				return [csvHeaders.join(','), ...csvData].join('\n');
			};

			const csvString = generateCSVData();
			const blob = new Blob([csvString], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const tempLink = document.createElement('a');
			tempLink.href = url;
			tempLink.setAttribute('download', 'discounts.csv');
			tempLink.click();
		}
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (viewBy !== 'Summary') {
			const data = [
				{
					name: '',
					columns: columns.map((column) => ({
						name: column.header,
						filterButton: true,
					})),
					data: discountsData.map((row) =>
						columns.map((column) =>
							column.dataType === 'price'
								? `${formattingData(row[column.id])}`
								: column.dataType === 'percent'
								? `${row[column.id]}%`
								: row[column.id]
						)
					),
				},
			];

			const filename = `discounts_${selectedUnitName}_${dateFormat(
				selectedFromDate,
				'mm-dd-yyyy'
			)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
			const spreadSheetTitle = 'Discounts';
			const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

			exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
		} else {
			const flattenColumns = (columns) => {
				let flatColumns = [];
				columns.forEach((column) => {
					if (column.columns) {
						flatColumns = flatColumns.concat(
							flattenColumns(column.columns).map((subCol) => ({
								...subCol,
								parentHeader: column.header,
							}))
						);
					} else {
						flatColumns.push(column);
					}
				});
				return flatColumns;
			};

			const flattenedColumns = flattenColumns(summaryColumns);

			const data = [
				{
					name: '',
					columns: flattenedColumns.map((column) => ({
						name: column.parentHeader ? `${column.parentHeader} - ${column.header}` : column.header,
						filterButton: true,
					})),
					data: discountsData.map((row) =>
						flattenedColumns.map((column) => {
							const isMetricColumn =
								column.id.startsWith('discounted') ||
								column.id.startsWith('salesGenerated') ||
								column.id.startsWith('discountAmount') ||
								column.id.startsWith('discountedTickets');

							let value = isMetricColumn
								? row.weeks?.find((week) => week[column.id])?.[column.id] ?? 0
								: row[column.id] ?? 0;

							if (column.dataType === 'price') {
								value = `$${value}`;
							} else if (column.dataType === 'percent') {
								value = `${value}%`;
							}

							return value.toString();
						})
					),
				},
			];

			const filename = `discounts_${selectedUnitName}_${dateFormat(
				selectedFromDate,
				'mm-dd-yyyy'
			)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
			const spreadSheetTitle = 'Discounts';
			const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

			exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
		}
	};

	const Table = (
		<TableHOC columns={viewBy === 'Summary' ? summaryColumns : columns} data={discountsData} isFooter={true} />
	);

	return (
		<>
			<div className='w-[98%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-2 text-[18px] leading-tight text-left pageTitle'>Discounts</h2>
				<header className='optionsBar flex justify-between items-center mb-0 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center'>
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
							extraClass={'w-[219px]'}
						/>
						<div className='w-44 viewBy-selector'>
							<Dropdown
								title='View'
								options={viewByOptions}
								selectedOption={viewBy}
								onOptionChange={handleViewByChange}
							/>
						</div>
						<div className='mx-2 w-52 discount-selector'>
							<Dropdown
								title='Discounts'
								options={isDiscountTypesLoading ? [{ name: 'Loading...' }] : discountTypeOptions}
								selectedOption={isDiscountTypesLoading ? 'Loading...' : discountType}
								onOptionChange={handleReportTypeChange}
								isSearch={true}
							/>
						</div>
						<div className='w-44 group-by'>
							<Dropdown
								title='Group By'
								options={groupByOptions}
								selectedOption={groupBy}
								onOptionChange={(option) => setGroupBy(option)}
								isEditable={isGroupByEditable}
							/>
						</div>
						<Run fetchData={fetchDiscountsReportData} />
					</div>
					<div>
						<ExportOptions
							includePDF={true}
							handlePDFClick={handlePDFClick}
							includeCSV={true}
							handleCSVClick={handleCSVClick}
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
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						{!isLoading &&
							(discountsData.length > 0 ? (
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
		</>
	);
};

export default Discounts;
