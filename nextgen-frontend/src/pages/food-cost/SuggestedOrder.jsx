import { useEffect, useState } from "react";
import * as Styled from "./styles/SuggestedOrderStyles.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI.jsx";
import Dropdown from "../../components/DropDown.jsx";
import { VendorAPI } from "../../apis/food-cost/VendorAPI.jsx";
import DateRangePicker from "../../components/DateRange.jsx";
import MessagePopup from "../../components/MessagePopup.jsx";
import Table from "../../components/TableBuilder.jsx";
import { SuggestedOrderAPI } from "../../apis/food-cost/SuggestedOrderAPI.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";

export default function SuggestedOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedUnitName, setSelectedUnitName] = useState("No Unit Selected");
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState("No Vendor Selected");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [companyID, setCompanyID] = useState(null);
  const [alignmentID, setAlignmentID] = useState(null);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: ["Forecasted Date", "Forecasted $ Amt"],
    dataTypes: ["string", "number"],
    columnWidths: "1fr 1fr",
    rows: [],
    width: "50%",
  });
  const [defaultSafetyFactorTable, setDefaultSafetyFactorTable] = useState({
    columnHeaders: ["Default Safety Factor"],
    dataTypes: ["number"],
    columnWidths: "1fr",
    rows: [],
    width: "15%",
    height: "50%",
  });

  useEffect(() => {
    document.title = "Suggested Order";
    if (selectedUnit === undefined || selectedUnit === null) {
      let parameters = decodeURIComponent(
        window.location.search.replace("?data=", "")
      );
      if (parameters) parameters = JSON.parse(parameters);
      parameters && setCompanyID(parameters.CompanyID);
      parameters && setAlignmentID(parameters.AlignmentId);
      parameters && setSelectedUnit(parameters.User_DefaultUnitID);
      parameters && getUnits(
        parameters.CompanyID,
        parameters.AlignmentId,
        parameters.User_GroupOrUnitAccess
      );
      parameters && setSelectedUnitName(parameters.UnitName);
      parameters && setSelectedVendorName(parameters.VendorName);
    }
    if (selectedUnit !== undefined && selectedUnit !== null) {
      getSuggestedOrderData(companyID, selectedUnit, new Date());
      getVendors(companyID, selectedUnit, new Date());
    } else {
      setErrorMessage("No Unit or Vendor Selected, Please select a unit.");
      setIsError(true);
      setIsLoading(false);
    }
    getVendors();
  }, [selectedUnit, companyID]);

  const getUnits = (companyId, alignmentId, userId) => {
    UnitsAndAreasAPI.getbyid(companyId, alignmentId, userId)
      .then((data) => {
        setUnitsList(data);
      })
      .catch((error) => {
        console.error("Error getting units: ", error);
        setIsError(true);
      });
  };

  const getVendors = () => {
    VendorAPI.getVendors(companyID, alignmentID)
      .then((data) => {
        setVendorsList(data.Vendors);
      })
      .catch((error) => {
        console.error("Error getting vendors: ", error);
        setIsError(true);
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
  };

  const handleDateChange = (dates) => {
    const formates = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDateRange = `${dates[0].toLocaleDateString(
      undefined,
      formates
    )} - ${dates[1].toLocaleDateString(undefined, formates)}`;
    setSelectedDates(formattedDateRange);
  };

  const handleClose = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
    setShowWarningPopup(false);
  };

  const getSuggestedOrderData = (companyID, unitID, date) => {
    setIsLoading(true);
    setIsError(false);
    SuggestedOrderAPI.get(companyID, unitID, date.toISOString().split('T')[0]).then((data) => {
      if (data === "No Template found for the selected company and unit.") {
        setErrorMessage("No Template found for the selected unit. Please create a template for this unit.");
        setIsError(true);
        setIsLoading(false);
        return;
      }
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      buildForecastTable(data.forecastData, date, tomorrow, nextDay);
      setDefaultSafetyFactorTable({
        ...defaultSafetyFactorTable,
        rows: [[{ value: data.defaultSafetyFactor, cellType: "percent", columnName: "Default Safety Factor", handleOnChange: { }, isInput: true}]],
      });
    }).catch(error => {
      console.error("Error getting suggested order data: ", error);
      setIsError(true);
    }).finally(() => {
      setIsLoading(false);
    });
  }
  
  const buildForecastTable = (forecastData, today, tomorrow, nextDay) => {
    const rows = [
      [
        { value: today.toLocaleDateString(), cellType: "", columnName: "Date" },
        { value: forecastData.today, cellType: "dollar", isInput: true, columnName: "Forecasted Sales"},
      ],
      [
        { value: tomorrow.toLocaleDateString(), cellType: "", columnName: "Date" },
        { value: forecastData.tomorrow, cellType: "dollar", isInput: true, columnName: "Forecasted Sales" },
      ],
      [
        { value: nextDay.toLocaleDateString(), cellType: "", columnName: "Date" },
        { value: forecastData.nextDay, cellType: "dollar", isInput: true, columnName: "Forecasted Sales" },
      ],
    ];
  
    setForecastTable({
      ...forecastTable,
      rows: rows,
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
              Name: vendors.VendorName,
              value: vendors.VendorID,
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
              columnWidths={forecastTable.columnWidths}
              rows={forecastTable.rows}
              width={forecastTable.width}
              tableName={"Forecast"}
              isSorting={false}
            />
            <Table
              columnHeaders={defaultSafetyFactorTable.columnHeaders}
              dataTypes={defaultSafetyFactorTable.dataTypes}
              columnWidths={defaultSafetyFactorTable.columnWidths}
              rows={defaultSafetyFactorTable.rows}
              tableName={"DefaultSafetyFactor"}
              width={defaultSafetyFactorTable.width}
              height={defaultSafetyFactorTable.height}
              isSorting={false}
            />
          </Styled.ForeCastAndSafetyFactor>
        </>
      )}
    </Styled.PageContainer>
  );
}
