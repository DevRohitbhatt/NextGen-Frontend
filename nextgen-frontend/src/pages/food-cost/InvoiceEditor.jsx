import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { deleteCall, getCall, postCall } from '../../apis/network';
import { useSelector } from 'react-redux';
import {
	ExportOptions,
	PdfBuilder,
	ExcelExport as exportToExcel,
	DateSelector,
	CalendarModal,
	Modal,
	Loader,
	Dropdown,
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { formattingData } from '../../functions/formatingCurrency';
import CurrencyInput from 'react-currency-input-field';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditableTableHOC, { EditCell, TableCell } from '../../components/table/EditableTableHOC';

const columnHelper = createColumnHelper();

const InvoiceEditor = () => {
	const location = useLocation();
	const [companyID, setCompanyID] = useState(0);
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState();
	const [selectedVendor, setSelectedVendor] = useState(0);
	const [selectedVendorName, setSelectedVendorName] = useState();
	const [vendorItems, setVendorItems] = useState([]);
	const [invoiceID, setInvoiceID] = useState(0);
	const [invoiceRef, setInvoiceRef] = useState('');
	const [isAddNew, setIsAddNew] = useState(false);
	const [isNewInvoice, setIsNewInvoice] = useState(false);
	const [isCreateNewVendorItemModalOpen, setIsCreateNewVendorItemModalOpen] = useState(false);
	const [isInoviceSummaryModalOpen, setIsInoviceSummaryModalOpen] = useState(false);
	const [isEditModeOn, setIsEditModeOn] = useState(false);
	const [verified, setVerified] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

	const [invoiceDetails, setInvoiceDetails] = useState({});
	const [invoiceVendorItems, setInvoiceVendorItems] = useState([]);
	const [invoiceSummaryData, setInvoiceSummaryData] = useState([]);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [comment, setComment] = useState();

	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [addMoreDropdownVisible, setAddMoreDropdownVisible] = useState(false);
	const moreOptionsDropdown = useRef(null);
	const addMoreOptionsDropdown = useRef(null);

	const [specificTimeCheckbox, setSpecificTimeCheckbox] = useState(false);
	const [total, setTotal] = useState('0.00');
	const [time, setTime] = useState('');

	const [invoicesTotal, setInvoicesTotal] = useState(0);
	const [invoicesTax, setInvoicesTax] = useState(0);
	const [invoicesSubtotal, setInvoicesSubtotal] = useState(0);
	const [newVendorItem, setNewVendorItem] = useState({
		vendorItemReference: '',
		accountingCode: '',
		description: '',
		unitOfMeasure: '',
		pack: '',
		size: '',
		orderQty: '0',
		price: '0.00',
		tax: '0.00',
		lineTotal: '0.00',
	});

	const handleNewVendorItemChange = (e) => {
		const { name, value } = e.target;
		setNewVendorItem((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// State variables for loading and error handling
	const [isLoading, setIsLoading] = useState(false);
	const [isInvoiceSummaryLoading, setIsInvoiceSummaryLoading] = useState(false);

	const [selectedDate, setSelectedDate] = useState();
	const [showDateModal, setShowDateModal] = useState(false);

	const [selectedSummaryOption, setSelectedSummaryOption] = useState('Item Price Changes');
	const summaryOptions = [
		{ name: 'Department Only', value: 'departmentonly' },
		{ name: 'Department/Subdepartment', value: 'departmentsubdepartment' },
		{ name: 'GL Code', value: 'glcode' },
		{ name: 'Item Price Changes', value: 'itempricechanges' },
	];

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
		setCompanyID(searchParams.get('companyID'));
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

	useEffect(() => {
		const subTotal = invoiceVendorItems
			?.reduce((acc, item) => acc + parseFloat(item.price.replace(/,/g, '')) * parseFloat(item.orderQty), 0)
			.toFixed(2);
		const tax = invoiceVendorItems
			?.reduce((acc, item) => acc + parseFloat(item.tax.replace(/,/g, '')), 0)
			.toFixed(2);
		const total = (parseFloat(subTotal) + parseFloat(tax)).toFixed(2);

		setInvoicesTax(tax);
		setInvoicesSubtotal(subTotal);
		setInvoicesTotal(total);
	}, [invoiceVendorItems]);

	useEffect(() => {
		if (selectedUnit && selectedVendor) {
			fetchInvoiceSummary();
		}
	}, [selectedSummaryOption]);

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
		}
		if (addMoreOptionsDropdown.current && !addMoreOptionsDropdown.current.contains(event.target)) {
			setAddMoreDropdownVisible(false);
		}
	};

	const columns = useMemo(
		() => [
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
					isNew: isAddNew,
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
				header: 'Pack/Size',
				dataPosition: 'text-center',
			}),
			columnHelper.accessor('orderQty', {
				id: 'orderQty',
				header: (
					<div className='flex items-center justify-center gap-1'>
						Quantity{' '}
						<input className='accent-[var(--tw-primary)]' type='checkbox' checked name='quantity' id='' />
					</div>
				),
				cell: TableCell,
				dataPosition: 'text-center',
			}),
			columnHelper.accessor('price', {
				id: 'price',
				header: (
					<div className='flex items-center justify-center gap-1'>
						Price{' '}
						<input className='accent-[var(--tw-primary)]' type='checkbox' checked name='price' id='' />
					</div>
				),
				cell: TableCell,
				dataPosition: 'text-center',
				meta: {
					dataType: 'currency',
				},
			}),
			columnHelper.accessor('tax', {
				id: 'tax',
				header: (
					<div className='flex items-center justify-center gap-1'>
						Tax <input className='accent-[var(--tw-primary)]' type='checkbox' checked name='tax' id='' />
					</div>
				),
				cell: TableCell,
				dataPosition: 'text-center',
				meta: {
					dataType: 'currency',
				},
			}),
			columnHelper.accessor('lineTotal', {
				id: 'lineTotal',
				header: 'Line Total',
				cell: ({ row }) =>
					formattingData(
						(
							parseFloat(row.original.price.replace(/,/g, '')) * parseFloat(row.original.orderQty) +
							parseFloat(row.original.tax.replace(/,/g, ''))
						).toFixed(2)
					),
				dataPosition: 'text-center',
			}),
		],
		[isAddNew, vendorItems]
	);

	const summaryColumns = useMemo(() => {
		const calculateFooterTotal = (table, accessor) =>
			formattingData(
				table.getCoreRowModel().rows?.reduce((acc, row) => acc + parseFloat(row.original[accessor]), 0)
			);

		switch (selectedSummaryOption) {
			case 'Item Price Changes':
				return [
					columnHelper.accessor('description', {
						id: 'description',
						header: <div className='w-full text-left'>Description</div>,
						cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
					}),
					columnHelper.accessor('currentItemPrice', {
						id: 'currentItemPrice',
						header: 'Current',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
					}),
					columnHelper.accessor('lastItemPrice', {
						id: 'lastItemPrice',
						header: 'Last',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
					}),
					columnHelper.accessor('itemPriceDifference', {
						id: 'itemPriceDifference',
						header: 'Diff',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
					}),
				];
			case 'Department Only':
				return [
					columnHelper.accessor('description', {
						id: 'description',
						header: <div className='w-full text-left'>Department</div>,
						cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
						footer: 'Summary Total',
					}),
					columnHelper.accessor('lineItemTax', {
						id: 'lineItemTax',
						header: 'Tax',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
						footer: ({ table }) => (
							<div className='text-center'>{calculateFooterTotal(table, 'lineItemTax')}</div>
						),
					}),
					columnHelper.accessor('lineItemTotal', {
						id: 'lineItemTotal',
						header: 'Total',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
						footer: ({ table }) => (
							<div className='text-center'>{calculateFooterTotal(table, 'lineItemTotal')}</div>
						),
					}),
				];
			case 'Department/Subdepartment':
				return [
					columnHelper.accessor('description', {
						id: 'description',
						header: <div className='w-full text-left'>Dept/SubDept</div>,
						cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
						footer: 'Summary Total',
					}),
					columnHelper.accessor('lineItemTotal', {
						id: 'lineItemTotal',
						header: 'Total',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
						footer: ({ table }) => (
							<div className='text-center'>{calculateFooterTotal(table, 'lineItemTotal')}</div>
						),
					}),
				];
			default:
				return [
					columnHelper.accessor('description', {
						id: 'description',
						header: <div className='w-full text-left'>GL Code</div>,
						cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
						footer: 'Summary Total',
					}),
					columnHelper.accessor('lineItemTax', {
						id: 'lineItemTax',
						header: 'Tax',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
						footer: ({ table }) => (
							<div className='text-center'>{calculateFooterTotal(table, 'lineItemTax')}</div>
						),
					}),
					columnHelper.accessor('lineItemTotal', {
						id: 'lineItemTotal',
						header: 'Total',
						cell: ({ getValue }) => formattingData(parseFloat(getValue())),
						footer: ({ table }) => (
							<div className='text-center'>{calculateFooterTotal(table, 'lineItemTotal')}</div>
						),
					}),
				];
		}
	}, [selectedSummaryOption]);

	const fetchInvoiceDetails = async () => {
		try {
			const getData = {
				url: 'getInvoiceDetailsData',
				urlParams: {
					companyID: companyID,
					invoiceID: invoiceID,
				},
			};

			const result = await getCall(getData);
			setInvoiceDetails(result.data[0]);
			setInvoiceRef(result.data[0]?.vendorInvoiceReference);
			setTotal(result.data[0]?.totalAmountIncludingTax);
			setComment(result.data[0]?.comments);
			setVerified(result.data[0]?.status == 'Ready' ? true : false);
			if (result.data[0]?.date && dateFormat(result.data[0].date, 'HH:MM:ss') !== '00:00:00') {
				setSpecificTimeCheckbox(true);
			}
			if (result.data[0]?.date) {
				const dateTime = new Date(result.data[0].date);
				const times = dateFormat(dateTime, 'HH:MM');
				setTime(times);
			}
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
				qsrItemID: item.qsrItemID,
				vendorItemReference: item.vendorItemReference || '',
				description: item.description || '',
				unitOfMeasure: item.unitOfMeasure || '',
				packSize: item.pack ? (item.size ? `${item.pack}/${item.size}` : item.pack) : item.size || '',
				orderQty: item.quantity || '0',
				price: item.price.toFixed(2) || '0.00',
				tax: item.taxAmount.toFixed(2) || '0.00',
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

	const handleDeleteInvoice = async () => {
		try {
			const deleteData = {
				url: 'deleteInvoice',
				urlParams: {
					companyId: companyID,
					qsrInvoiceID: invoiceID,
				},
			};

			const result = await deleteCall(deleteData);
			console.log('result', result);

			if (result.message === '10001' || result.status === 200) {
				toast.success('Invoice deleted successfully!');
				window.location.href = '/invoices';
			}
		} catch (error) {
			console.error('Error deleting Invoice: ', error);
		}
	};

	const fetchInvoiceSummary = async () => {
		try {
			setIsInvoiceSummaryLoading(true);
			const getData = {
				url: 'getInvoiceSummary',
				urlParams: {
					companyID: companyID,
					unitID: selectedUnit,
					vendorID: selectedVendor,
					mode: 'QSRItemID',
					includePriceInfo: 'Y',
					otherOptions: `PurchasedBefore=${dateFormat(selectedDate, 'mm/dd/yy')}|PurchasedSince=${dateFormat(
						new Date(selectedDate).setFullYear(new Date(selectedDate).getFullYear() - 1),
						'mm/dd/yy'
					)}`,
					qsrInvoiceID: invoiceID,
					summaryType: summaryOptions.find((option) => option.name === selectedSummaryOption).value,
				},
			};

			const result = await getCall(getData);
			setInvoiceSummaryData(result.data);
			setIsInvoiceSummaryLoading(false);
		} catch (error) {
			console.error('Error getting Invoice Summary: ', error);
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
			packSize: `${newVendorItem.pack}/${newVendorItem.size}` || '',
			orderQty: newVendorItem.orderQty || '0',
			price: '0.00',
			tax: '0.00',
			lineTotal: '0.00',
		};
		setIsAddNew(true);
		setInvoiceVendorItems((old) => [...old, newRow]);
	};

	const handlePDFClick = () => {
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
			exportType: 'pdf',
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
							{ value: formattingData(row.tax), cellType: 'text', columnName: 'Tax' },
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

	const createNewVendorItem = async () => {
		try {
			setIsCreateNewVendorItemModalOpen(false);

			const postData = {
				url: 'addVendorItem',
				urlParams: {
					companyID: companyID,
					vendorID: selectedVendor,
					vendorItemReference: newVendorItem.vendorItemReference,
					unitOfMeasure: newVendorItem.unitOfMeasure,
					companyGLCode: '',
					description: newVendorItem.description,
					pack: newVendorItem.pack,
					size: newVendorItem.size,
					qSRInventoryItemID: '0',
					fixedPrice: 0,
					contractPrice: 0,
					contractExpirationDate: dateFormat(new Date(), 'yyyy-mm-dd'),
					manufacturerName: '',
					manufacturerItemReference: '',
					vendorMargin: 0,
				},
			};

			const result = await postCall(postData);
			if (result.message === '10001' || result.status === 200) {
				toast.success('Vendor Item created successfully!');
				vendorItems.unshift(newVendorItem);
				handleAddItem();
			}
		} catch (error) {
			console.error('Error creating new Vendor Item: ', error);
		}
	};

	const handleSaveClick = async () => {
		try {
			if (isEditModeOn) {
				toast.warn('Invoice is in edit mode!');
				return;
			} else if (invoiceRef === '' || parseFloat(total || 0) !== parseFloat(invoicesTotal)) {
				toast.warn(
					invoiceRef === ''
						? 'Please enter Invoice Reference!'
						: 'Invoice total does not match calculated total!'
				);
				return;
			} else {
				toast.info('Saving Invoice...');
				const formattedDate = specificTimeCheckbox
					? `${dateFormat(selectedDate, 'yyyy-mm-dd')} ${time}`
					: dateFormat(selectedDate, 'yyyy-mm-dd');

				const data = {
					companyID,
					unitID: selectedUnit,
					vendorID: selectedVendor,
					date: new Date(formattedDate),
					invoiceType: isNewInvoice ? 'DI' : invoiceDetails?.invoiceType,
					originalVendorInvoiceReference: '',
					vendorInvoiceReference: invoiceRef,
					totalAmountIncludingTax: +total,
					taxAmount: +invoicesTax,
					invoiceSource: userID,
					comments: comment || '',
					checkNumber: isNewInvoice ? '' : invoiceDetails?.checkNumber,
					status: isNewInvoice ? '' : invoiceDetails?.status !== 'Imported' ? (verified ? 'Ready' : '') : '',
					qsrInvoiceID: invoiceID,
					invoiceItemModels: invoiceVendorItems.map(({ qsrItemID, orderQty, price, tax }) => ({
						qsrInvoiceID: invoiceID,
						qsrItemID: qsrItemID,
						quantity: +orderQty,
						price: +price,
						taxAmount: +tax,
					})),
				};

				const postData = {
					url: 'saveInvoice',
					bodyData: data,
				};

				const result = await postCall(postData);
				if (result.message === '10001' || result.status === 200) {
					toast.success('Invoice saved successfully!');
				}
			}
		} catch (error) {
			console.error('Error saving Invoice: ', error);
		}
	};

	const Table = (
		<EditableTableHOC
			data={invoiceVendorItems}
			columns={columns}
			setData={setInvoiceVendorItems}
			isAddNew={isAddNew}
			setIsAddNew={setIsAddNew}
			isEditModeOn={isEditModeOn}
			setEditModeOn={setIsEditModeOn}
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
							value={invoiceRef}
							onChange={(e) => setInvoiceRef(e.target.value)}
							className='flex items-center justify-between h-[52px] text-left pl-4 capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] outline-none caret-[var(--tw-primary)]'
						/>
					</div>
					<div className='flex flex-col justify-center m-1 rounded-3xl date-selector'>
						<h3 className='mb-1 ml-2 text-xl font-semibold text-nowrap'>Total</h3>
						<CurrencyInput
							prefix='$'
							className='w-40 pl-4 flex items-center justify-between h-[52px] text-[red] capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] outline-none caret-[red] text-left placeholder:text-[red]'
							value={total}
							placeholder='$0.00'
							decimalsLimit={2}
							onValueChange={(value) => setTotal(value)}
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
									<button
										className='w-[100%] bg-[#f9f9f9]'
										onClick={() => {
											setIsInoviceSummaryModalOpen(true);
											fetchInvoiceSummary();
											setIsDropdownVisible(false);
										}}
									>
										Summary
									</button>
								</div>
								<div className='mb-2 option'>
									<button
										disabled={isNewInvoice ? true : false}
										className={`w-[100%]  bg-[#f9f9f9] ${
											isNewInvoice ? 'cursor-not-allowed text-[#d1d0d0]' : 'cursor-pointer'
										}`}
										onClick={() => {
											setIsDeleteConfirmModalOpen(true);
											setIsDropdownVisible(false);
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
							<input
								className='accent-[var(--tw-primary)]'
								type='checkbox'
								checked={verified}
								onChange={(e) => setVerified(e.target.checked)}
							/>
							Verified
						</div>
						<div className='flex items-center h-8 gap-1'>
							<input
								className='accent-[var(--tw-primary)]'
								type='checkbox'
								checked={specificTimeCheckbox}
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
						includePDF={true}
						handlePDFClick={handlePDFClick}
						includeSave={true}
						handleSaveClick={handleSaveClick}
						saveTitle='Save Invoice'
					/>
				</div>
			</header>
			<div className='flex gap-4'>
				<h3>
					Created By:{' '}
					<span className='font-medium'>
						{isNewInvoice
							? 'QsrSupport'
							: isLoading
							? 'Loading...'
							: `${invoiceDetails?.userFirstName} ${invoiceDetails?.userLastName}`}
					</span>
				</h3>
				<h3>
					Last Saved By:{' '}
					<span className='font-medium'>
						{isNewInvoice
							? 'QsrSupport'
							: isLoading
							? 'Loading...'
							: `${invoiceDetails?.userFirstName} ${invoiceDetails?.userLastName}`}
					</span>
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
					<span>Subtotal: {formattingData(invoicesSubtotal)}</span>{' '}
					<span>Tax: {formattingData(invoicesTax)}</span>{' '}
					<span className='text-[red]'>Total: {formattingData(invoicesTotal)}</span>
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
					<form
						className='space-y-4'
						onSubmit={(e) => {
							e.preventDefault();
							if (
								!newVendorItem.vendorItemReference ||
								!newVendorItem.description ||
								!newVendorItem.unitOfMeasure
							) {
								toast.error('Please fill in all required fields!');
								return;
							}
							createNewVendorItem();
						}}
					>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block'>Vendor Item Reference*</label>
								<input
									type='text'
									name='vendorItemReference'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
									required
									onChange={handleNewVendorItemChange}
								/>
							</div>
							<div>
								<label className='block'>Accounting Code</label>
								<select
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
									disabled
								>
									<option value=''>Select</option>
								</select>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block'>Description*</label>
								<input
									type='text'
									name='description'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
									required
									onChange={handleNewVendorItemChange}
								/>
							</div>
							<div>
								<label className='block'>UOM*</label>
								<input
									type='text'
									name='unitOfMeasure'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
									required
									onChange={handleNewVendorItemChange}
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block'>Pack</label>
								<input
									type='text'
									name='pack'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
									onChange={handleNewVendorItemChange}
								/>
							</div>
							<div>
								<label className='block'>Size</label>
								<input
									type='text'
									name='size'
									className='w-full p-2 mt-1 border caret-[var(--tw-primary)] rounded-md focus:outline-[var(--tw-primary)]'
									onChange={handleNewVendorItemChange}
								/>
							</div>
						</div>

						<div className='flex justify-center mt-4 space-x-4'>
							<button
								type='submit'
								className='flex items-center gap-2 px-4 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
							>
								Create
							</button>
							<button
								type='button'
								className='flex items-center gap-2 px-4 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
								onClick={() => setIsCreateNewVendorItemModalOpen(false)}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</Modal>
			<Modal
				title={'Invoice Summary'}
				isOpen={isInoviceSummaryModalOpen}
				onClose={() => setIsInoviceSummaryModalOpen(false)}
			>
				<div className='p-4 min-w-[750px]'>
					<div className='grid grid-cols-2 gap-4 text-sm pb-2 border-b-2 border-solid border-[#f9f9f9]'>
						<div>
							<p>
								<span className='font-bold'>Vendor:</span>
								<span className=''>{selectedVendorName}</span>
							</p>
							<p>
								<span className='font-bold'>Date:</span>{' '}
								<span className=''>{dateFormat(selectedDate, 'mm-dd-yy')}</span>
							</p>
							<p>
								<span className='font-bold'>Invoice Ref#:</span>{' '}
								<span className=''>{invoiceDetails?.vendorInvoiceReference}</span>
							</p>
						</div>

						<div>
							<p>
								<span className='font-bold'>Unit:</span> <span className=''>{selectedUnitName}</span>
							</p>
							<p>
								<span className='font-bold'>Created By:</span>{' '}
								<span className=''>{`${invoiceDetails?.userFirstName} ${invoiceDetails?.userLastName}`}</span>
							</p>
							<p>
								<span className='font-bold'>Invoice Total:</span>{' '}
								<span className=''>{formattingData(parseFloat(total))}</span>
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2 w-96 text-nowrap'>
						<span className='font-bold'>Summarize By:</span>
						<div className='w-96'>
							<Dropdown
								options={summaryOptions}
								selectedOption={selectedSummaryOption}
								onOptionChange={(option) => setSelectedSummaryOption(option)}
							/>
						</div>
					</div>

					<div className='mt-4 min-h-64'>
						<Loader loading={isInvoiceSummaryLoading} />
						{!isInvoiceSummaryLoading &&
							(invoiceSummaryData.length > 0 ? (
								<div className='overflow-hidden bg-white rounded-2xl shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
									<TableHOC
										columns={summaryColumns}
										data={invoiceSummaryData}
										isFooter={selectedSummaryOption !== 'Item Price Changes' ? true : false}
										tableHeight='30vh'
									/>
								</div>
							) : (
								<div className='mt-10 text-xl font-medium text-center'>No data available</div>
							))}
					</div>

					<div className='flex justify-end w-full pr-2'>
						<button
							type='button'
							className='flex  items-center gap-2 px-8 mt-4 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
							onClick={() => setIsInoviceSummaryModalOpen(false)}
						>
							Ok
						</button>
					</div>
				</div>
			</Modal>
			<Modal
				title={'Delete Invoice Confirmation'}
				isOpen={isDeleteConfirmModalOpen}
				onClose={() => setIsDeleteConfirmModalOpen(false)}
			>
				<div className='px-10 py-4'>
					<p>Are you sure that you want to delete this invoice?</p>
					<div className='flex justify-around mt-4'>
						<button
							onClick={() => {
								handleDeleteInvoice();
								setIsDeleteConfirmModalOpen(false);
							}}
							className='flex items-center gap-2 px-8 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
						>
							Yes
						</button>
						<button
							onClick={() => setIsDeleteConfirmModalOpen(false)}
							className='flex items-center gap-2 px-8 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
						>
							No
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default InvoiceEditor;
