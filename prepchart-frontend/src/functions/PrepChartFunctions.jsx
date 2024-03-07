export function onInputCellChange(
  e,
  row,
  columnName,
  tableName,
  tableData,
  setTable,
  prepChart,
  setPrepChart
) {
  const newPrepChart = { ...prepChart };

  if (tableName === "DefaultSafetyFactor") {
    handleDefaultSafetyFactorChange(e, row, columnName, tableData, setTable, prepChart, setPrepChart);
    return;
  }

  if (columnName === "On Hand" ) {
    if (isNaN(e.target.value)) {
      e.target.value = 0;
      console.log("Please enter a number for On Hand");
    }
    if (e.target.value === "") e.target.value = 0;
    setTable({
      ...tableData,
      rows: tableData.rows.map((item, index) => {
        if (index === row) {
          let needed, onHand = 0;
          item.forEach((cell) => {
            if (cell.columnName === "Needed") {
              needed = parseFloat(cell.value);
            } else if (cell.columnName === "On Hand") {
              onHand = parseFloat(e.target.value);
              cell.value = parseFloat(e.target.value);
            } else if (cell.columnName === "Prep/Pull Amount") {
              cell.value = (needed - onHand).toFixed(2);
            }
          });
        }
        return item;
      }),
    });
  } else if (columnName === "Safety Factor") {
    setTable({
      ...tableData,
      rows: tableData.rows.map((item, index) => {
        if (index === row) {
          item.forEach((cell) => {
            if (cell.columnName === "Safety Factor") {
              cell.value = (e.target.value / 100).toLocaleString("en-US", {
                style: "percent",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              });
              newPrepChart[tableName][row][cell.columnName] = cell.value;
            }
          });
        }
        return item;
      }),
    });
  }

  newPrepChart[tableName][row][columnName] = parseFloat(e.target.value);
  setPrepChart(newPrepChart);
}

export function onDropdownCellChange(
  e,
  row,
  columnName,
  tableName,
  tableData,
  setTable,
  prepChart,
  setPrepChart
) {
  const newPrepChart = { ...prepChart };

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      if (index === row) {
        let prepValue = 0, yieldDollars = 0, yieldType = 0, safetyFactor = 0, needed = 0, onHand = 0;
        item.forEach((cell) => {
          if (cell.columnName === "Prep Type") {
            cell.value.forEach((option) => {
              if (option.IsSelected) {
                option.IsSelected = false;
              }
              if (option.PrepType === e.target.value) {
                prepValue = option.Value;
                option.IsSelected = true;
                newPrepChart[tableName][row][cell.columnName] = e.target.value;
              }
            });
          } else if (cell.columnName === "Yield/Type") {
            yieldDollars = (cell.yieldDollars / prepValue).toFixed(2);
            cell.value = yieldDollars;
            newPrepChart[tableName][row][cell.columnName] = yieldDollars;
          } else if (cell.columnName === "Safety Factor") {
            safetyFactor = cell.value;
          } else if (cell.columnName === "Needed") {
            needed = calculateNeededValue(tableName, prepChart, prepValue, yieldDollars, safetyFactor);
            cell.value = needed;
            newPrepChart[tableName][index][cell.columnName] = needed;
          } else if (cell.columnName === "On Hand") {
            onHand = parseFloat(cell.value);
            cell.value = onHand;
            newPrepChart[tableName][row][cell.columnName] = cell.value;
          } else if (cell.columnName === "Prep/Pull Amount") {
            cell.value = (needed - onHand).toFixed(2);
          }
        });
      }
      return item;
    }),
  });

  newPrepChart[tableName][row][columnName] = e.target.value;
  setPrepChart(newPrepChart);
}

export function handleForecastChange(
  e,
  row,
  columnName,
  tableName,
  tableData,
  setTable,
  prepChart,
  setPrepChart,
  todayTable,
  tomorrowTable,
  nextDayTable,
  setTodayTable,
  setTomorrowTable,
  setNextDayTable
) {
  const newPrepChart = { ...prepChart };
  let previousSafetyFactor = prepChart.DefaultSafetyFactor;

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      if (index === row) {
        let day = "";
        item.forEach((cell) => {
          if (cell.columnName === "Day") {
            day = cell.value;
          }
          if (cell.columnName === "Forecasted Sales") {
            cell.value = e.target.value;
            newPrepChart.ForecastData[day] = parseFloat(e.target.value);
          }
        });
      }
      return item;
    }),
  });

  setPrepChart(newPrepChart);
  recalculatePrepChart(newPrepChart, setPrepChart, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable, previousSafetyFactor, previousSafetyFactor);
}

