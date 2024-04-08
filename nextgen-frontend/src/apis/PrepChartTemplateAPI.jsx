import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";
import PrepChartjson from "../tempData/PrepChartTemp.json";

export const PrepChartTemplateAPI = {
  get: async function (companyID, unitID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/prepcharttemplate/getprepcharttemplate?companyid=${companyID}&unitid=${unitID}&templatetypeid=${0}`,
      signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
  save: async function (data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/prepcharttemplate/saveprepcharttemplate`,
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
      signal: cancel ? cancelApiObject[this.save.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
  getInventoryItems: async function (companyID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/prepcharttemplate/getinventorylist?companyid=${companyID}`,
      signal: cancel ? cancelApiObject[this.getInventoryItems.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  }
}

const cancelApiObject = defineCancelApiObject(PrepChartTemplateAPI);