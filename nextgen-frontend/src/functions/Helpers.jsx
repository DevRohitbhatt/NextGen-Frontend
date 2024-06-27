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
  // Update the selectedVendorItems state for the specific index
  const updatedItems = selectedVendorItems.map((item, idx) => {
    if (idx !== index) return item;

    let updatedItem = { ...item, [field]: value };

    if (field === "safetyFactor") {
      const safetyFactor = parseFloat(value.replace("%", ""));
      if (!isNaN(safetyFactor) && safetyFactor !== parseFloat(item.safetyFactor)) {
        const newSuggestedQty = calculateSuggestedQty(item.suggestedQty, safetyFactor);
        const newOrderAmount = calculateOrderAmount(newSuggestedQty, item.onHand);
        updatedItem = {
          ...updatedItem,
          safetyFactor: safetyFactor,
          suggestedQty: newSuggestedQty,
          orderAmount: newOrderAmount,
          extendedPrice: calculateExtendedPrice(newOrderAmount, item.latestInvoicePrice),
        };
        setQid(item.qsrItemID, safetyFactor);
        updatedItem.suggestedQty = parseFloat(updatedItem.suggestedQty.toFixed(2));
       
      }
    } else if (field === "onHand") {
      const onHand = parseFloat(value);
      const newOrderAmount = calculateOrderAmount(item.suggestedQty, onHand);
      updatedItem = {
        ...updatedItem,
        onHand: isNaN(onHand) ? "NaN" : onHand,
        orderAmount: newOrderAmount,
        extendedPrice: calculateExtendedPrice(newOrderAmount, item.latestInvoicePrice)
      };
    } else if (field === "orderAmount") {
      const orderAmount = parseFloat(value);
      const latestInvoicePrice = parseFloat(item.latestInvoicePrice);
      updatedItem = {
        ...updatedItem,
        orderAmount: orderAmount,
        extendedPrice:
          isNaN(orderAmount) || latestInvoicePrice === 0
            ? "NaN"
            : calculateExtendedPrice(orderAmount, latestInvoicePrice)
      };
    } else if (field === "extendedPrice") {
      const extendedPrice = parseFloat(value);
      const latestInvoicePrice = parseFloat(item.latestInvoicePrice);
      updatedItem = {
        ...updatedItem,
        extendedPrice: isNaN(extendedPrice) ? "NaN" : extendedPrice.toFixed(2),
        orderAmount:
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
    ["safetyFactor", "onHand", "orderAmount", "extendedPrice"].includes(field)
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

const calculateOrderAmount = (suggestedQty, onHand) => {
    if (onHand > suggestedQty) {
        return 0;
    }
    return formatNumberTwoDecimals(suggestedQty - onHand);
}

const calculateExtendedPrice = (orderAmount, latestInvoicePrice) => {
    return (orderAmount * latestInvoicePrice).toFixed(2);
}
