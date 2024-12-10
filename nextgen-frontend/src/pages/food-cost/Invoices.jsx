import { useEffect, useMemo, useRef, useState } from 'react';
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
	Modal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { SlEye } from 'react-icons/sl';

const columnHelper = createColumnHelper();

const Invoices = () => {
	const dispatch = useDispatch();
	const {
		companyID,
		alignmentID,
		unitsAndAreas,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
		vendorsList,
	} = useSelector((state) => state.globalState);
	const debounceTimer = useRef(null);
	const [invoiceReportData, setInvoiceReportData] = useState([]);
	const [isBrowseInvoicesClicked, setIsBrowseInvoicesClicked] = useState(true);
	const [searchKey, setSearchKey] = useState('');
	const [searchInvoiceData, setSearchInvoiceData] = useState([]);
	const [invoiceDetailLoading, setInvoiceDetailsLoading] = useState(false);
	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load your Invoices, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

	//selected vendor state variables
	const [selectedVendor, setSelectedVendor] = useState(0);
	const [selectedVendorName, setSelectedVendorName] = useState('All Vendors');
	const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState();
	const [selectedToDate, setSelectedToDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [invoiceHeaderDetails, setInvoiceHeaderDetails] = useState([]);
	const [invoiceItemDetails, setInvoiceItemDetails] = useState([]);
	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: invoices(),
		initialStep: 0,
		stepsEnabled: false,
	});

	//Open invoicesDetails
	const handleInvoicesDetailsModal = async (id) => {
		setShowPreviewModal(true);
		setInvoiceDetailsLoading(true);
		try {
			const getData = {
				url: 'getInvoiceDetailsData',
				urlParams: {
					companyId: companyID,
					invoiceID: id,
				},
			};

			const result = await getCall(getData, false);
			const invoiceItemrGetData = {
				url: 'getVendorInvoiceItems',
				urlParams: {
					companyId: companyID,
					invoiceID: id,
				},
			};

			const invoiceItemrResult = await getCall(invoiceItemrGetData, false);
			setInvoiceItemDetails(invoiceItemrResult.data);
			setInvoiceHeaderDetails(result.data);
		} catch (error) {
		} finally {
			setInvoiceDetailsLoading(false);
		}
	};

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'actions',
				cell: ({ getValue, row }) => (
					<div
						className='flex space-x-2 text-lg'
						onClick={(e) => {
							e.stopPropagation(),
								e.preventDefault(),
								handleInvoicesDetailsModal(row.original.qsrInvoiceID);
						}}
					>
						<SlEye />
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
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	useEffect(() => {
		if (companyID && alignmentID && (groupOrUnitAccess || selectedUnit)) {
			fetchData(companyID, alignmentID, groupOrUnitAccess || selectedUnit);
		} else {
			setErrorMessage('An issue occurred while loading the vendors. Please try again later.');
		}
	}, [companyID, alignmentID, groupOrUnitAccess, selectedUnit]);

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

	const fetchData = async (companyID) => {
		await Promise.all([fetchVendors(companyID)]);
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

	const fetchInvoiceReport = async () => {
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

			setInvoiceReportData(result.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Invoice data: ', error);
		}
	};

	useEffect(() => {
		if (selectedUnit && selectedFromDate) {
			fetchInvoiceReport();
		}
	}, [selectedUnit, selectedVendor, selectedFromDate, selectedToDate]);

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setShowUnitModal(false);
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
		setIsBrowseInvoicesClicked(true);
		if (debounceTimer.current) clearTimeout(debounceTimer.current);

		debounceTimer.current = setTimeout(async () => {
			if (e.target.value.length >= 3) {
				setIsBrowseInvoicesClicked(false);
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
			} else if (e.target.value === '') {
				setIsBrowseInvoicesClicked(true);
			}
		}, 500);
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
					name: '',
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
					name: '',
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
					onCallBack={(e) => {}}
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
								extraClass={'w-[219px]'}
							/>
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

				{isError ? (
					<div>{errorMessage}</div>
				) : !isLoading && !selectedUnit ? (
					<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
				) : (
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						<div className='mt-2'>
							<p className='font-medium'>
								Search by Invoice Reference or Total (minimum of 3 characters)
							</p>
							<input
								className='search-bar rounded-full h-[30px] w-[24%] flex items-center outline-none border border-gray-200 p-5 pr-[18px] pl-[18px] shadow-[0_0_10px_rgba(0,0,0,0.08)] my-auto justify-start transition-all hover:border-[var(--tw-primary)]'
								type='text'
								placeholder='Invoice Reference or Total'
								value={searchKey}
								onChange={handleSearchKeyChange}
							/>
						</div>
						<div className='paged-table'>{Table}</div>
					</div>
				)}

				<div>
					<UnitModal
						unitData={unitsAndAreas}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showUnitModal}
						includeAreas={true}
						handleClose={() => {
							setShowUnitModal(false);
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
				<Modal
					isOpen={showPreviewModal}
					title={'Invoice Details'}
					onClose={() => {
						setInvoiceHeaderDetails([]);
						setInvoiceItemDetails([]);
						setShowPreviewModal(!showPreviewModal);
					}}
				>
					<div className='w-full max-w-5xl p-6 overflow-auto bg-white rounded-lg shadow-lg min-w-[940px] min-h-[400px]'>
						<div className='my-4'>
							<div className='text-sm'>
								<span className='font-semibold'>Unit:</span>{' '}
								{invoiceHeaderDetails[0]?.unitName && invoiceHeaderDetails[0]?.unitName}
								<span className='mx-2 font-semibold'>Vendor:</span>{' '}
								{invoiceHeaderDetails[0]?.vendorName && invoiceHeaderDetails[0]?.vendorName}
								<span className='mx-2 font-semibold'>Date:</span> Mon 09/30/2024
								<span className='mx-2 font-semibold'>Invoice Reference:</span>{' '}
								{invoiceHeaderDetails[0]?.vendorInvoiceReference &&
									invoiceHeaderDetails[0]?.vendorInvoiceReference}
								<span className='mx-2 font-semibold'>Total:</span> $
								{invoiceHeaderDetails[0]?.totalAmountIncludingTax &&
									invoiceHeaderDetails[0]?.totalAmountIncludingTax}
							</div>
							<div className='mt-1 text-sm'>
								<span className='font-semibold'>Created By:</span>{' '}
								{invoiceHeaderDetails[0]?.originalFirstName &&
								invoiceHeaderDetails[0]?.originalFirstName !== 'Unknown'
									? invoiceHeaderDetails[0]?.originalFirstName +
									  ' ' +
									  invoiceHeaderDetails[0]?.originalLastName
									: invoiceHeaderDetails[0]?.userFirstName +
									  ' ' +
									  invoiceHeaderDetails[0]?.userLastName}
								<span className='mx-2 font-semibold'>Last Edited By:</span>{' '}
								{invoiceHeaderDetails[0]?.userFirstName &&
									invoiceHeaderDetails[0]?.userFirstName +
										' ' +
										invoiceHeaderDetails[0]?.userLastName}
							</div>
						</div>
						<div className='tableHOC pr-1 max-h-[60vh] overflow-auto'>
							<Loader loading={invoiceDetailLoading} />
							<table className='w-full text-sm border border-collapse border-gray-300'>
								<thead>
									<tr className='text-left bg-blue-200'>
										<th className='p-2 border border-gray-300'>Item Ref#</th>
										<th className='p-2 border border-gray-300'>Description</th>
										<th className='p-2 border border-gray-300'>UOM</th>
										<th className='p-2 border border-gray-300'>Pack/Size</th>
										<th className='p-2 border border-gray-300'>Qty</th>
										<th className='p-2 border border-gray-300'>Price</th>
										<th className='p-2 border border-gray-300'>Tax</th>
										<th className='p-2 border border-gray-300'>Line Total</th>
									</tr>
								</thead>
								<tbody>
									{/* Repeat this row for each item */}
									{invoiceItemDetails.map((item) => (
										<tr className='even:bg-gray-50'>
											<td className='p-2 text-center border border-gray-300'>
												{item.vendorItemReference}
											</td>
											<td className='p-2 border border-gray-300'>{item.description}</td>
											<td className='p-2 text-center border border-gray-300'>
												{item.unitOfMeasure}
											</td>
											<td className='p-2 text-center border border-gray-300'>{item.size}</td>
											<td className='p-2 text-center border border-gray-300'>{item.quantity}</td>
											<td className='p-2 text-center border border-gray-300'>
												${item.price.toFixed(2)}
											</td>
											<td className='p-2 text-center border border-gray-300'>
												${item.taxAmount.toFixed(2)}
											</td>
											<td className='p-2 text-center border border-gray-300'>
												${item.price + item.taxAmount.toFixed(2)}
											</td>
										</tr>
									))}
									{/* <tr className="even:bg-gray-50">
                  <td className="p-2 text-center border border-gray-300">
                    5447738
                  </td>
                  <td className="p-2 border border-gray-300">
                    SYRUP COKE ZERO SUGAR 2.5 GAL
                  </td>
                  <td className="p-2 text-center border border-gray-300">CA</td>
                  <td className="p-2 text-center border border-gray-300">
                    1 / 2.5GAL
                  </td>
                  <td className="p-2 text-center border border-gray-300">1</td>
                  <td className="p-2 text-center border border-gray-300">
                    $54.95
                  </td>
                  <td className="p-2 text-center border border-gray-300">
                    $0.00
                  </td>
                  <td className="p-2 text-center border border-gray-300">
                    $54.95
                  </td>
                </tr> */}
									{/* End of item row */}
								</tbody>
							</table>
						</div>
					</div>
				</Modal>
			</div>
		</>
	);
};

export default Invoices;
