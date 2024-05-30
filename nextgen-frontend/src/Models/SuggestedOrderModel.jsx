class SuggestedOrder {
    constructor(data) {
      this.suggestedOrderID = data.suggestedOrderID;
      this.purchaseOrderID = data.purchaseOrderID;
      this.companyID = data.companyID;
      this.unitID = data.unitID;
      this.vendorID = data.vendorID;
      this.createdBy = data.createdBy;
      this.orderFromDate = data.orderFromDate;
      this.orderToDate = data.orderToDate;
      this.defaultSafetyFactor = data.defaultSafetyFactor;
      this.forecastedData = data.forecastedData.map(({ firstMinute, projectedValue }) => ({ firstMinute, projectedValue }));
      this.suggestedOrderDetails = data.suggestedOrderDetails.map(({ name, suggestedOrderItem }) => ({
        name,
        suggestedOrderItem: suggestedOrderItem.map(item => ({
          department: item.department,
          subDepartment: item.subDepartment,
          invItemDescription: item.invItemDescription,
          qsrInventoryItemID: item.qsrInventoryItemID,
          invItemMainUOM: item.invItemMainUOM,
          vendorItems: item.vendorItems.map(vendorItem => ({
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
            isSelected: vendorItem.isSelected
          }))
        }))
      }));
    }
  }
  
  export default SuggestedOrder;
  