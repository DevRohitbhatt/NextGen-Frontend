import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
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
import * as SuggestedOrderFunctions from "../../functions/SuggestedOrderFunctions.jsx";
import TreeTable from "../../components/TreeTableBuilder.jsx";
import VendorSelector from "../../components/VendorSelector.jsx";
import DateSelector from "../../components/DateSelector.jsx";
import MinimizableContainer from "../../components/MinimizableContainer.jsx";

const suggestedTableStructure = {
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
    "Order Amount",
    "Extended Price"
  ],
  dataTypes: [
    "string",
    "string",
    "string",
    "string",
    "string",
    "number",
    "percent",
    "number",
    "number",
    "number",
    "number"
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
  const { company, unit, groupOrUnit, unitName, vendorID, vendorName, dates } = useLocation().state || {};
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(unit);
  const [selectedUnitName, setSelectedUnitName] = useState(unitName);
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorName, setSelectedVendorName] =
    useState(vendorName);
  const [selectedVendor, setSelectedVendor] = useState(vendorID);
  const [showModal, setShowModal] = useState(false);
  const [companyID, setCompanyID] = useState(company);
  const [alignmentID, setAlignmentID] = useState(null);
  const [groupOrUnitAccess, setGroupOrUnitAccess] = useState(groupOrUnit);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [fromDate, setFromDate] = useState(dates[0]);
  const [toDate, setToDate] = useState(dates[1]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [suggestedOrder, setsuggestedOrder] = useState({});
  const [suggestedTable, setSuggestedTable] = useState({
    ...suggestedTableStructure,
  });
  const [isVisible, setVisible] = useState(false);
  const [saveIsVisible, setSaveIsVisible] = useState(false);
  const [submitIsVisible, setSubmitIsVisible] = useState(false);
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
  const [saveSubmitStatus, setSaveSubmitStatus] = useState(0);

  useEffect(() => {
    document.title = "Suggested Order";
    const today = new Date();
    const formattedDate = formatDate(today);
    setSelectedDates(dates);

    console.log(unit, vendorID, vendorName, dates)

    if (unit && vendorID && vendorName && dates) {
      getOrderItem(companyID,unit,selectedVendor,dates[0],dates[1],0);
    }
    setSaveIsVisible(saveSubmitStatus === 0 ? true : false);
    setSubmitIsVisible(saveSubmitStatus === 0 ? false : true);
  }, []);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  
  const getOrderItem = (companyID,unitID,selectedVendor,orderFromDate,orderToDate,suggestedOrderId) => {
    setIsLoading(true);
    SuggestedOrderAPI.getOrderItem(companyID,unitID,selectedVendor,formatDate(orderFromDate),formatDate(orderToDate),suggestedOrderId)
      .then((response) => {
        console.log(response.data.suggestedOrderDetails);
        buildForecastTable(response.data.forecastedData);
        setSaveSubmitStatus(response.data.suggestedOrderID);
        setSuggestedTable({
          ...suggestedTable,
          rows: response.data.suggestedOrderDetails.map((category) => {
              return {
                name: category.name,
                suggestedOrderItem: category.suggestedOrderItem.map((item) => {
                  return {
                    department: item.department,
                    subDepartment: item.subDepartment,
                    invItemDescription: item.invItemDescription,
                    qsrInventoryItemID: item.qsrInventoryItemID,
                    invItemMainUOM: item.invItemMainUOM,
                    vendorItems: item.vendorItems.map((vendorItem) => {
                      return {
                        qsrItemID: vendorItem.qsrItemID,
                        description: vendorItem.description,
                        vendorItemReference: vendorItem.vendorItemReference,
                        packSize: vendorItem.packSize,
                        mappedTo: vendorItem.mappedTo,
                        unitOfMeasure: vendorItem.unitOfMeasure,
                        mappingQuantityMultiplier: vendorItem.mappingQuantityMultiplier,
                        latestInvoicePrice: vendorItem.latestInvoicePrice,
                        latestInvoiceDate: vendorItem.latestInvoiceDate,
                        safetyFactor: vendorItem.safetyFactor,
                        suggestedQty: vendorItem.suggestedQty,
                        onHand: vendorItem.onHand,
                        orderAmount: vendorItem.orderAmount,
                        extendedPrice: vendorItem.extendedPrice,
                        isSelected: vendorItem.isSelected
                      };
                    }),
                  };
                })
              };
          }),
        });
        setDefaultSafetyFactorTable({
          ...defaultSafetyFactorTable,
          rows: [
            [
              {
                value: response.data.defaultSafetyFactor,
                cellType: "percent",
                columnName: "Default Safety Factor",
                handleOnChange: {},
                isInput: true,
              },
            ],
          ],
        });
        setIsLoading(false);
        console.log(suggestedTable);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setIsError(true);
      });
  };

  useEffect(() => {
    // This effect runs whenever suggestedTable.rows changes
    console.log('Updated rows:', suggestedTable.rows);
  }, [suggestedTable]);

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
      title: "Order details",
      exportType: "csv",
      body: [
        {
          type: "table/Column",
          widths: [100, 75, 75, 75, 75, 75, 75, 75, 75],
          data: suggestedTable,
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
          data: suggestedTable,
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
        const updatedRows = suggestedTable.rows.map(category => {
          return {
            ...category,
            suggestedOrderItem: category.suggestedOrderItem.map(item => {
              return {
                ...item,
                vendorItems: item.vendorItems.map(vendorItem => {
                  return {
                    ...vendorItem,
                    safetyFactor: updatedValue
                  };
                })
              };
            })
          };
        });
        
        setSuggestedTable({
          ...suggestedTable,
          rows: updatedRows
        });
        break;
      }
      case "Forecast": {
        const updatedForecastData = SuggestedOrderFunctions.handleForecastChange(e, row, columnName, forecastTable, setForecastTable, editedMessages, setEditedMessages);
        buildForecastTable(updatedForecastData);
        break;
      }
      default:
        console.error("Invalid table name");
        break;
    }
  };
  
  

  function forecastedData(forecastedData) {
    if (!Array.isArray(forecastedData)) {
      console.error(
        "Expected ForecastedData to be an array but got:",
        forecastedData
      );
      return [];
    }

    return forecastedData.map((row, rowIndex) => {
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

  function defaultSafetyFactor(defaultSafetyFactorTable) {
    const [row] = defaultSafetyFactorTable || [];
    const valueEntry = row?.find(
      (entry) => entry.columnName === "Default Safety Factor"
    );
    return valueEntry?.value || null;
  }

  function handleSave() {
    const Data = {
      suggestedOrderID: 0,
      purchaseOrderID: 0,
      companyID: companyID,
      unitID: selectedUnit,
      vendorID: selectedVendor,
      createdBy: userID,
      orderFromDate: fromDate,
      orderToDate: toDate,
      defaultSafetyFactor: defaultSafetyFactor(defaultSafetyFactorTable.rows),
      forecastedData: forecastedData(forecastTable.rows),
      suggestedOrderDetails: suggestedTable.rows,
    };

    console.log(Data)

    const jsonData = JSON.stringify(Data);
    SuggestedOrderAPI.save(Data)
      .then(() => {
        setSaveIsVisible(false);
        setSubmitIsVisible(true);
        setSaveSubmitStatus(1);
        setSuccessMessage("Save successful");
        setShowSuccessPopup(true);
      })
      .catch((error) => {
        setShowErrorPopup(true);
        setSaveIsVisible(true);
        setSubmitIsVisible(false);
      });
  }

  function handleSubmit() {
    const data = {
      suggestedOrderID: 0,
      purchaseOrderID: 1,
      companyID: companyID,
      unitID: selectedUnit,
      vendorID: selectedVendor,
      createdBy: userID,
      orderFromDate: fromDate,
      orderToDate: toDate,
      defaultSafetyFactor: defaultSafetyFactor(defaultSafetyFactorTable.rows),
      forecastedData: forecastedData(forecastTable.rows),
      suggestedOrderDetails: suggestedTable.rows,
    };
    const jsonData = JSON.stringify(data);
    console.log("jsonData", jsonData);
    SuggestedOrderAPI.submit(jsonData)
      .then(() => {
        setVisible(true);
        setSuccessMessage("Submit successful");
        setShowSuccessPopup(true);
        setSubmitIsVisible(false);
        setSaveIsVisible(false);
        setSaveSubmitStatus(0);
      })
      .catch((error) => {
        setShowErrorPopup(true);
        setVisible(false);
      });
  }

  console.log("SuggestedOrder",suggestedTable.rows);
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
            companyID={companyID}
            alignmentID={alignmentID}
            memberID={groupOrUnitAccess}
            unitName={selectedUnitName}
            setUnitName={setSelectedUnitName}
            unitID={selectedUnit}
            isEditable={false}
          />
          <VendorSelector
            vendorName={selectedVendorName}
            setVendorName={setSelectedVendorName}
            vendorID={selectedVendor}
            isEditable={false}
          />
          <DateSelector
            fromDate={fromDate}
            toDate={toDate}
            isDateRange={true}
            isEditable={false}
          />
          <UnitModal
            unitData={unitsList}
            unitID={selectedUnit}
            unitName={selectedUnitName}
            show={showModal}
            handleClose={() => {
              setShowModal(false);
            }}
          />
        </Styled.DateAndUnitContainer>

        <ExportOptions
          includePDF={isVisible}
          includeCSV={isVisible}
          includeSave={saveIsVisible}
          includeSubmit={submitIsVisible}
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
          <MinimizableContainer title={() => {return <div>Sales Forecast</div>}}>
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
          </MinimizableContainer>

          <Styled.InventoryItemsContainer>
            <TreeTable
              data={suggestedTable.rows}
              columnHeaders={suggestedTable.columnHeaders}
              dataTypes={suggestedTable.dataTypes}
            />
          </Styled.InventoryItemsContainer>
        </>
      )}
    </Styled.PageContainer>
  );
}
