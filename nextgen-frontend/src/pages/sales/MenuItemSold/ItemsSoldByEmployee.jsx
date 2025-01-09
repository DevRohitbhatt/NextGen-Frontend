import { useEffect, useState } from 'react';
import { getCall } from '../../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
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
	Menu,
	Inventory,
	Loader,
	SelectionModal,
} from '../../../components';
import dateFormat from 'dateformat';
import { createColumnHelper } from '@tanstack/react-table';
import itemSoldByEmployee from '../../../assets/introJSSteps/menuItemSold/itemSoldByEmployee';

const columnHelper = createColumnHelper();

const ItemsSoldByEmployee = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [menuItemSoldData, setMenuItemSoldData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);

	//Menu Items
	const [menuItemList, setMenuItemList] = useState([]);

	//Inventory Items
	const [inventoryItemList, setInventoryItemList] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Error loading data, please try again later.');

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false);

	//selected menu items
	const [selectedMenu, setSelectedMenu] = useState(0);
	const [selectedMenuName, setselectedMenuName] = useState('No Menu Selected');
	const [showMenuModal, setShowMenuModal] = useState(false);

	//selected Inventory items
	const [selectedInventory, setSelectedInventory] = useState(0);
	const [selectedInventoryName, setselectedInventoryName] = useState('No Inventory Selected');
	const [showInventoryModal, setShowInventoryModal] = useState(false);

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [selectedToDate, setSelectedToDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	const [salesType, setSalesType] = useState('SalesNet');
	const [item, setItem] = useState('Menu');
	const [itemValue, setItemValue] = useState(0);
	const [isItemsLoading, setIsItemsLoading] = useState(false);
	const [isGroupByUnitChecked, setIsGroupByUnitChecked] = useState(false);
	const [inventoryFirstRender, setInventoryFirstRender] = useState(false);

	const tooltips = {
		item: "Menu Item ID",
		description:"Menu Item Name",
		quantity:"Number of menu items sold during the selected date range.",
		amount:"$ Amount Sold",
		itemSoldPercent: "The item’s percentage of total sales.",
		avgItemQuantity: "The average quantity sold per day during the selected date range.",	
		avgItemAmount: "The average price of the item.",	
    };
	
	const inventoryHeaders = [
		{ label: 'Qsr Inventory Item ID', key: 'inventoryItemID' },
		{ label: 'Description', key: 'description' },
	];

	const menuHeaders = [
		{ label: 'Item ID', key: 'itemID' },
		{ label: 'Description', key: 'description' },
		{ label: 'Full Description', key: 'fullDescription' },
		{ label: 'Price', key: 'price' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: itemSoldByEmployee(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const viewValueMap = {
		menu: 0,
		inventory: 1,
	};

	//Default date get
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

	const handleItemChange = (option) => {
		setItem(option);
		setMenuItemSoldData([]);
		setIsGroupByUnitChecked(false);
		if (option === 'Inventory') {
			setInventoryFirstRender(false);
		}
		const value = viewValueMap[option.toLowerCase()] || 0;
		setItemValue(value);
	};

	const handleSalesChange = (option) => {
		setSalesType(option);
		setMenuItemSoldData([]);
	};

	const generatedColumns = [
		columnHelper.accessor('unitName', {
			id: 'unitName',
			header: 'Unit',
			dataType: 'number',
			cell: (info) => info.getValue() || '',
		}),

		columnHelper.accessor('employeeId', {
			id: 'employeeId',
			header: 'Employee ID',
			dataType: 'string',
			cell: (info) => info.getValue() || '',
		}),
		columnHelper.accessor('firstName', {
			id: 'firstName',
			header: <div className='w-full text-left'>First Name</div>,
			dataType: 'string',
			cell: (info) => <div className='text-left'>{info.getValue()}</div> || '',
		}),
		columnHelper.accessor('lastName', {
			id: 'lastName',
			header: <div className='w-full text-left'>Last Name</div>,
			dataType: 'string',
			cell: (info) => <div className='text-left'>{info.getValue()}</div> || '',
		}),
		columnHelper.accessor('description', {
			id: 'description',
			header: <div className='w-full text-left'>Menu Item</div>,
			dataType: 'string',
			cell: (info) => <div className='text-left'>{info.getValue()}</div> || '',
		}),
		columnHelper.accessor('quant', {
			id: 'quant',
			header: '#Sold',
			dataType: 'number',
			cell: (info) => info.getValue() || '',
		}),
		columnHelper.accessor('discPrice', {
			id: 'discPrice',
			header: 'Item Sales',
			dataType: 'string',
			cell: ({ row, getValue }) =>
				row.getCanExpand()
					? ''
					: `$${getValue() !== null && getValue() !== undefined ? getValue().toFixed(2) : '0.00'}`,
		}),
		...(itemValue === 1
			? [
					columnHelper.accessor('caseUnitName', {
						id: 'caseUnitName',
						header: 'Case Unit',
						dataType: 'string',
						cell: (info) => info.getValue() || '',
					}),
			  ]
			: []),
		columnHelper.accessor('employeeCovers', {
			id: 'employeeCovers',
			header: 'Total Guests',
			dataType: 'string',
			cell: (info) => info.getValue() || '',
		}),
		columnHelper.accessor('employeeCoversPercent', {
			id: 'employeeCoversPercent',
			header: '% of Guests',
			dataType: 'number',
			cell: (info) => {
				const value = info.getValue();
				return value != null ? `${parseFloat(value).toFixed(2)}%` : '';
			},
		}),
	];

	const [columns, setColumns] = useState(generatedColumns);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	useEffect(() => {
		if (companyID && alignmentID && (groupOrUnitAccess || selectedUnit)) {
			fetchData(companyID);
		} else {
			setErrorMessage('An issue occurred while loading the Menu List or Inventory List. Please try again later.');
		}
	}, [companyID, alignmentID, groupOrUnitAccess, selectedUnit]);

	const fetchData = async (companyId) => {
		setIsItemsLoading(true);
		await Promise.all([fetchMenu(companyId), fetchInventory(companyId)]);
		setIsItemsLoading(false);
	};

	const fetchMenu = async (companyId) => {
		try {
			setIsError(false);
			const getData = {
				url: 'MenuItemsByCompanyID',
				urlParams: {
					companyId: companyId,
				},
			};

			const result = await getCall(getData);

			setMenuItemList(result.data);
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your menu, please try again later.');
			console.error('Error getting menus: ', error);
		}
	};

	const fetchInventory = async (companyId) => {
		try {
			setIsError(false);
			const getData = {
				url: 'InventoryByCompanyID',
				urlParams: {
					companyId: companyId,
				},
			};

			const result = await getCall(getData);

			setInventoryItemList(result.data);
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your inventory, please try again later.');
			console.error('Error getting inventory: ', error);
		}
	};

	const fetchSoldByEmpData = async () => {
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
				itemValue === 0
					? setErrorMessage('Please select a Menu Item!')
					: setErrorMessage('Please select an Inventory Item!');
				return false; // Prevent API call
			}

			const getData = {
				url: 'MenuItemSoldEmployeeData',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					menuItemIds: itemValue === 0 ? selectedMenu : 0,
					inventoryItemIds: itemValue === 1 ? selectedInventory : 0,
					itemType: itemValue,
				},
			};

			const result = await getCall(getData);

			const newData = result.data.menuItemSoldEmployeeModels.map((item) => ({
				employeeId: item.employeeId,
				unitName: item.name,
				total: salesType === 'SalesNet' ? result.data.salesTotal : result.data.grossTotal,
				firstName: item.firstName,
				lastName: item.lastName,
				description: item.description,
				discPrice: item?.discPrice,
				fullDescription: item.fullDescription,
				quant: item.quant,
				multiplier: item.multiplier,
				covers: item.covers,
				employeeCoversPercent: (item.employeeCoversPercent * 100).toFixed(2),
				employeeCovers: item.employeeCovers,
				hour: item.hour,
				caseUnitName: item.caseUnitName,
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

	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	//Menu item
	const handleMenuSelection = (MenuID, item) => {
		setSelectedMenu(MenuID);
		setselectedMenuName(item.description);
		setShowMenuModal(false);
	};

	//Inventory item
	const handleInventorySelection = (itemID, item) => {
		setSelectedInventory(itemID);
		setselectedInventoryName(item.description);
		setShowInventoryModal(false);
	};

	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	useEffect(() => {
		if (itemValue == 1) {
			handleGroupChange('Employee');
			setInventoryFirstRender(true);
		} else {
			setColumns(generatedColumns);
			setInventoryFirstRender(true);
		}
	}, [itemValue]);

	const handleGroupChange = (option) => {
		if (option.target) {
			const isChecked = option.target.checked;
			setIsGroupByUnitChecked(isChecked);
			if (itemValue === 1) {
				option = isChecked ? 'UnitAndEmployee' : 'Employee';
			} else {
				option = isChecked ? 'Unit' : 'None';
			}
		}
		const groupByColumns = {
			None: [],
			Employee: ['employeeId'],
			Unit: ['unitName'],
			UnitAndEmployee: ['unitName', 'employeeId'],
		};

		const selectedGroupByColumns = groupByColumns[option] || [];

		const newColumns = generatedColumns.map((column) =>
			selectedGroupByColumns.includes(column.id) ? { ...column, groupBy: true, show: false } : column
		);

		const calculateTotalCost = (rows, item) =>
			rows.reduce((acc, subRow) => acc + parseFloat(subRow.original[item] || 0), 0);

		const calculateNestedTotalCost = (rows, item) =>
			rows.reduce((acc, subRow) => acc + calculateTotalCost(subRow.subRows, item), 0);

		if (option !== 'None') {
			newColumns.unshift(
				columnHelper.display({
					id: 'actions',
					cell: ({ row }) => {
						if (!row.getCanExpand()) return null;

						const label =
							row.depth < selectedGroupByColumns.length
								? `${columns.find((col) => col.id === selectedGroupByColumns[row.depth])?.header}: ${
										row.original[selectedGroupByColumns[row.depth]]
								  } (Count: ${
										selectedGroupByColumns.length === 1
											? row.subRows.length
											: row.depth === 0
											? row.subRows.reduce((acc, subRow) => acc + subRow.subRows.length, 0)
											: row.subRows.length
								  } Total Quantity: ${
										selectedGroupByColumns.length === 1
											? calculateTotalCost(row.subRows, 'quant')
											: row.depth === 0
											? calculateNestedTotalCost(row.subRows, 'quant')
											: calculateTotalCost(row.subRows, 'quant')
								  } Total Amount: $${
										selectedGroupByColumns.length === 1
											? Number(
													calculateTotalCost(row.subRows, 'discPrice').toFixed(2)
											  ).toLocaleString('en-US')
											: row.depth === 0
											? Number(
													calculateNestedTotalCost(row.subRows, 'discPrice').toFixed(2)
											  ).toLocaleString('en-US')
											: Number(
													calculateTotalCost(row.subRows, 'discPrice').toFixed(2)
											  ).toLocaleString('en-US')
								  }) `
								: '';

						return (
							<div
								{...{
									style: {
										cursor: 'pointer',
										paddingLeft: `${row.depth * 2}rem`,
										width: '100%',
									},
									className: 'flex items-center gap-2 font-bold absolute bg-white inset-0 capitalize',
								}}
							>
								{row.getIsExpanded() ? (
									<CiSquareMinus className='text-[20px]' />
								) : (
									<CiSquarePlus className='text-[20px]' />
								)}
								{label}
							</div>
						);
					},
					size: 20,
				})
			);
			setColumns((prev) => [...newColumns]);
		} else {
			setColumns(generatedColumns);
		}

		if (isTableRendered && inventoryFirstRender) {
			fetchSoldByEmpData();
		}
	};

	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!menuItemSoldData || menuItemSoldData.length === 0) {
			console.error('Menu Items Sold report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Menu Items Sold',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName} | ${item} Items: ${selectedMenuName} | ${
					salesType === 'SalesNet' ? 'Net Sales:' : 'Gross Sales:'
				} $${menuItemSoldData[0]?.total?.toFixed(2)}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = [
			{
				type: 'table',
				title: `Items Sold By Employee | ${item}`,
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
					...(itemValue === 1 ? ['auto'] : []),
				],
				dataTypes: ['string', 'string', 'string', 'string', 'string', 'number', 'number', 'number', 'number'],
				data:
					itemValue === 0 && !isGroupByUnitChecked
						? {
								columnHeaders: columns.map((column) => column.header),
								rows: menuItemSoldData.map((row) =>
									columns.map((column) => ({
										value: row[column.id] || '0 ',
										cellType: column.dataType,
										columnName: column.header,
									}))
								),
						  }
						: {
								columnHeaders: columns.slice(1).map((column) => column.header),
								rows: menuItemSoldData.map((row) =>
									columns.slice(1).map((column) => ({
										value: row[column.id] || '0 ',
										cellType: column.dataType,
										columnName: column.header,
									}))
								),
						  },
			},
		];

		return body;
	};

	const handleCSVClick = () => {
		const csvHeaders = [
			'Unit Name',
			'Employee ID',
			'First Name',
			'Last Name',
			'Menu Item',
			'# Sold',
			'Item Sales',
			...(itemValue === 1 ? ['Case Unit'] : []),
			'Total Guests',
			'% of Guests',
		];
		const csvData = menuItemSoldData.flatMap((item) =>
			[
				item.unitName,
				item.employeeId,
				item.firstName,
				item.lastName,
				item.description,
				item.quant,
				item.discPrice,
				...(itemValue === 1 ? [item.caseUnitName] : []),
				item.employeeCovers,
				item.employeeCoversPercent,
			].join(',')
		);

		if (csvHeaders.length > 0 && csvData.length > 0) {
			const csvString = [csvHeaders.join(','), ...csvData].join('\n');
			const blob = new Blob([csvString], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const tempLink = document.createElement('a');
			tempLink.href = url;
			tempLink.setAttribute('download', 'menuItemSold.csv');
			tempLink.click();
		} else {
			console.error('No data available for CSV export');
		}
	};

	const handleExcelClick = () => {
		const data = [
			{
				name: '',
				columns: [
					{ name: 'Unit Name' },
					{ name: 'Employee ID' },
					{ name: 'First Name' },
					{ name: 'Last Name' },
					{ name: 'Menu Item' },
					{ name: '# Sold' },
					{ name: 'Item Sales' },
					...(itemValue === 1 ? [{ name: 'Case Unit' }] : []),
					{ name: 'Total Guests' },
					{ name: '% of Guests' },
				],
				data: menuItemSoldData.flatMap((item) => ({
					'Unit Name': item.unitName,
					'Employee ID': item.employeeId,
					'First Name': item.firstName,
					'Last Name': item.lastName,
					'Menu Item': item.description,
					'# Sold': item.quant,
					'Item Sales': item.discPrice,
					...(itemValue === 1 ? { 'Case Unit': item.caseUnitName } : {}),
					'Total Guests': item.employeeCovers,
					'% of Guests': parseFloat(item.employeeCoversPercent).toFixed(2),
				})),
			},
		];

		const filename = `MenuItemSold_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = `Menu Item Sold | Items Sold By Employee`;
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={menuItemSoldData}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			largeHeader= {true}
			detailOnTop={`${salesType === 'SalesNet' ? 'Net Sales:' : 'Gross Sales:'} $${
				Number(menuItemSoldData[0]?.total?.toFixed(2)).toLocaleString('en-US') || 0
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
				companyId={companyID}
				menuName={isItemsLoading ? 'Loading...' : selectedMenuName}
				setMenuName={setselectedMenuName}
				onClick={handleMenuClick}
			/>
		),
		Inventory: (
			<Inventory
				companyId={companyID}
				InventoryName={isItemsLoading ? 'Loading...' : selectedInventoryName}
				setInventoryName={setselectedInventoryName}
				onClick={handleInventoryClick}
			/>
		),
	};

	return (
		<>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>

			<header className='optionsBar mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center justify-between space-x-3'>
					<div className='flex items-center space-x-1'>
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

						<div className='pl-1 mt-6'>
							<input
								onChange={handleGroupChange}
								checked={isGroupByUnitChecked}
								className='mr-1 accent-[var(--tw-primary)]'
								type='checkbox'
							/>
							Group By Unit
						</div>
						<div className='run-button' onClick={fetchSoldByEmpData}>
							<div className='py-2 ml-1 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7 text-[14px]'>
								Run
							</div>
						</div>
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
				</div>
				<div className='flex mt-2 '>
					<div className='mt-2 itemType-selector'>
						<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>Select Item Type</label>
						<div className='p-3 border-2 border-solid rounded-[1.5rem] checkbox-group hover:border-primary'>
							<div className='flex flex-row space-x-6'>
								<div className='flex items-center cursor-pointer'>
									<input
										type='radio'
										id='Menu'
										name='itemType'
										value='Menu'
										checked={item === 'Menu'}
										onChange={() => handleItemChange('Menu')}
										className='cursor-pointer accent-[var(--tw-primary)]'
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
										className='cursor-pointer accent-[var(--tw-primary)]'
									/>
									<label htmlFor='Inventory' className='ml-2'>
										Inventory
									</label>
								</div>
							</div>
						</div>
					</div>
					<div className='mt-2 ml-2 item-selector'>
						<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>
							{item === 'Menu' ? 'Menu Items' : 'Inventory Items'}
						</label>
						<div className='w-56 cursor-pointer'>
							{componentMap[item === 'Menu' ? 'Menu' : 'Inventory']}
						</div>
					</div>
					<div className='pl-2 mt-2 sale-selector'>
						<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>Sales</label>
						<div className='p-3 border-2 border-solid rounded-[1.5rem] checkbox-group hover:border-primary'>
							<div className='flex flex-row space-x-6'>
								<div className='flex items-center cursor-pointer'>
									<input
										type='radio'
										id='Net'
										name='salesType'
										value='Net'
										checked={salesType === 'SalesNet'}
										onChange={() => handleSalesChange('SalesNet')}
										className='cursor-pointer accent-[var(--tw-primary)]'
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
										className='cursor-pointer accent-[var(--tw-primary)]'
									/>
									<label htmlFor='Gross' className='ml-2'>
										Gross
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Display the table if there is no error and the data is not loading */}
			{isError ? (
				<div>{errorMessage}</div>
			) : (
				<div className='relative w-full min-h-56'>
					<Loader loading={isLoading} />
					{!isLoading &&
						(menuItemSoldData.length > 0 ? (
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

				<SelectionModal
					title='Select a Menu Item'
					data={menuItemList}
					show={showMenuModal}
					headers={menuHeaders}
					handleClose={() => {
						setShowMenuModal(false);
					}}
					handleSelection={handleMenuSelection}
					selectedItemKey='itemID'
				/>

				<SelectionModal
					title='Select an Inventory Item'
					data={inventoryItemList}
					show={showInventoryModal}
					headers={inventoryHeaders}
					handleClose={() => {
						setShowInventoryModal(false);
					}}
					handleSelection={handleInventorySelection}
					selectedItemKey='inventoryItemID'
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
		</>
	);
};

export default ItemsSoldByEmployee;
