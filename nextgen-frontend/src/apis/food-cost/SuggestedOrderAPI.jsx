import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";
import order from "../../tempData/OrderData.json";

export const SuggestedOrderAPI = {
  getOrderItem: async function (companyID,unitID,vendorId,orderFromDate,orderToDate,suggestedOrderId,cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/suggestedorder/getvendorinventoryitems?companyId=${companyID}&unitId=${unitID}&vendorId=${vendorId}&orderFromDate=${orderFromDate}&orderToDate=${orderToDate}&suggestedOrderId=${suggestedOrderId}`,
      companyID,
      unitID,
      vendorId,
      orderFromDate,
      orderToDate,
      signal: cancel
        ? cancelApiObject[this.getOrderItem.name].handleRequestCancellation().signal : undefined });
    return response.data;
  },
  getOrderList: async function (companyID, alignmentID, memberID, unitID, vendorID, fromDate, toDate,  cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/order/GetOrderList?companyId=${companyID}&alignmentId=${alignmentID}&memberId=${memberID}&unitID=${unitID}&vendorID=${vendorID}&fromDate=${fromDate}&toDate=${toDate}`,
      signal: cancel ? cancelApiObject[this.getbyid.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
  getPurchaseOrderDetails: async function (companyID, purchaseOrderID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/order/getpurchaseorderdetails?companyId=${companyID}&purchaseOrderId=${purchaseOrderID}`,
      signal: cancel ? cancelApiObject[this.getPurchaseOrderDetails.name].handleRequestCancellation().signal : undefined,
    });
    return response.data;
  },
  save: async function (data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/suggestedorder/savesuggestedorder`,
      data,
      signal: cancel
        ? cancelApiObject[this.save.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },
  submit: async function (data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/suggestedorder/submitsuggestedrrderheader`,
      data,
      signal: cancel
        ? cancelApiObject[this.submit.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  }
};

const cancelApiObject = defineCancelApiObject(SuggestedOrderAPI);