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
	Loader,
} from '../../../components';
import dateFormat from 'dateformat';
import { createColumnHelper } from '@tanstack/react-table';
import itemSoldWithModifiers from '../../../assets/introJSSteps/menuItemSold/itemSoldWithModifiers';

const columnHelper = createColumnHelper();

const ItemsSoldWithModifiers = () => {
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

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Menu Items Sold, please try again later.'
	);

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

	const [view, setView] = useState('summary');
	const [viewValue, setViewValue] = useState(0);
	const [salesType, setSalesType] = useState('SalesNet');

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: itemSoldWithModifiers(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const viewValueMap = {
		summary: 0,
		byUnit: 1,
	};

	const handleViewChange = (option) => {
		setView(option);
		const value = viewValueMap[option] || 0;
		setViewValue(value);
		setMenuItemSoldData([]);
	};

	const [columns, setColumns] = useState([]);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	const fetchItemsSoldWithModifiersData = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);

			// Define the URL mapping based on viewValue
			const getData = {
				url: 'MenuItemSoldModifiersData',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					options: viewValue === 0 ? 'GroupSummary' : 'GroupByUnit',
					groupBy: viewValue === 0 ? 1 : 0,
				},
			};

			const result = await getCall(getData);

			let newData;

			// Conditional mapping based on salesType
			if (viewValue === 0) {
				newData = result.data.menuItemSoldModifierReportModels.map((category) => ({
					category: category.itemFullDescription,
					total: salesType === 'SalesNet' ? result.data.salesTotal : result.data.grossTotal,
					totalItemQuantity: category.menuItemSoldModifierModels[0].totalItemQuantity,
					subRows: category.menuItemSoldModifierModels?.map((item) => ({
						itemId: item.itemId,
						modItemID: item.modItemID === 0 ? item.itemId : item.modItemID,
						modifierDisplayName: item.modifierDisplayName,
						quant: item.modQuantity === 0 ? item.totalItemQuantity : item.modQuantity,
						modItemFrequency: item.modItemFrequency,
					})),
				}));
			} else if (viewValue === 1) {
				newData = result.data.menuItemSoldModifierReportModels.map((category) => ({
					category: category.itemFullDescription,
					total: salesType === 'SalesNet' ? result.data.salesTotal : result.data.grossTotal,
					subRows: category.menuItemSoldModifierUnitReportModels.map((unit) => ({
						totalItemQuantity: unit.menuItemSoldModifierModels[0].totalItemQuantity,
						unitName: unit.unitName,
						subRows: unit.menuItemSoldModifierModels.map((item) => ({
							unitName: item.unitName,
							itemId: item.itemId,
							quant: item.modQuantity === 0 ? item.totalItemQuantity : item.modQuantity,
							modItemID: item.modItemID === 0 ? item.itemId : item.modItemID,
							modifierDisplayName: item.modifierDisplayName,
							modQuantity: item.modQuantity,
							modItemFrequency: item.modItemFrequency,
						})),
					})),
				}));
			}

			setColumns([
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
										Menu Item Name: {row.original.category} (Quantity Sold ={' '}
										{viewValue === 1
											? row.subRows[0].original.totalItemQuantity
											: row.original.totalItemQuantity}
										)
									</span>
								) : (
									<span>
										Unit Name: {row.original.unitName} (Quantity Sold ={' '}
										{row.original.totalItemQuantity})
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
			]);

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
				)} | ${selectedUnitName} | ${
					salesType === 'SalesNet' ? 'Net Sales:' : 'Gross Sales:'
				} $${menuItemSoldData[0]?.total?.toFixed(2)}`,
			],
			exportType: 'pdf',
			pageOrientation: 'potrait',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = menuItemSoldData.map((category) => ({
			type: 'table',
			title: category.category || '',
			widths: ['auto', ...(viewValue === 1 ? ['auto'] : []), 'auto', 'auto', 'auto'],
			dataTypes: ['string', ...(viewValue === 1 ? ['string'] : []), 'string', 'number', 'number'],
			data: formatPDFData(category.subRows),
		}));

		return body;
	};

	const formatPDFData = (data) => {
		return viewValue === 0
			? {
					columnHeaders: ['Modifier Item #', 'Modifier Item Name', 'Quantity', 'Modifier Usage Frequency'],
					rows: data.map((subRow) => [
						{ value: subRow.modItemID, cellType: 'string', columnName: 'Modifier Item #' },
						{
							value: subRow.modifierDisplayName,
							cellType: 'string',
							columnName: 'Modifier Item Name',
						},
						{ value: subRow.quant, cellType: 'number', columnName: 'Quantity' },
						{
							value: subRow.modItemFrequency.toFixed(2),
							cellType: 'number',
							columnName: 'Modifier Usage Frequency',
						},
					]),
			  }
			: {
					columnHeaders: [
						'Unit Name',
						'Modifier Item #',
						'Modifier Item Name',
						'Quantity',
						'Modifier Usage Frequency',
					],
					rows: data.flatMap((unit) =>
						unit.subRows.map((subRow) => [
							{ value: subRow.unitName, cellType: 'string', columnName: 'Unit Name' },
							{ value: subRow.modItemID, cellType: 'string', columnName: 'Modifier Item #' },
							{
								value: subRow.modifierDisplayName,
								cellType: 'string',
								columnName: 'Modifier Item Name',
							},
							{ value: subRow.quant, cellType: 'number', columnName: 'Quantity' },
							{
								value: subRow.modItemFrequency.toFixed(2),
								cellType: 'number',
								columnName: 'Modifier Usage Frequency',
							},
						])
					),
			  };
	};

	const handleCSVClick = () => {
		const csvHeaders = [
			'Category',
			...(viewValue === 1 ? ['Unit Name'] : []),
			'Modifier Item #',
			'Modifier Item Name',
			'Quantity',
			'Modifier Usage Frequency',
		];
		const csvData =
			viewValue === 0
				? menuItemSoldData.flatMap((category) =>
						category.subRows.map((item) =>
							[
								category.category,
								item.modItemID,
								item.modifierDisplayName,
								item.quant,
								item.modItemFrequency.toFixed(2),
							].join(',')
						)
				  )
				: menuItemSoldData.flatMap((category) =>
						category.subRows.flatMap((unit) =>
							unit.subRows.map((item) =>
								[
									category.category,
									unit.unitName,
									item.modItemID,
									item.modifierDisplayName,
									item.quant,
									item.modItemFrequency.toFixed(2),
								].join(',')
							)
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
		const modifierColumns = [
			{ name: 'Category', filter: 'text' },
			{ name: 'Modifier Item #', filter: 'text' },
			{ name: 'Modifier Item Name', filter: 'text' },
			{ name: 'Quantity', filter: 'text' },
			{ name: 'Modifier Usage Frequency', filter: 'text' },
		];
		const data = [
			{
				name: viewValue === 0 ? 'Item Sold With Modifiers | Summary' : 'Item Sold With Modifiers | By Unit',
				columns:
					viewValue === 0 ? modifierColumns : [...modifierColumns, { name: 'Unit Name', filter: 'text' }],
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
			expandCollapseButtons={true}
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

						<div className='run-button' onClick={fetchItemsSoldWithModifiersData}>
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

export default ItemsSoldWithModifiers;
