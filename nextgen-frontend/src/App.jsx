import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { themes } from './assets/themes/Themes.jsx';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import InventoryTransferReport from './pages/food-cost/InventoryTransferReport.jsx';
import EmployeeInformation from './pages/labour/EmployeeInformation.jsx';
import SuggestedOrder from './pages/food-cost/SuggestedOrder/SuggestedOrder.jsx';
import SuggestedOrderList from './pages/food-cost/SuggestedOrder/SuggestedOrderList.jsx';
import PrepChart from './pages/food-cost/PrepChart/PrepChart';
import PrepChartTemplate from './pages/food-cost/PrepChart/PrepChartTemplate';
import VoidsReport from './pages/sales/VoidsReport.jsx';

const App = () => {
	const selectedTheme = themes.default;

	return (
		<Router>
			<ThemeProvider theme={selectedTheme}>
				<DndProvider backend={HTML5Backend}>
					<ToastContainer />
					<div className='App'>
						<Routes>
							<Route path='/' element={<PrepChart />} />
							<Route path='/PrepChartTemplate' element={<PrepChartTemplate />} />
							<Route path='/SuggestedOrderList' element={<SuggestedOrderList />} />
							<Route path='/SuggestedOrder' element={<SuggestedOrder />} />
							<Route path='/inventoryTransferReport' index element={<InventoryTransferReport />} />
							<Route path='/employeeInformation' element={<EmployeeInformation />} />
							<Route path='/voids' element={<VoidsReport />} />
						</Routes>
					</div>
				</DndProvider>
			</ThemeProvider>
		</Router>
	);
};

export default App;
