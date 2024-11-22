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
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	const [salesType, setSalesType] = useState('SalesNet');
	const [item, setItem] = useState('Menu');
	const [itemValue, setItemValue] = useState(0);
	const [isItemsLoading, setIsItemsLoading] = useState(false);

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

	const handleItemChange = (option) => {
		setItem(option);
		setMenuItemSoldData([]);
		const value = viewValueMap[option.toLowerCase()] || 0;
		setItemValue(value);
	};

	const handleSalesChange = (option) => {
		setSalesType(option);
		setMenuItemSoldData([]);
	};

	const [columns, setColumns] = useState([]);

	const generatedColumns = [
		columnHelper.accessor('unitName', {
			id: 'unitName',
			header: 'Unit',
			dataType: 'number',
			cell: ({ getValue, row }) =>
				itemValue === 0 ? (
					getValue()
				) : row.getCanExpand() ? (
					<div className={`flex items-center gap-2 font-bold absolute inset-0 w-96] `}>
						{row.getIsExpanded() ? <CiSquareMinus /> : <CiSquarePlus />}
						{`Employee ID: ${row.original.employeeId} (Count ${row.subRows.length}, Total Quantity
						 ${row.subRows.reduce((acc, curr) => acc + curr.original.quant, 0)}, Total Amount ${row.subRows
							.reduce((acc, curr) => acc + curr.original.discPrice, 0)
							.toFixed(2)})`}
					</div>
				) : getValue() ? (
					getValue() || ''
				) : (
					''
				),
		}),
		...(itemValue === 0
			? [
					columnHelper.accessor('employeeId', {
						id: 'employeeId',
						header: 'Employee ID',
						dataType: 'string',
						cell: (info) => info.getValue() || '',
					}),
			  ]
			: []),
		columnHelper.accessor('firstName', {
			id: 'firstName',
			header: 'First Name',
			dataType: 'string',
			cell: (info) => info.getValue() || '',
		}),
		columnHelper.accessor('lastName', {
			id: 'lastName',
			header: 'Last Name',
			dataType: 'string',
			cell: (info) => info.getValue() || '',
		}),
		columnHelper.accessor('description', {
			id: 'description',
			header: 'Menu Item',
			dataType: 'string',
			cell: (info) => info.getValue() || '',
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
				setErrorMessage('Please select according to the Item Type you have chosen !');
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

			const newData =
				itemValue === 0
					? result.data.menuItemSoldEmployeeModels.map((item) => ({
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
					  }))
					: result.data.menuItemSoldEmployeeModels.reduce((acc, item) => {
							const existingEmployee = acc.find((emp) => emp.employeeId === item.employeeId);
							const newItem = {
								unitId: item.unitId,
								unitName: item.name,
								employeeId: item.employeeId,
								firstName: item.firstName,
								lastName: item.lastName,
								grouping1: item.grouping1,
								itemId: item.itemId,
								description: item.description,
								fullDescription: item.fullDescription,
								quant: item.quant,
								discPrice: item.discPrice,
								multiplier: item.multiplier,
								covers: item.covers,
								employeeCoversPercent: (item.employeeCoversPercent * 100).toFixed(2),
								employeeCovers: item.employeeCovers,
								hour: item.hour,
								caseUnitName: item.caseUnitName,
								usageCases: item.usageCases,
								countDisplayUnitName: item.countDisplayUnitName,
								usageCountDisplayUnits: item.usageCountDisplayUnits,
							};

							if (existingEmployee) {
								existingEmployee.subRows.push(newItem);
							} else {
								acc.push({
									employeeId: item.employeeId,
									total: salesType === 'SalesNet' ? result.data.salesTotal : result.data.grossTotal,
									subRows: [newItem],
								});
							}

							return acc;
					  }, []);

			setColumns(generatedColumns);
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
		const body =
			itemValue === 0
				? [
						{
							type: 'table',
							title: `Items Sold By Employee | ${item}`,
							widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
							dataTypes: [
								'string',
								'string',
								'string',
								'string',
								'string',
								'number',
								'number',
								'number',
								'number',
							],
							data: {
								columnHeaders: columns.map((column) => column.header),
								rows: menuItemSoldData.map((row) =>
									columns.map((column) => ({
										value: row[column.id],
										cellType: column.dataType,
										columnName: column.header,
									}))
								),
							},
						},
				  ]
				: menuItemSoldData.flatMap((row) => ({
						type: 'table',
						title: `Employee ID: ${row.employeeId}`,
						widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
						dataTypes: [
							'string',
							'string',
							'string',
							'string',
							'number',
							'number',
							'string',
							'number',
							'number',
						],
						data: {
							columnHeaders: columns.map((column) => column.header),
							rows: row.subRows.map((subRow) =>
								columns.map((column) => ({
									value: subRow[column.id],
									cellType: column.dataType,
									columnName: column.header,
								}))
							),
						},
				  }));

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
			'Total Guests',
			'% of Guests',
		];
		const csvData =
			itemValue === 0
				? menuItemSoldData.flatMap((item) =>
						[
							item.unitName,
							item.employeeId,
							item.firstName,
							item.lastName,
							item.description,
							item.quant,
							item.discPrice,
							item.employeeCovers,
							item.employeeCoversPercent,
						].join(',')
				  )
				: menuItemSoldData.flatMap((item) =>
						item.subRows.map((subRow) =>
							[
								subRow.unitName,
								subRow.employeeId,
								subRow.firstName,
								subRow.lastName,
								subRow.description,
								subRow.quant,
								subRow.discPrice,
								subRow.covers,
								subRow.employeeCoversPercent,
							].join(',')
						)
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
				data:
					itemValue === 0
						? menuItemSoldData.flatMap((item) => ({
								'Unit Name': item.unitName,
								'Employee ID': item.employeeId,
								'First Name': item.firstName,
								'Last Name': item.lastName,
								'Menu Item': item.description,
								'# Sold': item.quant,
								'Item Sales': item.discPrice,
								'Total Guests': item.employeeCovers,
								'% of Guests': parseFloat(item.employeeCoversPercent).toFixed(2),
						  }))
						: menuItemSoldData.flatMap((item) =>
								item.subRows.flatMap((subRow) => ({
									'Unit Name': subRow.unitName,
									'Employee ID': subRow.employeeId,
									'First Name': subRow.firstName,
									'Last Name': subRow.lastName,
									'Menu Item': subRow.description,
									'# Sold': subRow.quant,
									'Item Sales': subRow.discPrice,
									'Total Guests': subRow.employeeCovers,
									'% of Guests': parseFloat(subRow.employeeCoversPercent).toFixed(2),
								}))
						  ),
			},
		];

		const filename = 'MenuItemSold';
		const spreadSheetTitle = 'Menu Item Sold';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={menuItemSoldData}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			detailOnTop={`${salesType === 'SalesNet' ? 'Net Sales:' : 'Gross Sales:'} $${
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
						/>

						<div className='run-button' onClick={fetchSoldByEmpData}>
							<div className='py-3 ml-2 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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
