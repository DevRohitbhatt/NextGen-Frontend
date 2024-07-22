import PdfBuilder from "../components/PdfBuilder";
export const handleForecastChange = (
  e,
  row,
  columnName,
  forecastTable,
  setForecastTable,
  editedMessages,
  setEditedMessages
) => {
  const updatedValue = parseFloat(e.target.value);

  if (isNaN(updatedValue)) {
    console.error("Invalid input value");
    return;
  }
  const currentCellValue = forecastTable.rows[row].find(cell => cell.columnName === columnName).value;
  const hasValueChanged = Math.round(currentCellValue, 0) !== updatedValue;
  const updatedEditedMessages = { ...editedMessages };
  if (hasValueChanged) {
    updatedEditedMessages[forecastTable.rows[row][0].value] = '* Changed';
  }
  setEditedMessages(updatedEditedMessages);

  const updatedRows = forecastTable.rows.map((r, rowIndex) => {
    if (rowIndex === row) {
      return r.map((cell) => {
        if (cell.columnName === columnName) {
          return { ...cell, value: updatedValue };
        }
        return cell;
      });
    }
    return r;
  });

  setForecastTable((prevTable) => ({
    ...prevTable,
    rows: updatedRows,
  }));

  // Recalculate the total forecasted value
  const updatedForecastData = updatedRows.slice(0, -1).map((row) => ({
    firstMinute: row[0].value,
    projectedValue: parseFloat(row[1].value),
  }));

  return updatedForecastData;
};

export const calculateSuggestedQuantities = (forecastTotal, suggestedOrderData) => { 
  const updatedSuggestedOrderData = suggestedOrderData.rows.map((detail) => {
    return {
      name: detail.name,
      suggestedOrderItem: detail.suggestedOrderItem.map((inventoryItem) => {
        return {
          ...inventoryItem,
          vendorItems: inventoryItem.vendorItems.map((vendorItem) => {
            if (vendorItem.suggestedQty !== 0 || vendorItem.onHandQty !== 0 || vendorItem.orderQty !== 0) {
              var extendedPrice = calculateExtendedPrice(vendorItem.orderQty, vendorItem.latestInvoicePrice);
              return {
                ...vendorItem,
                extendedPrice: extendedPrice,
              }
            }
            var suggestedQty = vendorItem.suggestedQty;
            var onHand = vendorItem.onHandQty;
            var orderQty = vendorItem.orderQty;
            var extendedPrice = 0;
            if (inventoryItem.invItemAvgSalesYieldPerMainUOM > 0) {
              suggestedQty = Math.ceil(
                (
                  (forecastTotal / inventoryItem.invItemAvgSalesYieldPerMainUOM) * vendorItem.mappingQuantityMultiplier
                ) * 1 + (vendorItem.safetyFactor / 100)
              );
            }
            orderQty = calculateOrderQty(suggestedQty, onHand);
            extendedPrice = calculateExtendedPrice(orderQty, vendorItem.latestInvoicePrice);
            const updatedVendorItem = {
              ...vendorItem,
              suggestedQty: suggestedQty,
              orderQty: orderQty,
              extendedPrice: extendedPrice,
            };
            return updatedVendorItem;
          }),
        }
      }),
    }
  });

  return updatedSuggestedOrderData;
}


export const handleVendorItemChange = (
  node,
  selectedQsrItemID,
  index,
  setSelectedVendorItems,
  onEdit
) => {
  const selectedVendorItem = node.suggestedOrderItem[index].vendorItems.find(
    (vendorItem) => vendorItem.qsrItemID === parseInt(selectedQsrItemID)
  );

  setSelectedVendorItems((prevSelectedVendorItems) => ({
    ...prevSelectedVendorItems,
    [index]: selectedVendorItem,
  }));

  const updatedSuggestedOrderItem = node.suggestedOrderItem.map(
    (childNode, i) =>
      i === index
        ? {
            ...childNode,
            vendorItems: childNode.vendorItems.map((vendorItem) =>
              vendorItem.qsrItemID === parseInt(selectedQsrItemID)
                ? { ...vendorItem, isSelected: true }
                : { ...vendorItem, isSelected: false }
            ),
          }
        : childNode
  );

  const updatedNode = {
    ...node,
    suggestedOrderItem: updatedSuggestedOrderItem,
  };

  onEdit(updatedNode);
};
export const handleEdit = async (
  field,
  value,
  index,
  node,
  selectedVendorItems,
  setSelectedVendorItems,
  onEdit,
  setQid
) => {
  const updatedItems = selectedVendorItems.map((item, idx) => {
    if (idx !== index) return item;

    let updatedItem = { ...item, [field]: value };

    if (field === "safetyFactor") {
      const safetyFactor = parseFloat(value.replace("%", ""));
      if (!isNaN(safetyFactor) && safetyFactor !== parseFloat(item.safetyFactor)) {
        const newSuggestedQty = calculateSuggestedQty(item.suggestedQty, safetyFactor);
        const newOrderQty = calculateOrderQty(newSuggestedQty, item.onHandQty);
        updatedItem = {
          ...updatedItem,
          safetyFactor: safetyFactor,
          suggestedQty: newSuggestedQty,
          orderQty: newOrderQty,
          extendedPrice: calculateExtendedPrice(newOrderQty, item.latestInvoicePrice),
        };
        setQid(item.qsrItemID, safetyFactor);
        updatedItem.suggestedQty = parseFloat(updatedItem.suggestedQty.toFixed(2));
       
      }
    } else if (field === "onHandQty") {
      const onHandQty = parseFloat(value);
      const neworderQty = calculateOrderQty(item.suggestedQty, onHandQty);
      updatedItem = {
        ...updatedItem,
        onHandQty: isNaN(onHandQty) ? "NaN" : onHandQty,
        orderQty: neworderQty,
        extendedPrice: calculateExtendedPrice(neworderQty, item.latestInvoicePrice)
      };
    } else if (field === "orderQty") {
      const orderQty = parseFloat(value);
      const latestInvoicePrice = parseFloat(item.latestInvoicePrice);
      updatedItem = {
        ...updatedItem,
        orderQty: orderQty,
        extendedPrice:
          isNaN(orderQty) || latestInvoicePrice === 0
            ? "NaN"
            : calculateExtendedPrice(orderQty, latestInvoicePrice)
      };
    } else if (field === "extendedPrice") {
      const extendedPrice = parseFloat(value);
      const latestInvoicePrice = parseFloat(item.latestInvoicePrice);
      updatedItem = {
        ...updatedItem,
        extendedPrice: isNaN(extendedPrice) ? "NaN" : extendedPrice.toFixed(2),
        orderQty:
          isNaN(extendedPrice) || latestInvoicePrice === 0
            ? "NaN"
            : (extendedPrice / latestInvoicePrice).toFixed(2),
      };
    }

    return updatedItem;
  });

  // Update the state with updatedItems
  setSelectedVendorItems(updatedItems);

  // Update the node's suggestedOrderItem to reflect changes in vendorItems
  const updatedSuggestedOrderItem = node.suggestedOrderItem.map(
    (childNode) => {

      let returntItem = {
        ...childNode,
        vendorItems: childNode.vendorItems.map((vendorItem) => {
          if (vendorItem.qsrItemID === updatedItems[index]?.qsrItemID) {
            return updatedItems[index];
          }
        }),
      };

      return returntItem;
    }
  );

  const updatedNode = {
    ...node,
    suggestedOrderItem: updatedSuggestedOrderItem,
  };

  if (
    ["safetyFactor", "onHandQty", "orderQty", "extendedPrice"].includes(field)
  ) {
    onEdit(updatedNode);
  }

  return updatedNode;
};

