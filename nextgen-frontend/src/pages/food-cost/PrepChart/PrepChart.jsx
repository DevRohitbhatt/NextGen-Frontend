import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import * as PrepChartFunctions from "../../../functions/prepChartFunctions.js";
import PrepChartIntroSteps from "../../../assets/introJSSteps/PrepChartIntroSteps.jsx";
import { Steps } from "intro.js-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  UnitSelector,
  DateSelector,
  ExportOptions,
  TableBuilder as Table,
  PdfBuilder,
  UnitModal,
  CalendarModal,
  ExcelExport as exportToExcel,
} from "../../../components/index.js";
import { getCall, postCall } from "../../../apis/network.js";

const toolTips = {
  forecastSales:
    "Copied from Web Scheduler if Web Scheduler subscriber otherwise a four-week moving average of Net Sales. NOTE: Adjustments to forecasted sales on prep chart DO NOT modify Web Scheduler Forecasted sales.",
  prepType:
    "Units of Measure collected from Inventory Configuration. Defaults to item with “PREP” in description.",
  yieldType:
    "Represents item dollar yield. Calculated as four week rolling average Net Sales / Item usage.",
  safetyFactor:
    "Set by default safety factor OR individual item safety factor. Added buffer or cushion to the base NEEDED amount. Typically used to ensure ample quantity of prep or thaw amounts without running short of product. Short shelf-life prepped or thawed items may have a lower safety factor applied to ensure top quality while minimizing waste.",
  needed:
    "Represents the quantity needed for Forecasted sales. (Net Sales / Yield Type) + safety factor. Items in Tomorrow section use Today Forecasted Sales + Tomorrow Forecasted Sales. Items in Next Day section use Today Forecasted Sales + Tomorrow Forecasted Sales + Next Day Forecasted Sales",
  onHand: "Physical count of usable product already available",
};

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
  classnames: [
    "inventory-item-name",
    "prep-type",
    "yield-type",
    "safety-factor",
    "needed",
    "on-hand",
    "prep-pull",
  ],
  dataTypes: [
    "string",
    "string",
    "number",
    "number",
    "number",
    "number",
    "number",
  ],
  columnWidths: "2.5fr 2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
  rows: [],
  headerTooltips: [
    "",
    toolTips.prepType,
    toolTips.yieldType,
    toolTips.safetyFactor,
    toolTips.needed,
    toolTips.onHand,
    "",
  ],
  toolTipDirection: ["", "left", "left", "left", "left", "left", ""],
};

