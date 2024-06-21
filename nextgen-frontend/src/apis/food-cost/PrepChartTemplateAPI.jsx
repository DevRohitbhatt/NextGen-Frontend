import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";

export const PrepChartTemplateAPI = {
  get: async function (companyID, unitID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/prepcharttemplate?companyid=${companyID}&unitid=${unitID}&templatetypeid=${0}`,
      signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
  save: async function (companyID, data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/prepcharttemplate/save?companyid=${companyID}`,
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