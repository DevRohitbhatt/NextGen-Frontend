import React from "react";
import PrepChart from "./pages/PrepChart.jsx";
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
import Dragdrop from "./pages/PrepChartTemp.jsx";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
// import Dragdrop from './components/DragDrop.jsx';

const App = () => {
  const selectedTheme = themes.default; // You can change this dynamically

  return (
    
    <ThemeProvider theme={selectedTheme}>
      {/* <PrepChart /> */}
      {/* <PrepChartTemp/>
      */}
      <DndProvider backend={HTML5Backend}>
      <div className="App">
        <Dragdrop />
      </div>
    </DndProvider>
    </ThemeProvider>
  );
};

export default App;