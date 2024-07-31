import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as Styled from "./styles/SuggestedOrderStyles.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import MessagePopup from "../../components/MessagePopup.jsx";
import Table from "../../components/TableBuilder.jsx";
import { SuggestedOrderAPI } from "../../apis/food-cost/SuggestedOrderAPI.jsx";
import { InventoryItemsAPI } from "../../apis/food-cost/InventoryItemsAPI.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";
import * as SuggestedOrderFunctions from "../../functions/SuggestedOrderFunctions.jsx";
import TreeTable from "../../components/TreeTableBuilder.jsx";
import VendorSelector from "../../components/VendorSelector.jsx";
import DateSelector from "../../components/DateSelector.jsx";
import MinimizableContainer from "../../components/MinimizableContainer.jsx";
import { toast } from "react-toastify";
import SubmitPurchaseOrderModal from "../../components/SubmitPurchaseOrderModal.jsx";

const toolTipForecastedDate = "Forecasted Sales dates selected for this order";
const toolTipForecastedAmt =
  "Forecasted sales from the main Forecast module. Forecasted sales may be adjusted for this order and will not impact any other module. Adjusted amounts will be flagged as *Changed.";

const toolTipDefaultSafetyFactor =
  "Set a default safety factor OR individual item safety factor below. Added buffer or cushion to the base SUGGESTED QTY amount. Typically used to ensure ample quantity, without running short of product. Short shelf-life items may have a lower safety factor applied to ensure top quality while minimizing waste and over stock.";

const toolTipItemDescription =
  "Vendor item description. Dropdown list shows substitute products ordered prior and mapped to the Inventory item.";
const toolTipItemRef = "Vendor reference #.";
const toolTipItemOrderUnit = "Vendor order unit i.e. case, box, etc.";
const toolTipPackSize =
  "Vendor packaging. How the item is packaged within the Vendor Order Unit.";
const toolTipCurrentLastPrice =
  "Integrated Vendor = Current vendor catalog pricing. NON-Integrated Vendor = last invoice price.";
const toolTipSafetyFactor =
  "Individual line item Safety Factor can be selected if different from the Default Safety Factor.";
const toolTipSuggestedQty =
  "(Order Span Forecasted Sales total / 4 week rolling average item dollar yield) * Safety Factor. The Suggested QTY value requires at least one instance of item usage.";
const toolTipOnHand =
  "Physical count of product on hand when creating your order. The On Hand value entered is deducted from the Suggested QTY to calculate the Order Amount.";
const toolTipOrderLimits = "Minimum and Maximum order quantity limits.";
  const toolTipOrderAmount =
  "The amount of product to order from your vendor. Suggested Qty - On Hand.";
