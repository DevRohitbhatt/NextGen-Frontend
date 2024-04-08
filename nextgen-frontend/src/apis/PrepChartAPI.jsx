import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils";
import PrepChartjson from "../tempData/PrepChart.json";

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
    //const response = await PrepChartjson;

    return response.data;
    //return response;
  },
  save: async function (data, cancel = false) {
    const response = await api.request({
      method: "POST",
      url: `/api/PrepChartTemplate/saveprepcharttemplate`,
      data,
      signal: cancel ? cancelApiObject[this.save.name].handleRequestCancellation().signal : undefined,
    });
    
    return response.data;
  }
}

const cancelApiObject = defineCancelApiObject(PrepChartAPI);