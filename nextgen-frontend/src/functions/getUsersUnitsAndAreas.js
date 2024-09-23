import { getCall } from "../apis/network.js";
import {
  setUnitsAndAreas,
  setDefaultUnitName,
  setGroupOrUnitAccessName,
} from "../reducer/slices/globalState.js";

export const fetchUnitsAndAreas = async (
  companyId,
  alignmentId,
  groupOrUnitAccess
) => {
  try {
    const getData = {
      url: "unitsAndArea",
      urlParams: {
        companyId: companyId,
        alignmentId: alignmentId,
        memberId: groupOrUnitAccess,
      },
    };

    const result = await getCall(getData);
    return result.data;
  } catch (error) {
    console.error("Error fetching units and areas: ", error);
    throw new Error(
      "There was an issue loading your units, please try again later."
    );
  }
};

export const SaveUnitsAndAreasToLocalStorage = (
  companyId,
  alignmentId,
  groupOrUnitAccess
) => {
  return async (dispatch) => {
    try {
      const unitsAndAreas = await fetchUnitsAndAreas(
        companyId,
        alignmentId,
        groupOrUnitAccess
      );
      localStorage.setItem("unitsAndAreas", JSON.stringify(unitsAndAreas));
      dispatch(setUnitsAndAreas(unitsAndAreas));

      let defaultUnitName = "";
      let groupOrUnitAccessName = "";
      unitsAndAreas.units.forEach((unit) => {
        if (unit.unitID.toString() === localStorage.getItem("defaultUnitId")) {
          defaultUnitName = unit.unitName;
        }
      });
      unitsAndAreas.areas.forEach((area) => {
        if (area.areaID === localStorage.getItem("groupOrUnitAccess")) {
          groupOrUnitAccessName = area.areaName;
        }
      });
      localStorage.setItem("defaultUnitName", defaultUnitName);
      localStorage.setItem("groupOrUnitAccessName", groupOrUnitAccessName);
      dispatch(setDefaultUnitName(defaultUnitName));
      dispatch(setGroupOrUnitAccessName(groupOrUnitAccessName));
    } catch (error) {
      console.error("Error saving units and areas to local storage: ", error);
      // Handle the error as needed
    }
  };
};
