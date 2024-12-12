import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getCall } from '../../apis/network';
import {
	ExportOptions,
	PdfBuilder,
	ExcelExport as exportToExcel,
	DateSelector,
	CalendarModal,
	Modal,
	Loader,
} from '../../components';
import dateFormat from 'dateformat';
import { createColumnHelper } from '@tanstack/react-table';

const InvoiceEditor = () => {
	const location = useLocation();
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState();
	const [selectedVendor, setSelectedVendor] = useState(0);
	const [selectedVendorName, setSelectedVendorName] = useState();
	const [invoiceDetails, setInvoiceDetails] = useState([]);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [comment, setComment] = useState();

	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [addMoreDropdownVisible, setAddMoreDropdownVisible] = useState(false);
	const moreOptionsDropdown = useRef(null);
	const addMoreOptionsDropdown = useRef(null);

	const [specificTimeCheckbox, setSpecificTimeCheckbox] = useState(false);
	const [total, setTotal] = useState(0);
	const [time, setTime] = useState('');

	// State variables for loading and error handling
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the countsheet Report, please try again later.'
	);

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
		setSelectedUnitName(searchParams.get('unitName'));
		setSelectedVendorName(searchParams.get('vendorName'));
		setSelectedDate(new Date(searchParams.get('date')));
	}, [location.search]);

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
		}
		if (addMoreOptionsDropdown.current && !addMoreOptionsDropdown.current.contains(event.target)) {
			setAddMoreDropdownVisible(false);
		}
	};

	console.log('selectedDate', selectedDate);

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
							className='flex items-center justify-between h-[52px] text-left pl-4 capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] outline-none caret-[var(--tw-primary)]'
						/>
					</div>
					<div className='flex flex-col justify-center m-1 rounded-3xl date-selector'>
						<h3 className='mb-1 ml-2 text-xl font-semibold text-nowrap'>Total</h3>
						<input
							type='text'
							className='w-40 pl-4 flex items-center justify-between h-[52px] text-[red] capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] outline-none caret-[red] text-left'
							value={total}
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
									<button className='w-[100%] bg-[#f9f9f9]'>Delete Invoice</button>
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
						includePrint={true}
						includeSave={true}
						saveTitle='Add New Invoices'
					/>
				</div>
			</header>
			<div className='flex gap-4'>
				<h3>
					Created By: <span className='font-medium'>Data importss</span>
				</h3>
				<h3>
					Last Saved By: <span className='font-medium'>Data import</span>
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

			<div className='relative w-full h-96'>
				<Loader loading={isLoading} />
				{!isLoading &&
					(invoiceDetails.length > 0 ? (
						<div className='paged-table'>{Table}</div>
					) : (
						<div className='mt-10 text-xl font-medium text-center'>No data available</div>
					))}
			</div>

			<div className='flex items-center justify-between rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center gap-2'>
					<button className='flex items-center gap-2 px-4 py-3 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'>
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
									<button className='w-[100%] bg-[#f9f9f9]'>Add Items From Latest Invoice</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Add Items From Last 7 days</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Add Items From Last 30 days</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Create New Vendor Item</button>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className='flex flex-col'>
					<span>Subtotal: $1027.80</span> <span>Tax: $0.00</span>{' '}
					<span className='text-[red]'>Total: $1027.80</span>
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
		</div>
	);
};

export default InvoiceEditor;
