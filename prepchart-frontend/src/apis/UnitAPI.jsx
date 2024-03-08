import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";
import unitsjson from "../tempData/Units.json";

export const UnitAPI = {
  get: async function (companyID, unitID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/prepchart/get`,
    //   companyID,
    //   unitID,
    //   signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await unitsjson;

    // return response.data;
    return response;
  },
}

const cancelApiObject = defineCancelApiObject(UnitAPI);