const formatNumberTwoDecimals = (value) => {
    const rounded = value.toFixed(2);
    return parseFloat(rounded);
}

const calculateSuggestedQty = (suggestedQty, safetyFactor) => {
    return formatNumberTwoDecimals(suggestedQty * (1 + safetyFactor / 100));
}

const calculateOrderQty = (suggestedQty, onHandQty) => {
    if (onHandQty > suggestedQty) {
        return 0;
    }
    return formatNumberTwoDecimals(suggestedQty - onHandQty);
}

const calculateExtendedPrice = (orderQty, latestInvoicePrice) => {
  const extendedPrice = '$' + ((orderQty * latestInvoicePrice).toFixed(2)).toString();
  return extendedPrice;
}

export const submitSuggestedOrderPDF =(suggestedOrderData) => {
  const pdfData = {
    title: "Suggested Order",
    subHeaders: ["Suggested Order Details"],
    exportType: "pdf",
    body: [
      {
        type: "table",
        widths: ["*", "*", "*", "*", "*"],
        dataTypes: ["string", "string", "string", "string", "string"],
        data: {
          columnHeaders: ["Item Description", "Item Ref", "Order Unit", "Pack Size", "Order Amount"],
          rows: formatExportArray(suggestedOrderData),
        }
      }
    ],
  };

  PdfBuilder(pdfData); 
}

const formatExportArray = (data) => {
  var returnArray = [];
  data.rows.map((detail) => {
    detail.suggestedOrderItem.map((inventoryItem) => {
      const selectedVendorItem = inventoryItem.vendorItems.find((vendorItem) => vendorItem.isSelected);
      if (selectedVendorItem.orderQty > 0) {
        returnArray.push([
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
            columnName: "Order Unit",
          },
          {
            value: selectedVendorItem.packSize,
            cellType: "",
            columnName: "Pack Size",
          },
          {
            value: selectedVendorItem.orderQty,
            cellType: "",
            columnName: "Order Amount",
          }
        ]);
      }
    });
  });
  return returnArray;
};

export const submitSuggestedOrderCSV = (suggestedOrderData, filename) => {
  const csvData = formatExportArray(suggestedOrderData);
  const headers = ["Item Description", "Item Ref", "Order Unit", "Pack Size", "Order Amount"];
  const csvDataString = headers.join(",") + "\n" + csvData.map((row) => row.map((cell) => cell.value).join(",")).join("\n");
  const csvBlob = new Blob([csvDataString], { type: "text/csv" });
  const csvURL = window.URL.createObjectURL(csvBlob);
  const tempLink = document.createElement("a");
  tempLink.href = csvURL;
  tempLink.setAttribute("download", filename + ".csv");
  tempLink.click();
}

export const onSearch = (searchTerm, data, setFilteredData, setExpandedNodes) => {
  const updatedExpandedNodes = {};
  const filteredData = data.rows.map((node) => {
    const updatedSuggestedOrderItem = node.suggestedOrderItem.map((item) => {
      let isHidden = false;
      if (
        item.invItemDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        updatedExpandedNodes[node.name] = true;
      } else {
        isHidden = true;
      }
      return { ...item, isHidden: isHidden };
    });
    return { ...node, suggestedOrderItem: updatedSuggestedOrderItem };
  });
  setExpandedNodes(updatedExpandedNodes);
  setFilteredData({ ...data, rows: filteredData });
};
