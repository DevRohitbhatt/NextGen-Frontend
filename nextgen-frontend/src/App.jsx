import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { themes } from './assets/themes/Themes.jsx';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import { getParametersFromUrl, storeAndDispatchParameters, loadFromLocalStorage } from './functions/storageHelpers.js';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyTheme } from './functions/getCompanyTheme.js';
import { Loader } from './components/index.js';
import {
	PrepChart,
	PrepChartTemplate,
	SuggestedOrderList,
	SuggestedOrder,
	InventoryTransfer,
	InventoryWeeksOnHand,
	EmployeeInformation,
	LaborByPayPeriod,
	Voids,
	MenuGrossProfit,
	ActualFoodCost,
	VarianceFoodCost,
	Invoices,
	Countsheets,
	CountsheetDesigner,
	PurchaseAnalysis,
} from './pages';
import { Suspense } from 'react';

const App = () => {
	const [selectedTheme, setSelectedTheme] = useState(themes.default);
	const [primaryColor, setPrimaryColor] = useState('');
	const [secondaryColor, setSecondaryColor] = useState('');
	const companyID = useSelector((state) => state.globalState.companyID);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchTheme = async () => {
			if (companyID) {
				const { primary, secondary } = await getCompanyTheme(companyID);
				console.log(primary);
				if (primary && secondary) {
					setPrimaryColor(primary);
					setSecondaryColor(secondary);
				}
			}
		};

		fetchTheme();
	}, [companyID]);

	useEffect(() => {
		console.log('primaryColor, secondaryColor', primaryColor, secondaryColor);
		if (primaryColor && secondaryColor) {
			console.log(primaryColor, secondaryColor);
			setSelectedTheme((prev) => ({ ...prev, primary: primaryColor, secondary: secondaryColor }));
			//update tailwind theme in the config file
			const root = document.documentElement;
			root.style.setProperty('--tw-primary', primaryColor);
			root.style.setProperty('--tw-secondary', secondaryColor);
		}
	}, [primaryColor, secondaryColor]);

	useEffect(() => {
		const parameters = getParametersFromUrl();
		let reload = false;

		if (parameters) {
			if (parameters.CompanyID !== localStorage.getItem('CompanyID')) {
				reload = true;
			} else if (parameters.User_UserID !== localStorage.getItem('User_UserID')) {
				reload = true;
			} else if (parameters.User_Type !== localStorage.getItem('User_Type')) {
				reload = true;
			} else if (parameters.User_DefaultUnitID !== localStorage.getItem('User_DefaultUnitID')) {
				reload = true;
			} else if (parameters.User_GroupOrUnitAccess !== localStorage.getItem('User_GroupOrUnitAccess')) {
				reload = true;
			}
		}

		if (!reload) {
			loadFromLocalStorage(dispatch); // Load from local storage if available
		} else {
			storeAndDispatchParameters(dispatch, parameters); // Store and dispatch URL parameters
		}
		// } else {
		// 	console.log("testing mode");
		// 	const defaultState = {
		// 		CompanyID: 1021,
		// 		CompanyName: "Default Company",
		// 		AlignmentId: 1110,
		// 		User_UserID: 5199,
		// 		User_Type: "admin",
		// 		User_DefaultUnitID: 0,
		// 		User_GroupOrUnitAccess: "defaultAccess"
		// 	};
		// 	storeAndDispatchParameters(dispatch, defaultState);  // Store and dispatch default state
		// }
	}, [dispatch]);

	return (
		<Router>
			<ThemeProvider theme={selectedTheme}>
				<DndProvider backend={HTML5Backend}>
					<ToastContainer />
					<div className='App'>
						<Suspense
							fallback={
								<div className='w-full m-auto text-2xl font-medium text-center '>
									<Loader loading={true} />
								</div>
							}
						>
							<Routes>
								<Route path='/PrepChart' element={<PrepChart />} />
								<Route path='/PrepChartTemplate' element={<PrepChartTemplate />} />
								<Route path='/SuggestedOrderList' element={<SuggestedOrderList />} />
								<Route path='/SuggestedOrder' element={<SuggestedOrder />} />

								{/* Food Cost */}
								<Route path='/InventoryTransfer' index element={<InventoryTransfer />} />
								<Route path='/InventoryWeeksOnHand' index element={<InventoryWeeksOnHand />} />
								<Route path='/ActualFoodCost' index element={<ActualFoodCost />} />
								<Route path='/VarianceFoodCost' index element={<VarianceFoodCost />} />
								<Route path='/Invoices' element={<Invoices />} />
								<Route path='/Countsheets' element={<Countsheets />} />
								<Route path='/CountsheetDesigner' element={<CountsheetDesigner />} />
								<Route path='/PurchaseAnalysis' element={<PurchaseAnalysis />} />

								{/* Sales */}
								<Route path='/Voids' element={<Voids />} />
								<Route path='/MenuGrossProfit' element={<MenuGrossProfit />} />

								{/* Labour */}
								<Route path='/EmployeeInformation' element={<EmployeeInformation />} />
								<Route path='/LaborByPayPeriod' element={<LaborByPayPeriod />} />
							</Routes>
						</Suspense>
					</div>
				</DndProvider>
			</ThemeProvider>
		</Router>
	);
};

export default App;
