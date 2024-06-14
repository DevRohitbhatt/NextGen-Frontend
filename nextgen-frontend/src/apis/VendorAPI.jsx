import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";

export const VendorAPI = {   
  getVendorsByCompany: async function (companyID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/vendor/getVendorByCompanyID?companyID=${companyID}`,
      signal: cancel ? cancelApiObject[this.getbyid.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  }
}

const cancelApiObject = defineCancelApiObject(VendorAPI);