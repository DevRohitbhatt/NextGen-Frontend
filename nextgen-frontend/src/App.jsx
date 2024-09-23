import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastContainer } from "react-toastify";
import {
  getParametersFromUrl,
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
import { setCompanyID, setCompanyName, setAlignmentID, setDefaultUnitID, setGroupOrUnitAccess, setUserID, setUserType } from "./reducer/slices/globalState.js";

const App = () => {
  const selectedTheme = themes.default;
	const dispatch = useDispatch();
	const state = useSelector((state) => state.globalstate);

  useEffect(() => {
    const parameters = getParametersFromUrl();

    if (parameters) {
      const {
        CompanyID,
        CompanyName,
        User_UserID,
        User_Type,
        User_DefaultUnitID,
        AlignmentId,
        User_GroupOrUnitAccess,
      } = parameters;
			dispatch(setCompanyID(CompanyID));
			dispatch(setCompanyName(CompanyName));
			dispatch(setAlignmentID(AlignmentId));
			dispatch(setDefaultUnitID(User_DefaultUnitID));
			dispatch(setGroupOrUnitAccess(User_GroupOrUnitAccess));
			dispatch(setUserID(User_UserID));
			dispatch(setUserType(User_Type));
      dispatch(SaveUnitsAndAreasToLocalStorage(
        CompanyID,
        AlignmentId,
        User_GroupOrUnitAccess
      ));
    } else if (state.CompanyID && state.AlignmentID) {
      dispatch(SaveUnitsAndAreasToLocalStorage(
        state.CompanyID,
				state.AlignmentID,
				state.User_GroupOrUnitAccess
      ));
    } else {
      console.log("testing mode");
      const defaultState = {
        companyId: 1021,
        companyName: "Default Company",
        userId: 5199,
        userType: "admin",
        defaultUnitId: 0,
        alignmentId: 1110,
        groupOrUnitAccess: "defaultAccess",
      };
      dispatch(SaveUnitsAndAreasToLocalStorage(1021, 1110, 0));
    }
  }, []);

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
