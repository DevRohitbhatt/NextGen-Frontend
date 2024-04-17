import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";
import VendorsList from "../../tempData/VendorsList.json";

export const VendorAPI = {
  getVendors: async function (companyID, unitID, cancel = false) {
    // const response = await api.request({
    //   method: "GET",
    //   url: `/api/prepchart/get`,
    //   companyID,
    //   unitID,
    //   signal: cancel ? cancelApiObject[this.get.name].handleRequestCancellation().signal : undefined,
    // });
    const response = await VendorsList;

    // return response.data;
    return response;
  },
}

const cancelApiObject = defineCancelApiObject(VendorAPI);