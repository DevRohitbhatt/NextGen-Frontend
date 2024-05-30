import api from "../configs/axiosConfig.jsx";
import { defineCancelApiObject } from "../configs/axiosUtils.jsx";
import Vendor from "../../Models/VendorModel";

const VendorsAPI = async (companyID, cancel = false) => {
  try {
    const response = await api.request({
      method: "GET",
      url: `/api/vendor/getvendorbycompanyid?companyId=${companyID}`,
      signal: cancel ? cancelApiObject[this.VendorsAPI.name].handleRequestCancellation().signal : undefined,
    });

    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const vendors = response?.data?.data || [];
    return vendors.map(({ vendorID, vendorName }) => new Vendor(vendorID, vendorName));
  } catch (error) {
    console.error("Error in VendorsAPI:", error);
    throw error; // Re-throw the error for external handling
  }
};

export const VendorAPI = { VendorsAPI };

const cancelApiObject = defineCancelApiObject(VendorAPI);
