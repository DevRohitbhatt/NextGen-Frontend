import { useEffect, useState } from "react";
import * as Styled from "./styles/PrepChartStyles.jsx";
import "../../components/UnitSelector.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import DateSelector from "../../components/DateSelector.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import { PrepChartAPI } from "../../apis/food-cost/PrepChartAPI.jsx";
import Table from "../../components/TableBuilder.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";
import * as PrepChartFunctions from "../../functions/PrepChartFunctions.jsx";
import { exportToExcel } from "../../functions/ExcelExport.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import CalendarModal from "../../components/ModalDate.jsx";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI.jsx";
import PrepChartIntroSteps from "../../assets/introJSSteps/PrepChartIntroSteps.jsx";
import { Steps } from "intro.js-react";

const toolTipForecastSales = "Copied from Web Scheduler if Web Scheduler subscriber otherwise a four-week moving average of Net Sales. NOTE: Adjustments to forecasted sales on prep chart DO NOT modify Web Scheduler Forecasted sales.";
const toolTipPrepType = "Units of Measure collected from Inventory Configuration. Defaults to item with “PREP” in description.";
const toolTipYieldType = "Represents item dollar yield. Calculated as four week rolling average Net Sales / Item usage dollars.";
const toolTipSafetyFactor = "Set by default safety factor OR individual item safety factor. Added buffer or cushion to the base NEEDED amount. Typically used to ensure ample quantity of prep or thaw amounts without running short of product. Short shelf-life prepped or thawed items may have a lower safety factor applied to ensure top quality while minimizing waste.";
const toolTipNeeded = "Represents the quantity needed for Forecasted sales. (Net Sales / Yield Type) + safety factor. Items in Tomorrow section use Today Forecasted Sales + Tomorrow Forecasted Sales. Items in Next Day section use Today Forecasted Sales + Tomorrow Forecasted Sales + Next Day Forecasted Sales";
const toolTipOnHand = "Physical count of usable product already available";
const left = "left";
const right = "right";

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
  classnames: ["inventory-item-name", "prep-type", "yield-type", "safety-factor", "needed", "on-hand", "prep-pull"],
  dataTypes : ["string", "string", "number", "number", "number", "number", "number"],
  columnWidths : "2.5fr 2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
  rows : [],
  headerTooltips: ["", toolTipPrepType, toolTipYieldType, toolTipSafetyFactor, toolTipNeeded, toolTipOnHand, ""],
  toolTipDirection: ["", left, left, left, left, left, ""]
};