const toolTipExtendedPrice = "Order Amount * Current/Last Price.";
const left = "left";
const right = "right";

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
    "Order Limits",
    "Order Amount",
    "Extended Price",
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
    "number",
    "number",
  ],
  columnWidth: ["160px", "160px", "70px", "80px", "70px", "145px", "80px", "80px", "80px", "80px"],
  rows: [],
  headerTooltips: [
    "",
    toolTipItemDescription,
    toolTipItemRef,
    toolTipItemOrderUnit,
    toolTipPackSize,
    toolTipCurrentLastPrice,
    toolTipSafetyFactor,
    toolTipSuggestedQty,
    toolTipOnHand,
    toolTipOrderLimits,
    toolTipOrderAmount,
    toolTipExtendedPrice,
  ],
  toolTipDirection: [
    "",
    right,
    right,
    right,
    right,
    right,
    right,
    right,
    right,
    right,
    right,
    right,
  ],
};
export default function SuggestedOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );
  const {
    company,
    unit,
    groupOrUnit,
    unitName,
    user,
    vendorID,
    vendorName,
    orderID,
    dates,
  } = useLocation().state || {};
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(unit);
  const [selectedUnitName, setSelectedUnitName] = useState(unitName);
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState(vendorName);
  const [selectedVendor, setSelectedVendor] = useState(vendorID);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [companyID, setCompanyID] = useState(company);
  const [alignmentID, setAlignmentID] = useState(null);
  const [groupOrUnitAccess, setGroupOrUnitAccess] = useState(groupOrUnit);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [fromDate, setFromDate] = useState(dates[0]);
  const [toDate, setToDate] = useState(dates[1]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [suggestedOrderID, setSuggestedOrderID] = useState(orderID || 0);
  const [suggestedOrder, setsuggestedOrder] = useState({});
  const [suggestedTable, setSuggestedTable] = useState({
    ...suggestedTableStructure,
  });
  const [orderLimits, setOrderLimits] = useState([]);
  const [filteredSuggestedTable, setFilteredSuggestedTable] = useState({
    ...suggestedTableStructure,
  });
  const [isVisible, setVisible] = useState(false);
  const [saveIsVisible, setSaveIsVisible] = useState(false);
  const [submitIsVisible, setSubmitIsVisible] = useState(false);
  const [userID, setUserID] = useState(user);
  const [successMessage, setSuccessMessage] = useState("");
  const [editedMessages, setEditedMessages] = useState({});
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: ["Forecasted Date", "Forecasted $ Amt", ""],
    dataTypes: ["string", "number", "string"],
    columnWidth: "1fr 1fr 0.5fr",
    rows: [],
    width: "50%",
    headerTooltips: [toolTipForecastedDate, toolTipForecastedAmt, ""],
    toolTipDirection: [right, right, ""],
  });

  const [saftyFactor, setSaftyFactor] = useState({});
  const toastId = useRef(null);

  const [defaultSafetyFactorTable, setDefaultSafetyFactorTable] = useState({
    columnHeaders: ["Default Safety Factor"],
    dataTypes: ["number"],
    columnWidth: "1fr",
    rows: [],
    width: "20%",
    height: "40%",
    headerTooltips: [toolTipDefaultSafetyFactor],
    toolTipDirection: [right],
  });
  const [saveSubmitStatus, setSaveSubmitStatus] = useState(0);

  useEffect(() => {
    window.parent.postMessage(JSON.stringify(window.location.pathname), "*");
    document.title = "Suggested Order";
    const today = new Date();
    const formattedDate = formatDate(today);
    setSelectedDates(dates);
    if (unit && vendorID && vendorName && dates) {
      getOrderItem(
        companyID,
        unit,
        selectedVendor,
        dates[0],
        dates[1],
        suggestedOrderID
      );
      getOrderLimits(companyID, unit);
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

  const getOrderItem = (
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
        if (response.message == 10003 || !response.data) {
          setErrorMessage("No data found for the selected unit and vendor");
          setIsError(true);
          setIsLoading(false);
          return;
        }
        buildForecastTable(response.data.forecastedData);
        setSaveSubmitStatus(response.data.suggestedOrderID);
        setSuggestedTable({
          ...suggestedTable,
          rows: response.data.suggestedOrderDetails,
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
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setIsError(true);
      });
  };

  const getOrderLimits = (companyID, unitID) => {
    InventoryItemsAPI.getInventoryItemsOrderLimits(companyID, unitID)
      .then((response) => {
        setOrderLimits(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Error getting Order Limits");
        setOrderLimits([]);
      });
  };

  useEffect(() => {
    if (forecastTable.rows.length > 0 && suggestedTable.rows.length > 0) {
      const newSuggestedOrder =
        SuggestedOrderFunctions.calculateSuggestedQuantities(
          forecastTable.rows[forecastTable.rows.length - 1][1].value,
          suggestedTable,
          orderLimits
        );
      setSuggestedTable({
        ...suggestedTable,
        rows: newSuggestedOrder,
      });
    }
  }, [forecastTable]);

  const handleClose = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
    setShowWarningPopup(false);
  };

  const buildForecastTable = (forecastData) => {
    let totalForecast = 0;
    const rows = [];

    forecastData.forEach((data, index) => {
      const projectedValue = Math.round(data.projectedValue);
      totalForecast += projectedValue;

      const editedMessage = editedMessages[data.firstMinute] || "";
      const row = [
        {
          value: new Date(data.firstMinute).toLocaleDateString(),
          cellType: "",
          columnName: "Date",
        },
        {
          value: projectedValue,
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

  useEffect(() => {
    const updateEditedMessages = () => {
      setForecastTable({
        ...forecastTable,
        rows: forecastTable.rows.map((row) => {
          const editedMessage = editedMessages[row[0].value] || "";
          return [
            row[0],
            row[1],
            {
              ...row[2],
              value: editedMessage,
            },
          ];
        }),
      });
    };
    updateEditedMessages();
  }, [editedMessages]);

  const handleCSVClick = () => {
    const data = suggestedTable.rows.flatMap((row) =>
      row.suggestedOrderItem.flatMap((item) =>
        item.vendorItems
          .filter((vendorItem) => vendorItem.isSelected)
          .map((selectedVendorItem) => [
            item.invItemDescription,
            selectedVendorItem.description,
            selectedVendorItem.vendorItemReference,
            selectedVendorItem.unitOfMeasure,
            selectedVendorItem.packSize,
            selectedVendorItem.latestInvoicePrice,
            selectedVendorItem.safetyFactor,
            selectedVendorItem.suggestedQty,
            selectedVendorItem.onHandQty,
            selectedVendorItem.orderQty,
            selectedVendorItem.extendedPrice,
          ])
      )
    );
    const csvDataString =
      suggestedTableStructure.columnHeaders.join(",") +
      "\n" +
      data.map((row) => row.join(",")).join("\n");
    const csvBlob = new Blob([csvDataString], { type: "text/csv" });
    const csvURL = window.URL.createObjectURL(csvBlob);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute(
      "download",
      `SuggestedOrder_${selectedUnitName}_${selectedVendorName}.csv`
    );
    tempLink.click();
  };

  const handlePDFClick = () => {
    const pdfData = {
      title: "Suggested Order",
      subHeaders: [
        `Unit: ${selectedUnitName}`,
        `Vendor: ${selectedVendorName}`, 
        `Order Span: ${fromDate.toDateString()} - ${toDate.toDateString()}`,
      ],
      pageOrientation: "landscape",
      exportType: "pdf",
      body: buildPDFBody(),
    };
    PdfBuilder(pdfData);
  };

  const buildPDFBody = () => {
    const body = suggestedTable.rows.map((row) => {
      return {
        type: "table",
        title: row.name,
        widths: [100, 75, "*", 50, "*", "*", "*", "*", 75, 75, "*"],
        data: formatPDFData(row.suggestedOrderItem),
        dataTypes: [
          "string",
          "string",
          "string",
          "string",
          "string",
          "currency",
          "percent",
          "number",
          "number",
          "number",
          "currency",
        ],
      };
    });

    return body;
  };

  const formatPDFData = (data) => {
    return {
      ...suggestedTableStructure,
      classNames: [
        "inventory-description",
        "item-description",
        "item-ref",
        "item-order-unit",
        "pack-size",
        "current-last-price",
        "safety-factor",
        "suggested-qty",
        "on-hand",
        "order-amount",
        "extended-price",
      ],
      rows: data.map((row) => {
        const selectedVendorItem = row.vendorItems.find(
          (item) => item.isSelected
        );
        return [
          {
            value: row.invItemDescription,
            cellType: "",
            columnName: "Inventory Description",
          },
          {
            value: selectedVendorItem.description,
            cellType: "",
            columnName: "Item Description",
          },
          {
            value: selectedVendorItem.vendorItemReference,
            cellType: "",
            columnName: "Item Ref",
          },
          {
            value: selectedVendorItem.unitOfMeasure,
            cellType: "",
            columnName: "Item Order Unit",
          },
          {
            value: selectedVendorItem.packSize,
            cellType: "",
            columnName: "Pack Size",
          },
          {
            value: selectedVendorItem.latestInvoicePrice,
            cellType: "dollar",
            columnName: "Current/Last Price",
          },
          {
            value: selectedVendorItem.safetyFactor,
            cellType: "percent",
            columnName: "Safety Factor",
          },
          {
            value: selectedVendorItem.suggestedQty,
            cellType: "",
            columnName: "Suggested Qty",
          },
          {
            value: selectedVendorItem.onHandQty,
            cellType: "",
            columnName: "On Hand",
          },
          {
            value: selectedVendorItem.orderQty,
            cellType: "",
            columnName: "Order Amount",
          },
          {
            value: selectedVendorItem.extendedPrice,
            cellType: "dollar",
            columnName: "Extended Price",
          },
        ];
      }),
    };
  };

  const handleTableCellChange = (e, row, columnName, tableName) => {
    const updatedValue = parseFloat(e.target.value);

    if (isNaN(updatedValue)) {
      console.error("Invalid input value");
      return;
    }

    switch (tableName) {
      case "DefaultSafetyFactor": {
        setDefaultSafetyFactorTable({
          ...defaultSafetyFactorTable,
          rows: [
            [
              {
                value: updatedValue,
                cellType: "percent",
                columnName: "Default Safety Factor",
                handleOnChange: {},
                isInput: true,
              },
            ],
          ],
        });
        const updatedRows = suggestedTable.rows.map((category) => {
          return {
            ...category,
            suggestedOrderItem: category.suggestedOrderItem.map((item) => {
              return {
                ...item,
                vendorItems: item.vendorItems.map((vendorItem) => {
                  if (vendorItem.qsrItemID in saftyFactor) {
                    const safetyFactor =
                      parseFloat(saftyFactor[vendorItem.qsrItemID]) / 100;
                    const suggestedQty =
                      parseFloat(vendorItem.suggestedQty) * (1 + safetyFactor);
                    const roundedQty = Math.round(suggestedQty * 100) / 100;
                    return {
                      ...vendorItem,
                      safetyFactor:
                        vendorItem.qsrItemID in saftyFactor
                          ? saftyFactor[vendorItem.qsrItemID]
                          : updatedValue,
                      suggestedQty: isNaN(roundedQty) ? 0 : roundedQty,
                      orderQty: (roundedQty - vendorItem.onHandQty).toFixed(2),
                      extendedPrice: (
                        parseFloat(
                          (roundedQty - vendorItem.onHandQty).toFixed(2)
                        ) * parseFloat(vendorItem.latestInvoicePrice)
                      ).toFixed(2),
                    };
                  } else {
                    const safetyFactor = parseFloat(updatedValue) / 100;
                    const suggestedQty =
                      parseFloat(vendorItem.suggestedQty) * (1 + safetyFactor);
                    const roundedQty = Math.round(suggestedQty * 100) / 100;

                    return {
                      ...vendorItem,
                      safetyFactor:
                        vendorItem.qsrItemID in saftyFactor
                          ? saftyFactor[vendorItem.qsrItemID]
                          : updatedValue,
                      suggestedQty: isNaN(roundedQty) ? 0 : roundedQty,
                      orderQty: (roundedQty - vendorItem.onHandQty).toFixed(2),
                      extendedPrice: (
                        parseFloat(
                          (roundedQty - vendorItem.onHandQty).toFixed(2)
                        ) * parseFloat(vendorItem.latestInvoicePrice)
                      ).toFixed(2),
                    };
                  }
                }),
              };
            }),
          };
        });
        setSuggestedTable({ 
          ...suggestedTable,
          rows: updatedRows,
        });
        break;
      }

      case "Forecast": {
        const updatedForecastData =
          SuggestedOrderFunctions.handleForecastChange(
            e,
            row,
            columnName,
            forecastTable,
            setForecastTable,
            editedMessages,
            setEditedMessages
          );
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

    return forecastedData
      .map((row, rowIndex) => {
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
      })
      .filter((item) => item !== null);
  }

  function defaultSafetyFactor(defaultSafetyFactorTable) {
    const [row] = defaultSafetyFactorTable || [];
    const valueEntry = row?.find(
      (entry) => entry.columnName === "Default Safety Factor"
    );
    return valueEntry?.value || 0;
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
      defaultSafetyFactor: defaultSafetyFactorTable.rows[0].value,
      forecastedData: forecastedData(forecastTable.rows),
      suggestedOrderDetails: suggestedTable.rows,
    };
    const jsonData = JSON.stringify(Data);
    toastId.current = toast.info("Saving Suggested Order...", {
      autoClose: false,
    });
    SuggestedOrderAPI.save(Data)
      .then(() => {
        setSaveIsVisible(false);
        setSubmitIsVisible(true);
        setSaveSubmitStatus(1);
        toast.success("Suggested Order Saved successfully");
        toast.update(toastId.current, { autoClose: 500 });
      })
      .catch((error) => {
        toast.error("Failed to Save Suggested Order");
        toast.update(toastId.current, { autoClose: 500 });
        setSaveIsVisible(true);
        setSubmitIsVisible(false);
      });
  }

  function onSubmitClick() {
    setShowSubmitModal(true);
  }

  function getSubmitData() {
    return {
      suggestedOrderID: suggestedOrderID,
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
    }
  }

  const setQid = (ind, sfValue) => {
    setSaftyFactor({ ...saftyFactor, [ind]: sfValue });
  };

  const handleSearch = (searchValue, setExpandedNodes) => {
    SuggestedOrderFunctions.onSearch(
      searchValue,
      suggestedTable,
      setSuggestedTable,
      setExpandedNodes
    );
  };

  const updateSuggestedTable = (newData) => {
    setSuggestedTable({
      ...suggestedTable,
      rows: newData,
    });
  };

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
            memberName={selectedUnitName}
            setMemberName={setSelectedUnitName}
            memberID={selectedUnit}
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
            memberID={selectedUnit}
            memberName={selectedUnitName}
            show={showModal}
            handleClose={() => {
              setShowModal(false);
            }}
          />
        </Styled.DateAndUnitContainer>

        <ExportOptions
          includePDF={true}
          includeCSV={true}
          includeSave={true}
          includeSubmit={true}
          handlePDFClick={handlePDFClick}
          handleCSVClick={handleCSVClick}
          handleSaveClick={handleSave}
          handleSubmitClick={onSubmitClick}
        />
        <SubmitPurchaseOrderModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          orderData={getSubmitData()}
          vendorName={selectedVendorName}
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
          <MinimizableContainer
            title={() => {
              return <div>Sales Forecast</div>;
            }}
          >
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
                headerTooltips={forecastTable.headerTooltips}
                toolTipDirection={forecastTable.toolTipDirection}
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
                headerTooltips={defaultSafetyFactorTable.headerTooltips}
                toolTipDirection={defaultSafetyFactorTable.toolTipDirection}
              />
            </Styled.ForeCastAndSafetyFactor>
          </MinimizableContainer>

          <Styled.InventoryItemsContainer>
            <TreeTable
              companyAndUnitData={{
                companyID: companyID,
                alignmentID: alignmentID,
                unitID: selectedUnit,
              }}
              data={suggestedTable.rows}
              setData={updateSuggestedTable}
              columnHeaders={suggestedTable.columnHeaders}
              dataTypes={suggestedTable.dataTypes}
              setQid={setQid}
              headerTooltips={suggestedTable.headerTooltips}
              toolTipDirection={suggestedTable.toolTipDirection}
              onSearch={handleSearch}
              orderLimits={orderLimits}
              setOrderLimits={setOrderLimits}
              columnWidths={suggestedTable.columnWidth}
            />
          </Styled.InventoryItemsContainer>
        </>
      )}
    </Styled.PageContainer>
  );
}
