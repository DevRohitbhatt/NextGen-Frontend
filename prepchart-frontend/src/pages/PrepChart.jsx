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
import { AreaAPI } from "../apis/AreaAPI.jsx";
import UnitModal from "../components/UnitModal.jsx";
import CalendarModal from "../components/ModalDate.jsx";

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
  const [SelecteUnitName, setSelecteUnitName] = useState("");
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
  }, []);

  useEffect(() => {
    if (prepChartDates.today) {
      buildForecastTable(prepChart.ForecastData);
      buildCalendarTable(selectedYear);
      setIsLoading(false);
    }
  }, [prepChartDates]);

  const buildCalendarTable = (year) => {
    const rows = [];
    let startDate = new Date(year, 0, 1);
    for (let i = 0; i < 12; i++) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 27);

      rows.push([
        { value: (i + 1).toString(), cellType: "" },
        {
          value: formatDate(startDate),
          cellType: "",
          onClick: () => handleRowClick(startDate, endDate),
        },
        {
          value: formatDate(endDate),
          cellType: "",
          onClick: () => handleRowClick(startDate, endDate),
        },
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

  const handleUnitSelectorClick = () => {
    setShowModal(true); // Open the modal when UnitSelector is clicked
  };
  const handleDateSelectorClick = () => {
    setShowDateModal(true); 
  };

  useEffect(() => {}, [selectedToDate, selectedFromDate]); // Run this effect whenever selectedDate changes

  const handleRowClick = (startDate, endDate) => {
    console.log("Start Date:", startDate.toLocaleDateString());
    console.log("End Date:", endDate.toLocaleDateString());
  };
  const handleCloseModal = () => {
    setShowDateModal(false);
  };
  const handleDateSelection = (fromDate, toDate) => {
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
    setShowDateModal(false); // Close the date modal after selection
  };
  const handleUnitSelection = (SelecteUnitName) => {
    setSelecteUnitName(SelecteUnitName);
    setShowModal(false); // Close the date modal after selection
  };

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart</Styled.PageTitle>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>
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
                isDateRange={false}
              />

              <UnitModal
                show={showModal}
                handleClose={() => {
                  setShowModal(false);
                }}
                handleUnitSelection={handleUnitSelection}
              />

              <CalendarModal
                handleClose={handleCloseModal}
                modalOpen={showDateModal}
                isDateRang={false}
                handleDateSelection={handleDateSelection}
              />
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
        </>
      )}
    </Styled.PageContainer>
  );
}
