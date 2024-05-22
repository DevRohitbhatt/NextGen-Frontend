import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";
import VendorsList from "../../tempData/VendorsList.json";

export const VendorAPI = {
  VendorsAPI: async function (companyID, cancel = false) {
    const response = await api.request({
        method: "GET",
        url: `/api/vendor/getvendorbycompanyid?companyId=${companyID}`,
        signal: cancel ? cancelApiObject[this.VendorsAPI.name].handleRequestCancellation().signal : undefined,
    });
    return response.data;
  }
}

 
const cancelApiObject = defineCancelApiObject(VendorAPI);