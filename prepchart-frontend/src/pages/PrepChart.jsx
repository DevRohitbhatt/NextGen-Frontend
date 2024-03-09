import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Styled from "./PrepChartStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import DateSelector from "../components/DateSelector.jsx";
import ExportOptions from "../components/ExportOptions.jsx";
import { PrepChartAPI } from "../apis/PrepChartAPI.jsx";
import Table from "../components/TableBuilder.jsx";
import PdfBuilder from "../components/PdfBuilder.jsx";
import { UnitAPI } from "../apis/UnitAPI.jsx";
import Modal from "../components/Modal.jsx";
import SearchUnit from "../components/SearchUnit.jsx";
import ModalDate from "../components/ModalDate.jsx";
import {
  CalendarToSelector,
  CalendarFromSelector,
} from "../components/CalendarSelector.jsx";
import YearSelector from "../components/YearSelector.jsx";

const prepTableStructure = {
  columnHeaders: [
    "Item Name",
    "Prep Type",
    "Yield/Type",
    "Safety Factor",
    "Needed",
    "On Hand",
    "Prep/Pull Amount",
  ],
  columnWidths: "1.5fr 2fr 1fr 1.2fr 1fr 1fr 1fr",
  rows: [],
};

export default function PrepChart() {
  const [prepChart, setPrepChart] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [prepChartDates, setPrepChartDates] = useState({});
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: [" ", "Forecasted Sales", "Date"],
    columnWidths: ".5fr 1fr 1fr",
    rows: [],
    width: "50%",
  });
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelecteUnit] = useState("");
  const [SelecteUnitName, setSelecteUnitName] = useState("");
  const [filteredUnit, setFilteredUnit] = useState([]);
  const [IsActive, setIsActive] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [showDateModal, setShowDateModal] = useState(false); // State to manage modal visibility

  const [todayTable, setTodayTable] = useState({
    ...prepTableStructure,
  });
  const [tomorrowTable, setTomorrowTable] = useState({
    ...prepTableStructure,
  });
  const [nextDayTable, setNextDayTable] = useState({
    ...prepTableStructure,
  });
  const [defaultSafetyFactorTable, setDefaultSafetyFactorTable] = useState({
    columnHeaders: ["Default Safety Factor"],
    columnWidths: "1fr",
    rows: [],
    width: "15%",
    height: "100px",
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [CalendarTable, setCalendarTable] = useState({
    columnHeaders: ["Period", "From", "To"],
    columnWidths: "1.5fr 2fr 2fr",
    rows: [],
    width: "92%",
  });
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());

  useEffect(() => {
    //Todo use companyID and UnitID instead of 1, 1
    PrepChartAPI.get(1, 1).then((data) => {
      setPrepChart(data);
      const date = new Date(data.Date);
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      setPrepChartDates({
        ...prepChartDates,
        today: date,
        tomorrow: tomorrow,
        nextDay: nextDay,
      });
      buildPrepTable(data.Today, setTodayTable);
      buildPrepTable(data.Tomorrow, setTomorrowTable);
      buildPrepTable(data.NextDay, setNextDayTable);
      setDefaultSafetyFactorTable({
        ...defaultSafetyFactorTable,
        rows: [[{ value: data.DefaultSafetyFactor, cellType: "input" }]],
      });
    });
    GetUnitList();
  }, []);

  useEffect(() => {
    if (prepChartDates.today) {
      buildForecastTable(prepChart.ForecastData);
      buildCalendarTable();
      setIsLoading(false);
    }
  }, [prepChartDates]);

  const GetUnitList = () => {
    UnitAPI.get(1, 1)
      .then((data) => {
        UnitListItem(data.Units);
        if (data.Units.length > 0) {
          setSelecteUnit(data.Units[0].UnitID);
          setSelecteUnitName(data.Units[0].Name);
          setIsActive(data.Units[0].UnitID);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  const UnitListItem = (UnitItem) => {
    setUnitsList({
      rows: UnitItem,
    });
    setFilteredUnit(UnitItem); // Initially, set filtered rows to all rows
  };

  const buildCalendarTable = () => {
    const rows = [
      [
        { value: "1", cellType: "" },
        { value: prepChartDates.today.toLocaleDateString(), cellType: "" },
        { value: prepChartDates.today.toLocaleDateString(), cellType: "" },
      ],
      [
        { value: "1", cellType: "" },
        { value: prepChartDates.today.toLocaleDateString(), cellType: "" },
        { value: prepChartDates.tomorrow.toLocaleDateString(), cellType: "" },
      ],
      [
        { value: "1", cellType: "" },
        { value: prepChartDates.today.toLocaleDateString(), cellType: "" },
        { value: prepChartDates.nextDay.toLocaleDateString(), cellType: "" },
      ],
    ];

    setCalendarTable({
      ...CalendarTable,
      rows: rows,
    });
  };

  const buildForecastTable = (forecastData) => {
    const rows = [
      [
        { value: "Today", cellType: "" },
        { value: forecastData.Today, cellType: "input" },
        { value: prepChartDates.today.toLocaleDateString(), cellType: "" },
      ],
      [
        { value: "Tomorrow", cellType: "" },
        { value: forecastData.Tomorrow, cellType: "input" },
        { value: prepChartDates.tomorrow.toLocaleDateString(), cellType: "" },
      ],
      [
        { value: "Next Day", cellType: "" },
        { value: forecastData.NextDay, cellType: "input" },
        { value: prepChartDates.nextDay.toLocaleDateString(), cellType: "" },
      ],
    ];

    setForecastTable({
      ...forecastTable,
      rows: rows,
    });
  };

  function onInputCellChange(e, row, columnName) {
    console.log(row, columnName, e.target.value);
  }

  const handlePDFClick = () => {
    const pdfData = {
      title: "Prep Chart",
      exportType: "pdf",
      body: [
        {
          type: "table/Column",
          title: "Forecast",
          widths: [50, 100, 75],
          data: forecastTable,
        },
        { type: "table/Column", widths: [100], data: defaultSafetyFactorTable },
        {
          type: "table",
          title: "Today",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: todayTable,
        },
        {
          type: "table",
          title: "Tomorrow",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: tomorrowTable,
        },
        {
          type: "table",
          title: "Next Day",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: nextDayTable,
        },
      ],
    };
    PdfBuilder(pdfData);
  };

  const handlePrintClick = () => {
    const pdfData = {
      title: "Prep Chart",
      exportType: "print",
      body: [
        {
          type: "table/Column",
          title: "Forecast",
          widths: [50, 100, 75],
          data: forecastTable,
        },
        { type: "table/Column", widths: [100], data: defaultSafetyFactorTable },
        {
          type: "table",
          title: "Today",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: todayTable,
        },
        {
          type: "table",
          title: "Tomorrow",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: tomorrowTable,
        },
        {
          type: "table",
          title: "Next Day",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: nextDayTable,
        },
      ],
    };
    PdfBuilder(pdfData);
  };

  const buildPrepTable = (prepChartSection, setTable) => {
    const rows = prepChartSection.map((item) => {
      return [
        { value: item.itemName, cellType: "", columnName: "Item Name" },
        { value: item.PrepType[0], cellType: "", columnName: "Prep Type" },
        { value: item.YieldType, cellType: "", columnName: "Yield/Type" },
        {
          value: item.SafetyFactor,
          cellType: "input",
          columnName: "Safety Factor",
          handleOnChange: { onInputCellChange },
        },
        {
          value: item.Needed,
          cellType: "input",
          columnName: "Needed",
          handleOnChange: { onInputCellChange },
        },
        {
          value: item.OnHand,
          cellType: "input",
          columnName: "On Hand",
          handleOnChange: { onInputCellChange },
        },
        {
          value: item.PrepPullAmount,
          cellType: "",
          columnName: "Prep/Pull Amount",
        },
      ];
    });

    setTable({
      ...todayTable,
      rows: rows,
    });
  };

  const SearchUnitItem = (keyword) => {
    const filtered = unitsList.rows.filter(
      (item) =>
        (item.Name &&
          item.Name.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.UnitID &&
          item.UnitID.toString().toLowerCase().includes(keyword.toLowerCase()))
    );
    setFilteredUnit(filtered);
  };
  const handleUnitSelectorClick = () => {
    setShowModal(true); // Open the modal when UnitSelector is clicked
  };
  const handleDateSelectorClick = () => {
    setShowDateModal(true); // Open the modal when UnitSelector is clicked
  };
  const handleUnitSelectChange = (event) => {
    setSelecteUnit(event.target.value);
    const UnitId = event.target.value;
    const selectedText = event.target.textContent;
    // Set the selected text to the state variable
    setSelecteUnitName(selectedText);

    // UnitAPI.get(1, UnitId)
    // .then((data) => {
    //   buildPrepMasterTable(data.InventoryList);
    //   setIsLoading(false); // Set loading to false after data is fetched
    // })
    // .catch((error) => {
    //   console.error("Error fetching data:", error);
    //   setIsLoading(false); // Set loading to false if there's an error
    // });
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleFromDateChange = (date) => {
    setSelectedFromDate(date);
    //console.log(selectedDate.toLocaleDateString())
  };
  const handleToDateChange = (date) => {
    setSelectedToDate(date);
    //console.log(selectedDate.toLocaleDateString())
  };
  useEffect(() => {
    console.log(selectedToDate.toLocaleDateString());
    console.log(selectedFromDate.toLocaleDateString());
  }, [selectedToDate,selectedFromDate]); // Run this effect whenever selectedDate changes


  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart</Styled.PageTitle>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <Styled.OptionsRow>
            <Styled.DateAndUnitContainer>
              <UnitSelector
                onClick={handleUnitSelectorClick}
                UnitName={SelecteUnitName}
              />
              <DateSelector
                ToDate={selectedToDate}
                FromDate={selectedFromDate}
                onClick={handleDateSelectorClick}
              />

              <Modal
                show={showModal}
                handleClose={() => {
                  setShowModal(false);
                  SearchUnitItem("");
                }}
              >
                <Styled.PopupContainer>
                  <Styled.LeftUnitList>
                    <label>Filter</label>
                    <Styled.InputGroup>
                      <SearchUnit
                        list={unitsList}
                        onSearch={(keyword) => SearchUnitItem(keyword)}
                      />
                    </Styled.InputGroup>
                    <div className="unitList">
                      <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                        {filteredUnit.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => setIsActive(item.UnitID)}
                            value={item.UnitID}
                            className={IsActive === item.UnitID ? "active" : ""}
                          >
                            {item.Name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Styled.LeftUnitList>
                  <Styled.RightUnitList>
                    <Styled.Span>{SelecteUnitName}</Styled.Span>
                    <div className="unitList">
                      <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                        {filteredUnit.map((item, index) => (
                          <li key={index} value={item.UnitID}>
                            {item.Name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Styled.RightUnitList>
                </Styled.PopupContainer>
              </Modal>

              <ModalDate
                show={showDateModal}
                handleClose={() => {
                  setShowDateModal(false);
                }}
              >
                <Styled.CalendarBoxWrapper>
                  <div className="fromdiv">
                    <Styled.Label>From:</Styled.Label>
                    <CalendarFromSelector handleDateChange={handleFromDateChange} selectedFromDate={selectedFromDate} />
                  </div>
                  <div className="Todiv">
                    <Styled.Label>To:</Styled.Label>
                    <CalendarToSelector handleDateChange={handleToDateChange} selectedToDate={selectedToDate} />
                  </div>
                  <div className="yeardiv">
                    <Styled.Label>Show Periods For Year:</Styled.Label>
                    <YearSelector
                      selectedYear={selectedYear}
                      onChange={handleYearChange}
                    />
                  </div>
                  
                </Styled.CalendarBoxWrapper>
                <div className="CalendarTable">
                    <Table 
                      columnHeaders={CalendarTable.columnHeaders}
                      columnwidths={CalendarTable.columnWidths}
                      rows={CalendarTable.rows}
                      width={CalendarTable.width}
                      className="CalendarTable"
                    />
                  </div>
              </ModalDate>
            </Styled.DateAndUnitContainer>
            <ExportOptions
              includeExcel={true}
              includePDF={true}
              includeCSV={true}
              includePrint={true}
              handlePDFClick={handlePDFClick}
              handlePrintClick={handlePrintClick}
            />
          </Styled.OptionsRow>

          <h2>Forecast</h2>
          <Styled.ForeCastAndSafetyFactor>
            <Table
              columnHeaders={forecastTable.columnHeaders}
              columnwidths={forecastTable.columnWidths}
              rows={forecastTable.rows}
              width={forecastTable.width}
            />
            <Table
              columnHeaders={defaultSafetyFactorTable.columnHeaders}
              columnwidths={defaultSafetyFactorTable.columnWidths}
              rows={defaultSafetyFactorTable.rows}
              width={defaultSafetyFactorTable.width}
              height={defaultSafetyFactorTable.height}
            />
          </Styled.ForeCastAndSafetyFactor>
          <h2>Today - {prepChart.ForecastData.Today}</h2>
          <Table
            columnHeaders={todayTable.columnHeaders}
            columnwidths={todayTable.columnWidths}
            rows={todayTable.rows}
            handleInputCellChange={onInputCellChange}
          />

          <h2>Tomorrow - {prepChart.ForecastData.Tomorrow}</h2>
          <Table
            columnHeaders={tomorrowTable.columnHeaders}
            columnwidths={tomorrowTable.columnWidths}
            rows={tomorrowTable.rows}
          />

          <h2>Next Day</h2>
          <Table
            columnHeaders={nextDayTable.columnHeaders}
            columnwidths={nextDayTable.columnWidths}
            rows={nextDayTable.rows}
          />
        </div>
      )}
    </Styled.PageContainer>
  );
}
