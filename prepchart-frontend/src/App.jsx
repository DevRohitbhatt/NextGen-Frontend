import React from "react";
import PrepChart from "./pages/PrepChart.jsx";
import { themes } from "./assets/themes/Themes.jsx";
import { ThemeProvider } from "styled-components";
//import { ThemeContext } from "./assets/themes/ThemeContext.jsx";

const App = () => {
  const selectedTheme = themes.default; // You can change this dynamically

  return (
    <ThemeProvider theme={selectedTheme}>
      <PrepChart />
    </ThemeProvider>
  );
};

export default App;