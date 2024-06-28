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

  //convert tableName to camelcase
  tableName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
  tableName = tableName.replace(/\s/g, "");

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
              newPrepChart[tableName][row]["onHand"] = cell.value;
            } else if (cell.columnName === "Prep/Pull Amount") {
              cell.value = (needed - onHand).toFixed(2);
              newPrepChart[tableName][row]["prepPullAmount"] = cell.value;
            }
          });
        }
        return item;
      }),
    });
  } else if (columnName === "Safety Factor") {
    if (e.target.value === "") e.target.value = 0;
    const newSafetyFactor = parseFloat(e.target.value);
    setTable({
      ...tableData,
      rows: tableData.rows.map((item, index) => {
        if (index === row) {
          let prepValue = 0, needed = 0, onHand = 0;
          item.forEach((cell) => {
            if (cell.columnName === "Safety Factor") {
              cell.value = newSafetyFactor;
              newPrepChart[tableName][row]["safetyFactor"] = cell.value;
            } else if (cell.columnName === "Needed") {
              prepChart[tableName][row].prepUOM.map((option) => {
                if (option.isSelected) {
                  return option.value;
                }
              });
              needed = calculateNeededValue(tableName, prepChart, prepValue, prepChart[tableName][row].yieldType, newSafetyFactor);
              cell.value = needed;
              newPrepChart[tableName][row]["needed"] = needed;
            } else if (cell.columnName === "On Hand") {
              onHand = parseFloat(cell.value);
            } else if (cell.columnName === "Prep/Pull Amount") {
              cell.value = (needed - onHand).toFixed(2);
              newPrepChart[tableName][row]["prepPullAmount"] = cell.value;
            }
          });
        }
        return item;
      }),
    });
  }
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

  //convert tableName to camelcase and remove spaces
  tableName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
  tableName = tableName.replace(/\s/g, "");

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      if (index === row) {
        let prepValue = 0, yieldType = 0, safetyFactor = 0, needed = 0, onHand = 0;
        item.forEach((cell) => {
          if (cell.columnName === "Prep Type") {
            cell.value.forEach((option) => {
              if (option.isSelected) {
                option.isSelected = false;
              }
              if (option.option === e.target.value) {
                prepValue = option.value;
                option.isSelected = true;
              }
            });
          } else if (cell.columnName === "Yield/Type") {
            yieldType = (cell.yieldDollars / prepValue).toFixed(2);
            cell.value = yieldType;
            newPrepChart[tableName][row]["yieldType"] = yieldType;
          } else if (cell.columnName === "Safety Factor") {
            safetyFactor = cell.value;
          } else if (cell.columnName === "Needed") {
            needed = calculateNeededValue(tableName, prepChart, prepValue, yieldType, safetyFactor);
            cell.value = needed;
            newPrepChart[tableName][index]["needed"] = needed;
          } else if (cell.columnName === "On Hand") {
            onHand = parseFloat(cell.value);
            cell.value = onHand;
            newPrepChart[tableName][row]["onHand"] = cell.value;
          if (cell.columnName === "Prep/Pull Amount") {
            if (needed !== 0 || onHand !== 0) {
              cell.value = (needed - onHand).toFixed(2);
            } else {
              cell.value = needed - onHand;
            }
            newPrepChart[tableName][row]["prepPullAmount"] = cell.value;
          }
        }
      });
    }
    return item;
  }),});
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
            //set day equal to cell.value converted to camel case
            day = cell.value.charAt(0).toLowerCase() + cell.value.slice(1);
            day = day.replace(/\s/g, "");
          }
          if (cell.columnName === "Forecasted Sales") {
            cell.value = e.target.value;
            newPrepChart.forecastData[day] = parseFloat(e.target.value);
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
  let previousSafetyFactor = prepChart.defaultSafetyFactor;

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      if (index === row) {
        return item.map((cell) => {
          if (cell.columnName === "Default Safety Factor") {
            if (e.target.value === "") e.target.value = 0;
            cell.value = e.target.value;
            newPrepChart.defaultSafetyFactor = parseFloat(e.target.value);
          }
          return cell;
        });
      } else {
        return item;
      }
    }),
  });

  recalculatePrepChart(newPrepChart, setPrepChart, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable, previousSafetyFactor, parseFloat(e.target.value));
  setPrepChart(newPrepChart);
}