export default function PrepChart() {
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState();
  const [prepChart, setPrepChart] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("There was an error trying to load the Prep Chart, please try again later.");
  const [prepChartDates, setPrepChartDates] = useState({});
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: [" ", "Forecasted Sales", "Date"],
    dataTypes: ["string", "number", "string"],
    columnWidths: ".5fr 1fr 1fr",
    rows: [],
    width: "50%",
    headerTooltips: ["", toolTipForecastSales, ""],
    toolTipDirection: ["", left, ""]
  });
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setselectedUnitName] = useState("No Unit Selected");
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
    height: "50%",
    headerTooltips: [""],
    toolTipDirection: [""]
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

  const [introJS, setIntroJS] = useState({
    stepsEnabled: false,
    steps: PrepChartIntroSteps(),
    initialStep: 0,
  });

  useEffect(() => {
    if (!selectedUnit) {
      let parameters = decodeURIComponent(window.location.search.replace("?data=", ""));
      if (parameters)
        parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters ? setAlignmentID(parameters.AlignmentId) : setAlignmentID();
      parameters ? setSelectedUnit(parameters.User_DefaultUnitID) : setSelectedUnit();
      parameters ? setIsActive(parameters.UnitID) : setIsActive();
      if (parameters.User_DefaultUnitID) {
        getPrepChart(parameters.CompanyID, parameters.User_DefaultUnitID, new Date());
        getUnits(parameters.CompanyID, parameters.AlignmentId, parameters.User_GroupOrUnitAccess);
      } else {
        setErrorMessage("No Unit Selected, Please select a unit.");
        setIsError(true);
        setIsLoading(false);
      }
    }
    else {
      getPrepChart(1021, 51, new Date());
    }
  }, []);

  const getPrepChart = (companyID, unitID, date) => {
    setIsLoading(true);
    setIsError(false);
    PrepChartAPI.get(companyID, unitID, date.toISOString().split('T')[0]).then((data) => {
      if (data === "No Template found for the selected company and unit.") {
        setErrorMessage("No Template found for the selected unit. Please create a template for this unit.");
        setIsError(true);
        setIsLoading(false);
        return;
      }
      setPrepChart(data);
      setSelectedToDate(date);
      setSelectedFromDate(date);
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      buildForecastTable(data.forecastData, date, tomorrow, nextDay);
      setPrepChartDates({
        ...prepChartDates,
        today: date,
        tomorrow: tomorrow,
        nextDay: nextDay,
      });
      PrepChartFunctions.buildPrepTable(data.today, setTodayTable, todayTable, handleTableCellChange, handleDropdownChange);
      PrepChartFunctions.buildPrepTable(data.tomorrow, setTomorrowTable, tomorrowTable, handleTableCellChange, handleDropdownChange);
      PrepChartFunctions.buildPrepTable(data.nextDay, setNextDayTable, nextDayTable, handleTableCellChange, handleDropdownChange);
      setDefaultSafetyFactorTable({
        ...defaultSafetyFactorTable,
        rows: [[{ value: data.defaultSafetyFactor, cellType: "percent", columnName: "Default Safety Factor", handleOnChange: { handleTableCellChange }, isInput: true}]],
      });
    });
  }

  const getUnits = (companyId, alignmentId, userId) => {
    UnitsAndAreasAPI.getbyid(companyId, alignmentId, userId)
      .then((data) => {
        setUnitsList(data);
      }).catch((error) => {
        console.error("Error getting units: ", error);
      });
  };
      


  useEffect(() => {
    if (prepChartDates.today) {
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

  const buildForecastTable = (forecastData, today, tomorrow, nextDay) => {
    const rows = [
      [
        { value: "Today", cellType: "", columnName: "Day"},
        { value: forecastData.today, cellType: "dollar", isInput: true, columnName: "Forecasted Sales"},
        { value: today.toLocaleDateString(), cellType: "", columnName: "Date" },
      ],
      [
        { value: "Tomorrow", cellType: "", columnName: "Day"},
        { value: forecastData.tomorrow, cellType: "dollar", isInput: true, columnName: "Forecasted Sales" },
        { value: tomorrow.toLocaleDateString(), cellType: "", columnName: "Date" },
      ],
      [
        { value: "Next Day", cellType: "", columnName: "Day"},
        { value: forecastData.nextDay, cellType: "dollar", isInput: true, columnName: "Forecasted Sales" },
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
          dataTypes: ["string", "currency rounded", "string"]
        },
        { type: "table/Column", widths: [100], data: defaultSafetyFactorTable },
        {
          type: "table",
          title: "Today",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: todayTable,
          dataTypes: ["string", "string", "currency", "percent", "numnber", "number", "number"]
        },
        {
          type: "table",
          title: "Tomorrow",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: tomorrowTable,
          dataTypes: ["string", "string", "currency", "percent", "numnber", "number", "number"]
        },
        {
          type: "table",
          title: "Next Day",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: nextDayTable,
          dataTypes: ["string", "string", "currency", "percent", "numnber", "number", "number"]
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
          dataTypes: ["string", "currency rounded", "string"]
        },
        { type: "table/Column", widths: [100], data: defaultSafetyFactorTable },
        {
          type: "table",
          title: "Today",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: todayTable,
          dataTypes: ["string", "string", "currency", "percent", "numnber", "number", "number"]
        },
        {
          type: "table",
          title: "Tomorrow",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: tomorrowTable,
          dataTypes: ["string", "string", "currency", "percent", "numnber", "number", "number"]
        },
        {
          type: "table",
          title: "Next Day",
          widths: [115, 140, "*", "*", "*", "*", "*"],
          data: nextDayTable,
          dataTypes: ["string", "string", "currency", "percent", "numnber", "number", "number"]
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
    exportToExcel(data, filename, "Prep Chart", prepChartDates.today.toLocaleDateString(), selectedUnitName);
  }
  
  const getTableData = (table) => {
    return table.rows.map(row => row.map(cell => formatCellValue(cell)));
  }
  
  const formatCellValue = (cell) => {
    switch (cell.columnName) {
      case "Prep Type":
        return cell.value.find(option => option.isSelected).option;
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

  const handleSaveClick = () => {
    const response = PrepChartAPI.save(prepChart);
  };

  const handleUnitSelectorClick = () => {
    setShowModal(true); // Open the modal when UnitSelector is clicked
  };
  const handleDateSelectorClick = () => {
    setShowDateModal(true); 
  };

  // useEffect(() => {}, [selectedToDate, selectedFromDate]); // Run this effect whenever selectedDate changes

  const handleRowClick = (startDate, endDate) => {
  };
  const handleCloseModal = () => {
    setShowDateModal(false);
  };
  const handleDateSelection = (fromDate, toDate) => {
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
    setShowDateModal(false); // Close the date modal after selection
    getPrepChart(companyID, selectedUnit, toDate);
  };
  const handleUnitSelection = (unitName, unitID) => {
    setselectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowModal(false); // Close the date modal after selection
    getPrepChart(companyID, unitID, selectedToDate);
  };
  
  const handleIntroStart = () => {
    setIntroJS({ ...introJS, stepsEnabled: true });
  };

  return (
    <Styled.PageContainer>
      <Steps
        enabled={introJS.stepsEnabled}
        steps={introJS.steps}
        initialStep={introJS.initialStep}
        onExit={() => {
          setIntroJS({ ...introJS, stepsEnabled: false });
        }}
      />
      <Styled.PageTitle>Prep Chart</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector
            onClick={handleUnitSelectorClick}
            unitName={selectedUnitName}
            setUnitName={setselectedUnitName}
            unitID={selectedUnit}
            label="Select Unit"
          />
          <DateSelector
            ToDate={selectedToDate}
            FromDate={selectedFromDate}
            onClick={handleDateSelectorClick}
            isDateRange={false}
          />

          <UnitModal
            unitData={unitsList}
            unitID={selectedUnit}
            unitName={selectedUnitName}
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
          includePrint={true}
          includeSave={true}
          includeHelp={true}
          handleSaveClick={handleSaveClick}
          handlePDFClick={handlePDFClick}
          handlePrintClick={handlePrintClick}
          handleExcelClick={handleExcelClick}
          handleHelpClick={handleIntroStart}
        />
      </Styled.OptionsRow>
      {isLoading ? (
        <>
          <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
        </>
      ) : (
        isError ? (
          <Styled.UnloadedMessage>{errorMessage}</Styled.UnloadedMessage>
        ) : (
          <>

            <h2>Forecast</h2>
            <Styled.ForeCastAndSafetyFactor>
              <Table
                columnHeaders={forecastTable.columnHeaders}
                dataTypes={forecastTable.dataTypes}
                columnwidths={forecastTable.columnWidths}
                rows={forecastTable.rows}
                width={forecastTable.width}
                tableName={"Forecast"}
                className={"sales-forecast"}
                handleInputCellChange={handleTableCellChange}
                isSorting={false}
                headerTooltips={forecastTable.headerTooltips}
                toolTipDirection={forecastTable.toolTipDirection}
              />
              <Table
                columnHeaders={defaultSafetyFactorTable.columnHeaders}
                dataTypes={defaultSafetyFactorTable.dataTypes}
                columnwidths={defaultSafetyFactorTable.columnWidths}
                rows={defaultSafetyFactorTable.rows}
                tableName={"DefaultSafetyFactor"}
                className={"default-safety-factor"}
                width={defaultSafetyFactorTable.width}
                height={defaultSafetyFactorTable.height}
                handleInputCellChange={handleTableCellChange}
                isSorting={false}
                headerTooltips={defaultSafetyFactorTable.headerTooltips}
                toolTipDirection={defaultSafetyFactorTable.toolTipDirection}
              />
            </Styled.ForeCastAndSafetyFactor>
            <h2 className="today-table">Today - ${Math.round(prepChart.forecastData.today)}</h2>
            <Table
              columnHeaders={todayTable.columnHeaders}
              classnames={todayTable.classnames}
              dataTypes={todayTable.dataTypes}
              columnwidths={todayTable.columnWidths}
              rows={todayTable.rows}
              tableName="Today"
              handleInputCellChange={handleTableCellChange}
              handleDropdownChange={handleDropdownChange}
              isSorting={false}
              headerTooltips={todayTable.headerTooltips}
              toolTipDirection={todayTable.toolTipDirection}
            />

            <h2 className={"tomorrow-table"}>Tomorrow - ${Math.round(prepChart.forecastData.tomorrow)}</h2>
            <Table
              columnHeaders={tomorrowTable.columnHeaders}
              dataTypes={tomorrowTable.dataTypes}
              columnwidths={tomorrowTable.columnWidths}
              rows={tomorrowTable.rows}
              tableName={"Tomorrow"}
              handleInputCellChange={handleTableCellChange}
              handleDropdownChange={handleDropdownChange}
              isSorting={false}
              headerTooltips={tomorrowTable.headerTooltips}
              toolTipDirection={tomorrowTable.toolTipDirection}
            />

            <h2 className={"nextday-table"} >Next Day - ${Math.round(prepChart.forecastData.nextDay)}</h2>
            <Table
              columnHeaders={nextDayTable.columnHeaders}
              dataTypes={nextDayTable.dataTypes}
              columnwidths={nextDayTable.columnWidths}
              rows={nextDayTable.rows}
              tableName={"NextDay"}
              handleInputCellChange={handleTableCellChange}
              handleDropdownChange={handleDropdownChange}
              isSorting={false}
              headerTooltips={nextDayTable.headerTooltips}
              toolTipDirection={nextDayTable.toolTipDirection}
            />
          </>
        )
      )}
    </Styled.PageContainer>
  );
}
