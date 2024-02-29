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
import * as PrepChartFunctions from "../functions/PrepChartFunctions.jsx";

const prepTableStructure = {
  columnHeaders : [
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
      PrepChartFunctions.buildPrepTable(data.Today, setTodayTable, todayTable, handleTableCellChange, handleDropdownChange);
      PrepChartFunctions.buildPrepTable(data.Tomorrow, setTomorrowTable, tomorrowTable, handleTableCellChange, handleDropdownChange);
      PrepChartFunctions.buildPrepTable(data.NextDay, setNextDayTable, nextDayTable, handleTableCellChange, handleDropdownChange);
      setDefaultSafetyFactorTable({
        ...defaultSafetyFactorTable,
        rows: [[{ value: data.DefaultSafetyFactor, cellType: "percent", columnName: "Default Safety Factor", handleOnChange: { handleTableCellChange }, isInput: true}]],
      });
    });
  }, []);

  useEffect(() => {
    if (prepChartDates.today) {
      buildForecastTable(prepChart.ForecastData);
      setIsLoading(false);
    }
  }, [prepChartDates]);

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
      body : [
        { type: "table/Column", title: "Forecast", widths: [50, 100, 75], data: forecastTable },
        { type: "table/Column", widths: [100], data: defaultSafetyFactorTable},
        { type: "table", title: "Today", widths: [115, 140, "*", "*", "*", "*", "*"], data: todayTable },
        { type: "table", title: "Tomorrow", widths: [115, 140, "*", "*", "*", "*", "*"], data: tomorrowTable },
        { type: "table", title: "Next Day", widths: [115, 140, "*", "*", "*", "*", "*"], data: nextDayTable },
      ]
    };
    PdfBuilder(pdfData);
  };

  const handlePrintClick = () => {
    const pdfData = {
      title: "Prep Chart",
      exportType: "print",
      body : [
        { type: "table/Column", title: "Forecast", widths: [50, 100, 75], data: forecastTable },
        { type: "table/Column", widths: [100], data: defaultSafetyFactorTable},
        { type: "table", title: "Today", widths: [115, 140, "*", "*", "*", "*", "*"], data: todayTable },
        { type: "table", title: "Tomorrow", widths: [115, 140, "*", "*", "*", "*", "*"], data: tomorrowTable },
        { type: "table", title: "Next Day", widths: [115, 140, "*", "*", "*", "*", "*"], data: nextDayTable },
      ]
    };
    PdfBuilder(pdfData);
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
              <UnitSelector />
              <DateSelector date={prepChartDates.today} />
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
