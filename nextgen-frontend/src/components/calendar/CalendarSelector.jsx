import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import { AiFillDownSquare } from 'react-icons/ai';
import { CalendarContainer } from '../styles/ReactCalendarStyles';

const InputBoxWrapper = styled.div`
	position: relative;
`;

const InputBox = styled.input`
	width: calc(100% - 30px);
	height: 27px;
	background: #e6e7e8;
	border: none;
	padding-left: 7px;
	color: #000;
	font-weight: 500;
	font-size: 14px;
`;
const Icon = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	height: 100%;
	display: flex;
	align-items: center;
	font-size: 35px;
	color: ${(props) => props.theme.primary};
`;

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
		<InputBoxWrapper>
			<InputBox
				type='text'
				onFocus={toggleCalendar}
				value={selectedDate.toLocaleDateString()}
				readOnly
				ref={inputRef}
			/>
			<Icon onClick={handleIconClick}>
				<AiFillDownSquare />
			</Icon>

			{showCalendar && (
				<div ref={calendarRef}>
					<CalendarContainer>
						<Calendar onChange={handleInputChange} value={selectedDate} onClickDay={toggleCalendar} />
					</CalendarContainer>
				</div>
			)}
		</InputBoxWrapper>
	);
};

export default CalendarSelector;
