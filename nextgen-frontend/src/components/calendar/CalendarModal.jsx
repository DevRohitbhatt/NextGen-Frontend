import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import * as Styled from "../styles/DateModalStyles.jsx";
import { FaTimes } from "react-icons/fa";
import {
  TableBuilder as Table,
  YearSelector,
  CalendarSelector,
} from "../index.js";
import Calendar from "react-calendar";
import { getCall } from "../../apis/network.js";
import { useSelector } from "react-redux";

const CalendarModal = ({
  handleClose,
  selectedFromDate,
  selectedToDate,
  modalOpen,
  isDateRange,
  handleDateSelection,
  periodDatesEndpoint = "getAllPeriodDates",
}) => {
  const { companyID } = useSelector((state) => state.globalState);
  const [initialFromDate, setInitialFromDate] = useState(selectedFromDate);
  const [initialToDate, setInitialToDate] = useState(selectedToDate);
  const [localFromDate, setLocalFromDate] = useState(selectedFromDate);
  const [localToDate, setLocalToDate] = useState(selectedToDate);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [dynamicData, setDynamicData] = useState(null);
  const [CalendarTable, setCalendarTable] = useState({
    columnHeaders: ["Period", "From", "To"],
    columnWidths: "1.5fr 2fr 2fr",
    dataTypes: ["string", "string", "string"],
    rows: [],
    width: "100%",
  });

  useEffect(() => {
    if (modalOpen) {
      setInitialFromDate(selectedFromDate);
      setInitialToDate(selectedToDate);
      setLocalFromDate(selectedFromDate);
      setLocalToDate(selectedToDate);
    }
    getDynamicDates();
  }, [modalOpen, selectedFromDate, selectedToDate]);

  // useEffect(() => {
  // 	buildCalendarTable(selectedYear);
  // }, [selectedYear]);

  useEffect(() => {
    if (dynamicData) {
      buildCalendarTable(selectedYear);
    }
  }, [selectedYear, dynamicData]);

  const getDynamicDates = async () => {
    try {
      const getData = {
        fullUrl: "api/company/settings/" + periodDatesEndpoint,
        urlParams: {
          companyId: companyID,
        },
      };

      const result = await getCall(getData);
      if (result && result.data) {
        setDynamicData(result);
      }
    } catch (error) {}
  };

  const buildCalendarTable = (year) => {
    const rows = dynamicData.data
      .filter((entry) => entry.yearID === year) // Filter periods by selected year
      .map((entry) => [
        { value: entry.periodID.toString(), cellType: "" },
        { value: formatDate(new Date(entry.periodMinDate)), cellType: "" },
        { value: formatDate(new Date(entry.periodMaxDate)), cellType: "" },
      ]);

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
    if (isDateRange && new Date(localToDate) >= new Date(localFromDate)) {
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

  const getDatesFromRows = (dates) => {
    let fromdate = new Date(dates[1].value);
    let todate = new Date(dates[2].value);
    setLocalFromDate(fromdate);
    setLocalToDate(todate);
  };

  return (
    <>
      {modalOpen && (
        <div className="fixed bg-[#00000073] w-full h-dvh left-0 top-0 z-10">
          <div
            className={`fixed bg-white rounded-lg shadow-lg overflow-hidden left-1/3  top-[6%] ${
              isDateRange ? "" : "w-96"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2 text-white bg-[var(--tw-primary)]">
              {isDateRange ? (
                <h4>Select a business period or Date Range</h4>
              ) : (
                <h4>Select a business Date</h4>
              )}
              <button
                className="p-1 text-white bg-transparent border-[0.25px] border-white border-solid rounded-none cursor-pointer hover:bg-white hover:text-[var(--tw-primary)] focus:outline-none"
                onClick={handleCloseModal}
              >
                <FaTimes className="close" />
              </button>
            </div>
            <div className="w-full mx-auto">
              {!isDateRange ? (
                <Calendar
                  onChange={handleInputChange}
                  value={localFromDate}
                  onClickDay={toggleCalendar}
                  className="tailwind-calendar"
                  calendarType="US"
                />
              ) : (
                <>
                  <div className="flex px-4 pt-4">
                    <div>
                      <span className="text-xs font-bold">From:</span>
                      <CalendarSelector
                        handleDateChange={(date) => {
                          setLocalFromDate(date);
                        }}
                        selectedFromDate={localFromDate}
                        date={localFromDate}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold">To:</span>
                      <CalendarSelector
                        handleDateChange={(date) => setLocalToDate(date)}
                        selectedToDate={localToDate}
                        date={localToDate}
                      />
                    </div>
                    <div className="yeardiv">
                      <span className="text-xs font-bold">
                        Show Periods For Year:
                      </span>
                      <YearSelector
                        selectedYear={selectedYear}
                        onChange={handleYearChange}
                      />
                    </div>
                  </div>

                  <div className="w-full px-4 m-auto">
                    <Table
                      columnHeaders={CalendarTable.columnHeaders}
                      columnwidths={CalendarTable.columnWidths}
                      dataTypes={CalendarTable.dataTypes}
                      rows={CalendarTable.rows}
                      width={CalendarTable.width}
                      className="CalendarTable"
                      height={"300px"}
                      scrollable={true}
                      onRowClick={getDatesFromRows}
                    />
                  </div>
                </>
              )}
            </div>
            <Styled.ModalFooter>
              <Styled.FooterButton onClick={handleOkButtonClick}>
                Ok
              </Styled.FooterButton>
              <Styled.FooterButton onClick={handleCloseModal}>
                Cancel
              </Styled.FooterButton>
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
