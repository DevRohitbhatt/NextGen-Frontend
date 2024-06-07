import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";

export const PrepChartAPI = {
  get: async function (companyID, unitID, templateTypeID, date, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/prepchartdetail?companyid=${companyID}&unitid=${unitID}&templatetypeid=${templateTypeID}&date=${date}`,
      companyID,
      unitID,
      date,
      signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    });
    
    return response.data;
  },
  save: async function (companyID, data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/prepchartdetail/save?companyid=${companyID}`,
      data,
      signal: cancel ? cancelApiObject[this.save.name].handleRequestCancellation().signal : undefined,
    });
    
    return response.data;
  }
}

const cancelApiObject = defineCancelApiObject(PrepChartAPI);