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
  onEdit
) => {
  // Update the selectedVendorItems state for the specific index
  const updatedItems = selectedVendorItems.map((item, idx) => {
    if (idx !== index) return item;

    let updatedItem = { ...item, [field]: value };

    if (field === "safetyFactor") {
      const safetyFactor = parseFloat(value.replace("%", ""));
      if (!isNaN(safetyFactor) && safetyFactor !== parseFloat(item.safetyFactor)) {
        updatedItem = {
          ...updatedItem,
          safetyFactor: safetyFactor,
          suggestedQty: parseFloat(item.suggestedQty) * (1 + safetyFactor / 100),
          orderAmount: (parseFloat(item.suggestedQty) - item.onHand).toFixed(2),
          extendedPrice:(parseFloat((parseFloat(item.suggestedQty) - item.onHand).toFixed(2)) * parseFloat(item.latestInvoicePrice)).toFixed(2),
        };
        updatedItem.suggestedQty = parseFloat(updatedItem.suggestedQty.toFixed(2));
       
      }
      console.log("aaaa",updatedItem);
    } else if (field === "onHand") {
      const onHand = parseFloat(value);
      updatedItem = {
        ...updatedItem,
        onHand: isNaN(onHand) ? "NaN" : onHand,
        orderAmount: (parseFloat(item.suggestedQty) - onHand).toFixed(2),
        extendedPrice:(((parseFloat(item.suggestedQty) - onHand).toFixed(2)) * parseFloat(item.latestInvoicePrice)).toFixed(2),
      };
    } else if (field === "orderAmount") {
      const orderAmount = parseFloat(value);
      const latestInvoicePrice = parseFloat(item.latestInvoicePrice);
      updatedItem = {
        ...updatedItem,
        orderAmount: (parseFloat(item.suggestedQty) - parseFloat(item.onHand)).toFixed(2),
        extendedPrice:
          isNaN(orderAmount) || latestInvoicePrice === 0
            ? "NaN"
            : (orderAmount * latestInvoicePrice).toFixed(2),
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
