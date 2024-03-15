import { useEffect, useState } from "react";
import * as Styled from "./PrepChartStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import DateSelector from "../components/DateSelector.jsx";
import ExportOptions from "../components/ExportOptions.jsx";
import { PrepChartAPI } from "../apis/PrepChartAPI.jsx";
import Table from "../components/TableBuilder.jsx";
import PdfBuilder from "../components/PdfBuilder.jsx";
import * as PrepChartFunctions from "../functions/PrepChartFunctions.jsx";
import { exportToExcel } from "../functions/ExcelExport.jsx";
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
  dataTypes : ["string", "string", "number", "number", "number", "number", "number"],
  columnWidths : "1.5fr 2fr 1fr 1.2fr 1fr 1fr 1fr",
  rows : [],
};

export default function PrepChart() {
  const [companyID, setCompanyID] = useState(1021);
  const [prepChart, setPrepChart] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [prepChartDates, setPrepChartDates] = useState({});
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: [" ", "Forecasted Sales", "Date"],
    dataTypes: ["string", "number", "string"],
    columnWidths: ".5fr 1fr 1fr",
    rows: [],
    width: "50%",
  });
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selecteUnitName, setSelecteUnitName] = useState("0051 Sawmill");
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
    dataTypes: ["number"],
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
    let parameters = decodeURIComponent(window.location.search.replace("?data=", ""));
    if (parameters)
      parameters = JSON.parse(parameters);
    parameters ? setCompanyID(parameters.CompanyID) : setCompanyID(1051);
    parameters ? setSelectedUnit(parameters.UnitID) : setSelectedUnit(51);
    parameters ? setSelecteUnitName(parameters.UnitName) : setSelecteUnitName("0051 Sawmill");
    parameters ? setIsActive(parameters.UnitID) : setIsActive(51);
    //Todo use companyID and UnitID instead of 1, 1
    PrepChartAPI.get(1, 1).then((data) => {
      setPrepChart(data);
      const date = new Date(data.Date);
      setSelectedToDate(date);
      setSelectedFromDate(date);
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
      PrepChartFunctions.buildPrepTable(data.Today, setTodayTable, todayTable, handleTableCellChange, handleDropdownChange);
      PrepChartFunctions.buildPrepTable(data.Tomorrow, setTomorrowTable, tomorrowTable, handleTableCellChange, handleDropdownChange);
      PrepChartFunctions.buildPrepTable(data.NextDay, setNextDayTable, nextDayTable, handleTableCellChange, handleDropdownChange);
      setDefaultSafetyFactorTable({
        ...defaultSafetyFactorTable,
        rows: [[{ value: data.DefaultSafetyFactor, cellType: "percent", columnName: "Default Safety Factor", handleOnChange: { handleTableCellChange }, isInput: true}]],
      });
    });
    GetUnitList();
  }, []);

  useEffect(() => {
    if (prepChartDates.today) {
      buildForecastTable(prepChart.ForecastData);
      buildCalendarTable(selectedYear);
      setIsLoading(false);
    }
  }, [prepChartDates]);
  

  const GetUnitList = () => {
    UnitAPI.get(1, 1)
      .then((data) => {
        UnitListItem(data.Units);
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

  const buildCalendarTable = (year) => {
    const rows = [];
    let startDate = new Date(year, 0, 1);
    //let startDate = new Date(prepChartDates.today.toLocaleDateString());

    for (let i = 0; i < 12; i++) { 
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 27); 

        rows.push([
            { value: (i + 1).toString(), cellType: "",  },
            { value: formatDate(startDate), cellType: "" , onClick: () => handleRowClick(startDate, endDate) },
            { value: formatDate(endDate), cellType: "" , onClick: () => handleRowClick(startDate, endDate)  }
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

  const buildForecastTable = (forecastData) => {
    const { today, tomorrow, nextDay } = prepChartDates;
    const rows = [
      [
        { value: "Today", cellType: "", columnName: "Day"},
        { value: forecastData.Today, cellType: "dollar", isInput: true, columnName: "Forecasted Sales"},
        { value: today.toLocaleDateString(), cellType: "", columnName: "Date" },
      ],
      [
        { value: "Tomorrow", cellType: "", columnName: "Day"},
        { value: forecastData.Tomorrow, cellType: "dollar", isInput: true, columnName: "Forecasted Sales" },
        { value: tomorrow.toLocaleDateString(), cellType: "", columnName: "Date" },
      ],
      [
        { value: "Next Day", cellType: "", columnName: "Day"},
        { value: forecastData.NextDay, cellType: "dollar", isInput: true, columnName: "Forecasted Sales" },
        { value: nextDay.toLocaleDateString(), cellType: "", columnName: "Date" },
      ],
    ];
  
    setForecastTable({
      ...forecastTable,
      rows: rows,
    });
  };

  function handleTableCellChange(e, row, columnName, tableName) {
    switch (tableName) {
      case "Today":
        PrepChartFunctions.onInputCellChange(e, row, columnName, tableName, todayTable, setTodayTable, prepChart, setPrepChart);
        break;
      case "Tomorrow":
        PrepChartFunctions.onInputCellChange(e, row, columnName, tableName, tomorrowTable, setTomorrowTable, prepChart, setPrepChart);
        break;
      case "NextDay":
        PrepChartFunctions.onInputCellChange(e, row, columnName, tableName, nextDayTable, setNextDayTable, prepChart, setPrepChart);
        break;
      case "DefaultSafetyFactor":
        PrepChartFunctions.handleDefaultSafetyFactorChange(e, row, columnName, tableName, defaultSafetyFactorTable, setDefaultSafetyFactorTable, prepChart, setPrepChart, setTodayTable, setTomorrowTable, setNextDayTable, todayTable, tomorrowTable, nextDayTable);
        break;
      case "Forecast":
        PrepChartFunctions.handleForecastChange(e, row, columnName, tableName, forecastTable, setForecastTable, prepChart, setPrepChart, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable);
        break;
      default:
        console.error("Invalid table name");
        break;
    }
  }

  function handleDropdownChange(e, row, columnName, tableName) {
    if (tableName === "Today") {
      PrepChartFunctions.onDropdownCellChange(e, row, columnName, tableName, todayTable, setTodayTable, prepChart, setPrepChart);
    } else if (tableName === "Tomorrow") {
      PrepChartFunctions.onDropdownCellChange(e, row, columnName, tableName, tomorrowTable, setTomorrowTable, prepChart, setPrepChart);
    } else if (tableName === "NextDay") {
      PrepChartFunctions.onDropdownCellChange(e, row, columnName, tableName, nextDayTable, setNextDayTable, prepChart, setPrepChart);
    }
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

  const handleExcelClick = () => {
    const forecastColumns = [
      { name: "Day", key: "Day", width: 10 },
      { name: "Forecasted Sales", key: "Forecasted Sales", width: 20 },
      { name: "Date", key: "Date", width: 20 },
    ];
  
    const defaultSafetyFactorColumns = [{ name: "Default Safety Factor", key: "Default Safety Factor", width: 20 }];
  
    const prepColumns = [
      { name: "Item Name", key: "Item Name", width: 50 },
      { name: "Prep Type", key: "Prep Type", width: 50 },
      { name: "Yield/Type", key: "Yield/Type", width: 20 },
      { name: "Safety Factor", key: "Safety Factor", width: 30 },
      { name: "Needed", key: "Needed", width: 20 },
      { name: "On Hand", key: "On Hand", width: 20 },
      { name: "Prep/Pull Amount", key: "Prep/Pull Amount", width: 30 },
    ];
  
    const todayData = getTableData(todayTable);
    const tomorrowData = getTableData(tomorrowTable);
    const nextDayData = getTableData(nextDayTable);
  
    const data = [
      { name: "Forecast", data: getTableData(forecastTable), columns: forecastColumns},
      { name: "Default Safety Factor", data: getTableData(defaultSafetyFactorTable), columns: defaultSafetyFactorColumns, float: "right", cellSpan: 2, hasTableHeader: false },
      { name: "Today", data: todayData, columns: prepColumns},
      { name: "Tomorrow", data: tomorrowData, columns: prepColumns},
      { name: "Next Day", data: nextDayData, columns: prepColumns},
    ];
  
    const filename = `${companyID}_${selectedUnit}_PrepChart_${prepChartDates.today.toLocaleDateString()}`;
    exportToExcel(data, filename, "Prep Chart", prepChartDates.today.toLocaleDateString(), selecteUnitName);
  }
  
  const getTableData = (table) => {
    return table.rows.map(row => row.map(cell => formatCellValue(cell)));
  }
  
  const formatCellValue = (cell) => {
    switch (cell.columnName) {
      case "Prep Type":
        return cell.value.find(option => option.IsSelected).PrepUOM;
      case "Yield/Type":
      case "Forecasted Sales":
        return cell.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case "Safety Factor":
      case "Default Safety Factor":
        return (cell.value / 100).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
      default:
        return cell.value;
    }
  }

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
    setSelectedUnit(event.target.value);
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

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    buildCalendarTable(newYear);
};

  const handleFromDateChange = (date) => {
    setSelectedFromDate(date);
  };
  const handleToDateChange = (date) => {
    setSelectedToDate(date);
  };
  useEffect(() => {
  }, [selectedToDate,selectedFromDate]); // Run this effect whenever selectedDate changes

  const handleRowClick = (startDate, endDate) => {
  };

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
                UnitName={selecteUnitName}
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
                    <Styled.Span>{selecteUnitName}</Styled.Span>
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
                      // onChange={(newYear) => buildCalendarTable(newYear)}
                    />
                  </div>
                  
                </Styled.CalendarBoxWrapper>
                <div>
                    <Table 
                      columnHeaders={CalendarTable.columnHeaders}
                      columnwidths={CalendarTable.columnWidths}
                      rows={CalendarTable.rows}
                      width={CalendarTable.width}
                      className="CalendarTable"
                      dataTypes={['number', 'string', 'string']}
                    />
                  </div>
              </ModalDate>
            </Styled.DateAndUnitContainer>
            <ExportOptions
              includeExcel={true}
              includePDF={true}
              includePrint={true}
              handlePDFClick={handlePDFClick}
              handlePrintClick={handlePrintClick}
              handleExcelClick={handleExcelClick}
            />
          </Styled.OptionsRow>

          <h2>Forecast</h2>
          <Styled.ForeCastAndSafetyFactor>
            <Table
              columnHeaders={forecastTable.columnHeaders}
              dataTypes={forecastTable.dataTypes}
              columnwidths={forecastTable.columnWidths}
              rows={forecastTable.rows}
              width={forecastTable.width}
              tableName={"Forecast"}
              handleInputCellChange={handleTableCellChange}
            />
            <Table
              columnHeaders={defaultSafetyFactorTable.columnHeaders}
              dataTypes={defaultSafetyFactorTable.dataTypes}
              columnwidths={defaultSafetyFactorTable.columnWidths}
              rows={defaultSafetyFactorTable.rows}
              tableName={"DefaultSafetyFactor"}
              width={defaultSafetyFactorTable.width}
              height={defaultSafetyFactorTable.height}
              handleInputCellChange={handleTableCellChange}
            />
          </Styled.ForeCastAndSafetyFactor>
          <h2>Today - ${prepChart.ForecastData.Today}</h2>
          <Table
            columnHeaders={todayTable.columnHeaders}
            dataTypes={todayTable.dataTypes}
            columnwidths={todayTable.columnWidths}
            rows={todayTable.rows}
            tableName="Today"
            handleInputCellChange={handleTableCellChange}
            handleDropdownChange={handleDropdownChange}
          />

          <h2>Tomorrow - ${prepChart.ForecastData.Tomorrow}</h2>
          <Table
            columnHeaders={tomorrowTable.columnHeaders}
            dataTypes={tomorrowTable.dataTypes}
            columnwidths={tomorrowTable.columnWidths}
            rows={tomorrowTable.rows}
            tableName={"Tomorrow"}
            handleInputCellChange={handleTableCellChange}
            handleDropdownChange={handleDropdownChange}
          />

          <h2>Next Day - ${prepChart.ForecastData.NextDay}</h2>
          <Table
            columnHeaders={nextDayTable.columnHeaders}
            dataTypes={nextDayTable.dataTypes}
            columnwidths={nextDayTable.columnWidths}
            rows={nextDayTable.rows}
            tableName={"NextDay"}
            handleInputCellChange={handleTableCellChange}
            handleDropdownChange={handleDropdownChange}
          />
        </div>
      )}
    </Styled.PageContainer>
  );
}
