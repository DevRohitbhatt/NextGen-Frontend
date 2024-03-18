import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";
import AreaLists from "../tempData/AreaList.json";
import UnitLists from "../tempData/UnitList.json";

export const UnitAPI = {
  get: async function (companyID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/unit/getunit`,
    //   companyID,
    //   signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await UnitLists;

    // return response.data;
    return response;
  },
  getUnitsByCompany: async function (companyID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/units/getcompanyunits`,
    //   companyID,
    //   signal: cancel ? cancelApiObject[this.getUnitByCompany.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await UnitLists;

    // return response.data;
    return response;
  }
}

const cancelApiObject = defineCancelApiObject(UnitAPI);