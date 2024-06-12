import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";

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

