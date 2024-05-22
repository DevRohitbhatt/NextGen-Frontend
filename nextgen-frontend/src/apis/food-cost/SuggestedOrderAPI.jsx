import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";
import treeData from "../../tempData/SuggestedOrderItem.json";
// import treeData from "../../tempData/SuggestedOrderItem.json";

export const SuggestedOrderAPI = {
  get: async function (companyID, unitID, date, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/prepchartdetail/?companyid=${companyID}&unitid=${unitID}&date=${date}`,
      companyID,
      unitID,
      date,
      signal: cancel
        ? cancelApiObject[this.get.name].handleRequestCancellation().signal
        : undefined,
    });


    return response.data;
  },
  getForecast: async function (companyID, unitID, vendorId, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/suggestedorder/getforecasteddatabycompanyidunitid/?companyId=${companyID}&unitId=${unitID}&vendorId=${vendorId}`,
      companyID,
      unitID,
      vendorId,
      signal: cancel ? cancelApiObject[this.getForecast.name].handleRequestCancellation().signal : undefined,
    });
    
    return response;
  },
  getOrderItem: async function (
    companyID,
    unitID,
    vendorId,
    orderFromDate,
    orderToDate,
    cancel = false
  ) {
    const response = await api.request({
      method: "GET",
      url: `/api/suggestedorder/getvendorinventoryitems?companyId=${companyID}&unitId=${unitID}&vendorId=${vendorId}&orderFromDate=${orderFromDate}&orderToDate=${orderToDate}`,
      companyID,
      unitID,
      vendorId,
      orderFromDate,
      orderToDate,
      signal: cancel
        ? cancelApiObject[this.getOrderItem.name].handleRequestCancellation()
            .signal
        : undefined
    });
    return response.data;
  },
  save: async function (data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/prepchartdetail/saveprepchartdetail`,
      data,
      signal: cancel
        ? cancelApiObject[this.save.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },
  UnitsAndAreasAPI: async function (companyID, alignmentID, areaID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/unitsandarea/getbyid?companyID=${companyID}&alignmentID=${alignmentID}&memberID=${areaID}`,
      signal: cancel
        ? cancelApiObject[this.getbyid.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },
  getVendor: async function (companyID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/vendor/getvendorbycompnayid?companyID=${companyID}`,
      signal: cancel
        ? cancelApiObject[this.getVendor.name].handleRequestCancellation()
            .signal
        : undefined,
    });
    return response.data;
  },
};

const cancelApiObject = defineCancelApiObject(SuggestedOrderAPI);

