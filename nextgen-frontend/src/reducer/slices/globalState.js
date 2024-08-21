import { createSlice } from '@reduxjs/toolkit';

// Initial state for the global state.
const initialState = {
	companyID: null,
	alignmentID: null,
	memberID: null,
	unitsList: [],
	vendorsList: [],
};

// Redux slice for managing global state.
const globalState = createSlice({
	name: 'globalState',
	initialState,
	reducers: {
		setCompanyID: (state, action) => {
			state.companyID = action.payload;
		},
		setAlignmentID: (state, action) => {
			state.alignmentID = action.payload;
		},
		setMemberID: (state, action) => {
			state.memberID = action.payload;
		},
		setUnitsList: (state, action) => {
			state.unitsList = action.payload;
		},
		setVendorsList: (state, action) => {
			state.vendorsList = action.payload;
		},
	},
});

export const { setCompanyID, setMemberID, setAlignmentID, setUnitsList, setVendorsList } = globalState.actions;

export default globalState.reducer;
