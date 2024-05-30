import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";
import SuggestedOrder from "../../Models/SuggestedOrderModel";
import UnitItem from "../../Models/UnitModel";

export const SuggestedOrderAPI = {
  getOrderItem: async function (companyID,unitID,vendorId,orderFromDate,orderToDate,suggestedOrderId,cancel = false) {
    try {
      const response = await api.request({
      method: "GET",
      url: `/api/suggestedorder/getvendorinventoryitems?companyId=${companyID}&unitId=${unitID}&vendorId=${vendorId}&orderFromDate=${orderFromDate}&orderToDate=${orderToDate}&suggestedOrderId=${suggestedOrderId}`,
      signal: cancel ? cancelApiObject[this.getOrderItem.name].handleRequestCancellation().signal : undefined,
      });
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const responseData = response.data;
      if (!responseData || !responseData.data) {
        throw new Error("API response data is not in the expected format");
      }

      return new SuggestedOrder(responseData.data);
    } catch (error) {
      console.error("Error in Suggested Order:", error);
      throw error; 
    }
  },
  UnitsAndAreasAPI: async function (companyID, alignmentID, areaID, cancel = false) {
    try {
        const response = await api.request({
            method: "GET",
            url: `api/unitsandarea/getbyid?companyId=${companyID}&alignmentId=${alignmentID}&memberId=${areaID}`,
            signal: cancel ? cancelApiObject[this.UnitsAndAreasAPI.name].handleRequestCancellation().signal : undefined,
        });

        if (response.status !== 200) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const responseData = response.data;
        if (!responseData || !responseData.data) {
            throw new Error("API response data is not in the expected format");
        }
        return new UnitItem(responseData.data);
    } catch (error) {
        console.error("Error in Unit Item:", error);
        throw error;
    }
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

