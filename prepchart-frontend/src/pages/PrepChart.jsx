import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Styled from "./PrepChartStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import DateSelector from "../components/DateSelector.jsx";
import ExportOptions from "../components/ExportOptions.jsx";
import { PrepChartAPI } from "../apis/PrepChartAPI.jsx";
import Table from "../components/TableBuilder.jsx";

export default function PrepChart() {
  const [prepChart, setPrepChart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prepChartDates, setPrepChartDates] = useState({
    today: new Date(),
    tomorrow: new Date(),
    nextDay: new Date(),
  });
  const [forecastTable, setForecastTable] = useState({
    columnHeaders: ["", "Forecasted Sales", "Date"],
    columnWidths: ".5fr 1fr 1fr",
    rows: [],
    width: "50%",
  });
  const [todayTable, setTodayTable] = useState({
    columnHeaders: [
      "Item Name",
      "Prep Type",
      "Yield/Type",
      "Safety Factor",
      "Needed",
      "On Hand",
      "Prep/Pull Amount",
    ],
    columnWidths: "1.5fr 2fr 1fr 1.2fr 1fr 1fr 1fr",
    rows: [],
  });
  const [tomorrowTable, setTomorrowTable] = useState({
    columnHeaders: [
      "Item Name",
      "Prep Type",
      "Yield/Type",
      "Safety Factor",
      "Needed",
      "On Hand",
      "Prep/Pull Amount",
    ],
    columnWidths: "1.5fr 2fr 1fr 1.2fr 1fr 1fr 1fr",
    rows: [],
  });
  const [nextDayTable, setNextDayTable] = useState({
    columnHeaders: [
      "Item Name",
      "Prep Type",
      "Yield/Type",
      "Safety Factor",
      "Needed",
      "On Hand",
      "Prep/Pull Amount",
    ],
    columnWidths: "1.5fr 2fr 1fr 1.2fr 1fr 1fr 1fr",
    rows: [],
  })


  useEffect(() => {
    //Todo use companyID and UnitID instead of 1, 1
    PrepChartAPI.get(1, 1).then((data) => {
      setPrepChart(data);
      setIsLoading(false);
      const date = new Date(data.Date);
      const tomorrow = new Date(date);
      //Todo: Date add is not working correctly
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      setPrepChartDates({
        ...prepChartDates,
        today: date,
        tomorrow: tomorrow,
        nextDay: nextDay,
      });
      buildForecastTable(data.ForecastData);
      buildPrepTable(data.Today, setTodayTable);
      buildPrepTable(data.Tomorrow, setTomorrowTable);
      buildPrepTable(data.NextDay, setNextDayTable);
    });
  }, []);

  const buildForecastTable = (forecastData) => {
    const rows = [
      [{ value: "Today", cellType: ""},{ value: forecastData.Today, cellType: "input"}, { value: prepChartDates.today.toLocaleDateString(), cellType: ""}],
      [{ value: "Tomorrow", cellType: ""},{ value: forecastData.Tomorrow, cellType: "input"}, { value: prepChartDates.tomorrow.toLocaleDateString(), cellType: ""}],
      [{ value: "Next Day", cellType: ""},{ value: forecastData.NextDay, cellType: "input"}, { value: prepChartDates.nextDay.toLocaleDateString(), cellType: ""}],
    ];

    setForecastTable({
      ...forecastTable,
      rows: rows,
    });
  };

  const buildPrepTable = (prepChartSection, setTable) => {
    console.log(prepChartSection);
    const rows = prepChartSection.map((item) => {
      return [
        { value: item.itemName, cellType: "" },
        { value: item.PrepType[0], cellType: "" },
        { value: item.YieldType, cellType: "" },
        { value: item.SafetyFactor, cellType: "input" },
        { value: item.Needed, cellType: "input" },
        { value: item.OnHand, cellType: "input" },
        { value: item.PrepPullAmount, cellType: "" },
      ];
    });

    setTable({
      ...todayTable,
      rows: rows,
    });
  };

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector />
          <DateSelector date={prepChartDates.today} />
        </Styled.DateAndUnitContainer>
        <ExportOptions
          includeExcel={true}
          includePDF={true}
          includeCSV={true}
          includePrint={true}
        />
      </Styled.OptionsRow>

      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <h2>Forecast</h2>
          <Table
            columnHeaders={forecastTable.columnHeaders}
            columnwidths={forecastTable.columnWidths}
            rows={forecastTable.rows}
            width={forecastTable.width}
          />
          <h2>Today</h2>
          <Table
            columnHeaders={todayTable.columnHeaders}
            columnwidths={todayTable.columnWidths}
            rows={todayTable.rows}
          />

          <h2>Tomorrow</h2>
          <Table
            columnHeaders={tomorrowTable.columnHeaders}
            columnwidths={tomorrowTable.columnWidths}
            rows={tomorrowTable.rows}
          />

          <h2>Next Day</h2>
          <Table
            columnHeaders={nextDayTable.columnHeaders}
            columnwidths={nextDayTable.columnWidths}
            rows={nextDayTable.rows}
          />
        </div>
      )}
    </Styled.PageContainer>
  );
}
