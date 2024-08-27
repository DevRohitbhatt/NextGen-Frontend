import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const CompanyAPI = {
  getCompanySetting: async function (companyID, settingName, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/company/settings/getsetting?companyId=${companyID}&settingName=${settingName}`,
      signal: cancel ? cancelApiObject[this.getCompanySetting.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
  getAllCompanySettings: async function (companyID, cancel = false) {
    const response = await api.request({
      method: "GET",
      url: `/api/company/settings/getallsettings?companyId=${companyID}`,
      signal: cancel ? cancelApiObject[this.getAllCompanySettings.name].handleRequestCancellation().signal : undefined,
    });

    return response.data;
  },
};

const cancelApiObject = defineCancelApiObject(CompanyAPI);
