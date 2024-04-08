import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import Table from "../components/TableBuilder.jsx";
import {
  CalendarToSelector,
  CalendarFromSelector,
} from "../components/CalendarSelector";
import YearSelector from "../components/YearSelector";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const ModalOverlay = styled.div`
  position: fixed;
  width: 500px;
  height: auto;
  background-color: #fff;
  display: block;
  z-index: 9;
  border-radius: 8px;
  box-shadow: 0px 0px 10px #00000047;
  overflow: hidden;
  left: 38%;
  top: 6%;
`;

const ModalContent = styled.div`
  // background-color: white;
  // padding: 20px;
  // border-radius: 8px;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background: #364790;
  color: #fff;
  padding: 10px 14px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 12px;
  background-color: transparent;
  cursor: pointer;
  color: #fff;
  border: 0.25px solid #fff;
  padding: 3px;
  border-radius: 0px;
  padding-bottom: 0;
`;
const ModalDialog = styled.div`
  position: fixed;
  background: #00000073;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9;
`;
const FooterButton = styled.button`
  box-shadow: inset 0 0 0 2px #364790;
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 110px;

  &::after {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }
  &::before {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }
  &:hover::after {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
  }
  &:hover::before {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0s, 0.25s;
  }
  &:hover {
    border-color: transparent;
    color: #fff;
    background: #364790;
  }
`;
const ModalFooter = styled.div`
  background: #efefef;
  display: flex;
  justify-content: center;
  gap: 11px;
  padding: 0.75rem;
`;
const ModalBody = styled.div`
  // padding: 0px 14px;
`;
const InputBox = styled.input`
  width: 130px;
  height: 27px;
  background: #e6e7e8;
  border: none;
  padding-left: 7px;
  color: #000;
  font-weight: 500;
`;
export const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
`;
const CalendarTop=styled.div`
  display: grid;
  grid-template-columns: 33.3fr 33.3fr 33.3fr;
`

const CalendarModal = ({
  handleClose,
  selectedFromDate,
  selectedToDate,
  selectedYear,
  handleFromDateChange,
  handleToDateChange,
  modalOpen,
  isDateRang,
  handleDateSelection
}) => {
  const [selectedYear1, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  useEffect(() => {
    buildCalendarTable(selectedYear1);
  }, []);

  const [CalendarTable, setCalendarTable] = useState({
    columnHeaders: ["Period", "From", "To"],
    columnWidths: "1.5fr 2fr 2fr",
    rows: [],
    width: "92%",
  });
  const buildCalendarTable = (year) => {
    const rows = [];
    let startDate = new Date(year, 0, 1);
    //let startDate = new Date(prepChartDates.today.toLocaleDateString());

    for (let i = 0; i < 12; i++) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 27);

      rows.push([
        { value: (i + 1).toString(), cellType: "" },
        { value: formatDate(startDate), cellType: "" },
        { value: formatDate(endDate), cellType: "" },
      ]);
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() + 1);
    }
    setCalendarTable({
      ...CalendarTable,
      rows: rows,
    });
  };
  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    buildCalendarTable(newYear);
  };
  const handleCloseModal = () => {
    handleClose(); // This will trigger the handleClose function defined in the parent component
  };

  const handleInputChange = (date) => {
    setSelectedDate(date);
  };
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  const handleOkButtonClick = () => {
    if (!isDateRang) {
      handleDateSelection(selectedDate, selectedDate); // Call function passed from PrepChart
    }
    handleClose();
  };

  return (
    <>
      {modalOpen && (
        <ModalDialog>
          <ModalOverlay className={isDateRang? "modal-overlay":"SingleModal" }>
            <ModalContent className="modal-content">
              <ModalHeader>
                {isDateRang?<h4>Select a business period or Date Range</h4>:
                  <h4>Select a business Date</h4>
                }
                <CloseButton onClick={handleCloseModal}>
                  <FaTimes className="close" />
                </CloseButton>
              </ModalHeader>
            </ModalContent>
            <ModalBody className={isDateRang? "daterangeBody":"dateBody"}>
              {!isDateRang ? (
                <div className="SingleCalendar">
                  <Calendar
                    onChange={handleInputChange}
                    value={selectedDate}
                    onClickDay={toggleCalendar}
                  />
                </div>
              ) : (
                <>
                  <CalendarTop>
                    <div className="fromdiv">
                      <Label>From:</Label>
                      <CalendarFromSelector
                        handleDateChange={handleFromDateChange}
                        selectedFromDate={selectedFromDate}
                      />
                    </div>
                    <div className="Todiv">
                      <Label>To:</Label>
                      <CalendarToSelector
                        handleDateChange={handleToDateChange}
                        selectedToDate={selectedToDate}
                      />
                    </div>
                    <div className="yeardiv">
                      <Label>Show Periods For Year:</Label>
                      <YearSelector
                        selectedYear={selectedYear}
                        onChange={handleYearChange}
                      />
                    </div>
                  </CalendarTop>

                  <div className="MainCalendarTable">
                    <Table
                      columnHeaders={CalendarTable.columnHeaders}
                      columnwidths={CalendarTable.columnWidths}
                      rows={CalendarTable.rows}
                      width={CalendarTable.width}
                      className="CalendarTable"
                    />
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <FooterButton onClick={handleOkButtonClick}>Ok</FooterButton>
              <FooterButton onClick={handleClose}>Cancel</FooterButton>
            </ModalFooter>
          </ModalOverlay>
        </ModalDialog>
      )}
    </>
  );
};

CalendarModal.propTypes = {
  handleClose: PropTypes.func,
  selectedFromDate: PropTypes.instanceOf(Date),
  selectedToDate: PropTypes.instanceOf(Date),
  selectedYear: PropTypes.number,
  handleFromDateChange: PropTypes.func,
  handleToDateChange: PropTypes.func,
  modalOpen: PropTypes.bool,
  isDateRang: PropTypes.bool,
  handleDateSelection:PropTypes.func,
};

export default CalendarModal;
