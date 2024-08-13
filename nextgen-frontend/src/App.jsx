import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { themes } from './assets/themes/Themes.jsx';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import InventoryTransferReport from './pages/food-cost/InventoryTransferReport.jsx';

const App = () => {
	const selectedTheme = themes.default;

	return (
		<Router>
			<ThemeProvider theme={selectedTheme}>
				<DndProvider backend={HTML5Backend}>
					<ToastContainer />
					<div className='App'>
						<Routes>
							<Route path='/InventoryTransferReport' index element={<InventoryTransferReport />} />
						</Routes>
					</div>
				</DndProvider>
			</ThemeProvider>
		</Router>
	);
};

export default App;
