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
import { VendorAPI } from "../../apis/food-cost/VendorAPI.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";
import * as SuggestedOrderFunctions from "../../functions/SuggestedOrderFunctions.jsx";

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
    "number",
    "number",
    "number",
    "number",
  ],
  columnWidth: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
  rows: [],
};
let SaveSubmitStatus = 0;

export default function SuggestedOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(87);
  const [selectedUnitName, setSelectedUnitName] = useState("No Unit Selected");
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorName, setSelectedVendorName] =
    useState("No Vendor Selected");
  const [selectedVendor, setSelectedVendor] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [companyID, setCompanyID] = useState(1021);
  const [alignmentID, setAlignmentID] = useState(null);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isUnitSelected, setIsUnitSelected] = useState(false);
  const [isActive, setIsActive] = useState([]);
  const [suggestedOrder, setsuggestedOrder] = useState({});
  const [SuggestedTable, setSuggestedTable] = useState({
    ...SuggestedTableStructure,
  });
  const [IsVisible, setVisible] = useState(false);
  const [saveIsVisible, setsaveIsVisible] = useState(false);
  const [userID, setUserID] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [editedMessages, setEditedMessages] = useState({});
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: ["Forecasted Date", "Forecasted $ Amt", ""],
    dataTypes: ["string", "number", "string"],
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
    const today = new Date();
    const formattedDate = formatDate(today);
    setSelectedDates(`${formattedDate} - ${formattedDate}`);

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
      parameters ? setUserID(parameters.User_UserID) : setUserID();

      if (parameters.User_DefaultUnitID) {
        getUnits(companyID, alignmentID, 5120);
        getVendors(companyID);
        GetOrderItem(companyID, selectedUnit, selectedVendor, fromDate, toDate);
      } else {
        setErrorMessage("No Unit or Vendor Selected, Please select a unit.");
        setIsError(true);
        setIsLoading(false);
      }
    } else {
      getUnits(companyID, 1110, 5120);
      getVendors(companyID);
      GetOrderItem(companyID,selectedUnit,selectedVendor,fromDate,toDate,0);
    }
    setsaveIsVisible(SaveSubmitStatus === 0);
  }, []);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDateChange = ([start, end]) => {
    const formattedFromDate = formatDate(new Date(start));
    const formattedToDate = formatDate(new Date(end));
    setSelectedDates(`${formattedFromDate} - ${formattedToDate}`);
    setFromDate(start);
    setToDate(end);
    GetOrderItem(companyID, selectedUnit, selectedVendor, start, end, 0);
  };
  const getUnits = (companyId, alignmentId, userId) => {
    SuggestedOrderAPI.UnitsAndAreasAPI(companyId, alignmentId, userId)
      .then((response) => {
        console.log("Units ",response);  
          setUnitsList(response);
       
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
    VendorAPI.VendorsAPI(companyID)
      .then((response) => {
          setVendorsList(response);
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

  const handleUnitSelectorClick = () => {
    setShowModal(true);
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowModal(false);
    GetOrderItem(companyID, selectedUnit, selectedVendor, fromDate, toDate, 0);
  };

  const handleVendorSelection = (VendorName, VendorID) => {
    setSelectedVendorName(VendorName);
    setSelectedVendor(VendorID);
    GetOrderItem(companyID, selectedUnit, selectedVendor, fromDate, toDate, 0);
  };

  const GetOrderItem = (
    companyID,
    unitID,
    selectedVendor,
    orderFromDate,
    orderToDate,
    suggestedOrderId
  ) => {
    setIsLoading(true);
    SuggestedOrderAPI.getOrderItem(
      companyID,
      unitID,
      selectedVendor,
      formatDate(orderFromDate),
      formatDate(orderToDate),
      suggestedOrderId
    )
      .then((response) => {
        console.log("response",response);
        buildForecastTable(response.forecastedData);
        SaveSubmitStatus = response.suggestedOrderID;
        setSuggestedTable({
          ...SuggestedTableStructure,
          rows: response.suggestedOrderDetails,
        });
        setDefaultSafetyFactorTable({
          ...defaultSafetyFactorTable,
          rows: [
            [
              {
                value: response.defaultSafetyFactor,
                cellType: "percent",
                columnName: "Default Safety Factor",
                handleOnChange: {},
                isInput: true,
              },
            ],
          ],
        });
        setIsUnitSelected(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleClose = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
    setShowWarningPopup(false);
  };

  const buildForecastTable = (forecastData) => {
    let totalForecast = 0;
    const rows = [];
    
    forecastData.forEach((data, index) => {
      totalForecast += data.projectedValue;
  
    const editedMessage = editedMessages[data.firstMinute] || '';
      const row = [
        {
          value: new Date(data.firstMinute).toLocaleDateString(),
          cellType: "",
          columnName: "Date",
        },
        {
          value: data.projectedValue,
          cellType: "dollar",
          isInput: true,
          columnName: "Forecasted Sales",
        },
        {
          value: editedMessage,
          cellType: "",
          columnName: "Edited Message",
        },
      ];
  
      rows.push(row);
    });
  
    totalForecast = totalForecast.toFixed(2);
    const totalRow = [
      { value: "Total", cellType: "", columnName: "", isTotal: true },
      {
        value: totalForecast,
        cellType: "dollar",
        isInput: false,
        isTotal: true,
      },
      {
        value: "",
        cellType: "",
        columnName: "",
        isTotal: true,
      },
    ];
    rows.push(totalRow);
  
    setForecastTable({
      ...forecastTable,
      rows: rows,
    });
  };

  const handleCSVClick = () => {
    const csvData = {
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
          type: "table/Column",
          widths: [100, 75, 75, 75, 75, 75, 75, 75, 75],
          data: SuggestedTable,
        },
      ],
    };
    PdfBuilder(csvData);
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
        {
          type: "table/Column",
          title: "Default Safety Factor",
          widths: [100],
          data: defaultSafetyFactorTable,
        },
        {
          type: "table/Column",
          title: "Suggested Order",
          widths: [100, 75, 75, 75, 75, 75, 75, 75, 75],
          data: SuggestedTable,
        },
      ],
    };
    PdfBuilder(pdfData);
  };

  const handleTableCellChange = (e, row, columnName, tableName) => {
    const updatedValue = parseFloat(e.target.value);

    if (isNaN(updatedValue)) {
      console.error("Invalid input value");
      return;
    }

    switch (tableName) {
      case "DefaultSafetyFactor": {
        SuggestedOrderFunctions.handleDefaultSafetyFactorChange(e,row,columnName,tableName,defaultSafetyFactorTable,setDefaultSafetyFactorTable,suggestedOrder,
          setsuggestedOrder,setSuggestedTable,SuggestedTable);
        break;
      }
      case "Forecast": {
        const  updatedForecastData  = SuggestedOrderFunctions.handleForecastChange(e, row, columnName, forecastTable, setForecastTable,editedMessages,setEditedMessages);
        buildForecastTable(updatedForecastData);
        break;
      }
     
      default:
        console.error("Invalid table name");
        break;
    }
  };


  function ForecastedData(ForecastedData) {
    if (!Array.isArray(ForecastedData)) {
      console.error(
        "Expected ForecastedData to be an array but got:",
        ForecastedData
      );
      return [];
    }

    return ForecastedData.map((row, rowIndex) => {
      if (!Array.isArray(row)) {
        console.error(
          `Expected row at index ${rowIndex} to be an array but got:`,
          row
        );
        return null;
      }

      const dateEntry = row.find((entry) => entry.columnName === "Date");
      const valueEntry = row.find(
        (entry) => entry.columnName === "Forecasted Sales"
      );

      if (
        !dateEntry ||
        !dateEntry.value ||
        typeof valueEntry?.value !== "number"
      ) {
        return null;
      }

      const date = new Date(dateEntry.value);
      if (isNaN(date)) {
        console.error(
          `Invalid date format in row at index ${rowIndex}:`,
          dateEntry.value
        );
        return null;
      }

      const isoDate = date.toISOString().split("T")[0] + "T00:00:00";

      return {
        firstMinute: isoDate,
        projectedValue: valueEntry.value,
      };
    }).filter((item) => item !== null);
  }

  function DefaultSafetyFactor(defaultSafetyFactorTable) {
    const [row] = defaultSafetyFactorTable || [];
    const valueEntry = row?.find(
      (entry) => entry.columnName === "Default Safety Factor"
    );
    return valueEntry?.value || null;
  }

  function handleSave() {
    const Data = {
      suggestedOrderID: 1,
      purchaseOrderID: 0,
      companyID: companyID,
      unitID: selectedUnit,
      vendorID: selectedVendor,
      createdBy: userID,
      orderFromDate: fromDate,
      orderToDate: toDate,
      defaultSafetyFactor: DefaultSafetyFactor(defaultSafetyFactorTable.rows),
      forecastedData: ForecastedData(forecastTable.rows),
      suggestedOrderDetails: SuggestedTable.rows,
    };

    const jsonData = JSON.stringify(Data);
    console.log("jsonData", jsonData);
    SuggestedOrderAPI.save(jsonData)
      .then(() => {
        setsaveIsVisible(false);
        SaveSubmitStatus = 1;
        setSuccessMessage("Save successful");
        setShowSuccessPopup(true);
      })
      .catch((error) => {
        setShowErrorPopup(true);
      });
  }

  function handleSubmit() {
    const Data = {
      suggestedOrderID: 0,
      purchaseOrderID: 1,
      companyID: companyID,
      unitID: selectedUnit,
      vendorID: selectedVendor,
      createdBy: userID,
      orderFromDate: fromDate,
      orderToDate: toDate,
      defaultSafetyFactor: DefaultSafetyFactor(defaultSafetyFactorTable.rows),
      forecastedData: ForecastedData(forecastTable.rows),
      suggestedOrderDetails: SuggestedTable.rows,
    };
    const jsonData = JSON.stringify(Data);
    console.log("jsonData", jsonData);
    SuggestedOrderAPI.submit(jsonData)
      .then(() => {
        setVisible(true);
        setSuccessMessage("Submit successful");
        setShowSuccessPopup(true);
        setsaveIsVisible(true);
        SaveSubmitStatus = 0;
      })
      .catch((error) => {
        setShowErrorPopup(true);
        setVisible(false);
      });
  }
  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Suggested Order</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.MessageContainer>
          {showSuccessPopup && (
            <MessagePopup
              type="Success"
              message={successMessage}
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
          includePDF={IsVisible}
          includeCSV={IsVisible}
          includeSave={saveIsVisible}
          includeSubmit={saveIsVisible}
          handlePDFClick={handlePDFClick}
          handleCSVClick={handleCSVClick}
          handleSaveClick={handleSave}
          handleSubmitClick={handleSubmit}
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
              dataTypes={SuggestedTable.dataTypes}
              columnwidths={SuggestedTable.columnWidth}
              rows={SuggestedTable.rows}
              isTreeTable={true}
            />
          </Styled.InventoryItemsContainer>
        </>
      )}
    </Styled.PageContainer>
  );
}
