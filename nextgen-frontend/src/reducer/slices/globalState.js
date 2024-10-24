import { createSlice } from "@reduxjs/toolkit";

// Initial state for the global state.
const initialState = {
  companyID: null,
  companyName: null,
  alignmentID: null,
  defaultUnitID: null,
  defaultUnitName: null,
  groupOrUnitAccess: null,
	groupOrUnitAccessName: null,
  memberID: null,
  userID: null,
  userType: null,
  unitsList: [],
  unitAndAreas: {},
  vendorsList: [],
};

// Redux slice for managing global state.
const globalState = createSlice({
  name: "globalState",
  initialState,
  reducers: {
    setCompanyID: (state, action) => {
      state.companyID = action.payload;
    },
    setCompanyName: (state, action) => {
      state.companyName = action.payload;
    },
    setAlignmentID: (state, action) => {
      state.alignmentID = action.payload;
    },
    setDefaultUnitID: (state, action) => {
      state.defaultUnitID = action.payload;
    },
    setDefaultUnitName: (state, action) => {
      state.defaultUnitName = action.payload;
    },
    setGroupOrUnitAccess: (state, action) => {
      state.groupOrUnitAccess = action.payload;
    },
		setGroupOrUnitAccessName: (state, action) => {
			state.groupOrUnitAccessName = action.payload;
		},
    setMemberID: (state, action) => {
      state.memberID = action.payload;
    },
    setUserID: (state, action) => {
      state.userID = action.payload;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    setUnitsList: (state, action) => {
      state.unitsList = action.payload;
    },
    setUnitsAndAreas: (state, action) => {
      state.unitsAndAreas = action.payload;
    },
    setVendorsList: (state, action) => {
      state.vendorsList = action.payload;
    },
  },
});

export const {
  setCompanyID,
  setCompanyName,
  setDefaultUnitID,
  setDefaultUnitName,
  setGroupOrUnitAccess,
	setGroupOrUnitAccessName,
  setMemberID,
	setUserID,
	setUserType,
  setAlignmentID,
  setUnitsList,
	setUnitsAndAreas,
  setVendorsList,
} = globalState.actions;

export default globalState.reducer;