export default function PrepChart() {
	const state = useSelector((state) => state.globalState);
  const companyID = useSelector((state) => state.globalState.companyID);
  const alignmentID = useSelector((state) => state.globalState.alignmentID);
  const unitsList = useSelector((state) => state.globalState.unitsAndAreas);

  const [prepChart, setPrepChart] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Prep Chart, please try again later."
  );
  const [prepChartDates, setPrepChartDates] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(state.defaultUnitID);
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [showDateModal, setShowDateModal] = useState(false); // State to manage modal visibility
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [todayTable, setTodayTable] = useState({
    ...prepTableStructure,
  });
  const [tomorrowTable, setTomorrowTable] = useState({
    ...prepTableStructure,
  });
  const [nextDayTable, setNextDayTable] = useState({
    ...prepTableStructure,
  });
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: [" ", "Forecasted Sales", "Date"],
    dataTypes: ["string", "number", "string"],
    columnWidths: ".5fr 1fr 1fr",
    rows: [],
    width: "40%",
    headerTooltips: ["", toolTips.forecastSales, ""],
    toolTipDirection: ["", "left", ""],
  });
  const [defaultSafetyFactorTable, setDefaultSafetyFactorTable] = useState({
    columnHeaders: ["Default Safety Factor"],
    dataTypes: ["number"],
    columnWidths: "1fr",
    rows: [],
    width: "20%",
    height: "50%",
    headerTooltips: [""],
    toolTipDirection: [""],
  });
  const [CalendarTable, setCalendarTable] = useState({
    columnHeaders: ["Period", "From", "To"],
    columnWidths: "1.5fr 2fr 2fr",
    rows: [],
    width: "92%",
  });
  const [introJS, setIntroJS] = useState({
    stepsEnabled: false,
    steps: PrepChartIntroSteps(),
    initialStep: 0,
  });
  const toastId = useRef(null);

  useEffect(() => {
    if (state.defaultUnitId) {
      setSelectedUnit(state.defaultUnitId);
    }
    if (state.defaultUnitName) {
      setSelectedUnitName(state.defaultUnitName);
    }
  }, [
    state.defaultUnitId,
    state.defaultUnitName,
  ]);

  useEffect(() => {
    if ( companyID && state.defaultUnitID ) {
			getPrepChart(companyID, state.defaultUnitID, selectedToDate);
		}
  }, [companyID, state.defaultUnitID]);

  const getPrepChart = async (companyID, unitID, date) => {
    setIsLoading(true);
    setIsError(false);
    var templateTypeID = 0;
    const getData = {
      url: "getPrepChartDetail",
      urlParams: {
        companyID: companyID,
        unitID: unitID,
        templateTypeID: templateTypeID,
        date: date.toISOString().split("T")[0],
      },
    };

    const result = await getCall(getData);
    if (
      result.data === "No Template found for the selected company and unit."
    ) {
      setErrorMessage(
        "No Template found for the selected unit. Please create a template for this unit."
      );
      setIsError(true);
      setIsLoading(false);
      return;
    }
    setPrepChart(result.data);
    setSelectedToDate(date);
    setSelectedFromDate(date);
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);
    buildForecastTable(result.data.forecastData, date, tomorrow, nextDay);
    setPrepChartDates({
      ...prepChartDates,
      today: date,
      tomorrow: tomorrow,
      nextDay: nextDay,
    });
    PrepChartFunctions.buildPrepTable(
      result.data.today,
      setTodayTable,
      todayTable,
      handleTableCellChange,
      handleDropdownChange
    );
    PrepChartFunctions.buildPrepTable(
      result.data.tomorrow,
      setTomorrowTable,
      tomorrowTable,
      handleTableCellChange,
      handleDropdownChange
    );
    PrepChartFunctions.buildPrepTable(
      result.data.nextDay,
      setNextDayTable,
      nextDayTable,
      handleTableCellChange,
      handleDropdownChange
    );
    setDefaultSafetyFactorTable({
      ...defaultSafetyFactorTable,
      rows: [
        [
          {
            value: result.data.defaultSafetyFactor,
            cellType: "percent",
            columnName: "Default Safety Factor",
            handleOnChange: { handleTableCellChange },
            isInput: true,
          },
        ],
      ],
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
        { value: "Today", cellType: "", columnName: "Day" },
        {
          value: forecastData.today,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        { value: today.toLocaleDateString(), cellType: "", columnName: "Date" },
      ],
      [
        { value: "Tomorrow", cellType: "", columnName: "Day" },
        {
          value: forecastData.tomorrow,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        {
          value: tomorrow.toLocaleDateString(),
          cellType: "",
          columnName: "Date",
        },
      ],
      [
        { value: "Next Day", cellType: "", columnName: "Day" },
        {
          value: forecastData.nextDay,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        {
          value: nextDay.toLocaleDateString(),
          cellType: "",
          columnName: "Date",
        },
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
        PrepChartFunctions.onInputCellChange(
          e,
          row,
          columnName,
          tableName,
          todayTable,
          setTodayTable,
          prepChart,
          setPrepChart
        );
        break;
      case "Tomorrow":
        PrepChartFunctions.onInputCellChange(
          e,
          row,
          columnName,
          tableName,
          tomorrowTable,
          setTomorrowTable,
          prepChart,
          setPrepChart
        );
        break;
      case "NextDay":
        PrepChartFunctions.onInputCellChange(
          e,
          row,
          columnName,
          tableName,
          nextDayTable,
          setNextDayTable,
          prepChart,
          setPrepChart
        );
        break;
      case "DefaultSafetyFactor":
        PrepChartFunctions.handleDefaultSafetyFactorChange(
          e,
          row,
          columnName,
          tableName,
          defaultSafetyFactorTable,
          setDefaultSafetyFactorTable,
          prepChart,
          setPrepChart,
          setTodayTable,
          setTomorrowTable,
          setNextDayTable,
          todayTable,
          tomorrowTable,
          nextDayTable
        );
        break;
      case "Forecast":
        PrepChartFunctions.handleForecastChange(
          e,
          row,
          columnName,
          tableName,
          forecastTable,
          setForecastTable,
          prepChart,
          setPrepChart,
          todayTable,
          tomorrowTable,
          nextDayTable,
          setTodayTable,
          setTomorrowTable,
          setNextDayTable
        );
        break;
      default:
        console.error("Invalid table name");
        break;
    }
  }

  function handleDropdownChange(e, row, columnName, tableName) {
    if (tableName === "Today") {
      PrepChartFunctions.onDropdownCellChange(
        e,
        row,
        columnName,
        tableName,
        todayTable,
        setTodayTable,
        prepChart,
        setPrepChart
      );
    } else if (tableName === "Tomorrow") {
      PrepChartFunctions.onDropdownCellChange(
        e,
        row,
        columnName,
        tableName,
        tomorrowTable,
        setTomorrowTable,
        prepChart,
        setPrepChart
      );
    } else if (tableName === "NextDay") {
      PrepChartFunctions.onDropdownCellChange(
        e,
        row,
        columnName,
        tableName,
        nextDayTable,
        setNextDayTable,
        prepChart,
        setPrepChart
      );
    }
  }

  const updatePrepPullAmount = (table) => {
    return table.rows.map((row) => {
      const onHandIndex = table.columnHeaders.indexOf("On Hand");
      const prepPullAmountIndex =
        table.columnHeaders.indexOf("Prep/Pull Amount");

      if (row[onHandIndex].value === 0 || row[onHandIndex].value === null) {
        row[prepPullAmountIndex].value = "";
      }
      return row;
    });
  };

  const handlePDFClick = () => {
    const todayForecast = `$${Math.round(forecastTable.rows[0][1].value)}`;
    const tomorrowForecast = `$${Math.round(forecastTable.rows[1][1].value)}`;
    const nextDayForecast = `$${Math.round(forecastTable.rows[2][1].value)}`;

    const todayDate = forecastTable.rows[0][2].value;
    const tomorrowDate = forecastTable.rows[1][2].value;
    const nextDayDate = forecastTable.rows[2][2].value;

    const updatedTodayTable = {
      ...todayTable,
      rows: updatePrepPullAmount(todayTable),
    };
    const updatedTomorrowTable = {
      ...tomorrowTable,
      rows: updatePrepPullAmount(tomorrowTable),
    };
    const updatedNextDayTable = {
      ...nextDayTable,
      rows: updatePrepPullAmount(nextDayTable),
    };

    const pdfData = {
      title: `Prep & Thaw Chart - ${selectedUnitName}`,
      exportType: "pdf",
      body: [
        {
          type: "table",
          title: `Today - ${todayForecast}  ${todayDate}`,
          widths: [160, 110, "*", 27, 32, "*", "auto"],
          data: updatedTodayTable,
          dataTypes: [
            "string",
            "string",
            "currency",
            "percent",
            "numnber",
            "number",
            "number",
          ],
        },
        {
          type: "table",
          title: `Tomorrow - ${tomorrowForecast}  ${tomorrowDate}`,
          widths: [160, 110, "*", 27, 32, "*", "auto"],
          data: updatedTomorrowTable,
          dataTypes: [
            "string",
            "string",
            "currency",
            "percent",
            "numnber",
            "number",
            "number",
          ],
        },
        {
          type: "table",
          title: `Next Day - ${nextDayForecast}  ${nextDayDate}`,
          widths: [160, 110, "*", 27, 32, "*", "auto"],
          data: updatedNextDayTable,
          dataTypes: [
            "string",
            "string",
            "currency",
            "percent",
            "numnber",
            "number",
            "number",
          ],
        },
      ],
    };
    PdfBuilder(pdfData);
  };

  const handlePrintClick = () => {
    const todayForecast = `$${Math.round(forecastTable.rows[0][1].value)}`;
    const tomorrowForecast = `$${Math.round(forecastTable.rows[1][1].value)}`;
    const nextDayForecast = `$${Math.round(forecastTable.rows[2][1].value)}`;

    const todayDate = forecastTable.rows[0][2].value;
    const tomorrowDate = forecastTable.rows[1][2].value;
    const nextDayDate = forecastTable.rows[2][2].value;

    const updatedTodayTable = {
      ...todayTable,
      rows: updatePrepPullAmount(todayTable),
    };
    const updatedTomorrowTable = {
      ...tomorrowTable,
      rows: updatePrepPullAmount(tomorrowTable),
    };
    const updatedNextDayTable = {
      ...nextDayTable,
      rows: updatePrepPullAmount(nextDayTable),
    };

    const pdfData = {
      title: `Prep & Thaw Chart - ${selectedUnitName}`,
      exportType: "print",
      body: [
        {
          type: "table",
          title: `Today - ${todayForecast}  ${todayDate}`,
          widths: [160, 110, "*", 27, 32, "*", "auto"],
          data: updatedTodayTable,
          dataTypes: [
            "string",
            "string",
            "currency",
            "percent",
            "numnber",
            "number",
            "number",
          ],
        },
        {
          type: "table",
          title: `Tomorrow - ${tomorrowForecast}  ${tomorrowDate}`,
          widths: [160, 110, "*", 27, 32, "*", "auto"],
          data: updatedTomorrowTable,
          dataTypes: [
            "string",
            "string",
            "currency",
            "percent",
            "numnber",
            "number",
            "number",
          ],
        },
        {
          type: "table",
          title: `Next Day - ${nextDayForecast}  ${nextDayDate}`,
          widths: [160, 110, "*", 27, 32, "*", "auto"],
          data: updatedNextDayTable,
          dataTypes: [
            "string",
            "string",
            "currency",
            "percent",
            "numnber",
            "number",
            "number",
          ],
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

    const defaultSafetyFactorColumns = [
      {
        name: "Default Safety Factor",
        key: "Default Safety Factor",
        width: 20,
      },
    ];

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
      {
        name: "Forecast",
        data: getTableData(forecastTable),
        columns: forecastColumns,
      },
      {
        name: "Default Safety Factor",
        data: getTableData(defaultSafetyFactorTable),
        columns: defaultSafetyFactorColumns,
        float: "right",
        cellSpan: 2,
        hasTableHeader: false,
      },
      { name: "Today", data: todayData, columns: prepColumns },
      { name: "Tomorrow", data: tomorrowData, columns: prepColumns },
      { name: "Next Day", data: nextDayData, columns: prepColumns },
    ];

    const filename = `${companyID}_${selectedUnit}_PrepChart_${prepChartDates.today.toLocaleDateString()}`;
    exportToExcel(
      data,
      filename,
      "Prep Chart",
      prepChartDates.today.toLocaleDateString(),
      selectedUnitName
    );
  };

  const getTableData = (table) => {
    return table.rows.map((row) => row.map((cell) => formatCellValue(cell)));
  };

  const formatCellValue = (cell) => {
    switch (cell.columnName) {
      case "Prep Type":
        return cell.value.find((option) => option.isSelected).option;
      case "Yield/Type":
      case "Forecasted Sales":
        return cell.value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case "Safety Factor":
      case "Default Safety Factor":
        return (cell.value / 100).toLocaleString("en-US", {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      default:
        return cell.value;
    }
  };

  const handleSaveClick = async () => {
    toastId.current = toast.info("Saving Prep Chart...", { autoClose: false });

    const postData = {
      url: "savePrepChartDetail",
      urlParams: {
        companyID: companyID,
      },
      bodyData: prepChart,
    };

    try {
      await postCall(postData);
      toast.success("Prep Chart saved successfully");
      toast.update(toastId.current, { autoClose: 500 });
    } catch (error) {
      toast.error("Failed to save Prep Chart");
      toast.update(toastId.current, { autoClose: 500 });
    }
  };

  const handleUnitSelectorClick = () => {
    setShowModal(true); // Open the modal when UnitSelector is clicked
  };
  const handleDateSelectorClick = () => {
    setShowDateModal(true);
  };

  const handleRowClick = (startDate, endDate) => {};
  const handleCloseModal = () => {
    setShowDateModal(false);
  };
  const handleDateSelection = (fromDate, toDate) => {
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
    setShowDateModal(false); // Close the date modal after selection
    getPrepChart(companyID, selectedUnit || state.defaultUnitID, toDate);
  };
  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowModal(false); // Close the date modal after selection
    getPrepChart(companyID, unitID, selectedToDate);
  };

  const handleIntroStart = () => {
    setIntroJS({ ...introJS, stepsEnabled: true });
  };

  return (
    <div className="w-[85%] mx-auto">
      <Steps
        enabled={introJS.stepsEnabled}
        steps={introJS.steps}
        initialStep={introJS.initialStep}
        onExit={() => setIntroJS({ ...introJS, stepsEnabled: false })}
      />
      <div className="text-2xl leading-tight my-4">Prep Chart</div>
      <div className="flex justify-between mb-10 rounded-2xl p-2.5 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
        <div className="flex mx-auto">
          <UnitSelector
            onClick={handleUnitSelectorClick}
            companyID={companyID}
            alignmentID={alignmentID}
            memberName={selectedUnitName}
            setMemberName={setSelectedUnitName}
            memberID={selectedUnit}
          />
          <DateSelector
            toDate={selectedToDate}
            fromDate={selectedFromDate}
            onClick={handleDateSelectorClick}
            isDateRange={false}
          />
          <UnitModal
            unitData={unitsList}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleUnitSelection={handleUnitSelection}
          />
          <CalendarModal
            handleClose={handleCloseModal}
            modalOpen={showDateModal}
            isDateRang={false}
            handleDateSelection={handleDateSelection}
          />
        </div>
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
      </div>
      {isLoading ? (
        <div className="text-2xl mx-auto w-full text-center">Loading...</div>
      ) : isError ? (
        <div className="text-2xl mx-auto w-full text-center">
          {errorMessage}
        </div>
      ) : (
        <>
          <div className="text-2xl my-4">Forecast</div>
          <div className="flex mx-auto gap-10">
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
          </div>
          <h2 className="today-table text-2xl my-4">
            Today - ${Math.round(prepChart.forecastData.today)}
          </h2>
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
          <h2 className={"tomorrow-table text-2xl my-4"}>
            Tomorrow - ${Math.round(prepChart.forecastData.tomorrow)}
          </h2>
          <Table
            columnHeaders={tomorrowTable.columnHeaders}
            dataTypes={tomorrowTable.dataTypes}
            columnwidths={tomorrowTable.columnWidths}
            rows={tomorrowTable.rows}
            tableName={"Tomorrow"}
            handleInputCellChange={handleTableCellChange}
            handleDropdownChange={handleDropdownChange}
            isSorting={false}
          />
          <h2 className={"nextday-table text-2xl my-4"}>
            Next Day - ${Math.round(prepChart.forecastData.nextDay)}
          </h2>
          <Table
            columnHeaders={nextDayTable.columnHeaders}
            dataTypes={nextDayTable.dataTypes}
            columnwidths={nextDayTable.columnWidths}
            rows={nextDayTable.rows}
            tableName={"NextDay"}
            handleInputCellChange={handleTableCellChange}
            handleDropdownChange={handleDropdownChange}
            isSorting={false}
          />
        </>
      )}
    </div>
  );
}