export function handleDefaultSafetyFactorChange(
  e,
  row,
  columnName,
  tableName,
  tableData,
  setTable,
  prepChart,
  setPrepChart,
  setTodayTable,
  setTomorrowTable,
  setNextDayTable,
  todayTable,
  tomorrowTable,
  nextDayTable
) {
  const newPrepChart = { ...prepChart };
  let previousSafetyFactor = prepChart.DefaultSafetyFactor;

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      if (index === row) {
        return item.map((cell) => {
          if (cell.columnName === "Default Safety Factor") {
            cell.value = e.target.value;
            newPrepChart.DefaultSafetyFactor = parseFloat(e.target.value);
          }
          return cell;
        });
      } else {
        return item;
      }
    }),
  });

  recalculatePrepChart(newPrepChart, setPrepChart, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable, previousSafetyFactor, parseFloat(e.target.value));
}

export const recalculatePrepChart = (prepChart, setPrepChart, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable, previousSafetyFactor, newSafetyFactor) => {
  recalculateTable(prepChart, setPrepChart, todayTable, setTodayTable, "Today", previousSafetyFactor, newSafetyFactor);
  recalculateTable(prepChart, setPrepChart, tomorrowTable, setTomorrowTable, "Tomorrow", previousSafetyFactor, newSafetyFactor);
  recalculateTable(prepChart, setPrepChart, nextDayTable, setNextDayTable, "NextDay", previousSafetyFactor, newSafetyFactor);
}

export const recalculateTable = (prepChart, setPrepChart, tableData, setTable, tableName, previousSafetyFactor, newSafetyFactor) => {
  const newPrepChart = { ...prepChart };

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      let prepValue = 0;
      let yieldDollars = 0;
      let safetyFactor = 0;
      let needed = 0;
      let onHand = 0;

      return item.map((cell) => {
        if (cell.columnName === "Prep Type") {
          cell.value.forEach((option) => {
            if (option.IsSelected) {
              prepValue = option.Value;
            }
          });
        }

        if (cell.columnName === "Yield/Type") {
          yieldDollars = (cell.yieldDollars / prepValue).toFixed(2);
          cell.value = yieldDollars;
          newPrepChart[tableName][index][cell.columnName] = yieldDollars;
        } else if (cell.columnName === "Safety Factor") {
          safetyFactor = (cell.value === previousSafetyFactor) ? newSafetyFactor : cell.value;
          cell.value = safetyFactor;
        } else if (cell.columnName === "Needed") {
          needed = calculateNeededValue(tableName, prepChart, prepValue, yieldDollars, safetyFactor);
          cell.value = needed;
          newPrepChart[tableName][index][cell.columnName] = needed;
        } else if (cell.columnName === "On Hand") {
          onHand = parseFloat(cell.value);
          newPrepChart[tableName][index][cell.columnName] = onHand;
        } else if (cell.columnName === "Prep/Pull Amount") {
          cell.value = (needed - onHand).toFixed(2);
        }
        return cell;
      });
    }),
  });
}

function calculateNeededValue(tableName, prepChart, prepValue, yieldDollars, safetyFactor) {
  const todayForecast = prepChart.ForecastData.Today;
  const tomorrowForecast = prepChart.ForecastData.Tomorrow;
  const nextDayForecast = prepChart.ForecastData.NextDay;
  let needed = 0;
  safetyFactor = safetyFactor / 100 + 1;

  if (tableName === "Today") {
    needed = (todayForecast / (prepValue + parseFloat(yieldDollars))) * safetyFactor;
  } else if (tableName === "Tomorrow") {
    needed = ((todayForecast + tomorrowForecast) / (prepValue + parseFloat(yieldDollars))) * safetyFactor;
  } else if (tableName === "NextDay") {
    needed = ((todayForecast + tomorrowForecast + nextDayForecast) / (prepValue + parseFloat(yieldDollars))) * safetyFactor;
  }

  return needed.toFixed(2);
}

export const buildPrepTable = (
  prepChartSection,
  setTable,
  tableState,
  onInputCellChange,
  handleDropdownChange
) => {
  const rows = prepChartSection.map((item) => {
    return [
      { 
        value: item.itemName, 
        cellType: "", 
        columnName: "Item Name" },
      {
        value: item.PrepType,
        cellType: "dropdown",
        columnName: "Prep Type",
        handleOnChange: { handleDropdownChange },
      },
      { 
        value: item.YieldType,
        cellType: "dollar", 
        columnName: "Yield/Type" ,
        yieldDollars: item.YieldDollars,
        isInput: false,
      },
      {
        value: item.SafetyFactor,
        cellType: "percent",
        columnName: "Safety Factor",
        handleOnChange: { onInputCellChange },
        isInput: false,
      },
      {
        value: item.Needed,
        cellType: "",
        columnName: "Needed",
        handleOnChange: { onInputCellChange },
      },
      {
        value: item.OnHand,
        cellType: "input",
        columnName: "On Hand",
        handleOnChange: { onInputCellChange },
        isInput: true,
      },
      {
        value: item.PrepPullAmount,
        cellType: "",
        columnName: "Prep/Pull Amount",
      },
    ];
  });

  setTable({
    ...tableState,
    rows: rows,
  });
};
