import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";
import PrepChartjson from "../tempData/PrepChartTemp.json";

export const PrepChartTemplateAPI = {
  get: async function (companyID, unitID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/prepcharttemplate/getprepcharttemplate`,
    //   companyID,
    //   unitID,
    //   signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await PrepChartjson;

    // return response.data;
    return response;
  },
  save: async function (data, cancel = false) {
    // const response = await api.request({
    //   method: "POST",
    //   url: `/api/prepcharttemplate/saveprepcharttemplate`,
    //   data,
    //   signal: cancel ? cancelApiObject[this.save.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await PrepChartjson;

    // return response.data;
    return response;
  }
}

const cancelApiObject = defineCancelApiObject(PrepChartTemplateAPI);