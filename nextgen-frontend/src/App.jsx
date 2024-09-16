import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { themes } from './assets/themes/Themes.jsx';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
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
	ActualFoodCost,
	VarianceFoodCost,
	Invoices,
	Countsheets,
	CountsheetDesigner,
	Purchase,
	MenuItemsSold
} from './pages';
import { Suspense } from 'react';

const App = () => {
	const selectedTheme = themes.default;

	return (
		<Router>
			<ThemeProvider theme={selectedTheme}>
				<DndProvider backend={HTML5Backend}>
					<ToastContainer />
					<div className='App'>
						<Suspense
							fallback={<div className='w-full m-auto text-2xl font-medium text-center '>Loading...</div>}
						>
							<Routes>
								<Route path='/' element={<PrepChart />} />
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
								<Route path='/Purchase' element={<Purchase />} />

								{/* Sales */}
								<Route path='/Voids' element={<Voids />} />
								<Route path='/MenuItemsSold' element={<MenuItemsSold />} />

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
