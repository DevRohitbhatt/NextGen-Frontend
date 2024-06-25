import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";

export const VendorAPI = {
  getVendorsByCompany: async function (companyID, cancel = false) {
    const response = await api.request({
        method: "GET",
        url: `/api/vendor/getvendorsbycompanyid?companyId=${companyID}`,
        signal: cancel ? cancelApiObject[this.GetVendorsByCompany.name].handleRequestCancellation().signal : undefined,
    });
    return response.data;
  }
}


 
const cancelApiObject = defineCancelApiObject(VendorAPI);
