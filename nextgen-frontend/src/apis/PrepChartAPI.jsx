import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const PrepChartAPI = {
  get: async function (companyID, unitID, date, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/prepchartdetail/getprepchartdetail/?companyid=${companyID}&unitid=${unitID}&date=${date}`,
      companyID,
      unitID,
      date,
      signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    });
    
    return response.data;
  },
  save: async function (data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/prepchartdetail/saveprepchartdetail`,
      data,
      signal: cancel ? cancelApiObject[this.save.name].handleRequestCancellation().signal : undefined,
    });
    
    return response.data;
  }
}

const cancelApiObject = defineCancelApiObject(PrepChartAPI);