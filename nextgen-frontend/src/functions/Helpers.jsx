export const handleVendorItemChange = (node, selectedQsrItemID, index, setSelectedVendorItems, onEdit) => {
    const selectedVendorItem = node.suggestedOrderItem[index].vendorItems.find(
        (vendorItem) => vendorItem.qsrItemID === parseInt(selectedQsrItemID)
    );

    setSelectedVendorItems((prevSelectedVendorItems) => ({
        ...prevSelectedVendorItems,
        [index]: selectedVendorItem,
    }));

    const updatedSuggestedOrderItem = node.suggestedOrderItem.map((childNode, i) =>
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

export const handleEdit = (field, value, index, node, selectedVendorItems, setSelectedVendorItems, onEdit) => {
    // Update the selectedVendorItems state for the specific index
    const updatedVendorItem = {
        ...selectedVendorItems[index],
        [field]: value
    };

    // Update the selectedVendorItems state
    setSelectedVendorItems(prevSelectedVendorItems => ({
        ...prevSelectedVendorItems,
        [index]: updatedVendorItem
    }));

    // Update the node's suggestedOrderItem to reflect changes in vendorItems
    const updatedSuggestedOrderItem = node.suggestedOrderItem.map((childNode, i) =>
        i === index
            ? {
                ...childNode,
                vendorItems: childNode.vendorItems.map((vendorItem) =>
                    vendorItem.qsrItemID === selectedVendorItems[index]?.qsrItemID
                        ? { ...vendorItem, [field]: value }
                        : vendorItem
                ),
            }
            : childNode
    );

    // Update the node with the updated suggestedOrderItem
    const updatedNode = {
        ...node,
        suggestedOrderItem: updatedSuggestedOrderItem,
    };

    // Calculate extendedPrice if editing orderAmount or latestInvoicePrice if editing extendedPrice
    if (field === "orderAmount" || field === "extendedPrice") {
        const currentItem = updatedVendorItem;
        const orderAmount = parseFloat(currentItem.orderAmount);
        const latestInvoicePrice = parseFloat(currentItem.latestInvoicePrice);
        const extendedPrice = parseFloat(currentItem.extendedPrice);

        if (field === "orderAmount") {
            // Calculate extendedPrice based on latestInvoicePrice * orderAmount
            const newExtendedPrice = latestInvoicePrice * orderAmount;

            // Update the selectedVendorItems state with calculated extendedPrice
            setSelectedVendorItems(prevSelectedVendorItems => ({
                ...prevSelectedVendorItems,
                [index]: {
                    ...currentItem,
                    orderAmount: value, // Update orderAmount
                    extendedPrice: newExtendedPrice.toFixed(2) // Update extendedPrice
                }
            }));
        } else if (field === "extendedPrice") {
            // Calculate latestInvoicePrice based on extendedPrice / orderAmount (handle division by zero)
            const newLatestInvoicePrice = orderAmount !== 0 ? extendedPrice / orderAmount : 0;

            // Update the selectedVendorItems state with calculated latestInvoicePrice
            setSelectedVendorItems(prevSelectedVendorItems => ({
                ...prevSelectedVendorItems,
                [index]: {
                    ...currentItem,
                    extendedPrice: value, // Update extendedPrice
                    latestInvoicePrice: newLatestInvoicePrice.toFixed(2) // Update latestInvoicePrice
                }
            }));
        }
    }

    // Callback to notify parent component about the updated node
    onEdit(updatedNode);
    // Return the updated node to set in the component state if needed
    return updatedNode;
};
