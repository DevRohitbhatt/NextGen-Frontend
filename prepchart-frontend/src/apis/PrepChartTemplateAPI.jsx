import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";
import PrepChartjson from "../tempData/PrepChartTemp.json";

export const PrepChartTempAPI = {
  get: async function (companyID, unitID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/prepchart/get`,
    //   companyID,
    //   unitID,
    //   signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await PrepChartjson;

    // return response.data;
    return response;
  },
}

const cancelApiObject = defineCancelApiObject(PrepChartTempAPI);