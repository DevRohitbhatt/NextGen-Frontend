import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector, useDispatch } from 'react-redux';
import invoices from '../../assets/introJSSteps/invoices';
import { setVendorsList } from '../../reducer/slices/globalState';
import {
	UnitSelector,
	Loader,
	VendorSelector,
	CalendarModal,
	VendorModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { MdEdit } from 'react-icons/md';

const columnHelper = createColumnHelper();

const Invoices = () => {
	const dispatch = useDispatch();
	const globalState = useSelector((state) => state.globalState);
	const companyID = useSelector((state) => state.globalState.companyID);
	const alignmentID = useSelector((state) => state.globalState.alignmentID);
	const unitsAndAreasList = useSelector((state) => state.globalState.unitsAndAreas);
	const vendorsList = useSelector((state) => state.globalState.vendorsList);
	const groupOrUnitAccessID = useSelector((state) => state.globalState.groupOrUnitAccess);

	const [invoiceReportData, setInvoiceReportData] = useState([]);
	const [isBrowseInvoicesClicked, setIsBrowseInvoicesClicked] = useState(true);
	const [searchKey, setSearchKey] = useState('');
	const [searchInvoiceData, setSearchInvoiceData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Invoices, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('No Unit Selected');
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

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: invoices(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'actions',
				cell: () => (
					<div className='flex space-x-2 text-lg'>
						<PiMagnifyingGlassBold className='cursor-pointer' />
						<MdEdit className='cursor-pointer' />
					</div>
				),
				size: 50,
			}),
			columnHelper.accessor('name', {
				id: 'name',
				header: 'Vendor',
				dataType: 'string',
				size: 60,
			}),
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit',
				dataType: 'string',
				size: 150,
			}),
			columnHelper.accessor('vendorInvoiceReference', {
				id: 'vendorInvoiceReference',
				header: 'Invoice Reference',
				dataType: 'string',
				size: 80,
			}),
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				cell: ({ getValue }) => {
					if (!getValue()) return '';
					return dateFormat(getValue(), 'mm-dd-yyyy');
				},
				dataType: 'date',
				size: 80,
			}),
			columnHelper.accessor('totalAmountIncludingTax', {
				id: 'totalAmountIncludingTax',
				header: 'Total',
				dataType: 'number',
				size: 60,
			}),
			columnHelper.accessor('lastEditedBy', {
				id: 'lastEditedBy',
				header: 'Last Edited By',
				dataType: 'string',
				size: 80,
			}),
			columnHelper.accessor('status', {
				id: 'status',
				header: 'Status',
				dataType: 'string',
				size: 60,
			}),
		],
		[]
	);

	useEffect(() => {
		if (globalState.groupOrUnitAccess || globalState.defaultUnitID) {
			setSelectedUnit(globalState.groupOrUnitAccess || globalState.defaultUnitID);
		}
		if (globalState.groupOrUnitAccessName || globalState.defaultUnitName) {
			setSelectedUnitName(globalState.groupOrUnitAccessName || globalState.defaultUnitName);
		}
	}, [
		globalState.defaultUnitID,
		globalState.groupOrUnitAccess,
		globalState.defaultUnitName,
		globalState.groupOrUnitAccessName,
	]);

	useEffect(() => {
		if (companyID && alignmentID && (groupOrUnitAccessID || selectedUnit)) {
			fetchData(companyID, alignmentID, groupOrUnitAccessID || selectedUnit);
		} else {
			setErrorMessage('There was an issue loading your orders, please try again later.');
		}
	}, [companyID, alignmentID, groupOrUnitAccessID, selectedUnit]);

	const fetchData = async (companyID) => {
		setIsLoading(true);
		await Promise.all([fetchVendors(companyID)]);
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

	// Function to get the voids report
	const handleInvoiceReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'invoiceReport',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					vendorId: selectedVendor,
				},
			};

			const result = await getCall(getData);
			const newData = {
				...result,
				data: result.data.map((row) => ({
					...row,
					subrows: row.voids,
				})),
			};

			setInvoiceReportData(newData.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Invoice data: ', error);
		}
	};

	useEffect(() => {
		if (selectedUnit) {
			handleInvoiceReport();
		}
	}, [selectedUnit, selectedVendor, selectedFromDate, selectedToDate]);

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	const handleVendorSelection = (selectedVendorName, vendorList) => {
		setSelectedVendorName(selectedVendorName);
		setSelectedVendor(vendorList[0].id);
		setVendorShowModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleSearchKeyChange = async (e) => {
		setSearchKey(e.target.value);
		if (e.target.value.length >= 3) {
			try {
				setIsLoading(true);
				setIsError(false);
				const getData = {
					url: 'invoiceSearchReport',
					urlParams: {
						companyId: companyID,
						alignmentId: alignmentID,
						memberId: selectedUnit,
						searchKey: e.target.value,
						userId: 0,
					},
				};

				const result = await getCall(getData);
				setSearchInvoiceData(result.data);
				setIsLoading(false);
			} catch (error) {
				setIsError(true);
				setIsLoading(false);
				setErrorMessage('There was an issue loading your data, please try again later.');
				console.error('Error getting Invoices data: ', error);
			}
		}
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (isBrowseInvoicesClicked) {
			if (!invoiceReportData) return;

			const pdfData = {
				title: 'Invoices',
				subHeaders: [
					`Unit:${selectedUnitName} | Vendor:${selectedVendorName} | Date Range:${dateFormat(
						selectedFromDate,
						'mm-dd-yyyy'
					)} - ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`,
				],
				exportType: 'pdf',
				pageOrientation: 'portrait',
				body: [
					{
						type: 'table',
						widths: new Array(columns.length - 1).fill('auto'),
						dataTypes: columns.slice(1).map((column) => column.dataType),
						data: {
							columnHeaders: columns.slice(1).map((column) => column.header),
							rows: invoiceReportData.map((row) =>
								columns.slice(1).map((column) => ({
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
		} else {
			if (!searchInvoiceData) return;

			const pdfData = {
				title: 'Invoices',
				subHeaders: [`Search Results for '${searchKey}'`],
				exportType: 'pdf',
				pageOrientation: 'portrait',
				body: [
					{
						type: 'table',
						widths: new Array(columns.length - 1).fill('auto'),
						dataTypes: columns.slice(1).map((column) => column.dataType),
						data: {
							columnHeaders: columns.slice(1).map((column) => column.header),
							rows: searchInvoiceData.map((row) =>
								columns.slice(1).map((column) => ({
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
		}
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (isBrowseInvoicesClicked) {
			if (!invoiceReportData) return;

			const data = [
				{
					name: `Vendor:${selectedVendorName}`,
					columns: columns.slice(1).map((column) => ({ name: column.header, filterButton: true })),
					data: invoiceReportData.map((row) => columns.slice(1).map((column) => row[column.id])),
				},
			];

			const filename = `Inv_${selectedUnitName}_${selectedVendorName}_${dateFormat(
				selectedFromDate,
				'mm-dd-yyyy'
			)}-${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;
			const spreadSheetTitle = 'Invoices';
			const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

			exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
		} else {
			if (!searchInvoiceData) return;

			const data = [
				{
					name: `Search Results for '${searchKey}'`,
					columns: columns.slice(1).map((column) => ({ name: column.header, filterButton: true })),
					data: searchInvoiceData.map((row) => columns.slice(1).map((column) => row[column.id])),
				},
			];

			const filename = `Inv_Search_${searchKey}`;
			const spreadSheetTitle = 'Invoices Search';
			const date = '';

			exportToExcel(data, filename, spreadSheetTitle, date, '');
		}
	};

	const Table =
		!isLoading &&
		(isBrowseInvoicesClicked ? (
			invoiceReportData.length === 0 ? (
				<div className='mx-auto mt-5 text-lg w-fit'>No Invoices Found</div>
			) : (
				<TableHOC
					columns={columns}
					data={invoiceReportData}
					isPaginated={true}
					dataPosition='left'
					headerPosition='left'
				/>
			)
		) : searchKey.length === 0 ? (
			<div className='mx-auto mt-5 text-lg w-fit'>Enter invoice reference or total for searching</div>
		) : searchKey.length < 3 ? (
			<div className='mx-auto mt-5 text-lg w-fit'>
				Invoice reference or total should be minimum of 3 characters
			</div>
		) : searchInvoiceData.length === 0 ? (
			<div className='mx-auto mt-5 text-lg w-fit'>{`No invoices found where Invoice Reference or Total that contains '${searchKey}'`}</div>
		) : (
			<TableHOC columns={columns} data={searchInvoiceData} />
		));

	return (
		<>
			<Loader loading={isLoading} />
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Invoices</h2>

				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div>
						<div className='flex gap-2'>
							<button
								className={`px-3 py-2 border-2 border-solid border-primary  hover:text-white hover:bg-primary focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
									isBrowseInvoicesClicked ? 'bg-primary text-white' : 'text-primary bg-secondary'
								}`}
								onClick={() => setIsBrowseInvoicesClicked(true)}
							>
								Browse Invoices
							</button>
							<button
								className={`px-3 py-2 border-2 border-solid border-primary  hover:text-white hover:bg-primary focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
									isBrowseInvoicesClicked ? 'text-primary bg-secondary' : 'bg-primary text-white'
								}`}
								onClick={() => setIsBrowseInvoicesClicked(false)}
							>
								Search Invoices
							</button>
						</div>
						{isBrowseInvoicesClicked ? (
							<div className='flex items-center space-x-3'>
								<UnitSelector
									companyID={companyID}
									alignmentID={alignmentID}
									memberID={selectedUnit}
									memberName={selectedUnitName}
									includeAreas={true}
									setMemberName={setSelectedUnitName}
									onClick={() => setUnitShowModal(true)}
								/>
								<VendorSelector
									vendorID={selectedVendor}
									vendorName={selectedVendorName}
									setVendorName={setSelectedVendorName}
									onClick={() => setVendorShowModal(true)}
								/>
								<DateSelector
									toDate={selectedToDate}
									fromDate={selectedFromDate}
									isDateRange={true}
									onClick={() => setShowDateModal(true)}
								/>
							</div>
						) : (
							<div className='mt-2'>
								<p className='font-medium'>
									Search by Invoice Reference or Total (minimum of 3 characters)
								</p>
								<input
									className='p-2 border-2 rounded-lg border-secondary'
									type='text'
									placeholder='Invoice Reference or Total'
									value={searchKey}
									onChange={handleSearchKeyChange}
								/>
							</div>
						)}
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

				{isError ? (
					<div>{errorMessage}</div>
				) : !isLoading && !selectedUnit ? (
					<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
				) : (
					<div className='paged-table'>{Table}</div>
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

export default Invoices;
