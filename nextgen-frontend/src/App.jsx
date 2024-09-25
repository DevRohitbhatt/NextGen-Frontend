import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastContainer } from "react-toastify";
import {
  getParametersFromUrl,
	storeAndDispatchParameters,
	loadFromLocalStorage,
} from "./functions/storageHelpers.js";
import { useDispatch, useSelector } from "react-redux";
import { SaveUnitsAndAreasToLocalStorage } from "./functions/getUsersUnitsAndAreas";
import InventoryTransferReport from "./pages/food-cost/InventoryTransferReport.jsx";
import EmployeeInformation from "./pages/labour/EmployeeInformation.jsx";
import SuggestedOrder from "./pages/food-cost/SuggestedOrder/SuggestedOrder.jsx";
import SuggestedOrderList from "./pages/food-cost/SuggestedOrder/SuggestedOrderList.jsx";
import PrepChart from "./pages/food-cost/PrepChart/PrepChart";
import PrepChartTemplate from "./pages/food-cost/PrepChart/PrepChartTemplate";
import VoidsReport from "./pages/sales/VoidsReport.jsx";
import LaborByPayPeriod from "./pages/labour/LaborByPayPeriod.jsx";
import InventoryWeeksOnHand from "./pages/food-cost/InventoryWeeksOnHand.jsx";

const App = () => {
  const selectedTheme = themes.default;
	const dispatch = useDispatch();

	useEffect(() => {
		const parameters = getParametersFromUrl();
	
		if (localStorage.getItem("CompanyID") !== null) {
			loadFromLocalStorage(dispatch);  // Load from local storage if available
		} else if (parameters) {
			storeAndDispatchParameters(dispatch, parameters);  // Store and dispatch URL parameters
		} else {
			console.log("testing mode");
			const defaultState = {
				CompanyID: 1021,
				CompanyName: "Default Company",
				AlignmentId: 1110,
				User_UserID: 5199,
				User_Type: "admin",
				User_DefaultUnitID: 0,
				User_GroupOrUnitAccess: "defaultAccess"
			};
			storeAndDispatchParameters(dispatch, defaultState);  // Store and dispatch default state
		}
	}, [dispatch]);
	

  return (
    <Router>
      <ThemeProvider theme={selectedTheme}>
        <DndProvider backend={HTML5Backend}>
          <ToastContainer />
          <div className="App">
            <Routes>
              <Route path="/PrepChart" element={<PrepChart />} />
              <Route
                path="/PrepChartTemplate"
                element={<PrepChartTemplate />}
              />
              <Route
                path="/SuggestedOrderList"
                element={<SuggestedOrderList />}
              />
              <Route path="/SuggestedOrder" element={<SuggestedOrder />} />
              {/* Food Cost */}
              <Route
                path="/InventoryTransferReport"
                index
                element={<InventoryTransferReport />}
              />
              <Route
                path="/InventoryWeeksOnHand"
                index
                element={<InventoryWeeksOnHand />}
              />
              {/* Sales */}
              <Route path="/Voids" element={<VoidsReport />} />
              {/* Labour */}
              <Route
                path="/EmployeeInformation"
                element={<EmployeeInformation />}
              />
              <Route path="/LaborByPayPeriod" element={<LaborByPayPeriod />} />
            </Routes>
          </div>
        </DndProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
