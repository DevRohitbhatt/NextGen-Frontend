import { useEffect, useState, useMemo } from 'react';
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
	Loader,
} from '../../../components';
import { getCall } from '../../../apis/network';
import { Steps } from 'intro.js-react';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import itemSoldTotals from '../../../assets/introJSSteps/menuItemSold/itemSoldTotals';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const ItemsSoldTotals = () => {
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

	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Error loading data, please try again later.');

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false);

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [viewWeek, setViewWeek] = useState('All');
	const [viewWeekValue, setViewWeekValue] = useState(0);
	const [view, setView] = useState('summary');
	const [viewValue, setViewValue] = useState(0);
	const [salesType, setSalesType] = useState('SalesNet');

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: itemSoldTotals(),
		initialStep: 0,
		stepsEnabled: false,
	});

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
	};

	const handleViewWeekChange = (option) => {
		setViewWeek(option);
		const value = dayValueMap[option] || 0;
		setViewWeekValue(value);
	};

	const handleViewChange = (option) => {
		setView(option);
		const value = viewValueMap[option] || 0;
		setViewValue(value);
		setMenuItemSoldData([]);
	};

	const handleSalesChange = (option) => {
		setSalesType(option);
		setMenuItemSoldData([]);
	};

	const columns = [
		...(viewValue === 2
			? [
					columnHelper.accessor('category', {
						id: 'category',
						header: 'Category',
						dataType: 'string',
						size: 60,
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
								{row.subRows.reduce((acc, curr) => acc + curr.original.discPrice, 0).toFixed(2)})
							</span>
						)}
					</div>
				) : getValue() ? (
					getValue() || ''
				) : (
					''
				),
		}),

		...(viewValue === 1
			? [
					columnHelper.accessor('unitName', {
						id: 'unitName',
						header: 'Unit',
						dataType: 'string',
						cell: (info) => info.getValue() || '',
					}),
			  ]
			: [
					columnHelper.accessor('description', {
						id: 'description',
						header: 'Description',
						dataType: 'string',
						cell: (info) => info.getValue() || '',
					}),
			  ]),
		columnHelper.accessor('quant', {
			id: 'quant',
			header: 'Quantity',
			dataType: 'number',
			size: 60,
			cell: (info) => info.getValue() || '',
		}),
		columnHelper.accessor('discPrice', {
			id: 'discPrice',
			header: 'Amount',
			dataType: 'number',
			cell: ({ row, getValue }) =>
				row.getCanExpand()
					? ''
					: `$${getValue() !== null && getValue() !== undefined ? getValue().toFixed(2) : '0.00'}`,
		}),
		columnHelper.accessor('itemSoldPct', {
			id: 'itemSoldPct',
			header: 'Item Sold %',
			dataType: 'number',
			size: 60,
			cell: (info) => {
				const value = info.getValue();
				return value != null ? `${parseFloat(value).toFixed(2)}%` : '';
			},
		}),
		columnHelper.accessor('quantity_Avg', {
			id: 'quantity_Avg',
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

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	const fetchItemsSoldTotalsData = async () => {
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
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
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
						itemSoldPct: item.itemSoldPct,
						quantity_Avg: item.quantity_Avg,
						discPrice_Avg: item.discPrice_Avg,
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
				newData = result.data.menuItemSoldTotalsModels.map((item) => ({
					unitName: item.unitName,
					total: salesType === 'SalesNet' ? result.data.total : result.data.grossTotal,
					category: item.grouping1,
					itemId: item.itemId,
					description: item.description,
					quant: item.quant,
					discPrice: item.discPrice,
					quantity_Avg: item.quantity_Avg,
					discPrice_Avg: item.discPrice_Avg,
					itemSoldPct: item.itemSoldPct.toFixed(2),
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
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
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
				)} | ${selectedUnitName} | ${viewWeek} | ${
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
			viewValue === 2
				? [
						{
							type: 'table',
							title: 'Items Sold Totals | Top Sellers',
							widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
							dataTypes: ['string', 'string', 'number', 'number', 'number', 'number', 'number'],
							data: {
								columnHeaders: columns.slice(1).map((column) => column.header),
								rows: menuItemSoldData.map((row) =>
									columns.slice(1).map((column) => ({
										value: row[column.id] != null ? row[column.id] : '', // Ensure value is not null or undefined
										cellType: column.dataType,
										columnName: column.header,
									}))
								),
							},
						},
				  ]
				: menuItemSoldData.map((row) => {
						const title = row.category || '';
						return {
							type: 'table',
							title: title,
							widths: [
								'auto',
								'auto',
								'auto',
								'auto',
								'auto',
								'auto',
								'auto',
								...(viewValue === 1 ? ['auto'] : []),
							],
							dataTypes: ['string', 'string', 'number', 'number', 'number', 'number', 'number'],
							data: formatPDFData(row.subRows),
						};
				  });

		return body;
	};

	const formatPDFData = (data) => {
		return viewValue === 0
			? {
					columnHeaders: [
						'Item ID',
						'Description',
						'Quantity',
						'Amount',
						'Item Sold %',
						'Average Item Quantity',
						'Average Item Amount',
					],
					rows: data.map((subRow) => [
						{ value: subRow.itemId, cellType: 'string', columnName: 'Item ID' },
						{ value: subRow.description, cellType: 'string', columnName: 'Description' },
						{ value: subRow.quant, cellType: 'number', columnName: 'Quantity' },
						{ value: subRow.discPrice, cellType: 'number', columnName: 'Amount' },
						{ value: subRow.itemSoldPct.toFixed(2), cellType: 'number', columnName: 'Item Sold %' },
						{ value: subRow.quantity_Avg, cellType: 'number', columnName: 'Average Item Quantity' },
						{
							value: subRow.discPrice_Avg.toFixed(2),
							cellType: 'number',
							columnName: 'Average Item Amount',
						},
					]),
			  }
			: viewValue === 1
			? {
					columnHeaders: [
						'Unit Name',
						'Item ID',
						'Description',
						'Quantity',
						'Amount',
						'Item Sold %',
						'Average Item Quantity',
						'Average Item Amount',
					],
					rows: data.flatMap((unit) =>
						unit.subRows.map((subRow) => [
							{ value: subRow.unitName, cellType: 'string', columnName: 'Unit Name' },
							{ value: subRow.itemId, cellType: 'string', columnName: 'Item ID' },
							{ value: subRow.description, cellType: 'string', columnName: 'Description' },
							{ value: subRow.quant, cellType: 'number', columnName: 'Quantity' },
							{ value: subRow.discPrice, cellType: 'number', columnName: 'Amount' },
							{
								value: subRow.itemSoldPct.toFixed(2),
								cellType: 'number',
								columnName: 'Item Sold %',
							},
							{
								value: subRow.quantity_Avg,
								cellType: 'number',
								columnName: 'Average Item Quantity',
							},
							{
								value: subRow.discPrice_Avg.toFixed(2),
								cellType: 'number',
								columnName: 'Average Item Amount',
							},
						])
					),
			  }
			: null;
	};

	const handleCSVClick = () => {
		const csvHeaders = [
			'Category',
			'Item',
			'Description',
			'Quantity',
			'Amount',
			'Item Sold %',
			'Average Item Quantity',
			'Average Item Amount',
		];
		const csvData =
			viewValue === 0
				? menuItemSoldData.flatMap((row) =>
						row.subRows.map((subRow) =>
							[
								row.category,
								subRow.itemId,
								subRow.description,
								subRow.quant,
								subRow.discPrice,
								subRow.itemSoldPct.toFixed(2),
								subRow.quantity_Avg,
								subRow.discPrice_Avg.toFixed(2),
							].join(',')
						)
				  )
				: viewValue === 1
				? menuItemSoldData.flatMap((category) =>
						category.subRows.flatMap((unit) =>
							unit.subRows.map((item) =>
								[
									category.category,
									item.itemId,
									item.description,
									item.quant,
									item.discPrice,
									item.itemSoldPct.toFixed(2),
									item.quantity_Avg,
									item.discPrice_Avg.toFixed(2),
								].join(',')
							)
						)
				  )
				: menuItemSoldData.map((item) =>
						[
							item.category,
							item.itemId,
							item.description,
							item.quant,
							item.discPrice,
							item.itemSoldPct,
							item.quantity_Avg,
							item.discPrice_Avg.toFixed(2),
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
									'Item Sold %': Number(item.itemSoldPct).toFixed(2),
									'Average Item Quantity': item.quantity_Avg,
									'Average Item Amount': item.discPrice_Avg,
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
										'Item Sold %': Number(item.itemSoldPct).toFixed(2),
										'Average Item Quantity': item.quantity_Avg,
										'Average Item Amount': item.discPrice_Avg,
									}))
								)
						  )
						: menuItemSoldData.map((item) => ({
								Category: item.category,
								Item: item.itemId,
								Description: item.description,
								Quantity: item.quant,
								Amount: item.discPrice,
								'Item Sold %': Number(item.itemSoldPct).toFixed(2),
								'Average Item Quantity': item.quantity_Avg,
								'Average Item Amount': item.discPrice_Avg,
						  })),
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
			view={viewWeek}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			expandCollapseButtons={viewValue !== 2 ? true : false}
			detailOnTop={`${salesType === 'SalesNet' ? 'Net Sales:' : 'Gross Sales:'} $${
				menuItemSoldData[0]?.total?.toFixed(2) || 0
			}`}
		/>
	);

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

						<div className='w-44'>
							<Dropdown
								title='Day of the week'
								options={dropdownOptions}
								selectedOption={viewWeek}
								onOptionChange={handleViewWeekChange}
							/>
						</div>

						<div className='run-button' onClick={fetchItemsSoldTotalsData}>
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
				<div className='flex mt-2'>
					<div className='mt-2 view-selector'>
						<label className='block ml-2 mb-1 mt-[-12px] text-lg font-semibold'>View</label>
						<div className='p-3 border-2 border-solid rounded-[1.5rem] checkbox-group hover:border-primary'>
							<div className='flex flex-row space-x-6'>
								<div className='flex items-center cursor-pointer'>
									<input
										type='radio'
										id='summary'
										name='reportType'
										value='summary'
										checked={view === 'summary'}
										onChange={() => handleViewChange('summary')}
										className='cursor-pointer accent-[var(--tw-primary)]'
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
										className='cursor-pointer accent-[var(--tw-primary)]'
									/>
									<label htmlFor='byUnit' className='ml-2'>
										By Unit
									</label>
								</div>
								<div className='flex items-center cursor-pointer'>
									<input
										type='radio'
										id='topSellers'
										name='reportType'
										value='topSellers'
										checked={view === 'topSellers'}
										onChange={() => handleViewChange('topSellers')}
										className='cursor-pointer accent-[var(--tw-primary)]'
									/>
									<label htmlFor='topSellers' className='ml-2'>
										Top Sellers
									</label>
								</div>
							</div>
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

export default ItemsSoldTotals;
