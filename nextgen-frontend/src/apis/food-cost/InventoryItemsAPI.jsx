import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils";

export const InventoryItemsAPI = {
  getInventoryItemsOrderLimits: async function (companyID, unitID, qsrInventoryItemID = null, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/inventoryitems/getinventoryitemsorderlimits?companyID=${companyID}&unitID=${unitID}${qsrInventoryItemID ? `&qsrInventoryItemID=${qsrInventoryItemID}` : ""}`,
      companyID,
      unitID,
      qsrInventoryItemID,
      signal: cancel ? cancelApiObject[this.getInventoryItemsOrderLimits.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
  updateInventoryItemOrderLimits: async function (companyID, unitID, qsrInventoryItemID, minOrderQuantity, maxOrderQuantity, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/inventoryitems/updateinventoryitemsorderlimit?companyID=${companyID}&unitID=${unitID}&qsrInventoryItemID=${qsrInventoryItemID}&minOrderQuantity=${minOrderQuantity}&maxOrderQuantity=${maxOrderQuantity}`,
      companyID,
      unitID,
      qsrInventoryItemID,
      minOrderQuantity,
      maxOrderQuantity,
      signal: cancel ? cancelApiObject[this.updateInventoryItemOrderLimits.name].handleRequestCancellation().signal : undefined,
    });
    
    return response.data;
  },
  deleteInventoryItemOrderLimits: async function (companyID, unitID, qsrInventoryItemID, cancel = false) {
    const response = await api.request({
      method: "DELETE",
      url: `/api/inventoryitems/deleteinventoryitemsorderlimit?companyID=${companyID}&unitID=${unitID}&qsrInventoryItemID=${qsrInventoryItemID}`,
      companyID,
      unitID,
      qsrInventoryItemID,
      signal: cancel ? cancelApiObject[this.deleteInventoryItemOrderLimits.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
};

const cancelApiObject = defineCancelApiObject(InventoryItemsAPI);