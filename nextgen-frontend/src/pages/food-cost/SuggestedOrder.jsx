import { useEffect, useState } from "react";
import * as Styled from "./styles/SuggestedOrderStyles.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import Dropdown from "../../components/DropDown.jsx";
import DateRangePicker from "../../components/DateRange.jsx";
import MessagePopup from "../../components/MessagePopup.jsx";
import Table from "../../components/TableBuilder.jsx";
import { SuggestedOrderAPI } from "../../apis/food-cost/SuggestedOrderAPI.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";
import * as PrepChartFunctions from "../../functions/PrepChartFunctions.jsx";


const SuggestedTableStructure = {
  columnHeaders: [
    "Inventory Description",
    "Item Description",
    "Item Ref",
    "Item Order Unit",
    "Pack Size",
    "Current/Last Price",
    "Safety Factor",
    "Suggested Qty",
    "On Hand",
  ],
  dataTypes: [
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
  ],
  columnWidth: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
  rows: [],
};

export default function SuggestedOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("No Unit Selected");
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState("No Vendor Selected");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState(null);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [FromDate, setFromDate] = useState();
  const [ToDate, setToDate] = useState();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isUnitSelected, setIsUnitSelected] = useState(false);
  const [IsActive, setIsActive] = useState([]);
  const [prepChart, setPrepChart] = useState({});
  const [SuggestedTable, setSuggestedTable] = useState({
    ...SuggestedTableStructure,
  });

  const [forecastTable, setForecastTable] = useState({
    columnHeaders: ["Forecasted Date", "Forecasted $ Amt",""],
    dataTypes: ["string", "number","string"],
    columnWidth: "1fr 1fr 0.5fr",
    rows: [],
    width: "50%",
  });

  const [defaultSafetyFactorTable, setDefaultSafetyFactorTable] = useState({
    columnHeaders: ["Default Safety Factor"],
    dataTypes: ["number"],
    columnWidth: "1fr",
    rows: [],
    width: "20%",
    height: "40%",
  });

  useEffect(() => {
    document.title = "Suggested Order";
    if (!unitsList) {
      let parameters = decodeURIComponent(
        window.location.search.replace("?data=", "")
      );
      if (parameters) parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters ? setAlignmentID(parameters.AlignmentId) : setAlignmentID();
      parameters
        ? setSelectedUnit(parameters.User_DefaultUnitID)
        : setSelectedUnit();
      parameters ? setIsActive(parameters.UnitID) : setIsActive();
      if (parameters.User_DefaultUnitID) {
        fetchData(1021, 51, new Date());
        getUnits(1021, 1110, 5120);
        getVendors(1021);
      } else {
        setErrorMessage("No Unit or Vendor Selected, Please select a unit.");
        setIsError(true);
        setIsLoading(false);
      }
    } else {
      getVendors(1021);
      getUnits(1021, 1110, 5120);
      getSuggestedOrderData(1021, 51, new Date());
     // fetchData(1021, 51, new Date());
    }
  }, []);

  const getUnits = (companyId, alignmentId, userId) => {
    SuggestedOrderAPI.getbyid(companyId, alignmentId, userId)
      .then((response) => {
        const data = response.data; // Extract data object from the response
        if (response.message === "10001") {
          setUnitsList(data);
        }
      })
      .catch((error) => {
        setIsError(true);
        if (error.response && error.response.status === 404) {
          setErrorMessage("Units not found for the given parameters.");
        } else if (error.response && error.response.status === 403) {
          setErrorMessage(
            "Access denied. You do not have permission to view units."
          );
        } else {
          setErrorMessage("An error occurred while getting units.");
        }
      });
  };

  const getVendors = (companyID) => {
    SuggestedOrderAPI.getVendor(companyID)
      .then((response) => {
        const data = response.data; // Extract data object from the response
        if (response.message === "10001") {
          setVendorsList(data);
        }
      })
      .catch((error) => {
        setIsError(true);
        if (error.response && error.response.status === 404) {
          setErrorMessage("vendors not found for the given parameters.");
        } else if (error.response && error.response.status === 403) {
          setErrorMessage(
            "Access denied. You do not have permission to view vendors."
          );
        } else {
          setErrorMessage("An error occurred while getting vendors.");
        }
      });
  };
  const getSuggestedOrderData = (companyID, unitID, date,selectedVendor) => {
    setIsLoading(true);
    setIsError(false);
    SuggestedOrderAPI.getItem(
      companyID,
      unitID,
      date.toISOString().split("T")[0],
      selectedVendor
    )
      .then((response) => {
        const data = response.data; // Extract data object from the response
        if (response.message === "10001") {
          const tomorrow = new Date(date);
          tomorrow.setDate(date.getDate() + 1);
          const nextDay = new Date(tomorrow);
          nextDay.setDate(nextDay.getDate() + 1);
          buildForecastTable(data.forecastData, date, tomorrow, nextDay);

          setDefaultSafetyFactorTable({
            ...defaultSafetyFactorTable,
            rows: [
              [
                {
                  value: data.defaultSafetyFactor,
                  cellType: "percent",
                  columnName: "Default Safety Factor",
                  handleOnChange: {},
                  isInput: true,
                },
              ],
            ],
          });
        } else {
          setErrorMessage(
            "No Template found for the selected unit. Please create a template for this unit."
          );
          setIsError(true);
        }
      })
      .catch((error) => {
        console.error("Error getting suggested order data: ", error);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUnitSelectorClick = () => {
    setShowModal(true);
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowModal(false);
  };

  const handleVendorSelection = (VendorName, VendorID) => {
    setSelectedVendorName(VendorName);
    setSelectedVendor(VendorID);
    getSuggestedOrderData(companyID,selectedUnit,selectedDates,selectedVendor)
  };

  const handleDateChange = (dates) => {
    const formates = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDateRange = `${dates[0].toLocaleDateString(
      undefined,
      formates
    )} - ${dates[1].toLocaleDateString(undefined, formates)}`;

    const FromDates=`${dates[0].toLocaleDateString(undefined,formates)}`
    const TodayDates=`${dates[0].toLocaleDateString(undefined,formates)}`

    setFromDate(FromDates)
    setToDate(TodayDates)
    setSelectedDates(formattedDateRange);
  };

  const handleClose = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
    setShowWarningPopup(false);
  };

  const buildForecastTable = (forecastData, today, tomorrow, nextDay) => {
    const totalForecast =
      forecastData.today + forecastData.tomorrow + forecastData.nextDay;

    const rows = [
      [
        { value: today.toLocaleDateString(), cellType: "", columnName: "Date" },
        {
          value: forecastData.today,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        {
          value:"",cellType: "", columnName: "" 
        }
      ],
      [
        {
          value: tomorrow.toLocaleDateString(),
          cellType: "",
          columnName: "Date",
        },
        {
          value: forecastData.tomorrow,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        {
          value:"",cellType: "", columnName: "" 
        }
      ],
      [
        {
          value: nextDay.toLocaleDateString(),
          cellType: "",
          columnName: "Date",
        },
        {
          value: forecastData.nextDay,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        {
          value:"",cellType: "", columnName: "" 
        }
      ],
    ];
    const updatedRows = rows.filter((row) => row[0].value !== "Total");

    const totalRow = [
      { value: "Total", cellType: "", columnName: "" ,isTotal:true      },
      {
        value: totalForecast,
        cellType: "dollar",
        isInput: false,
        isTotal:true     
      },
      {
        value:"",cellType: "", columnName: "" ,isTotal:true
      }
    ];
    updatedRows.push(totalRow);

    setForecastTable({
      ...forecastTable,
      rows: updatedRows,
    });
  };

  const handleCSVClick = () => {
    const pdfData = {
      title: "Suggested Order",
      exportType: "csv",
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

  const fetchData = (companyID, selectedUnit, date) => {
    setIsLoading(true);
    SuggestedOrderAPI.get(
      companyID,
      selectedUnit,
      date.toISOString().split("T")[0]).then((response) => {
        const data = response.data; // Extract data object from the response
        console.log(data)
        if (response.message === "10001") {
          buildPrepMasterTable(data);
          setIsUnitSelected(true);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const buildPrepMasterTable = (SuggestedOrder) => {
    setSuggestedTable({
      ...SuggestedTableStructure,
      rows: SuggestedOrder,
    });
  };

  function handleTableCellChange(e, row, columnName, tableName) {
    switch (tableName) {
      case "DefaultSafetyFactor":
        PrepChartFunctions.handleDefaultSafetyFactorChange(e, row, columnName, tableName, defaultSafetyFactorTable, setDefaultSafetyFactorTable, prepChart, setPrepChart, setSuggestedTable, SuggestedTable);
        break;
      case "Forecast":
        PrepChartFunctions.handleForecastChange(e, row, columnName, tableName, forecastTable, setForecastTable, prepChart, setPrepChart, SuggestedTable, setSuggestedTable);
        break;
      default:
        console.error("Invalid table name");
        break;
    }
  }

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Suggested Order</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.MessageContainer>
          {showSuccessPopup && (
            <MessagePopup
              type="Success"
              message="Success message"
              onClose={handleClose}
            />
          )}

          {showErrorPopup && (
            <MessagePopup
              type="Error"
              message="Error message"
              onClose={handleClose}
            />
          )}

          {showWarningPopup && (
            <MessagePopup
              type="Warning"
              message="Warning message"
              onClose={handleClose}
            />
          )}
        </Styled.MessageContainer>

        <Styled.DateAndUnitContainer>
          <UnitSelector
            onClick={handleUnitSelectorClick}
            unitName={selectedUnitName}
            setUnitName={setSelectedUnitName}
            unitID={selectedUnit}
          />
          <Dropdown
            options={vendorsList.map((vendors) => ({
              Name: vendors.vendorName,
              value: vendors.vendorID,
            }))}
            selectedOption={selectedVendorName}
            onOptionChange={handleVendorSelection}
          />
          <DateRangePicker
            selectedDates={selectedDates}
            onDateChange={handleDateChange}
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
        </Styled.DateAndUnitContainer>
        <ExportOptions
          includePDF={true}
          includeCSV={true}
          includeSave={true}
          handlePDFClick={handlePDFClick}
          handleCSVClick={handleCSVClick}
        />
      </Styled.OptionsRow>
      {isLoading ? (
        <>
          <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
        </>
      ) : isError ? (
        <Styled.UnloadedMessage>{errorMessage}</Styled.UnloadedMessage>
      ) : (
        <>
          <h2>Order Forecasted</h2>
          <Styled.ForeCastAndSafetyFactor>
            <Table
              columnHeaders={forecastTable.columnHeaders}
              dataTypes={forecastTable.dataTypes}
              columnwidths={forecastTable.columnWidth}
              rows={forecastTable.rows}
              width={forecastTable.width}
              tableName={"Forecast"}
              handleInputCellChange={handleTableCellChange}
              isSorting={false}
            />

            <Table
              columnHeaders={defaultSafetyFactorTable.columnHeaders}
              dataTypes={defaultSafetyFactorTable.dataTypes}
              columnwidths={defaultSafetyFactorTable.columnWidth}
              rows={defaultSafetyFactorTable.rows}
              tableName={"DefaultSafetyFactor"}
              width={defaultSafetyFactorTable.width}
              height={defaultSafetyFactorTable.height}
              handleInputCellChange={handleTableCellChange}
              isSorting={false}
            />
          </Styled.ForeCastAndSafetyFactor>

          <Styled.InventoryItemsContainer>
            <Table
              columnHeaders={SuggestedTable.columnHeaders}
              columnwidths={SuggestedTable.columnWidth}
              dataTypes={SuggestedTable.dataTypes}
              rows={SuggestedTable.rows}
              isSorting={false}
              className={"SuggestedTable"}
            />
          </Styled.InventoryItemsContainer>
        </>
      )}
    </Styled.PageContainer>
  );
}
