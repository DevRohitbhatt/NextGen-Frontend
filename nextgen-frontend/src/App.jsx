import React from "react";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css'; 
import { ToastContainer } from "react-toastify";
import PrepChart from "./pages/food-cost/PrepChart.jsx";
import PrepChartTemplate from "./pages/food-cost/PrepChartTemplate.jsx";
import SuggestedOrder from "./pages/food-cost/SuggestedOrder.jsx";
import SuggestedOrderList from "./pages/food-cost/SuggestedOrderList.jsx";

const App = () => {
  const selectedTheme = themes.default; 

  return (
    <Router>
      <ThemeProvider theme={selectedTheme}> 
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