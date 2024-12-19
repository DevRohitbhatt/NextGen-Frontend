import { SaveUnitsAndAreasToLocalStorage } from './getUsersUnitsAndAreas';
import {
	setCompanyID,
	setCompanyName,
	setAlignmentID,
	setDefaultUnitID,
	setGroupOrUnitAccess,
	setUserID,
	setUserType,
	setUnitsAndAreas,
	setDefaultUnitName,
	setGroupOrUnitAccessName,
} from '../reducer/slices/globalState';

// Helper to extract parameters from URL
export const getParametersFromUrl = () => {
	const queryString = window.location.search;
	if (queryString.includes('?data=')) {
		const parameters = decodeURIComponent(queryString.replace('?data=', ''));
		return parameters ? JSON.parse(parameters) : null;
	}
	return null;
};

// Simplified function to store URL parameters in localStorage
export const storeURLParametersLocalStorage = (params) => {
	Object.keys(params).forEach((key) => {
		localStorage.setItem(key, params[key]);
	});
};

// Refactored function to dispatch parameters to Redux store
export const dispatchURLParameters = (params) => {
	return async (dispatch) => {
		try {
			dispatch(setCompanyID(params.CompanyID));
			dispatch(setCompanyName(params.CompanyName));
			dispatch(setAlignmentID(params.AlignmentId));
			dispatch(setDefaultUnitID(params.User_DefaultUnitID));
			dispatch(setGroupOrUnitAccess(params.User_GroupOrUnitAccess));
			dispatch(setUserID(params.User_UserID));
			dispatch(setUserType(params.User_Type));

			// Saving units and areas
			dispatch(
				SaveUnitsAndAreasToLocalStorage(
					params.CompanyID,
					params.AlignmentId,
					params.User_GroupOrUnitAccess,
					params.User_DefaultUnitID
				)
			);
		} catch (error) {
			console.error('Error dispatching URL parameters: ', error);
			throw new Error('There was an issue with the URL parameters.');
		}
	};
};

// LocalStorage keys and corresponding actions
const localStorageKeys = [
	{ key: 'CompanyID', action: setCompanyID },
	{ key: 'CompanyName', action: setCompanyName },
	{ key: 'AlignmentId', action: setAlignmentID },
	{ key: 'User_DefaultUnitID', action: setDefaultUnitID },
	{ key: 'User_GroupOrUnitAccess', action: setGroupOrUnitAccess },
	{ key: 'User_UserID', action: setUserID },
	{ key: 'User_Type', action: setUserType },
	{ key: 'unitsAndAreas', action: setUnitsAndAreas, isJson: true },
	{ key: 'defaultUnitName', action: setDefaultUnitName },
	{ key: 'groupOrUnitAccessName', action: setGroupOrUnitAccessName },
];

// Function to load from localStorage and dispatch values
export const loadFromLocalStorage = (dispatch) => {
	localStorageKeys.forEach(({ key, action, isJson }) => {
		const value = localStorage.getItem(key);
		if (value !== null) {
			const parsedValue = isJson ? JSON.parse(value) : value;
			dispatch(action(parsedValue));
		}
	});
};

// Helper to both store parameters and dispatch them
export const storeAndDispatchParameters = (dispatch, params) => {
	storeURLParametersLocalStorage(params);
	dispatch(dispatchURLParameters(params));
};
