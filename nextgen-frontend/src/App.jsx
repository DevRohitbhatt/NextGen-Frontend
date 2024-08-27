import React, { useEffect, useState } from "react";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css'; 
import { ToastContainer } from "react-toastify";
import { CompanyAPI } from "./apis/CompanyAPI.jsx";
import PrepChart from "./pages/food-cost/PrepChart.jsx";
import PrepChartTemplate from "./pages/food-cost/PrepChartTemplate.jsx";
import SuggestedOrder from "./pages/food-cost/SuggestedOrder.jsx";
import SuggestedOrderList from "./pages/food-cost/SuggestedOrderList.jsx";

const App = () => {
  const [theme, setTheme] = useState(themes.default);
	let parameters = decodeURIComponent(window.location.search.replace('?data=', ''));
	if (parameters) {
		parameters = JSON.parse(parameters);
		localStorage.setItem('companyID', parameters.CompanyID);
	}

	useEffect(() => {
		CompanyAPI.getAllCompanySettings(localStorage.getItem('companyID')).then((response) => {
			if (response) {
				localStorage.setItem('companySettings', JSON.stringify(response.data));
				const themeSetting = response.data.find((setting) => setting.name === 'App3ThemeEditorColors');
				if (themeSetting) {
					const firstColor = themeSetting.value.split(',')[0];
					const secondColor = themeSetting.value.split(',')[1];
					const thirdColor = themeSetting.value.split(',')[2];
					let primaryColor = firstColor;
					let secondaryColor = secondColor;
					if (firstColor == '#fff') {
						primaryColor = secondColor;
						secondaryColor = thirdColor;
					}

					setTheme({
						...theme,
						primary: primaryColor,
						secondary: secondaryColor,
					});
				}
			}
		}).catch((error) => {
			console.log('Error fetching company settings', error);
		});
	}, []);


  return (
    <Router>
      <ThemeProvider theme={theme}> 
          <DndProvider backend={HTML5Backend}>
            <ToastContainer/>
            <div className="App">
                <Routes>
                  <Route path="/" element={<PrepChart />} />
                  <Route path="/PrepChartTemplate" element={<PrepChartTemplate />} />
                  <Route path="/PrepChart" element={<PrepChart />} />
                  <Route path="/SuggestedOrderList" element={<SuggestedOrderList />} />
                  <Route path="/SuggestedOrder" element={<SuggestedOrder />} />
                </Routes>
            </div>
          </DndProvider>
        </ThemeProvider>
    </Router>
  );
};

export default App;