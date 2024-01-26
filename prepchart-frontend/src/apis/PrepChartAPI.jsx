import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils";
import PrepChartjson from "../tempData/PrepChart.json";

export const PrepChartAPI = {
  get: async function (companyID, unitID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/prepchart/get`,
    //   companyID,
    //   unitID,
    //   signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    // });

    // return response.data;
    return PrepChartjson;
  },
}

const cancelApiObject = defineCancelApiObject(PrepChartAPI);