export const recalculatePrepChart = (prepChart, setPrepChart, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable, previousSafetyFactor, newSafetyFactor) => {
  recalculateTable(prepChart, setPrepChart, todayTable, setTodayTable, "today", previousSafetyFactor, newSafetyFactor);
  recalculateTable(prepChart, setPrepChart, tomorrowTable, setTomorrowTable, "tomorrow", previousSafetyFactor, newSafetyFactor);
  recalculateTable(prepChart, setPrepChart, nextDayTable, setNextDayTable, "nextDay", previousSafetyFactor, newSafetyFactor);
}

export const recalculateTable = (prepChart, setPrepChart, tableData, setTable, tableName, previousSafetyFactor, newSafetyFactor) => {
  const newPrepChart = { ...prepChart };

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      let prepValue = 0;
      let yieldType = 0;
      let safetyFactor = 0;
      let needed = 0;
      let onHand = 0;

      return item.map((cell) => {
        if (cell.columnName === "Prep Type") {
          cell.value.forEach((option) => {
            if (option.isSelected) {
              prepValue = option.value;
            }
          });
        }

        if (cell.columnName === "Yield/Type") {
          yieldType = (cell.yieldDollars / prepValue).toFixed(2);
          cell.value = yieldType;
          newPrepChart[tableName][index]["yieldType"] = yieldType;
        } else if (cell.columnName === "Safety Factor") {
          safetyFactor = (cell.value === previousSafetyFactor) ? newSafetyFactor : cell.value;
          cell.value = safetyFactor;
          newPrepChart[tableName][index]["safetyFactor"] = safetyFactor;
        } else if (cell.columnName === "Needed") {
          needed = calculateNeededValue(tableName, prepChart, prepValue, yieldType, safetyFactor);
          cell.value = needed;
          newPrepChart[tableName][index]["needed"] = needed;
        } else if (cell.columnName === "On Hand") {
          onHand = parseFloat(cell.value);
          newPrepChart[tableName][index]["onHand"] = onHand;
        } else if (cell.columnName === "Prep/Pull Amount") {
          cell.value = (needed - onHand).toFixed(2);
          newPrepChart[tableName][index]["prepPullAmount"] = cell.value;
        }
        return cell;
      });
    }),
  });
}

function calculateNeededValue(tableName, prepChart, prepValue, yieldType, safetyFactor) {
  const todayForecast = prepChart.forecastData.today;
  const tomorrowForecast = prepChart.forecastData.tomorrow;
  const nextDayForecast = prepChart.forecastData.nextDay;
  let needed = 0;
  safetyFactor = safetyFactor / 100 + 1;
  if (isNaN(yieldType) || yieldType === 0.00 || yieldType === "0.00") {
    return 0;
  }

  if (tableName === "today") {
    needed = (todayForecast / (parseFloat(yieldType))) * safetyFactor;
  } else if (tableName === "tomorrow") {
    needed = ((todayForecast + tomorrowForecast) / (parseFloat(yieldType))) * safetyFactor;
  } else if (tableName === "nextDay") {
    needed = ((todayForecast + tomorrowForecast + nextDayForecast) / (parseFloat(yieldType))) * safetyFactor;
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
        value: item.prepUOM,
        cellType: "dropdown",
        columnName: "Prep Type",
        handleOnChange: { handleDropdownChange },
      },
      { 
        value: item.yieldType,
        cellType: "dollar", 
        columnName: "Yield/Type" ,
        yieldDollars: item.caseYieldDollars,
        isInput: false,
      },
      {
        value: item.safetyFactor,
        cellType: "percent",
        columnName: "Safety Factor",
        handleOnChange: { onInputCellChange },
        isInput: true,
      },
      {
        value: item.needed,
        cellType: "",
        columnName: "Needed",
        handleOnChange: { onInputCellChange },
      },
      {
        value: item.onHand,
        cellType: "input",
        columnName: "On Hand",
        handleOnChange: { onInputCellChange },
        isInput: true,
      },
      {
        value: item.prepPullAmt,
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
