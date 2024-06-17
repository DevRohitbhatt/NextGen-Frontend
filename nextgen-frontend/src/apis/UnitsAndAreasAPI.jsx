import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";


export const UnitsAndAreasAPI = {
    UnitsAndAreasAPI: async function (companyID, alignmentID, areaID, cancel = false) {
        const response = await api.request({
            method: "GET",
            url: `/api/unitsandarea/getbyid?companyID=${companyID}&alignmentID=${alignmentID}&memberID=${areaID}`,
            signal: cancel ? cancelApiObject[this.UnitsAndAreasAPI.name].handleRequestCancellation().signal : undefined,
        });

        return response.data;
    }
}

const cancelApiObject = defineCancelApiObject(UnitsAndAreasAPI);