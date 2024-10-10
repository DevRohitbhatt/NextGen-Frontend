import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector, useDispatch } from 'react-redux';
import { setVendorsList } from '../../reducer/slices/globalState';
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
	VendorSelector,
	VendorModal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import PurchaseAnalysi from '../../assets/introJSSteps/PurchaseAnalysis';
import { useLocation } from 'react-router-dom';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const PurchaseAnalysis = () => {
	const dispatch = useDispatch();
	const { companyID, alignmentID, unitsAndAreas: unitsAndAreasList, groupOrUnitAccess, defaultUnitID, groupOrUnitAccessName, defaultUnitName, vendorsList } = useSelector((state) => state.globalState);
	const [purchasetData, setPurchaseData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Purchase Analysis Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//selected vendor state variables
	const [selectedVendor, setSelectedVendor] = useState(0);
	const [selectedVendorName, setSelectedVendorName] = useState('All Vendors');
	const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//location for state
	const location = useLocation();

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: PurchaseAnalysi(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit',
				dataType: 'string',
				size: 300,
			}),
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				cell: ({ getValue }) => {
					if (!getValue()) return '';
					const date = new Date(getValue());
					const formattedDate = `${dateFormat(date, 'mm-dd-yyyy')}`;
				
					return formattedDate;
				},
				dataType: 'date',
				size: 100,
			}),
			columnHelper.accessor('name', {
				id: 'name',
				header: 'Vendor',
				dataType: 'string',
				size: 100,
			}),
			columnHelper.accessor('vendorInvoiceReference', {
				id: 'vendorInvoiceReference',
				header: 'Invoice Ref #',
				dataType: 'string',
				size: 120,
			}),
			columnHelper.accessor('totalAmountIncludingTax', {
				id: 'totalAmountIncludingTax',
				header: 'Invoice Total',
				cell: ({ getValue }) => (getValue() ? `${getValue().toFixed(2)}` : ''),
				dataType: 'number',
				size: 120,
			}),
			columnHelper.accessor('companyGLCode', {
				id: 'companyGLCode',
				header: 'GL Code',
				dataType: 'string',
				size: 200,
			}),
			columnHelper.accessor('vendorItemDescription', {
				id: 'vendorItemDescription',
				header: 'Vendor Item',
				dataType: 'string',
				size: 250,
			}),
			columnHelper.accessor('quantity', {
				id: 'quantity',
				header: 'Item Quantity',
				cell: ({ getValue }) => <div className='text-center'>{getValue() ?? 0}</div>,
				footer: ({ table }) => (
					<div className='font-bold text-center'>
						{parseInt(table.getCoreRowModel().rows.reduce((acc, row) => acc + row.original.quantity, 0))}
					</div>
				),
				dataType: 'number',
				size: 100,
			}),
			columnHelper.accessor('price', {
				id: 'price',
				header: 'Item Price',
				cell: ({ getValue }) => (getValue() ? `$${getValue().toFixed(2)}` : '$0.00'),
				dataType: 'number',
				size: 100,
			}),
			columnHelper.accessor('taxAmount', {
				id: 'taxAmount',
				header: 'Item Tax',
				cell: ({ getValue }) => (getValue() ? `$${getValue().toFixed(2)}` : '$0.00'),
				dataType: 'number',
				size: 100,
			}),
			columnHelper.accessor('extPrice', {
				id: 'extPrice',
				header: 'Item Total',
				cell: ({ getValue }) => (getValue() ? `$${getValue().toFixed(2)}` : '$0.00'),
				footer: ({ table }) => (
					<div className='font-bold text-start'>
						$
						{table
							.getCoreRowModel()
							.rows.reduce((acc, row) => acc + row.original.extPrice, 0)
							.toFixed(2)}
					</div>
				),
				dataType: 'number',
				size: 100,
			}),
			columnHelper.accessor('department', {
				id: 'department',
				header: 'Department',
				dataType: 'string',
				size: 120,
			}),
			columnHelper.accessor('subdepartment', {
				id: 'subdepartment',
				header: 'Sub Department',
				dataType: 'string',
				size: 150,
			}),
			columnHelper.accessor('inventoryItemDescription', {
				id: 'inventoryItemDescription',
				header: 'Inventory Item',
				dataType: 'string',
				size: '300',
			}),
		],
		[]
	);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [
		defaultUnitID,
		groupOrUnitAccess,
		defaultUnitName,
		groupOrUnitAccessName,
	]);

	useEffect(() => {
		if (companyID && alignmentID && (groupOrUnitAccess || selectedUnit)) {
			fetchData(companyID, alignmentID, groupOrUnitAccess || selectedUnit);
		} else {
			setErrorMessage('There was an issue loading your orders, please try again later.');
		}
	}, [companyID, alignmentID, groupOrUnitAccess, selectedUnit]);

	useEffect(() => {
		if (location.state) {
			fetchPurchaseDetails();
		}
	}, []);

	const fetchData = async (companyId) => {
		setIsLoading(true);
		await Promise.all([fetchVendors(companyId)]);
		setIsLoading(false);
	};

	// This function fetches the vendors.
	const fetchVendors = async (companyID) => {
		try {
			setIsError(false);
			const getData = {
				url: 'vendors',
				urlParams: {
					companyID: companyID,
				},
			};

			const result = await getCall(getData);
			dispatch(setVendorsList(result));
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your vendors, please try again later.');
			console.error('Error getting vendors: ', error);
		}
	};

	// Function to fetch the purchase analysis details
	const fetchPurchaseDetails = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'PurchaseAnalysis',
				urlParams: {
					companyID: location.state?.companyID,
					alignmentID: location.state?.alignmentID,
					memberID: location.state?.memberID,
					fromDate: location.state?.fromDate,
					toDate: location.state?.toDate,
					vendorId: location.state?.vendorId,
				},
			};

			setSelectedUnit(location.state?.memberID);

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
				...item,
				unitName: location.state.unitsAndAreasList?.units.find((unit) => unit.unitID === parseInt(item.unitId))
					?.unitName,
			}));

			setPurchaseData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			console.error('Error fetching Purchase Analysis details: ', error);
		}
	};

	// Function to get the voids report
	const handleRun = async () => {
		try {
			setIsLoading(true);
			setIsError(false);

			const getData = {
				url: 'PurchaseAnalysis',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					vendorId: selectedVendor,
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
				...item,
				unitName: unitsAndAreasList.units.find((unit) => unit.unitID === parseInt(item.unitId))?.unitName,
				inventoryItemDescription: `${item.qsrInventoryItemID} - ${item.inventoryItemDescription}`,
			}));

			setPurchaseData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Purchase Analysis Report data: ', error);
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

	const handleVendorSelection = (selectedVendorName, vendorList) => {
		setSelectedVendorName(selectedVendorName);
		setSelectedVendor(vendorList[0].id);
		setVendorShowModal(false);
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		const pdfData = {
			title: 'Purchase Analysis Report',
			subHeaders: [
				`Unit:${selectedUnitName} | Vendor:${selectedVendorName} | Date Range:${dateFormat(
					selectedFromDate,
					'mm-dd-yyyy'
				)} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: new Array(columns.length).fill('auto'),
					dataTypes: columns.map((column) => column.dataType),
					data: {
						columnHeaders: columns.map((column) => column.header),
						rows: purchasetData.map((row) =>
							columns.map((column) => ({
								value: row[column.id],
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

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: `Vendor:${selectedVendorName}`,
				columns: columns.map((column) => ({ name: column.header, filterButton: true })),
				data: purchasetData.map((row) => columns.map((column) => row[column.id])),
			},
		];

		const filename = 'PurchaseAnalysis';
		const spreadSheetTitle = 'Purchase Analysis Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={purchasetData}
			isPaginated={true}
			isFooter={true}
			headerPosition='flex-start'
			dataPosition='text-start'
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
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Purchase Analysis Report</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyID={companyID}
							alignmentID={alignmentID}
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
						<VendorSelector
							vendorID={selectedVendor}
							vendorName={selectedVendorName}
							setVendorName={setSelectedVendorName}
							onClick={() => setVendorShowModal(true)}
						/>

						<div className='run-button' onClick={handleRun}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<div className='relative w-full min-h-56'><Loader loading={isLoading} />
						{!isLoading &&
							(purchasetData.length > 0 ? (
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

					<VendorModal
						vendorData={vendorsList}
						vendorID={selectedVendor}
						vendorName={selectedVendorName}
						show={showVendorModal}
						handleClose={() => {
							setVendorShowModal(false);
						}}
						handleVendorSelection={handleVendorSelection}
						isMultiVendor={true}
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

export default PurchaseAnalysis;
