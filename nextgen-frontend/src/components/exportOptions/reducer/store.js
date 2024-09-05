import { configureStore } from '@reduxjs/toolkit';
import globalStateReducer from './slices/globalState';

// Created a Redux store holding the global state of the application
const store = configureStore({
	reducer: {
		globalState: globalStateReducer,
	},
});

export default store;
