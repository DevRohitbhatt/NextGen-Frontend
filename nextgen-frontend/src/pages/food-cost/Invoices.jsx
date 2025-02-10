import { useEffect, useMemo, useRef, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector, useDispatch } from 'react-redux';
import invoices from '../../assets/introJSSteps/invoices';
import { Link } from 'react-router-dom';
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
	Dropdown,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { SlEye } from 'react-icons/sl';
import { formattingData } from './../../functions/formatingCurrency';

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
	const [showAddInvoicesModal, setShowAddInvoicesModal] = useState();
	const [unitDropdownData, setUnitDropdownData] = useState([]);
	const [vendorDropdownData, setVendorDropdownData] = useState([]);
	const [selectedDropdownUnit, setSelectedDropdownUnit] = useState();
	const [selectedDropdownVendor, setSelectedDropdownVendor] = useState();

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isNewInvoiceLoading, setIsNewInvoiceLoading] = useState(false);
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
	const [showWarnings, setShowWarnings] = useState(false);
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

	useEffect(() => {
		if (unitsAndAreas && vendorsList) {
			const unitsList =
				unitsAndAreas?.units?.map((unit) => {
					return {
						id: unit.unitID,
						name: unit.unitName,
					};
				}) || [];
			const vendorsListData =
				vendorsList?.data?.map((vendor) => {
					return {
						id: vendor.vendorID,
						name: vendor.vendorName,
					};
				}) || [];
			setUnitDropdownData(unitsList);
			setVendorDropdownData(vendorsListData);
		}
	}, [unitsAndAreas, vendorsList]);

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
			console.error('Error getting default dates: ', error);
		} finally {
			setInvoiceDetailsLoading(false);
		}
	};

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) => (
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
				cell: ({ getValue }) => formattingData(getValue()),
				dataType: 'currency',
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

	useEffect(() => {
		if (selectedUnit) {
			setSelectedDropdownUnit(unitDropdownData?.find((unit) => unit.id === selectedUnit)?.name);
		}
	}, [selectedUnit]);

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

	const openInvoiceEditor = (row) => {
		window.open(
			`/InvoiceEditor?unitID=${row.unitID}&unitName=${row.unitName}&vendorID=${row.vendorID}&vendorName=${row.name}&date=${row.date}&invoiceID=${row.qsrInvoiceID}&lastEditedBy=${row.lastEditedBy}&invoiceReference=${row.vendorInvoiceReference}&totalAmount=${row.totalAmountIncludingTax}&newInvoice=false&companyID=${companyID}`,
			'_blank'
		);
	};

	const handleAddNewInvoice = async () => {
		try {
			setIsNewInvoiceLoading(true);
			setShowAddInvoicesModal(false);
			const getData = {
				url: 'getVendorItems',
				urlParams: {
					companyID: companyID,
					unitID: unitDropdownData?.find((unit) => unit.name === selectedDropdownUnit)?.id,
					vendorID: vendorDropdownData?.find((vendor) => vendor.name === selectedDropdownVendor)?.id,
					mode: 'EDITORVIEW',
					includePriceInfo: 'Y',
					otherOptions: '',
				},
			};

			const result = await getCall(getData);

			if (result.data.length > 0) {
				window.open(
					`/InvoiceEditor?unitID=${
						unitDropdownData?.find((unit) => unit.name === selectedDropdownUnit)?.id
					}&unitName=${selectedDropdownUnit}&vendorID=${
						vendorDropdownData?.find((vendor) => vendor.name === selectedDropdownVendor)?.id
					}&vendorName=${selectedDropdownVendor}&date=${new Date()}&newInvoice=true&companyID=${companyID}`,
					'_blank'
				);
			} else {
				setShowAddInvoicesModal(false);
				setShowWarnings(true);
			}
			setIsNewInvoiceLoading(false);
		} catch (error) {
			console.error('Error getting Invoice data: ', error);
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
									value:
										column.dataType === 'currency'
											? formattingData(row[column.id])
											: row[column.id] || '0 ',
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
			if (invoiceReportData.length < 1) return;

			const data = [
				{
					name: '',
					columns: columns.slice(1).map((column) => ({ name: column.header, filterButton: true })),
					data: invoiceReportData.map((row) =>
						columns
							.slice(1)
							.map((column) =>
								column.dataType === 'currency' ? formattingData(row[column.id]) : row[column.id]
							)
					),
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
					data: searchInvoiceData.map((row) =>
						columns
							.slice(1)
							.map((column) =>
								column.dataType === 'currency' ? formattingData(row[column.id]) : row[column.id]
							)
					),
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
					onCallBack={(row) => openInvoiceEditor(row)}
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
			<div className='w-[98%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-2 mb-2 text-[20px] leading-tight text-left pageTitle'>Invoices</h2>

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
							<DateSelector
								toDate={selectedToDate}
								fromDate={selectedFromDate}
								isDateRange={true}
								onClick={() => setShowDateModal(true)}
								extraClass={'w-[219px]'}
							/>
							<VendorSelector
								vendorID={selectedVendor}
								vendorName={selectedVendorName}
								setVendorName={setSelectedVendorName}
								onClick={() => setVendorShowModal(true)}
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
							includeAdd={true}
							addTitle={'Add New Invoice'}
							handleAddClick={() => setShowAddInvoicesModal(true)}
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

				{isNewInvoiceLoading && <Loader loading={isNewInvoiceLoading} />}

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
						<div className='flex justify-between my-4'>
							<div className='flex gap-4 text-sm'>
								<span className='flex flex-col'>
									Unit:
									<span className='font-semibold'>
										{invoiceHeaderDetails[0]?.unitName && invoiceHeaderDetails[0]?.unitName}
									</span>
								</span>
								<span className='flex flex-col'>
									Vendor:
									<span className='font-semibold'>
										{invoiceHeaderDetails[0]?.vendorName && invoiceHeaderDetails[0]?.vendorName}
									</span>
								</span>
								<span className='flex flex-col'>
									Date:{' '}
									<span className='font-semibold'>
										{dateFormat(invoiceHeaderDetails[0]?.date, 'ddd yyyy-mm-dd')}
									</span>
								</span>
								<span className='flex flex-col'>
									Invoice Reference:
									<span className='font-semibold'>
										{invoiceHeaderDetails[0]?.vendorInvoiceReference}
									</span>
								</span>
								<span className='flex flex-col'>
									Total:
									<span className='font-semibold'>
										{formattingData(invoiceHeaderDetails[0]?.totalAmountIncludingTax)}
									</span>
								</span>
							</div>
							<div className='mt-1 text-sm'>
								<span className='flex gap-1'>
									Created By:{' '}
									<span>
										{invoiceHeaderDetails[0]?.originalFirstName &&
										invoiceHeaderDetails[0]?.originalFirstName !== 'Unknown'
											? invoiceHeaderDetails[0]?.originalFirstName +
											  ' ' +
											  invoiceHeaderDetails[0]?.originalLastName
											: invoiceHeaderDetails[0]?.userFirstName +
											  ' ' +
											  invoiceHeaderDetails[0]?.userLastName}
									</span>
								</span>{' '}
								<span className=''>
									Last Edited By:{' '}
									<span>
										{invoiceHeaderDetails[0]?.userFirstName &&
											invoiceHeaderDetails[0]?.userFirstName +
												' ' +
												invoiceHeaderDetails[0]?.userLastName}
									</span>
								</span>{' '}
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
									{invoiceItemDetails.map((item) => (
										<tr className='even:bg-gray-50' key={item.vendorItemReference}>
											<td className='p-2 text-center border border-gray-300'>
												{item.vendorItemReference}
											</td>
											<td className='p-2 border border-gray-300'>{item.description}</td>
											<td className='p-2 text-center border border-gray-300'>
												{item.unitOfMeasure}
											</td>
											<td className='p-2 text-center border border-gray-300'>
												{item.pack
													? item.size
														? `${item.pack}/${item.size}`
														: item.pack
													: item.size || ''}
											</td>
											<td className='p-2 text-center border border-gray-300'>{item.quantity}</td>
											<td className='p-2 text-center border border-gray-300'>
												{formattingData(item.price)}
											</td>
											<td className='p-2 text-center border border-gray-300'>
												{formattingData(item.taxAmount)}
											</td>
											<td className='p-2 text-center border border-gray-300'>
												{formattingData(item.price * item.quantity + item.taxAmount)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</Modal>
				<Modal
					isOpen={showAddInvoicesModal}
					title={'Add New Invoice'}
					onClose={() => {
						setShowAddInvoicesModal(!showAddInvoicesModal);
					}}
				>
					<div className='flex flex-col items-center gap-3 p-4 min-w-96'>
						<Dropdown
							title='Unit'
							options={unitDropdownData}
							selectedOption={selectedDropdownUnit}
							onOptionChange={(unit) => setSelectedDropdownUnit(unit)}
							isSearch={true}
						/>
						<Dropdown
							title='Vendor'
							options={vendorDropdownData}
							selectedOption={selectedDropdownVendor}
							onOptionChange={(unit) => setSelectedDropdownVendor(unit)}
							isSearch={true}
						/>
						<button
							className={`flex items-center gap-2 px-4 py-3 border-solid focus:outline-none relative rounded-none border transition-colors duration-[0.25s] delay-[0.0833s] mt-2 ${
								!selectedDropdownUnit || !selectedDropdownVendor
									? 'border-[#D3D3D3] bg-gray-200 hover:border-[#d3d3d3] text-[#D3D3D3] hover:text-[#D3D3D3] cursor-not-allowed'
									: 'border-[var(--tw-primary)] hover:bg-[var(--tw-primary)] text-[var(--tw-primary)] hover:text-white shadow-[inset_0_0_0_1px_var(--tw-primary)] tailwind-button'
							}`}
							onClick={!selectedDropdownUnit || !selectedDropdownVendor ? null : handleAddNewInvoice}
						>
							New Invoice
						</button>
					</div>
				</Modal>
				<Modal title={'No Vendor Item'} isOpen={showWarnings} onClose={() => setShowWarnings(false)}>
					<div className='p-4 w-[440px]'>
						<p className='text-center text-[var(--tw-primary)]'>
							{`There should be at least one vendor item in the vendor '${selectedDropdownVendor}' prior to creating a new Invoice.`}
						</p>
					</div>
				</Modal>
			</div>
		</>
	);
};

export default Invoices;
