import api from "./configs/axiosConfig.jsx";
import { defineCancelApiObject } from "./configs/axiosUtils.jsx";

export const SuggestedOrderAPI = {
  getOrderList: async function (companyID, alignmentID, memberID, vendorID, fromDate, toDate,  cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/order/GetOrderList?companyId=${companyID}&alignmentId=${alignmentID}&memberId=${memberID}&vendorID=${vendorID}&fromDate=${fromDate}&toDate=${toDate}`,
      signal: cancel ? cancelApiObject[this.getbyid.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  }
}

const cancelApiObject = defineCancelApiObject(SuggestedOrderAPI);