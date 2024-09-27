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
	TableHOC,
	Dropdown,
	Menu,
	MenuModal,
	Inventory,
	InventoryModal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import actualFoodCosts from '../../assets/introJSSteps/actualFoodCosts';

const columnHelper = createColumnHelper();

const MenuItemsSold = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [menuItemSoldData, setMenuItemSoldData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	//Menu Items
	const [menuItemList, setMenuItemList] = useState([]);

	//Inventory Items
	const [inventoryItemList, setInventoryItemList] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Menu Items Sold, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//selected menu items
	const [selectedMenu, setSelectedMenu] = useState(0);
	const [selectedMenuName, setselectedMenuName] = useState('No Menu Selected');
	const [showMenuModal, setShowMenuModal] = useState(false); // State to manage modal visibility

	//selected Inventory items
	const [selectedInventory, setSelectedInventory] = useState(0);
	const [selectedInventoryName, setselectedInventoryName] = useState('No Inventory Selected');
	const [showInventoryModal, setShowInventoryModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [viewWeek, setViewWeek] = useState('All');
	const [viewWeekValue, setViewWeekValue] = useState(0);
	const [view, setView] = useState('summary'); // Default to "summary"
	const [viewValue, setViewValue] = useState(0);
	const [salesType, setSalesType] = useState('SalesNet'); // Default to "Net"
	const [groupUnit, setGroupUnit] = useState('SalesNet'); // Default to "Net"
	const [currentSalesType, setCurrentSalesType] = useState('SalesNet');
	const [activeTab, setActiveTab] = useState('ItemsSoldTotals');
	const [item, setItem] = useState('Menu');
	const [itemValue, setItemValue] = useState(0);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: actualFoodCosts(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// set dropdown iteams
	const dropdownOptions = [
		{ name: 'All' },
		{ name: 'Sunday' },
		{ name: 'Monday' },
		{ name: 'Tuesday' },
		{ name: 'Wednesday' },
		{ name: 'Thursday' },
		{ name: 'Friday' },
		{ name: 'Saturday' },
	];

	// Create a mapping object for day names to values
	const dayValueMap = {
		All: 0,
		Sunday: 1,
		Monday: 2,
		Tuesday: 3,
		Wednesday: 4,
		Thursday: 5,
		Friday: 6,
		Saturday: 7,
	};

	const viewValueMap = {
		summary: 0,
		byUnit: 1,
		topSellers: 2,
		Menu: 0,
		Inventory: 1,
	};

	const handleViewWeekChange = (option) => {
		setViewWeek(option);
		const value = dayValueMap[option] || 0; // Default to 0 if option is not found
		setViewWeekValue(value);
	};

	const handleViewChange = (option) => {
		setView(option);
		const value = viewValueMap[option] || 0; // Default to 0 if option is not found
		setViewValue(value);
		setMenuItemSoldData([]);
	};

	const handleItemChange = (option) => {
		setItem(option);
		const value = viewValueMap[option] || 0; // Default to 0 if option is not found
		setItemValue(value);
	};

	const handleSalesChange = (option) => {
		setSalesType(option);
	};

	const handleGroupByUnitChange = (option) => {
		setGroupUnit(option);
	};

	const getColumns = (activeTab) => {
		if (activeTab === 'ItemsSoldTotals') {
			return [
				...(viewValue === 2
					? [
							columnHelper.accessor('category', {
								id: 'category',
								header: 'Category',
								dataType: 'string',
								cell: (info) => info.getValue() || '',
							}),
					  ]
					: []),
				columnHelper.accessor('itemId', {
					id: 'itemId',
					header: 'Item',
					dataType: 'string',
					cell: ({ getValue, row }) =>
						row.getCanExpand() ? (
							<div
								{...{
									style: {
										cursor: 'pointer',
										paddingLeft: `${row.depth * 2}rem`,
									},
									className: 'flex items-center gap-2 font-bold absolute inset-0 w-96]',
								}}
							>
								{row.getIsExpanded() ? (
									<CiSquareMinus className='text-[20px]' />
								) : (
									<CiSquarePlus className='text-[20px]' />
								)}
								{row.depth === 0 ? (
									<span>
										Category: {row.original.category} (Count: {row.subRows.length}, Total Amount: $
										{(() => {
											if (row.getCanExpand()) {
												const sum = row.subRows
													.reduce((acc, subrow) => {
														if (subrow.getCanExpand()) {
															return (
																acc +
																subrow.subRows.reduce(
																	(subAcc, subSubrow) =>
																		subAcc + subSubrow.original.discPrice,
																	0
																)
															);
														} else {
															return acc + subrow.original.discPrice;
														}
													}, 0)
													.toFixed(2);
												return sum;
											} else {
												return getValue();
											}
										})()}
										)
									</span>
								) : (
									<span>
										Description: {row.original.item} (Count: {row.subRows.length}, Total Amount: ${' '}
										{row.subRows.reduce((acc, curr) => acc + curr.original.discPrice, 0).toFixed(2)}
										)
									</span>
								)}
							</div>
						) : getValue() ? (
							getValue() || ''
						) : (
							''
						),
				}),
				columnHelper.accessor('description', {
					id: 'description',
					header: 'Description',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('quant', {
					id: 'Quantity',
					header: 'Quantity',
					dataType: 'number',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('discPrice', {
					id: 'Amount',
					header: 'Amount',
					dataType: 'number',
					cell: ({ row, getValue }) =>
						row.getCanExpand()
							? ''
							: `$${getValue() !== null && getValue() !== undefined ? getValue().toFixed(2) : '0.00'}`,
				}),
				columnHelper.accessor('itemSoldPct', {
					id: 'ItemSold',
					header: 'Item Sold %',
					dataType: 'number',
					cell: (info) => {
						const value = info.getValue();
						return value != null ? `${parseFloat(value).toFixed(2)}%` : '';
					},
				}),
				columnHelper.accessor('quantity_Avg', {
					id: 'AvgItemQunt',
					header: 'Avg Item Quantity',
					dataType: 'number',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('discPrice_Avg', {
					id: 'discPrice_Avg',
					header: 'Avg Item Amount',
					dataType: 'number',
					cell: ({ row, getValue }) =>
						row.getCanExpand()
							? ''
							: `$${getValue() !== null && getValue() !== undefined ? getValue().toFixed(2) : '0.00'}`,
				}),
			];
		}

		if (activeTab === 'ItemsSoldByEmployee') {
			return [
				columnHelper.accessor('unitName', {
					id: 'Unit',
					header: 'Unit',
					dataType: 'number',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('employeeId', {
					id: 'Employee ID',
					header: 'Employee ID',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('firstName', {
					id: 'First Name',
					header: 'First Name',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('lastName', {
					id: 'Last Name',
					header: 'Last Name',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('MenuItem', {
					id: 'Menu Item',
					header: 'Menu Item',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('Sold', {
					id: '#Sold',
					header: '#Sold',
					dataType: 'number',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('discPrice', {
					id: 'Item Sales',
					header: 'Item Sales',
					dataType: 'string',
					cell: ({ row, getValue }) =>
						row.getCanExpand()
							? ''
							: `$${getValue() !== null && getValue() !== undefined ? getValue().toFixed(2) : '0.00'}`,
				}),
				columnHelper.accessor('employeeCovers', {
					id: 'Total Guests',
					header: 'Total Guests',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('employeeCoversPercent', {
					id: '% of Guests',
					header: '% of Guests',
					dataType: 'number',
					cell: (info) => {
						const value = info.getValue();
						return value != null ? `${parseFloat(value).toFixed(2)}%` : '';
					},
				}),
			];
		}
		if (activeTab === 'ItemsSoldByHour') {
			return [
				columnHelper.accessor('unit', {
					id: 'Unit',
					header: 'Unit',
					dataType: 'number',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('hour', {
					id: 'Hour',
					header: 'Hour',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('MenuItem', {
					id: 'Menu Item',
					header: 'Menu Item',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('Sold', {
					id: '# Sold',
					header: '# Sold',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('discPrice', {
					id: 'Item Sales',
					header: 'Item Sales',
					dataType: 'string',
					cell: ({ row, getValue }) =>
						row.getCanExpand()
							? ''
							: `$${getValue() !== null && getValue() !== undefined ? getValue().toFixed(2) : '0.00'}`,
				}),
				...(itemValue === 1
					? [
							columnHelper.accessor('Sold', {
								id: 'Case Unit Name',
								header: 'Case Unit Name',
								dataType: 'string',
								cell: (info) => info.getValue() || '',
							}),
							columnHelper.accessor('Sold', {
								id: 'Usage Cases',
								header: 'Usage Cases',
								dataType: 'string',
								cell: (info) => info.getValue() || '',
							}),
							columnHelper.accessor('Sold', {
								id: 'Count Name',
								header: 'Usage Cases',
								dataType: 'string',
								cell: (info) => info.getValue() || '',
							}),
							columnHelper.accessor('Sold', {
								id: 'Use Count',
								header: 'Use Count',
								dataType: 'string',
								cell: (info) => info.getValue() || '',
							}),
					  ]
					: []),
			];
		}
		if (activeTab === 'ItemsSoldWithModifiers') {
			return [
				columnHelper.accessor('modItemID', {
					id: 'modItemID',
					header: 'Modifier Item #',
					dataType: 'string',
					cell: ({ getValue, row }) =>
						row.getCanExpand() ? (
							<div
								{...{
									style: {
										cursor: 'pointer',
										paddingLeft: `${row.depth * 2}rem`,
									},
									className: 'flex items-center gap-2 font-bold absolute inset-0 w-96]',
								}}
							>
								{row.getIsExpanded() ? (
									<CiSquareMinus className='text-[20px]' />
								) : (
									<CiSquarePlus className='text-[20px]' />
								)}
								{row.depth === 0 ? (
									<span>
										Menu Item Name: {row.original.category} (Quantity Sold = {row.subRows.length})
									</span>
								) : (
									<span>
										Unit Name: {row.original.unitName} (Quantity Sold = {row.subRows.length})
									</span>
								)}
							</div>
						) : getValue() ? (
							getValue() || ''
						) : (
							''
						),
				}),
				columnHelper.accessor('modifierDisplayName', {
					id: 'Modifier Item Name',
					header: 'Modifier Item Name',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('quant', {
					id: 'quant',
					header: 'Quantity',
					dataType: 'string',
					cell: (info) => info.getValue() || '',
				}),
				columnHelper.accessor('modItemFrequency', {
					id: 'Modifier Usage Frequency',
					header: 'Modifier Usage Frequency',
					dataType: 'string',
					cell: ({ getValue }) => (getValue() ? `${(getValue() * 100).toFixed(2)}%` : ''),
				}),
			];
		}

		// Default return for modifiers or other tabs
		return [];
	};

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
		await Promise.all([
			fetchUnits(companyId, alignmentId, selectedUnit),
			fetchMenu(companyId),
			fetchInventory(companyId),
		]);
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

	// Fetching Menu
	const fetchMenu = async (companyId) => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'MenuItemsByCompanyID',
				urlParams: {
					companyId: companyId,
				},
			};

			const result = await getCall(getData);

			setMenuItemList(result.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your menu, please try again later.');
			console.error('Error getting menus: ', error);
		}
	};

	// Fetching Inventory
	const fetchInventory = async (companyId) => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'InventoryByCompanyID',
				urlParams: {
					companyId: companyId,
				},
			};

			const result = await getCall(getData);
			console.log('inventory', result);

			setInventoryItemList(result.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your inventory, please try again later.');
			console.error('Error getting inventory: ', error);
		}
	};

	const handleRun = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);

			// Define the URL mapping based on viewValue
			const urlMapping = {
				0: 'MenuItemSoldSummaryReport',
				1: 'MenuItemSoldUnitReport',
				2: 'MenuItemSoldSellersReport',
			};

			// Get the URL based on viewValue
			const url = urlMapping[viewValue] || 'MenuItemSoldSummaryReport'; // Default URL if viewValue is not found
			const getData = {
				url: url,
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
					groupingId: viewValue,
					DOW: viewWeekValue,
					columnName: salesType,
				},
			};

			const result = await getCall(getData);

			// Declare newData variable
			let newData;

			// Conditional mapping based on salesType
			if (viewValue === 0) {
				newData = result.data.map((category) => ({
					category: category.category,
					total: category.total,
					subRows: category.menuItemSoldTotalsModels?.map((item) => ({
						unitName: item.unitName,
						grouping1: item.grouping1,
						itemId: item.itemId,
						description: item.description,
						quant: item.quant,
						discPrice: item.discPrice,
						quantity_Avg: item.quantity_Avg,
						discPrice_Avg: item.discPrice_Avg,
						itemSoldPct: item.itemSoldPct,
					})),
				}));
			} else if (viewValue === 1) {
				newData = result.data.map((category) => ({
					category: category.category,
					total: category.total,
					subRows: category.menuItemSoldUnitSummaryModels.map((unit) => ({
						item: unit.item,
						subRows: unit.menuItemSoldTotalsModels.map((item) => ({
							unitName: item.unitName,
							grouping1: item.grouping1,
							itemId: item.itemId,
							description: item.description,
							quant: item.quant,
							discPrice: item.discPrice,
							quantity_Avg: item.quantity_Avg,
							discPrice_Avg: item.discPrice_Avg,
							itemSoldPct: item.itemSoldPct,
						})),
					})),
				}));
			} else if (viewValue === 2) {
				// Direct binding without additional mapping
				newData = result.data?.map((item) => ({
					unitName: item.unitName,
					total: parseFloat(result.data?.reduce((acc, curr) => acc + curr.discPrice, 0).toFixed(2)),
					category: item.grouping1,
					itemId: item.itemId,
					description: item.description,
					quant: item.quant,
					discPrice: item.discPrice,
					quantity_Avg: item.quantity_Avg,
					discPrice_Avg: item.discPrice_Avg,
					itemSoldPct: item.itemSoldPct,
				}));
			}

			setCurrentSalesType(salesType);
			setMenuItemSoldData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Menu Item Sold Report data: ', error);
		}
	};

	const handleSoldByEmpRun = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
			if (
				(itemValue === 0 && (!selectedMenu || selectedMenu <= 0)) ||
				(itemValue === 1 && (!selectedInventory || selectedInventory <= 0))
			) {
				setIsLoading(false);
				setIsError(true);
				setErrorMessage('Please select according to the Item Type you have chosen !');
				return false; // Prevent API call
			}
			// Define the URL mapping based on viewValue
			const getData = {
				url: 'MenuItemSoldEmployeeData',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
					menuItemIds: itemValue === 0 ? selectedMenu : 0,
					inventoryItemIds: itemValue === 1 ? selectedInventory : 0,
					itemType: itemValue,
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
				unitName: item.name,
				employeeId: item.employeeId,
				total: parseFloat(result.data?.reduce((acc, curr) => acc + curr.discPrice, 0).toFixed(2)),
				firstName: item.firstName,
				lastName: item.lastName,
				MenuItem: item.description,
				Sold: item.quant,
				discPrice: item?.discPrice,
				fullDescription: item.fullDescription,
				quant: item.quant,
				multiplier: item.multiplier,
				covers: item.covers,
				employeeCoversPercent: item.employeeCoversPercent,
				employeeCovers: item.employeeCovers,
				hour: item.hour,
			}));

			setMenuItemSoldData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Menu Item Sold Report data: ', error);
		}
	};

	const handleSoldByHour = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
			if (
				(itemValue === 0 && (!selectedMenu || selectedMenu <= 0)) ||
				(itemValue === 1 && (!selectedInventory || selectedInventory <= 0))
			) {
				setIsLoading(false);
				setIsError(true);
				setErrorMessage('Please select according to the Item Type you have chosen !');
				return false; // Prevent API call
			}
			// Define the URL mapping based on viewValue
			const getData = {
				url: 'MenuItemSoldHourData',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
					menuItemIds: itemValue === 0 ? selectedMenu : 0,
					inventoryItemIds: itemValue === 1 ? selectedInventory : 0,
					itemType: itemValue,
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
				unit: item.name,
				hour: item.hour,
				MenuItem: item.description,
				Sold: item.quant,
				discPrice: item?.discPrice,
			}));

			setMenuItemSoldData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Menu Item Sold Report data: ', error);
		}
	};

	const ItemsSoldWithModifiers = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);

			// Define the URL mapping based on viewValue
			const getData = {
				url: 'MenuItemSoldModifiersData',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
					options: viewValue === 0 ? 'GroupSummary' : viewValue === 1 ? 'GroupByUnit' : 'GroupByUnit',
					groupBy: viewValue === 0 ? 1 : viewValue === 1 ? 0 : 0,
				},
			};

			const result = await getCall(getData);

			let newData;

			// Conditional mapping based on salesType
			if (viewValue === 0) {
				newData = result.data.map((category) => ({
					category: category.itemFullDescription,
					//   total: category.total,
					subRows: category.menuItemSoldModifierModels?.map((item) => ({
						itemId: item.itemId,
						modItemID: item.modItemID === 0 ? item.itemId : item.modItemID,
						modifierDisplayName: item.modifierDisplayName,
						quant: item.modQuantity,
						modItemFrequency: item.modItemFrequency,
					})),
				}));
			} else if (viewValue === 1) {
				newData = result.data.map((category) => ({
					category: category.itemFullDescription,
					//   total: category.total,
					subRows: category.menuItemSoldModifierUnitReportModels.map((unit) => ({
						unitName: unit.unitName,
						subRows: unit.menuItemSoldModifierModels.map((item) => ({
							unitName: item.unitName,
							itemId: item.itemId,
							modItemID: item.modItemID === 0 ? item.itemId : item.modItemID,
							modifierDisplayName: item.modifierDisplayName,
							modQuantity: item.modQuantity,
							modItemFrequency: item.modItemFrequency,
						})),
					})),
				}));
			}

			setMenuItemSoldData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Menu Item Sold Report data: ', error);
		}
	};

	const handleUnitSelection = (unitName, unitID) => {
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	//Menu item
	const handleMenuSelection = (MenuID, menuName) => {
		setSelectedMenu(MenuID);
		setselectedMenuName(menuName);
		setShowMenuModal(false);
	};

	//Inventory item
	const handleInventorySelection = (itemID, Description) => {
		setSelectedInventory(itemID);
		setselectedInventoryName(Description);
		setShowInventoryModal(false);
	};

	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleTypeChange = (value) => {
		setActiveTab(value);
		setMenuItemSoldData([]);
		setViewValue(0);
		setSalesType('SalesNet');
		setViewWeekValue(0);
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!menuItemSoldData || menuItemSoldData.length === 0) {
			console.error('Voids report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Menu Items Sold',
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
		// Map through each row of menuItemSoldData
		const body = menuItemSoldData.map((row) => {
			return {
				type: 'table',
				title: row.unitName, // Set the department as the title
				widths: [
					'auto', // Unit name
					'auto', // Grouping (category)
					'auto', // Item ID
					'auto', // Item description
					'auto', // Quantity sold
					'auto', // Discounted price
					'auto', // Average quantity sold
					'auto', // Average discounted price
					'auto', // Percentage of items sold
				],
				dataTypes: [
					'string', // Unit name
					'string', // Grouping (category)
					'string', // Item ID
					'string', // Item description
					'number', // Quantity sold
					'number', // Discounted price
					'number', // Average quantity sold
					'number', // Average discounted price
					'number', // Percentage of items sold
				],
				data: formatPDFData(row.subRows), // Use a formatter for the subRows data
			};
		});

		return body; // Return the constructed body for PDF
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: [
				'Unit Name',
				'Grouping',
				'Item ID',
				'Description',
				'Quantity Sold',
				'Discounted Price',
				'Average Quantity Sold',
				'Average Discounted Price',
				'Percentage of Items Sold',
			],
			rows: data.flatMap((row) =>
				row.menuItemSoldTotalsModels.map((item) => [
					{
						value: item.unitName || 'N/A', // Use "N/A" if unitName is null
						cellType: 'string',
						columnName: 'Unit Name',
					},
					{
						value: item.grouping1,
						cellType: 'string',
						columnName: 'Grouping',
					},
					{
						value: item.itemId,
						cellType: 'string',
						columnName: 'Item ID',
					},
					{
						value: item.description,
						cellType: 'string',
						columnName: 'Description',
					},
					{
						value: item.quant,
						cellType: 'number',
						columnName: 'Quantity Sold',
					},
					{
						value: item.discPrice,
						cellType: 'number',
						columnName: 'Discounted Price',
					},
					{
						value: item.quantity_Avg,
						cellType: 'number',
						columnName: 'Average Quantity Sold',
					},
					{
						value: item.discPrice_Avg,
						cellType: 'number',
						columnName: 'Average Discounted Price',
					},
					{
						value: Number(item.itemSoldPct).toFixed(2),
						cellType: 'number',
						columnName: 'Percentage of Items Sold',
					},
				])
			),
		};
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		// Define the data structure for the Excel export

		const data = (() => {
			switch (activeTab) {
				case 'ItemsSoldTotals':
					return [
						{
							name:
								viewValue === 0
									? 'Item Sold Totals | Summary'
									: viewValue === 1
									? 'Item Sold Totals | By Unit'
									: 'Item Sold Totals | Top Sellers',
							columns: [
								{ name: 'Category', filter: 'text' },
								{ name: 'Item', filter: 'text' },
								{ name: 'Description', filter: 'text' },
								{ name: 'Quantity', filter: 'text' },
								{ name: 'Amount', filter: 'text' },
								{ name: 'Item Sold %', filter: 'text' },
								{ name: 'Average Item Quantity', filter: 'text' },
								{ name: 'Average Item Amount', filter: 'text' },
							],
							data:
								viewValue === 0
									? menuItemSoldData.flatMap((category) =>
											category.subRows.map((item) => ({
												Category: category.category,
												Item: item.itemId,
												Description: item.description,
												Quantity: item.quant,
												Amount: item.discPrice,
												'Average Item Quantity': item.quantity_Avg,
												'Average Item Amount': item.discPrice_Avg,
												'Item Sold %': Number(item.itemSoldPct).toFixed(2),
											}))
									  )
									: viewValue === 1
									? menuItemSoldData.flatMap((category) =>
											category.subRows.flatMap((unit) =>
												unit.subRows.map((item) => ({
													Category: category.category,
													Item: item.itemId,
													Description: item.description,
													Quantity: item.quant,
													Amount: item.discPrice,
													'Average Item Quantity': item.quantity_Avg,
													'Average Item Amount': item.discPrice_Avg,
													'Item Sold %': Number(item.itemSoldPct).toFixed(2),
												}))
											)
									  )
									: menuItemSoldData.map((item) => ({
											Category: item.category,
											Item: item.itemId,
											Description: item.description,
											Quantity: item.quant,
											Amount: item.discPrice,
											'Average Item Quantity': item.quantity_Avg,
											'Average Item Amount': item.discPrice_Avg,
											'Item Sold %': Number(item.itemSoldPct).toFixed(2),
									  })),
						},
					];
				case 'ItemsSoldByEmployee':
					return [
						{
							name:
								itemValue === 0
									? `Items Sold By Employee | Menu Item: ${selectedMenuName}`
									: `Items Sold By Employee | Inventory Item: ${selectedInventoryName}`,
							columns: [
								{ name: 'Unit Name', filter: 'text' },
								{ name: 'Employee ID', filter: 'text' },
								{ name: 'First Name', filter: 'text' },
								{ name: 'Last Name', filter: 'text' },
								{ name: 'Menu Item', filter: 'text' },
								{ name: '# Sold', filter: 'text' },
								{ name: 'Item Sales', filter: 'text' },
								{ name: 'Total Guests', filter: 'text' },
								{ name: '% of Guests', filter: 'text' },
							],
							data: menuItemSoldData.flatMap((item) => ({
								'Unit Name': item.unitName,
								'Employee ID': item.employeeId,
								'First Name': item.firstName,
								'Last Name': item.lastName,
								'Menu Item': item.MenuItem,
								'# Sold': item.Sold,
								'Item Sales': item.discPrice,
								'Total Guests': item.employeeCovers,
								'% of Guests': parseFloat(item.employeeCoversPercent).toFixed(2),
							})),
						},
					];
				case 'ItemsSoldByHour':
					return [
						{
							name:
								itemValue === 0
									? `Items Sold By Hour | Menu Item: ${selectedMenuName}`
									: `Items Sold By Hour | Inventory Item: ${selectedInventoryName}`,
							columns: [
								{ name: 'Unit', filter: 'text' },
								{ name: 'Hour', filter: 'text' },
								{ name: 'Menu Item', filter: 'text' },
								{ name: '# Sold', filter: 'text' },
								{ name: 'Item Sales', filter: 'text' },
							],
							data: menuItemSoldData.flatMap((item) => ({
								Unit: item.unit,
								Hour: item.hour,
								'Menu Item': item.MenuItem,
								'# Sold': item.Sold,
								'Item Sales': item.discPrice,
							})),
						},
					];
				case 'ItemsSoldWithModifiers':
					const modifierColumns = [
						{ name: 'Category', filter: 'text' },
						{ name: 'Modifier Item #', filter: 'text' },
						{ name: 'Modifier Item Name', filter: 'text' },
						{ name: 'Quantity', filter: 'text' },
						{ name: 'Modifier Usage Frequency', filter: 'text' },
					];
					return [
						{
							name:
								viewValue === 0
									? 'Item Sold With Modifiers | Summary'
									: 'Item Sold With Modifiers | By Unit',
							columns:
								viewValue === 0
									? modifierColumns
									: [...modifierColumns, { name: 'Unit Name', filter: 'text' }],
							data:
								viewValue === 0
									? menuItemSoldData.flatMap((category) =>
											category.subRows.map((item) => ({
												Category: category.category,
												'Modifier Item #': item.modItemID,
												'Modifier Item Name': item.modifierDisplayName,
												Quantity: item.quant,
												'Modifier Usage Frequency': item.modItemFrequency,
											}))
									  )
									: menuItemSoldData.flatMap((category) =>
											category.subRows.flatMap((unit) =>
												unit.subRows.map((item) => ({
													Category: category.category,
													UnitName: unit.unitName,
													'Modifier Item #': item.modItemID,
													'Modifier Item Name': item.modifierDisplayName,
													Quantity: item.modQuantity,
													'Modifier Usage Frequency': item.modItemFrequency,
												}))
											)
									  ),
						},
					];
				default:
					return [];
			}
		})();

		const filename = 'MenuItemSold';
		const spreadSheetTitle = 'Menu Item Sold Report';
		const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const columns = useMemo(() => getColumns(activeTab, viewValue, itemValue), [activeTab, viewValue, itemValue]);

	const Table = (
		<TableHOC
			columns={columns}
			data={menuItemSoldData}
			view={viewWeek}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			expandCollapseButtons={
				(activeTab === 'ItemsSoldTotals' && viewValue !== 2) || activeTab === 'ItemsSoldWithModifiers'
					? true
					: false
			}
			detailOnTop={`${currentSalesType === 'SalesNet' ? 'Net Sales:' : 'Gross Sales:'} $${
				menuItemSoldData[0]?.total?.toFixed(2) || 0
			}`}
		/>
	);

	const handleMenuClick = () => {
		setShowMenuModal(true);
	};

	const handleInventoryClick = () => {
		setShowInventoryModal(true);
	};

	const componentMap = {
		Menu: (
			<Menu
				companyId={companyId}
				menuName={selectedMenuName}
				setMenuName={setselectedMenuName}
				onClick={handleMenuClick}
			/>
		),
		Inventory: (
			<Inventory
				companyId={companyId}
				InventoryName={selectedInventoryName}
				setInventoryName={setselectedInventoryName}
				onClick={handleInventoryClick}
			/>
		),
	};

	const handleRunClick = () => {
		if (activeTab === 'ItemsSoldTotals') {
			handleRun();
		} else if (activeTab === 'ItemsSoldByEmployee') {
			handleSoldByEmpRun();
		} else if (activeTab === 'ItemsSoldByHour') {
			handleSoldByHour();
		} else {
			ItemsSoldWithModifiers();
		}
	};

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'> Menu Items Sold </h2>
			{/* Tabs Section */}
			<header className='space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
				<div className='flex items-center py-2 space-x-6'>
					<button
						className={`py-2 px-4 ${
							activeTab === 'ItemsSoldTotals'
								? 'border-l-4 border-r-4 border-t-4 border-primary text-primary'
								: 'border-b-4 border-gray-200'
						}`}
						onClick={() => handleTypeChange('ItemsSoldTotals')}
					>
						Items Sold Totals
					</button>
					<button
						className={`py-2 px-4 ${
							activeTab === 'ItemsSoldByEmployee'
								? 'border-l-4 border-r-4 border-t-4 border-primary text-primary'
								: 'border-b-4 border-gray-200'
						}`}
						onClick={() => handleTypeChange('ItemsSoldByEmployee')}
					>
						Items Sold By Employee
					</button>
					<button
						className={`py-2 px-4 ${
							activeTab === 'ItemsSoldByHour'
								? 'border-l-4 border-r-4 border-t-4 border-primary text-primary'
								: 'border-b-4 border-gray-200'
						}`}
						onClick={() => handleTypeChange('ItemsSoldByHour')}
					>
						Items Sold By Hour
					</button>
					<button
						className={`py-2 px-4 ${
							activeTab === 'ItemsSoldWithModifiers'
								? 'border-l-4 border-r-4 border-t-4 border-primary text-primary'
								: 'border-b-4 border-gray-200'
						}`}
						onClick={() => handleTypeChange('ItemsSoldWithModifiers')}
					>
						Items Sold With Modifiers
					</button>
				</div>

				<div className='flex items-center justify-between space-x-3'>
					<div className='flex items-center space-x-3'>
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
						{activeTab === 'ItemsSoldTotals' && (
							<div className='w-36'>
								<Dropdown
									title='Day of the week'
									options={dropdownOptions}
									selectedOption={viewWeek}
									onOptionChange={handleViewWeekChange}
								/>
							</div>
						)}

						{(activeTab === 'ItemsSoldByEmployee' || activeTab === 'ItemsSoldByHour') && (
							<div className='pl-2 mt-2'>
								<div className='p-3 checkbox-group hover:border-primary'>
									<div className='flex flex-row space-x-6'>
										<div className='flex items-center cursor-pointer'>
											<input
												type='checkbox'
												id='Net'
												name='byUnit'
												value='Net'
												checked={groupUnit === 'byUnit'}
												onChange={() => handleGroupByUnitChange('byUnit')}
												className='cursor-pointer checkbox-radio'
											/>
											<label htmlFor='byUnit' className='ml-2'>
												Group By Unit
											</label>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className='run-button' onClick={handleRunClick}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
								Run
							</div>
						</div>
					</div>

					<div>
						<ExportOptions
							includePDF={true}
							handlePDFClick={handlePDFClick}
							includeCSV={true}
							includeExcel={true}
							handleExcelClick={handleExcelClick}
							includeHelp={true}
							handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
						/>
					</div>
				</div>
				<div className='flex mt-2'>
					{(activeTab === 'ItemsSoldTotals' || activeTab === 'ItemsSoldWithModifiers') && (
						<>
							<div className='mt-2'>
								<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>View</label>
								<div className='p-3 border-2 border-gray-300 rounded-[1.5rem] checkbox-group hover:border-primary'>
									<div className='flex flex-row space-x-6'>
										<div className='flex items-center cursor-pointer'>
											<input
												type='radio'
												id='summary'
												name='reportType'
												value='summary'
												checked={view === 'summary'}
												onChange={() => handleViewChange('summary')}
												className='cursor-pointer checkbox-radio'
											/>
											<label htmlFor='summary' className='ml-2'>
												Summary
											</label>
										</div>
										<div className='flex items-center cursor-pointer'>
											<input
												type='radio'
												id='byUnit'
												name='reportType'
												value='byUnit'
												checked={view === 'byUnit'}
												onChange={() => handleViewChange('byUnit')}
												className='cursor-pointer checkbox-radio'
											/>
											<label htmlFor='byUnit' className='ml-2'>
												By Unit
											</label>
										</div>
										{activeTab !== 'ItemsSoldWithModifiers' && (
											<div className='flex items-center cursor-pointer'>
												<input
													type='radio'
													id='topSellers'
													name='reportType'
													value='topSellers'
													checked={view === 'topSellers'}
													onChange={() => handleViewChange('topSellers')}
													className='checkbox-radio'
												/>
												<label htmlFor='topSellers' className='ml-2'>
													Top Sellers
												</label>
											</div>
										)}
									</div>
								</div>
							</div>
						</>
					)}
					{(activeTab === 'ItemsSoldByEmployee' || activeTab === 'ItemsSoldByHour') && (
						<>
							<div className='mt-2'>
								<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>
									Select Item Type
								</label>
								<div className='p-3 border-2 border-gray-300 rounded-[1.5rem] checkbox-group hover:border-primary'>
									<div className='flex flex-row space-x-6'>
										<div className='flex items-center cursor-pointer'>
											<input
												type='radio'
												id='Menu'
												name='itemType'
												value='Menu'
												checked={item === 'Menu'}
												onChange={() => handleItemChange('Menu')}
												className='cursor-pointer checkbox-radio'
											/>
											<label htmlFor='Menu' className='ml-2'>
												Menu
											</label>
										</div>
										<div className='flex items-center cursor-pointer'>
											<input
												type='radio'
												id='Inventory'
												name='ItemType'
												value='Inventory'
												checked={item === 'Inventory'}
												onChange={() => handleItemChange('Inventory')}
												className='cursor-pointer checkbox-radio'
											/>
											<label htmlFor='Inventory' className='ml-2'>
												Inventory
											</label>
										</div>
									</div>
								</div>
							</div>
							<div className='mt-2 ml-2'>
								<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>
									{item === 'Menu' ? 'Menu Items' : 'Inventory Items'}
								</label>
								<div className='flex flex-row space-x-6'>
									<div className='flex items-center cursor-pointer'>
										{componentMap[item === 'Menu' ? 'Menu' : 'Inventory']}
									</div>
								</div>
							</div>
						</>
					)}

					{activeTab !== 'ItemsSoldWithModifiers' && (
						<div className='pl-2 mt-2'>
							<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>Sales</label>
							<div className='p-3 border-2 border-gray-300 rounded-[1.5rem] checkbox-group hover:border-primary'>
								<div className='flex flex-row space-x-6'>
									<div className='flex items-center cursor-pointer'>
										<input
											type='radio'
											id='Net'
											name='salesType'
											value='Net'
											checked={salesType === 'SalesNet'}
											onChange={() => handleSalesChange('SalesNet')}
											className='cursor-pointer checkbox-radio'
										/>
										<label htmlFor='Net' className='ml-2'>
											Net
										</label>
									</div>
									<div className='flex items-center cursor-pointer'>
										<input
											type='radio'
											id='Gross'
											name='salesType'
											value='Gross'
											checked={salesType === 'SalesGross'}
											onChange={() => handleSalesChange('SalesGross')}
											className='cursor-pointer checkbox-radio'
										/>
										<label htmlFor='Gross' className='ml-2'>
											Gross
										</label>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</header>
			{isLoading ? (
				<div>Loading...</div>
			) : isError ? (
				<div>{errorMessage}</div>
			) : (
				<>{menuItemSoldData.length > 0 && <div className='paged-table'>{Table}</div>}</>
			)}{' '}
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

				<MenuModal
					menuData={menuItemList}
					show={showMenuModal}
					handleClose={() => {
						setShowMenuModal(false);
					}}
					handleMenuSelection={handleMenuSelection}
				/>

				<InventoryModal
					InventoryData={inventoryItemList}
					show={showInventoryModal}
					handleClose={() => {
						setShowInventoryModal(false);
					}}
					handleInventorySelection={handleInventorySelection}
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

export default MenuItemsSold;
