import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import PropTypes from "prop-types";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 30px;
  margin: 5px;
  cursor: pointer;
`;
const Label = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  white-space: nowrap;
`;

const CalendarContainer = styled.div`
  white-space: nowrap;
  border-radius: 20px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }
`;
const Input = styled.input`
  border: none;
  cursor: pointer;
`;

const DateRangePicker = ({ selectedDates, onDateChange }) => {
  const today = new Date();
  const [dates, setDates] = useState([today, today]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const textBoxRef = useRef(null);
  const calendarRef = useRef(null);

  const formates = { year: "numeric", month: "2-digit", day: "2-digit" };

  const handleDateChange = (index, date) => {
    const newDates = [...dates];
    newDates[index] = date;
    setDates(newDates);
  };

  const handleTextBoxClick = () => {
    setCalendarVisible(!calendarVisible);
  };

  const handleCalendarChange = (value) => {
    setDates(value);
    onDateChange(value);
    setCalendarVisible(false);
    if (textBoxRef.current) {
      const formattedDateRange = `${value[0].toLocaleDateString(
        undefined,
        formates
      )} - ${value[1].toLocaleDateString(undefined, formates)}`;
      textBoxRef.current.value = formattedDateRange;
    }
  };

  useEffect(() => {
    if (textBoxRef.current) {
      
      const formattedDateRange = `${dates[0].toLocaleDateString(
        undefined,
        formates
      )} - ${dates[1].toLocaleDateString(undefined, formates)}`;
      textBoxRef.current.value = formattedDateRange;
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (
      calendarVisible &&
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      textBoxRef.current &&
      !textBoxRef.current.contains(event.target)
    ) {
      setCalendarVisible(false);
    }
  };

  return (
    <MainContainer>
      <Label>Order Span </Label>
      <CalendarContainer>
        <Input type="text" onClick={handleTextBoxClick} ref={textBoxRef} />
        {calendarVisible && (
          <div ref={calendarRef}>
            <Calendar
              selectRange
              value={dates}
              onChange={handleCalendarChange}
              onClickDay={(value) => handleDateChange(0, value)}
              onActiveStartDateChange={({ activeStartDate }) =>
                handleDateChange(1, activeStartDate)
              }
              onClickMonth={() => textBoxRef.current.focus()}
            />
          </div>
        )}
      </CalendarContainer>
    </MainContainer>
  );
};

DateRangePicker.propTypes={
    selectedDates:PropTypes.any,
    onDateChange:PropTypes.func

}

export default DateRangePicker;
