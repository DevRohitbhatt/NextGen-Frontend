import React from "react";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PrepChart from "./pages/PrepChart.jsx";
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
import PrepChartTemplate from "./pages/PrepChartTemplate.jsx";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css'; 

const App = () => {
  const selectedTheme = themes.default; 

  return (
    <Router>
      <ThemeProvider theme={selectedTheme}> 
          <DndProvider backend={HTML5Backend}>
            <div className="App">
                <Routes>
                  <Route path="/" element={<PrepChart />} />
                  <Route path="/PrepChartTemplate" element={<PrepChartTemplate />} />
                  <Route path="/PrepChart" element={<PrepChart />} />
                </Routes>
            </div>
          </DndProvider>
        </ThemeProvider>
    </Router>
  );
};

export default App;