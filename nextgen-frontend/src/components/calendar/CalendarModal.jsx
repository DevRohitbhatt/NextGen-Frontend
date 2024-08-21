import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Styled from '../styles/DateModalStyles.jsx';
import { FaTimes } from 'react-icons/fa';
import { ModalHeader } from 'react-bootstrap';
import { TableBuilder as Table, YearSelector, CalendarSelector } from '../index.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarModal = ({
	handleClose,
	selectedFromDate,
	selectedToDate,
	handleFromDateChange,
	handleToDateChange,
	modalOpen,
	isDateRange,
	handleDateSelection,
}) => {
	const [initialFromDate, setInitialFromDate] = useState(selectedFromDate);
	const [initialToDate, setInitialToDate] = useState(selectedToDate);
	const [localFromDate, setLocalFromDate] = useState(selectedFromDate);
	const [localToDate, setLocalToDate] = useState(selectedToDate);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [showCalendar, setShowCalendar] = useState(false);
	const [CalendarTable, setCalendarTable] = useState({
		columnHeaders: ['Period', 'From', 'To'],
		columnWidths: '1.5fr 2fr 2fr',
		dataTypes: ['string', 'string', 'string'],
		rows: [],
		width: '92%',
	});

	useEffect(() => {
		if (modalOpen) {
			setInitialFromDate(selectedFromDate);
			setInitialToDate(selectedToDate);
			setLocalFromDate(selectedFromDate);
			setLocalToDate(selectedToDate);
		}
	}, [modalOpen, selectedFromDate, selectedToDate]);

	useEffect(() => {
		buildCalendarTable(selectedYear);
	}, [selectedYear]);

	const buildCalendarTable = (year) => {
		const rows = [];
		let startDate = new Date(year, 0, 1);

		for (let i = 0; i < 12; i++) {
			const endDate = new Date(startDate);
			endDate.setDate(startDate.getDate() + 27);

			rows.push([
				{ value: (i + 1).toString(), cellType: '' },
				{ value: formatDate(startDate), cellType: '' },
				{ value: formatDate(endDate), cellType: '' },
			]);

			startDate = new Date(endDate);
			startDate.setDate(startDate.getDate() + 1);
		}

		setCalendarTable((prevState) => ({
			...prevState,
			rows: rows,
		}));
	};

	const formatDate = (date) => {
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${month}/${day}/${year}`;
	};

	const handleYearChange = (newYear) => {
		setSelectedYear(newYear);
		buildCalendarTable(newYear);
	};

	const handleInputChange = (date) => {
		if (isDateRange) {
			setLocalFromDate(date);
			setLocalToDate(date);
		} else {
			setLocalFromDate(date);
		}
	};

	const toggleCalendar = () => {
		setShowCalendar(!showCalendar);
	};

	const handleOkButtonClick = () => {
		if (isDateRange) {
			handleDateSelection(localFromDate, localToDate);
		} else {
			handleDateSelection(localFromDate, localFromDate);
		}
		handleClose();
	};

	const handleCloseModal = () => {
		// Reset the dates to their initial values on cancel
		setLocalFromDate(initialFromDate);
		setLocalToDate(initialToDate);
		handleClose();
	};

	return (
		<>
			{modalOpen && (
				<div className='fixed bg-[#00000073] w-full h-dvh left-0 top-0 z-10'>
					<div
						className={`fixed w-[500px] bg-white rounded-lg shadow-lg overflow-hidden left-1/3 top-[6%]  ${
							isDateRange ? '' : 'w-96'
						}`}
					>
						<div className='flex items-center justify-between px-4 py-2 text-white bg-primary'>
							{isDateRange ? (
								<h4>Select a business period or Date Range</h4>
							) : (
								<h4>Select a business Date</h4>
							)}
							<button
								className='p-1 text-white bg-transparent border-[0.25px] border-white border-solid rounded-none cursor-pointer hover:bg-white hover:text-primary focus:outline-none'
								onClick={handleCloseModal}
							>
								<FaTimes className='close' />
							</button>
						</div>
						<div className='px-4'>
							{!isDateRange ? (
								<Calendar
									onChange={handleInputChange}
									value={localFromDate}
									onClickDay={toggleCalendar}
								/>
							) : (
								<>
									<div className='flex'>
										<div>
											<span className='text-xs font-bold'>From:</span>
											<CalendarSelector
												handleDateChange={(date) => setLocalFromDate(date)}
												selectedFromDate={localFromDate}
											/>
										</div>
										<div>
											<span className='text-xs font-bold'>To:</span>
											<CalendarSelector
												handleDateChange={(date) => setLocalToDate(date)}
												selectedToDate={localToDate}
											/>
										</div>
										<div className='yeardiv'>
											<span className='text-xs font-bold'>Show Periods For Year:</span>
											<YearSelector selectedYear={selectedYear} onChange={handleYearChange} />
										</div>
									</div>

									<div className=''>
										<Table
											columnHeaders={CalendarTable.columnHeaders}
											columnwidths={CalendarTable.columnWidths}
											dataTypes={CalendarTable.dataTypes}
											rows={CalendarTable.rows}
											width={CalendarTable.width}
											className='CalendarTable'
											height={'300px'}
											scrollable={true}
										/>
									</div>
								</>
							)}
						</div>
						<Styled.ModalFooter>
							<Styled.FooterButton onClick={handleOkButtonClick}>Ok</Styled.FooterButton>
							<Styled.FooterButton onClick={handleCloseModal}>Cancel</Styled.FooterButton>
						</Styled.ModalFooter>
					</div>
				</div>
			)}
		</>
	);
};

CalendarModal.propTypes = {
	handleClose: PropTypes.func,
	selectedFromDate: PropTypes.instanceOf(Date),
	selectedToDate: PropTypes.instanceOf(Date),
	handleFromDateChange: PropTypes.func,
	handleToDateChange: PropTypes.func,
	modalOpen: PropTypes.bool,
	isDateRange: PropTypes.bool,
	handleDateSelection: PropTypes.func,
};

export default CalendarModal;
