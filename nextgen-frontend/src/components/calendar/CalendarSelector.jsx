import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import { AiFillDownSquare } from 'react-icons/ai';
import { CalendarContainer } from '../styles/ReactCalendarStyles';

const CalendarSelector = ({ handleDateChange, date }) => {
	const [showCalendar, setShowCalendar] = useState(false);
	const [selectedDate, setSelectedDate] = useState(date || new Date());
	const inputRef = useRef(null);
	const calendarRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				inputRef.current &&
				!inputRef.current.contains(event.target) &&
				calendarRef.current &&
				!calendarRef.current.contains(event.target)
			) {
				setShowCalendar(false);
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		console.log('Date changed: ', date);
		if (date) {
			setSelectedDate(date);
		}
	}, [date]);

	const handleInputChange = (date) => {
		setSelectedDate(date);
		if (handleDateChange) {
			handleDateChange(date);
		}
	};

	const toggleCalendar = () => {
		setShowCalendar(!showCalendar);
	};
	const handleIconClick = (event) => {
		event.stopPropagation(); // Prevent input box from receiving focus
		toggleCalendar();
	};

	return (
		<div className='relative'>
			<input
				className='w-full h-7 bg-[#e6e7e8] border-none pl-2 text-black font-semibold text-sm focus:outline-none'
				type='text'
				onFocus={toggleCalendar}
				value={selectedDate.toLocaleDateString()}
				readOnly
				ref={inputRef}
			/>
			<div
				className='absolute top-0 flex items-center h-full text-4xl -right-1 text-[var(--tw-primary)]'
				onClick={handleIconClick}
			>
				<AiFillDownSquare />
			</div>

			{showCalendar && (
				<div ref={calendarRef}>
					<div className='fixed z-30'>
						<Calendar onChange={handleInputChange} value={selectedDate} onClickDay={toggleCalendar} />
					</div>
				</div>
			)}
		</div>
	);
};

export default CalendarSelector;
