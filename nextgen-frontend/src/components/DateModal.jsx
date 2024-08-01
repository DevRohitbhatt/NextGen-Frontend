import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import * as Styled from "./styles/DateModalStyles.jsx";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import Table from "./TableBuilder.jsx";
import {
  CalendarToSelector,
  CalendarFromSelector,
} from "./CalendarSelector.jsx";
import YearSelector from "./YearSelector.jsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
    columnHeaders: ["Period", "From", "To"],
    columnWidths: "1.5fr 2fr 2fr",
    dataTypes: ["string", "string", "string"],
    rows: [],
    width: "92%",
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
        { value: (i + 1).toString(), cellType: "" },
        { value: formatDate(startDate), cellType: "" },
        { value: formatDate(endDate), cellType: "" },
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
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
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
        <Styled.ModalDialog>
          <Styled.ModalOverlay $isDateRange={isDateRange}>
            <Styled.ModalContent className="modal-content">
              <ModalHeader>
                {isDateRange ? (
                  <h4>Select a business period or Date Range</h4>
                ) : (
                  <h4>Select a business Date</h4>
                )}
                <Styled.CloseButton onClick={handleCloseModal}>
                  <FaTimes className="close" />
                </Styled.CloseButton>
              </ModalHeader>
            </Styled.ModalContent>
            <Styled.ModalBody className={isDateRange ? "daterangeBody" : "dateBody"}>
              {!isDateRange ? (
                <div className="SingleCalendar">
                  <Calendar
                    onChange={handleInputChange}
                    value={localFromDate}
                    onClickDay={toggleCalendar}
                  />
                </div>
              ) : (
                <>
                  <Styled.CalendarTop>
                    <div className="fromdiv">
                      <Styled.Label>From:</Styled.Label>
                      <CalendarFromSelector
                        handleDateChange={(date) => setLocalFromDate(date)}
                        selectedFromDate={localFromDate}
                      />
                    </div>
                    <div className="Todiv">
                      <Styled.Label>To:</Styled.Label>
                      <CalendarToSelector
                        handleDateChange={(date) => setLocalToDate(date)}
                        selectedToDate={localToDate}
                      />
                    </div>
                    <div className="yeardiv">
                      <Styled.Label>Show Periods For Year:</Styled.Label>
                      <YearSelector
                        selectedYear={selectedYear}
                        onChange={handleYearChange}
                      />
                    </div>
                  </Styled.CalendarTop>

                  <div className="MainCalendarTable">
                    <Table
                      columnHeaders={CalendarTable.columnHeaders}
                      columnwidths={CalendarTable.columnWidths}
                      dataTypes={CalendarTable.dataTypes}
                      rows={CalendarTable.rows}
                      width={CalendarTable.width}
                      className="CalendarTable"
                    />
                  </div>
                </>
              )}
            </Styled.ModalBody>
            <Styled.ModalFooter>
              <Styled.FooterButton onClick={handleOkButtonClick}>
                Ok
              </Styled.FooterButton>
              <Styled.FooterButton onClick={handleCloseModal}>
                Cancel
              </Styled.FooterButton>
            </Styled.ModalFooter>
          </Styled.ModalOverlay>
        </Styled.ModalDialog>
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
