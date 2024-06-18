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
    const updatedVendorItem = {
        ...selectedVendorItems[index],
        [field]: value
    };

    setSelectedVendorItems(prevSelectedVendorItems => ({
        ...prevSelectedVendorItems,
        [index]: updatedVendorItem
    }));

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

    const updatedNode = {
        ...node,
        suggestedOrderItem: updatedSuggestedOrderItem,
    };

    onEdit(updatedNode);
};
