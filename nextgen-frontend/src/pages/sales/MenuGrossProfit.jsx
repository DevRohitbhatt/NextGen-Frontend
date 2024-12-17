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
	Modal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import menuGrossProfit from '../../assets/introJSSteps/menuGrossProfit';

const columnHelper = createColumnHelper();

const MenuGrossProfit = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [menuGrossProfitData, setMenuGrossProfitData] = useState([]);
	const [recipeInfoData, setRecipeInfoData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isRecipeInfoLoading, setIsRecipeInfoLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Menu Gross Profit Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [selectedToDate, setSelectedToDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	const Categories = ['Beverage', 'Food', 'Non Revenue', 'Wings'];
	const [selectedCategories, setSelectedCategories] = useState(Categories);
	const [isGroupByCategory, setIsGroupByCategory] = useState(true);
	const [showItemsWithSales, setShowItemsWithSales] = useState(false);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

	const [showItemsWithNoRecipeCost, setShowItemsWithNoRecipeCost] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState();
	const [recipeInforModalOpen, setRecipeInforModalOpen] = useState(false);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: menuGrossProfit(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const createColumns = (columnHelper) => [
		columnHelper.accessor('category', {
			id: 'category',
			header: 'Category',
			dataType: 'string',
			size: 100,
		}),
		columnHelper.accessor('itemID', {
			id: 'itemID',
			header: 'Item ID',
			dataType: 'string',
			footer: ({ table }) => {
				return (
					<div className='h-10'>
						<div
							style={{ cursor: 'pointer', width: '100%' }}
							className='absolute inset-0 flex items-center justify-between gap-6 leading-5 capitalize shadow-[0_1px_0_var(--tw-primary)_inset] bg-white '
						>
							<div>Grand Total:</div>
							<div>Total Gross Sales: ${table.getCoreRowModel().rows[0].original.totalGrossSales}</div>
							<div>Gross Food Cost: ${table.getCoreRowModel().rows[0].original.grossFoodCost}</div>
							<div>Gross Profit: ${table.getCoreRowModel().rows[0].original.grossProfitFooter}</div>
							<div>Total Net Sales: ${table.getCoreRowModel().rows[0].original.totalNetSales}</div>
							<div>Net Food Cost: ${table.getCoreRowModel().rows[0].original.netFoodCost}</div>
							<div>Net Profit: ${table.getCoreRowModel().rows[0].original.netProfit}</div>
						</div>
					</div>
				);
			},
		}),
		columnHelper.accessor('itemName', {
			id: 'itemName',
			header: () => <div className='w-full text-left'>Item Name</div>,
			cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
			dataType: 'string',
			size: 150,
		}),
		columnHelper.accessor('itemPrice', {
			id: 'itemPrice',
			header: 'Item Price',
			cell: ({ getValue }) => `$${getValue()}`,
			dataType: 'string',
			size: 100,
		}),
		columnHelper.accessor('recipeCost', {
			id: 'recipeCost',
			header: 'Recipe Cost',
			cell: ({ getValue }) => `$${getValue()}`,
			dataType: 'string',
			size: 100,
		}),
		columnHelper.accessor('costper', {
			id: 'costper',
			header: 'Cost %',
			dataType: 'string',
			size: 80,
		}),
		columnHelper.accessor('quantitySold', {
			id: 'quantitySold',
			header: 'Quantity Sold',
			dataType: 'string',
			size: 120,
		}),
		columnHelper.accessor('itemSales', {
			id: 'itemSales',
			header: 'Item Sales',
			cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
			dataType: 'string',
			size: 100,
		}),
		columnHelper.accessor('grossProfit', {
			id: 'grossProfit',
			header: 'Gross Profit',
			cell: ({ getValue }) => `$${getValue()}`,
			dataType: 'string',
			size: 100,
		}),
		columnHelper.accessor('grossProfitper', {
			id: 'grossProfitper',
			header: 'Gross Profit %',
			dataType: 'string',
			size: 100,
		}),
	];

	const memoizedColumns = useMemo(() => createColumns(columnHelper), []);
	const [columns, setColumns] = useState(memoizedColumns);

	const recipeModalColumns = [
		columnHelper.accessor('qsrInventoryItemID', {
			id: 'qsrInventoryItemID',
			header: 'QSR Inventory Item ID',
			dataType: 'number',
			size: 150,
		}),
		columnHelper.accessor('inventoryItem', {
			id: 'inventoryItem',
			header: 'Inventory Item',
			cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
			dataType: 'string',
			size: 300,
		}),
		columnHelper.accessor('mainUOMName', {
			id: 'mainUOMName',
			header: 'Main UOM Name',
			cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
			dataType: 'string',
			size: 180,
		}),
		columnHelper.accessor('mainUOMCost', {
			id: 'mainUOMCost',
			header: 'Main UOM Cost',
			cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
			dataType: 'number',
			size: 100,
		}),
		columnHelper.accessor('mainUOMsInRecipe', {
			id: 'mainUOMsInRecipe',
			header: 'Main UOMs In Recipe',
			cell: ({ getValue }) => getValue().toFixed(6),
			dataType: 'number',
			size: 100,
		}),
		columnHelper.accessor('smallUOMName', {
			id: 'smallUOMName',
			header: 'Small UOM Name',
			dataType: 'string',
			size: 100,
		}),
		columnHelper.accessor('smallUOMCost', {
			id: 'smallUOMCost',
			header: 'Small UOM Cost',
			cell: ({ getValue }) => `$${getValue().toFixed(4)}`,
			dataType: 'number',
			size: 100,
		}),
		columnHelper.accessor('smallUOMsInRecipe', {
			id: 'smallUOMsInRecipe',
			header: 'Small UOMs In Recipe',
			cell: ({ getValue }) => getValue().toFixed(6),
			dataType: 'number',
			size: 100,
		}),
		columnHelper.accessor('recipeItemCost', {
			id: 'recipeItemCost',
			header: 'Recipe Item Cost',
			cell: ({ getValue }) => `$${getValue().toFixed(4)}`,
			dataType: 'number',
			size: 100,
		}),
		columnHelper.accessor('inventoryPriceSourceT0N', {
			id: 'inventoryPriceSourceT0N',
			header: 'Inventory Price Source',
			cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
			dataType: 'string',
			size: 100,
		}),
	];

	useEffect(() => {
		if (defaultUnitID) {
			setSelectedUnit(defaultUnitID);
		}
		if (defaultUnitName) {
			setSelectedUnitName(defaultUnitName);
		}
	}, [defaultUnitID, defaultUnitName]);

	useEffect(() => {
		handleGroupByCategory();
	}, []);

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

	const fetchMenuGrossProfitData = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'menuGrossProfit',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);

			const newData = result.data.menuGrossSalesCodeModels.map((item) => ({
				category: item.description,
				itemID: item.itemID,
				itemName: item.itemName,
				itemPrice: item.itemPrice,
				recipeCost: item.recipeCost.toFixed(2),
				costper: (item.costper * 100).toFixed(2) + '%',
				quantitySold: item.quantitySold,
				itemSales: item.grossItemSales,
				grossProfit: item.grossProfit.toFixed(2),
				grossProfitper: (item.grossProfitper * 100).toFixed(2) + '%',
				totalGrossSales: result.data.menuGrossProfitFooterModel.totalGrossSales.slice(1),
				grossFoodCost: result.data.menuGrossProfitFooterModel.grossFoodCost.slice(1),
				grossProfitFooter: result.data.menuGrossProfitFooterModel.grossProfit.slice(1),
				totalNetSales: result.data.menuGrossProfitFooterModel.totalNetSales.slice(1),
				netFoodCost: result.data.menuGrossProfitFooterModel.netFoodCost.slice(1),
				netProfit: result.data.menuGrossProfitFooterModel.netProfit.slice(1),
			}));

			let filteredData = newData.filter((item) => selectedCategories.includes(item.category));

			if (!showItemsWithSales) {
				filteredData = filteredData.filter((item) => item.itemSales !== 0);
			}

			if (!showItemsWithNoRecipeCost) {
				filteredData = filteredData.filter((item) => item.recipeCost !== '0.00');
			}
			setMenuGrossProfitData(filteredData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Menu Gross Profit Report data: ', error);
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

	const handleCategoryChange = (category) => {
		if (selectedCategories.includes(category)) {
			setSelectedCategories(selectedCategories.filter((c) => c !== category));
		} else {
			setSelectedCategories([...selectedCategories, category]);
		}
	};

	const handleGroupByCategory = (e) => {
		const isChecked = e ? e.target.checked : isGroupByCategory;
		setIsGroupByCategory(isChecked);

		if (isChecked) {
			const newColumns = [
				columnHelper.display({
					id: 'actions',
					cell: ({ row }) => {
						if (!row.getCanExpand()) return null;

						return (
							<div
								style={{
									cursor: 'pointer',
									paddingLeft: `${row.depth * 2}rem`,
									width: '100%',
								}}
								className='absolute inset-0 flex items-center gap-2 font-bold capitalize bg-white'
							>
								{row.getIsExpanded() ? (
									<CiSquareMinus className='text-[20px]' />
								) : (
									<CiSquarePlus className='text-[20px]' />
								)}
								{row.original.category}
							</div>
						);
					},
					size: 20,
				}),
				...memoizedColumns.map((column) =>
					column.id === 'category' ? { ...column, groupBy: true, show: false } : column
				),
			];
			setColumns(newColumns);
		} else {
			setColumns(memoizedColumns);
		}

		if (e) fetchMenuGrossProfitData();
	};

	const handleRecipeInfoModal = async (e) => {
		setSelectedRecipe(e);
		setRecipeInforModalOpen(true);
		try {
			setIsRecipeInfoLoading(true);
			const getData = {
				url: 'menuGrossProfitRecipeInfo',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					itemID: e.itemID,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);

			setRecipeInfoData(result.data);
			setIsRecipeInfoLoading(false);
		} catch (e) {
			console.log('Error getting Menu Gross Profit Recipe Information data: ', e);
		}
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		const pdfData = {
			title: 'Menu Gross Profit',
			subHeaders: [
				`Generated on ${dateFormat(
					new Date(),
					'mm/dd/yyyy'
				)}  |  Unit:${selectedUnitName}  |  Date Range: ${dateFormat(
					selectedFromDate,
					'mm-dd-yyyy'
				)} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: Array(10).fill('auto'),
					dataTypes: Array(10).fill('string'),
					data: {
						columnHeaders: [
							'Category',
							'Item ID',
							'Item Name',
							'Item Price',
							'Recipe Cost',
							'Cost %',
							'Quantity Sold',
							'Item Sales',
							'Gross Profit',
							'Gross Profit %',
						],
						rows: menuGrossProfitData.map((row) => [
							{
								value: row.category,
								cellType: 'string',
								columnName: 'Category',
							},
							{ value: row.itemID, cellType: 'string', columnName: 'Item ID' },
							{
								value: row.itemName,
								cellType: 'string',
								columnName: 'Item Name',
							},
							{
								value: row.itemPrice,
								cellType: 'string',
								columnName: 'Item Price',
							},
							{
								value: row.recipeCost,
								cellType: 'string',
								columnName: 'Recipe Cost',
							},
							{ value: row.costper, cellType: 'string', columnName: 'Cost %' },
							{
								value: row.quantitySold,
								cellType: 'string',
								columnName: 'Quantity Sold',
							},
							{
								value: row.itemSales === 0 ? '0 ' : row.itemSales,
								cellType: 'string',
								columnName: 'Item Sales',
							},
							{
								value: row.grossProfit,
								cellType: 'string',
								columnName: 'Gross Profit',
							},
							{
								value: row.grossProfitper,
								cellType: 'string',
								columnName: 'Gross Profit %',
							},
						]),
					},
				},
			],
		};

		PdfBuilder(pdfData);
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: '',
				columns: [
					{ name: 'Category', filterButton: true },
					{ name: 'Item ID', filterButton: true },
					{ name: 'Item Name', filterButton: true },
					{ name: 'Item Price', filterButton: true },
					{ name: 'Recipe Cost', filterButton: true },
					{ name: 'Cost %', filterButton: true },
					{ name: 'Quantity Sold', filterButton: true },
					{ name: 'Item Sales', filterButton: true },
					{ name: 'Gross Profit', filterButton: true },
					{ name: 'Gross Profit %', filterButton: true },
				],
				data: menuGrossProfitData.map((row) => [
					row.category,
					row.itemID,
					row.itemName,
					row.itemPrice,
					row.recipeCost,
					row.costper,
					row.quantitySold,
					row.itemSales,
					row.grossProfit,
					row.grossProfitper,
				]),
			},
		];

		const filename = `menuGrossProfit_${selectedUnitName}_${dateFormat(
			selectedFromDate,
			'mm-dd-yyyy'
		)}_to_${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = `Menu Gross Profit`;
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(
			data,
			filename,
			spreadSheetTitle,
			date,
			`${selectedUnitName}  |  Generated on ${dateFormat(new Date(), 'mm/dd/yyyy')}`
		);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={menuGrossProfitData}
			isFooter={true}
			onCallBack={(e) => handleRecipeInfoModal(e)}
		/>
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
				<h2 className='my-4 text-[20px] leading-tight text-left pageTitle'>Menu Gross Profit</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
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
						<div className='categories-button' onClick={() => setIsCategoryModalOpen(true)}>
							<div className='py-3 ml-2 text-[16px] text-center capitalize border-2 border-solid cursor-pointer px-8 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
								Select Categories
							</div>
						</div>
						<div className='run-button' onClick={fetchMenuGrossProfitData}>
							<div className='py-3 ml-3 text-[16px] font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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

				<div className='flex gap-4 '>
					<div className='flex items-center rounded'>
						<input
							type='checkbox'
							className='w-4 h-4 text-[14px] accent-[var(--tw-primary)] hover:brightness-150 bg-gray-100 border-gray-300'
							checked={showItemsWithSales}
							onClick={() => setShowItemsWithSales(!showItemsWithSales)}
						/>
						<label className='text-[14px] font-medium ms-2'>Show Items With Sales of $0</label>
					</div>
					<div className='flex items-center rounded'>
						<input
							type='checkbox'
							className='w-4 h-4 accent-[var(--tw-primary)] hover:brightness-150 bg-gray-100 border-gray-300 text-[14px] '
							checked={showItemsWithNoRecipeCost}
							onClick={() => setShowItemsWithNoRecipeCost(!showItemsWithNoRecipeCost)}
						/>
						<label className='text-[14px]  font-medium ms-2'>Show Items With No Recipe Cost</label>
					</div>
					<div className='flex items-center rounded'>
						<input
							type='checkbox'
							className='w-4 h-4 accent-[var(--tw-primary)] hover:brightness-150 bg-gray-100 border-gray-300 text-[14px] '
							checked={isGroupByCategory}
							onClick={(e) => handleGroupByCategory(e)}
						/>
						<label className='text-[14px]  font-medium ms-2'>Group Items By Category</label>
					</div>
				</div>

				{/* Display the table if there is no error and the data is not loading */}

				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						{!isLoading &&
							(menuGrossProfitData.length > 0 ? (
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
					<Modal
						isOpen={isCategoryModalOpen}
						onClose={() => setIsCategoryModalOpen(false)}
						title={'Select The Categories To Show On The Report'}
					>
						<div className='p-4 w-[32rem] space-y-4 '>
							<div className='flex justify-between'>
								<button
									className='relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_2px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button'
									onClick={() => setSelectedCategories(Categories)}
								>
									Select All
								</button>
								<button
									className='relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_2px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button'
									onClick={() => setSelectedCategories([])}
								>
									Select None
								</button>
							</div>
							<div className='flex flex-col space-y-2'>
								{Categories.map((category) => (
									<div key={category} className='flex items-center rounded'>
										<input
											type='checkbox'
											className='w-4 h-4 accent-[var(--tw-primary)] hover:brightness-150 bg-gray-100 border-gray-300'
											checked={selectedCategories.includes(category)}
											onChange={() => handleCategoryChange(category)}
										/>
										<label className='text-lg font-medium ms-2'>{category}</label>
									</div>
								))}
							</div>
						</div>
					</Modal>
					<Modal
						isOpen={recipeInforModalOpen}
						onClose={() => setRecipeInforModalOpen(false)}
						title={'Recipe Information'}
					>
						<div className='w-[80rem] p-4 overflow-auto'>
							<h2 className='flex justify-center text-lg'>
								Item:
								<span className='mx-1 font-bold'>
									{selectedRecipe?.itemID + ' - ' + selectedRecipe?.itemName}
								</span>{' '}
								| Total Recipe Cost: ${selectedRecipe?.recipeCost}
							</h2>

							<div className='relative w-full min-h-56'>
								<Loader loading={isRecipeInfoLoading} />
								{!isRecipeInfoLoading &&
									(menuGrossProfitData.length > 0 ? (
										<TableHOC
											columns={recipeModalColumns}
											data={recipeInfoData}
											headerPosition='left'
										/>
									) : (
										<div className='mt-10 text-xl font-medium text-center'>No data available</div>
									))}
							</div>
						</div>
					</Modal>
				</div>
			</div>
		</>
	);
};

export default MenuGrossProfit;
