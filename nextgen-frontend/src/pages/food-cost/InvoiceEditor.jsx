import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getCall } from '../../apis/network';
import { useSelector } from 'react-redux';
import {
	ExportOptions,
	PdfBuilder,
	ExcelExport as exportToExcel,
	DateSelector,
	CalendarModal,
	Modal,
	Loader,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import EditableTableHOC, { EditCell, TableCell } from '../../components/table/EditableTableHOC';

const columnHelper = createColumnHelper();

const InvoiceEditor = () => {
	const location = useLocation();
	const { companyID } = useSelector((state) => state.globalState);
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState();
	const [selectedVendor, setSelectedVendor] = useState(0);
	const [selectedVendorName, setSelectedVendorName] = useState();
	const [vendorItems, setVendorItems] = useState([]);
	const [invoiceID, setInvoiceID] = useState(0);
	const [isAddNew, setIsAddNew] = useState(false);
	const [isNewInvoice, setIsNewInvoice] = useState(false);
	const [isCreateNewVendorItemModalOpen, setIsCreateNewVendorItemModalOpen] = useState(false);

	const [invoiceDetails, setInvoiceDetails] = useState({});
	const [invoiceVendorItems, setInvoiceVendorItems] = useState([]);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [comment, setComment] = useState();

	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [addMoreDropdownVisible, setAddMoreDropdownVisible] = useState(false);
	const moreOptionsDropdown = useRef(null);
	const addMoreOptionsDropdown = useRef(null);

	const [specificTimeCheckbox, setSpecificTimeCheckbox] = useState(false);
	const [total, setTotal] = useState(0);
	const [time, setTime] = useState('');

	const [invoicesTotal, setInvoicesTotal] = useState(0);
	const [invoicesTax, setInvoicesTax] = useState(0);
	const [invoicesSubtotal, setInvoicesSubtotal] = useState(0);

	// State variables for loading and error handling
	const [isLoading, setIsLoading] = useState(false);

	const [selectedDate, setSelectedDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		setSelectedUnit(searchParams.get('unitID'));
		setSelectedVendor(searchParams.get('vendorID'));
		setInvoiceID(searchParams.get('invoiceID') || 0);
		setSelectedUnitName(searchParams.get('unitName'));
		setSelectedVendorName(searchParams.get('vendorName'));
		setSelectedDate(new Date(searchParams.get('date')));
		setIsNewInvoice(searchParams.get('newInvoice') === 'true' ? true : false);
	}, [location.search]);

	useEffect(() => {
		if (isNewInvoice && invoiceID === 0) {
			if (selectedUnit && selectedVendor) {
				setIsLoading(true);
				fetchVendorItems().finally(() => setIsLoading(false));
			}
		} else if (invoiceID !== 0) {
			setIsLoading(true);
			Promise.all([fetchInvoiceDetails(), fetchVendorInvoiceItems(), fetchVendorItems()])
				.then(() => setIsLoading(false))
				.catch(() => setIsLoading(false));
		}
	}, [selectedUnit, selectedVendor]);

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
		}
		if (addMoreOptionsDropdown.current && !addMoreOptionsDropdown.current.contains(event.target)) {
			setAddMoreDropdownVisible(false);
		}
	};

	const formattingData = (value) => {
		return value < 0
			? `-$${Math.abs(parseFloat(value)).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })}`
			: `$${parseFloat(value).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })}`;
	};

	const columns = [
		columnHelper.display({
			id: 'actions',
			cell: EditCell,
			size: '80',
		}),
		columnHelper.accessor('mainItem', {
			id: 'mainItem',
			cell: TableCell,
			header: (
				<div className='flex gap-20'>
					<span>Item Ref#</span> <span>Description</span>
				</div>
			),
			size: '300',
			dataPosition: 'text-left',
			meta: {
				type: 'select',
				options: vendorItems.map((item) => ({
					value: `${item.vendorItemReference} - ${item.description}`,
					label: `${item.vendorItemReference} - ${item.description}`,
				})),
			},
		}),
		columnHelper.accessor('unitOfMeasure', {
			id: 'unitOfMeasure',
			header: 'UOM',
			dataPosition: 'text-center',
		}),
		columnHelper.accessor('packSize', {
			id: 'packSize',
			header: 'Pack Size',
			dataPosition: 'text-center',
		}),
		columnHelper.accessor('orderQty', {
			id: 'orderQty',
			header: (
				<div className='flex items-center justify-center gap-1'>
					Quantity <input className='accent-[var(--tw-primary)]' type='checkbox' name='quantity' id='' />
				</div>
			),
			cell: TableCell,
			dataPosition: 'text-center',
		}),
		columnHelper.accessor('price', {
			id: 'price',
			header: (
				<div className='flex items-center justify-center gap-1'>
					Price <input className='accent-[var(--tw-primary)]' type='checkbox' name='price' id='' />
				</div>
			),
			cell: TableCell,
			dataPosition: 'text-center',
		}),
		columnHelper.accessor('tax', {
			id: 'tax',
			header: (
				<div className='flex items-center justify-center gap-1'>
					Tax <input className='accent-[var(--tw-primary)]' type='checkbox' name='tax' id='' />
				</div>
			),
			cell: TableCell,
			dataPosition: 'text-center',
		}),
		columnHelper.accessor('lineTotal', {
			id: 'lineTotal',
			header: 'Line Total',
			cell: ({ row }) =>
				formattingData(
					(
						parseFloat(row.original.price) * parseFloat(row.original.orderQty) +
						parseFloat(row.original.tax)
					).toFixed(2)
				),
			dataPosition: 'text-center',
		}),
	];

	const fetchInvoiceDetails = async () => {
		try {
			setIsLoading(true);
			const getData = {
				url: 'getInvoiceDetailsData',
				urlParams: {
					companyID: companyID,
					invoiceID: invoiceID,
				},
			};

			const result = await getCall(getData);
			setInvoiceDetails(result.data[0]);
			setTotal(result.data[0]?.totalAmountIncludingTax);
			setComment(result.data[0]?.comments);
			setIsLoading(false);
		} catch (error) {
			console.log('Error getting Invoice data: ', error);
		}
	};

	const fetchVendorInvoiceItems = async () => {
		try {
			const getData = {
				url: 'getVendorInvoiceItems',
				urlParams: {
					companyID: companyID,
					invoiceID: invoiceID,
				},
			};

			const result = await getCall(getData);
			const newRow = await result.data?.map((item) => ({
				mainItem: `${item.vendorItemReference} - ${item.description}`,
				vendorItemReference: item.vendorItemReference || '',
				description: item.description || '',
				unitOfMeasure: item.unitOfMeasure || '',
				packSize: item.size || '0.00',
				orderQty: item.quantity || '0',
				price: item.price || '0.00',
				tax: item.taxAmount || '0.00',
				lineTotal: '0.00',
			}));

			setInvoiceVendorItems(newRow);
		} catch (error) {
			console.error('Error getting Invoice data: ', error);
		}
	};

	const fetchVendorItems = async (option) => {
		try {
			setIsAddNew(false);
			const getData = {
				url: 'getVendorItems',
				urlParams: {
					companyID: companyID,
					unitID: selectedUnit,
					vendorID: selectedVendor,
					mode: option ? 'QSRITEMIDN' : 'EDITORVIEW',
					includePriceInfo: option ? 'N' : 'Y',
					otherOptions: option ? option : '',
				},
			};

			const result = await getCall(getData);

			if (option) {
				setVendorItems(result.data);
				const newRow = result.data.map((item) => ({
					mainItem: `${item.vendorItemReference} - ${item.description}`,
					qsrItemID: item.qsrItemID || '',
					vendorItemReference: item.vendorItemReference || '',
					description: item.description || '',
					unitOfMeasure: item.unitOfMeasure || '',
					packSize: `${item.pack} / ${item.size}` || '0.00',
					orderQty: item.orderQty || '0',
					price: item.price || '0.00',
					tax: item.tax || '0.00',
					lineTotal: '0.00',
				}));
				setIsAddNew(false);
				setInvoiceVendorItems((old) => [...old, ...newRow]);
			} else if (isNewInvoice) {
				setVendorItems(result.data.sort((a, b) => a.description.localeCompare(b.description)));
				const firstVendorItem = result.data[0];
				const newRow = [
					{
						mainItem: `${firstVendorItem.vendorItemReference} - ${firstVendorItem.description}`,
						qsrItemID: firstVendorItem.qsrItemID || '',
						vendorItemReference: firstVendorItem.vendorItemReference || '',
						description: firstVendorItem.description || '',
						unitOfMeasure: firstVendorItem.unitOfMeasure || '',
						packSize: `${firstVendorItem.pack} / ${firstVendorItem.size}` || '0.00',
						orderQty: firstVendorItem.orderQty || '0',
						price: '0.00',
						tax: '0.00',
						lineTotal: '0.00',
					},
				];
				setIsAddNew(true);
				setInvoiceVendorItems((old) => [...old, ...newRow]);
			} else {
				setVendorItems(result.data.sort((a, b) => a.description.localeCompare(b.description)));
			}
		} catch (error) {
			console.error('Error getting Invoice data: ', error);
		}
	};

	useEffect(() => {
		const subTotal = invoiceVendorItems?.reduce((acc, item) => acc + item.price * item.orderQty, 0).toFixed(2);
		const tax = invoiceVendorItems?.reduce((acc, item) => acc + parseFloat(item.tax), 0).toFixed(2);
		const total = (parseFloat(subTotal) + parseFloat(tax)).toFixed(2);

		setInvoicesTax(tax);
		setInvoicesSubtotal(subTotal);
		setInvoicesTotal(total);
	}, [invoiceDetails]);

	const handleDeleteInvoice = async () => {
		try {
			setIsLoading(true);
			const postData = {
				url: 'deleteInvoice',
				data: {
					companyId: companyID,
					qsrInvoiceID: invoiceID,
				},
			};

			await getCall(postData);
			setIsLoading(false);
		} catch (error) {
			console.error('Error deleting Invoice: ', error);
		}
	};

	const handleAddItem = () => {
		setIsAddNew(false);
		const newVendorItem = vendorItems.find(
			(item) =>
				!invoiceVendorItems.some((invoiceItem) => item.vendorItemReference === invoiceItem.vendorItemReference)
		);

		if (newVendorItem === undefined) {
			alert('All items have been added');
			return;
		}

		const newRow = {
			mainItem: `${newVendorItem.vendorItemReference} - ${newVendorItem.description}`,
			qsrItemID: newVendorItem.qsrItemID || '',
			vendorItemReference: newVendorItem.vendorItemReference || '',
			description: newVendorItem.description || '',
			unitOfMeasure: newVendorItem.unitOfMeasure || '',
			packSize: `${newVendorItem.pack}/${newVendorItem.size}` || '0.00',
			orderQty: newVendorItem.orderQty || '0',
			price: '0.00',
			tax: '0.00',
			lineTotal: '0.00',
		};
		setIsAddNew(true);
		setInvoiceVendorItems((old) => [...old, newRow]);
	};

	const handlePrintClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!invoiceVendorItems || invoiceVendorItems.length === 0) {
			console.error('Countsheet data is not defined or empty');
			return;
		}

		const pdfData = {
			title: '',
			subHeaders: [
				`Unit: ${selectedUnitName}`,
				`Vendor: ${selectedVendorName}`,
				`Date: ${dateFormat(selectedDate, 'mm-dd-yyyy')}`,
				`Invoice Reference: ${invoiceDetails.vendorInvoiceReference}`,
			],
			exportType: 'print',
			pageOrientation: 'portrait',
			body: [
				{
					type: 'table',
					widths: new Array(columns.length).fill('auto'),
					data: {
						columnHeaders: [
							'Item Ref#',
							'Description',
							'UOM',
							'Pack Size',
							'Quantity',
							'Price',
							'Tax',
							'Line Total',
						],
						rows: invoiceVendorItems.map((row) => [
							{ value: row.vendorItemReference, cellType: 'text', columnName: 'Item Ref#' },
							{ value: row.description, cellType: 'text', columnName: 'Description' },
							{ value: row.unitOfMeasure, cellType: 'text', columnName: 'UOM' },
							{ value: row.packSize, cellType: 'text', columnName: 'Pack Size' },
							{ value: row.orderQty, cellType: 'text', columnName: 'Quantity' },
							{ value: formattingData(row.price), cellType: 'text', columnName: 'Price' },
							{ value: row.tax, cellType: 'text', columnName: 'Tax' },
							{
								value: formattingData(
									parseFloat(row.price) * parseFloat(row.orderQty) + parseFloat(row.tax)
								),
								cellType: 'text',
								columnName: 'Line Total',
							},
						]),
					},
				},
			],
		};

		PdfBuilder(pdfData);
	};

	const handleExcelClick = () => {
		if (invoiceVendorItems.length === 0) return;

		const data = [
			{
				name: '',
				columns: [
					{ name: 'Item Ref#' },
					{ name: 'Description' },
					{ name: 'UOM' },
					{ name: 'Pack Size' },
					{ name: 'Quantity' },
					{ name: 'Price' },
					{ name: 'Tax' },
					{ name: 'Line Total' },
				],
				data: invoiceVendorItems.map((row) => ({
					'Item Ref#': row.vendorItemReference,
					Description: row.description,
					UOM: row.unitOfMeasure,
					'Pack Size': row.packSize,
					Quantity: row.orderQty,
					Price: row.price,
					Tax: row.tax,
					'Line Total': parseFloat(row.price) * parseFloat(row.orderQty) + parseFloat(row.tax),
				})),
			},
		];

		const filename = `Invoice_${selectedUnitName}_${selectedVendorName}_${dateFormat(selectedDate, 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Invoice Info';
		const info = `${selectedUnitName}, Vendor: ${selectedVendorName}, Date: ${dateFormat(
			selectedDate,
			'mm-dd-yyyy'
		)}, Invoice Reference: ${
			invoiceDetails.vendorInvoiceReference
		}, Subtotal: ${invoicesSubtotal}, Tax: ${invoicesTax}, Total: ${invoicesTotal}, Export Date: ${dateFormat(
			new Date(),
			'mm-dd-yyyy hh:MM:ss TT'
		)}`;
		const date = dateFormat(selectedDate, 'mm-dd-yyyy');

		exportToExcel(data, filename, spreadSheetTitle, date, info);
	};

	const Table = (
		<EditableTableHOC
			data={invoiceVendorItems}
			columns={columns}
			setData={setInvoiceVendorItems}
			isAddNew={isAddNew}
			setIsAddNew={setIsAddNew}
		/>
	);

	return (
		<div className='w-[85%] mx-auto h-full'>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>
				{selectedUnitName} - {selectedVendorName} - Invoice
			</h2>
			<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center gap-1'>
					<DateSelector fromDate={selectedDate} isDateRange={false} onClick={() => setShowDateModal(true)} />

					<div className='flex flex-col justify-center rounded-3xl date-selector'>
						<h3 className='mb-1 ml-2 text-xl font-semibold text-nowrap'>Invoice Reference</h3>
						<input
							type='text'
							value={invoiceDetails?.vendorInvoiceReference || ''}
							onChange={(e) =>
								setInvoiceDetails({ ...invoiceDetails, vendorInvoiceReference: e.target.value })
							}
							className='flex items-center justify-between h-[52px] text-left pl-4 capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] outline-none caret-[var(--tw-primary)]'
						/>
					</div>
					<div className='flex flex-col justify-center m-1 rounded-3xl date-selector'>
						<h3 className='mb-1 ml-2 text-xl font-semibold text-nowrap'>Total</h3>
						<input
							type='text'
							className='w-40 pl-4 flex items-center justify-between h-[52px] text-[red] capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] outline-none caret-[red] text-left'
							value={formattingData(total)}
							onChange={(e) => {
								const value = e.target.value;
								if (/^\d*\.?\d*$/.test(value)) {
									setTotal(value);
								}
							}}
							onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
						/>
					</div>
					<div
						className='flex items-center justify-between mt-8  px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)]'
						onClick={() => setShowCommentModal(true)}
					>
						Insert Comment
					</div>

					<div className='relative flex items-center justify-center py-3 mt-8 ml-1 text-center capitalize cursor-pointer w-28 whitespace-nowrap rounded-3xl '>
						<div
							onClick={() => setIsDropdownVisible(!isDropdownVisible)}
							className='items-center justify-center w-full px-6 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
						>
							<span className='cursor-pointer select-none'> More...</span>
						</div>
						{isDropdownVisible && (
							<div
								className='absolute top-[90%] left-0 rounded-xl text-center bg-white  shadow-[0px_5px_20px_-10px_rgba(0,_0,_0,_0.5)] z-10 p-2'
								ref={moreOptionsDropdown}
							>
								<div className='mb-2 option '>
									<button className='w-[100%] bg-[#f9f9f9]'>Summary</button>
								</div>
								<div className='mb-2 option'>
									<button
										disabled={true}
										className={`w-[100%]  bg-[#f9f9f9] ${
											isNewInvoice ? 'cursor-not-allowed text-[#d1d0d0]' : 'cursor-pointer'
										}`}
										onClick={() => {
											isNewInvoice ? null : handleDeleteInvoice;
										}}
									>
										Delete Invoice
									</button>
								</div>
							</div>
						)}
					</div>
					<div className='mt-8 ml-2'>
						<div className='flex gap-1'>
							<input className='accent-[var(--tw-primary)]' type='checkbox' />
							Verified
						</div>
						<div className='flex items-center h-8 gap-1'>
							<input
								className='accent-[var(--tw-primary)]'
								type='checkbox'
								value={specificTimeCheckbox}
								onChange={(e) => setSpecificTimeCheckbox(e.target.checked)}
							/>
							Specific Time
							{specificTimeCheckbox && (
								<input
									type='time'
									value={time}
									onChange={(e) => setTime(e.target.value)}
									className='border [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-[#D3D3D3] px-1 text-center focus:outline-none [&::-webkit-datetime-edit-hour-field:focus]:bg-[var(--tw-primary)] [&::-webkit-datetime-edit-minute-field:focus]:bg-[var(--tw-primary)] [&::-webkit-datetime-edit-second-field:focus]:bg-[var(--tw-primary)] [&::-webkit-datetime-edit-ampm-field:focus]:bg-[var(--tw-primary)]'
								/>
							)}
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includeExcel={true}
						handleExcelClick={handleExcelClick}
						includePrint={true}
						handlePrintClick={handlePrintClick}
						includeSave={true}
						saveTitle='Add New Invoices'
					/>
				</div>
			</header>
			<div className='flex gap-4'>
				<h3>
					Created By:{' '}
					<span className='font-medium'>{`${invoiceDetails?.userFirstName} ${invoiceDetails?.userLastName}`}</span>
				</h3>
				<h3>
					Last Saved By:{' '}
					<span className='font-medium'>{`${invoiceDetails?.userFirstName} ${invoiceDetails?.userLastName}`}</span>
				</h3>
				{!showCommentModal && comment !== undefined && comment.length > 0 ? (
					<p className='flex-1 truncate max-w-[800px]'>
						Comment:{' '}
						<span onClick={() => setShowCommentModal(true)} className='underline cursor-pointer '>
							{comment}
						</span>
					</p>
				) : (
					''
				)}
			</div>

			<div className='relative w-full min-h-64'>
				<Loader loading={isLoading} />
				{!isLoading &&
					(invoiceVendorItems.length > 0 ? (
						<div className='paged-table'>{Table}</div>
					) : (
						<div className='mt-10 text-xl font-medium text-center'>No data available</div>
					))}
			</div>

			<div className='flex mt-6 items-center justify-between rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center gap-2'>
					<button
						className='flex items-center gap-2 px-4 py-3 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
						disabled={isAddNew}
						onClick={handleAddItem}
					>
						Add Item
					</button>
					<div className='relative flex items-center justify-center text-center capitalize cursor-pointer w-28 whitespace-nowrap rounded-3xl'>
						<div
							onClick={() => setAddMoreDropdownVisible(!addMoreDropdownVisible)}
							className='items-center justify-center w-full px-6 py-3 text-center capitalize cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
						>
							<span className='cursor-pointer select-none'> More...</span>
						</div>
						{addMoreDropdownVisible && (
							<div
								className='absolute bottom-[106%] left-0 rounded-xl text-center bg-white shadow-[0px_5px_20px_-10px_rgba(0,_0,_0,_0.5)] z-10 p-2'
								ref={addMoreOptionsDropdown}
							>
								<div className='mb-2 option'>
									<button
										className='w-[100%] bg-[#f9f9f9]'
										onClick={() => {
											fetchVendorItems('LatestInvoice');
											setAddMoreDropdownVisible(false);
										}}
									>
										Add Items From Latest Invoice
									</button>
								</div>
								<div className='mb-2 option'>
									<button
										className='w-[100%] bg-[#f9f9f9]'
										onClick={() => {
											fetchVendorItems(
												`PurchasedSince=${dateFormat(
													new Date(new Date().setDate(new Date().getDate() - 6)),
													'yyyy-mm-dd'
												)}`
											);
											setAddMoreDropdownVisible(false);
										}}
									>
										Add Items From Last 7 days
									</button>
								</div>
								<div className='mb-2 option'>
									<button
										className='w-[100%] bg-[#f9f9f9]'
										onClick={() => {
											fetchVendorItems(
												`PurchasedSince=${dateFormat(
													new Date(new Date().setDate(new Date().getDate() - 30)),
													'yyyy-mm-dd'
												)}`
											);
											setAddMoreDropdownVisible(false);
										}}
									>
										Add Items From Last 30 days
									</button>
								</div>
								<div className='mb-2 option'>
									<button
										className='w-[100%] bg-[#f9f9f9]'
										onClick={() => {
											setIsCreateNewVendorItemModalOpen(true);
											setAddMoreDropdownVisible(false);
										}}
									>
										Create New Vendor Item
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className='flex flex-col items-end'>
					<span>Subtotal: ${invoicesSubtotal}</span> <span>Tax: ${invoicesTax}</span>{' '}
					<span className='text-[red]'>Total: ${invoicesTotal}</span>
				</div>
			</div>

			<CalendarModal
				handleClose={() => setShowDateModal(false)}
				modalOpen={showDateModal}
				isDateRange={false}
				handleDateSelection={(date) => setSelectedDate(date)}
				handleFromDateChange={(fromDate) => setSelectedDate(fromDate)}
				selectedFromDate={selectedDate}
			/>
			<Modal
				isOpen={showCommentModal}
				title={'Insert Comment'}
				onClose={() => {
					setShowCommentModal(!showCommentModal);
				}}
			>
				<div className='h-32 m-4 w-96'>
					<textarea
						className='w-full h-full block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border-2 border-[var(--tw-primary)] resize-none focus:outline-[var(--tw-primary)] caret-[var(--tw-primary)]'
						name=''
						id=''
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder='Enter your comment here...'
					></textarea>
				</div>
			</Modal>
			<Modal
				isOpen={isCreateNewVendorItemModalOpen}
				title={'Create New Vendor Item'}
				onClose={() => {
					setIsCreateNewVendorItemModalOpen(!isCreateNewVendorItemModalOpen);
				}}
			>
				<div className='max-w-md p-6 mx-auto '>
					<h3 className='font-medium'>Vendor: {selectedVendorName}</h3>
					<form className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block'>Vendor Item Reference*</label>
								<input
									type='text'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
								/>
							</div>
							<div>
								<label className='block'>Accounting Code</label>
								<select className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'>
									<option value=''>Select</option>
								</select>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block'>Description*</label>
								<input
									type='text'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
								/>
							</div>
							<div>
								<label className='block'>UOM*</label>
								<input
									type='text'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block'>Pack</label>
								<input
									type='text'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
								/>
							</div>
							<div>
								<label className='block'>Size</label>
								<input
									type='text'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
								/>
							</div>
						</div>

						<div className='flex justify-center mt-4 space-x-4'>
							<button
								type='button'
								className='flex items-center gap-2 px-4 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
							>
								Create
							</button>
							<button
								type='button'
								className='flex items-center gap-2 px-4 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
};

export default InvoiceEditor;
