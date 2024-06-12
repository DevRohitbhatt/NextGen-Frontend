export const handleForecastChange = (
  e,
  row,
  columnName,
  forecastTable,
  setForecastTable,
  editedMessages,
  setEditedMessages
) => {
  const updatedValue = parseFloat(e.target.value);

  if (isNaN(updatedValue)) {
    console.error("Invalid input value");
    return;
  }
  const currentCellValue = forecastTable.rows[row].find(cell => cell.columnName === columnName).value;
  const hasValueChanged = currentCellValue !== updatedValue;
  const updatedEditedMessages = { ...editedMessages };
  if (hasValueChanged) {
    updatedEditedMessages[forecastTable.rows[row][0].value] = '* Changed';
  }
  setEditedMessages(updatedEditedMessages);

  const updatedRows = forecastTable.rows.map((r, rowIndex) => {
    if (rowIndex === row) {
      return r.map((cell) => {
        if (cell.columnName === columnName) {
          return { ...cell, value: updatedValue };
        }
        return cell;
      });
    }
    return r;
  });

  setForecastTable((prevTable) => ({
    ...prevTable,
    rows: updatedRows,
  }));

  // Recalculate the total forecasted value
  const updatedForecastData = updatedRows.slice(0, -1).map((row) => ({
    firstMinute: row[0].value,
    projectedValue: parseFloat(row[1].value),
  }));

  return updatedForecastData;
};


export function handleDefaultSafetyFactorChange(
  e,
  row,
  columnName,
  tableName,
  tableData,
  setTable,
  suggestedOrder,
  setsuggestedOrder,
  setSuggestedTable,
  SuggestedTable
) {
  const newsuggestedOrder = { ...suggestedOrder };
  let previousSafetyFactor = suggestedOrder.defaultSafetyFactor;

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      if (index === row) {
        return item.map((cell) => {
          if (cell.columnName === "Default Safety Factor") {
            if (e.target.value === "") e.target.value = 0;
            cell.value = e.target.value;
            newsuggestedOrder.defaultSafetyFactor = parseFloat(e.target.value);
          }
          return cell;
        });
      } else {
        return item;
      }
    }),
  });

  recalculateSuggestedOrder(newsuggestedOrder, setsuggestedOrder, SuggestedTable, setSuggestedTable,previousSafetyFactor, parseFloat(e.target.value));
  setsuggestedOrder(newsuggestedOrder);
}

export const recalculateSuggestedOrder = (suggestedOrder, setsuggestedOrder, todayTable, tomorrowTable, nextDayTable, setTodayTable, setTomorrowTable, setNextDayTable, previousSafetyFactor, newSafetyFactor) => {
  recalculateTable(suggestedOrder, setsuggestedOrder, todayTable, setTodayTable, "today", previousSafetyFactor, newSafetyFactor);
  recalculateTable(suggestedOrder, setsuggestedOrder, tomorrowTable, setTomorrowTable, "tomorrow", previousSafetyFactor, newSafetyFactor);
  recalculateTable(suggestedOrder, setsuggestedOrder, nextDayTable, setNextDayTable, "nextDay", previousSafetyFactor, newSafetyFactor);
}

export const recalculateTable = (suggestedOrder, setsuggestedOrder, tableData, setTable, tableName, previousSafetyFactor, newSafetyFactor) => {
  const newsuggestedOrder = { ...suggestedOrder };

  setTable({
    ...tableData,
    rows: tableData.rows.map((item, index) => {
      let suggestedValue = 0;
      let yieldType = 0;
      let safetyFactor = 0;
      let needed = 0;
      let onHand = 0;

      return item.map((cell) => {
        if (cell.columnName === "Prep Type") {
          cell.value.forEach((option) => {
            if (option.isSelected) {
              suggestedValue = option.value;
            }
          });
        }

        if (cell.columnName === "Yield/Type") {
          yieldType = (cell.yieldDollars / suggestedValue).toFixed(2);
          cell.value = yieldType;
          newsuggestedOrder[tableName][index]["yieldType"] = yieldType;
        } else if (cell.columnName === "Safety Factor") {
          safetyFactor = (cell.value === previousSafetyFactor) ? newSafetyFactor : cell.value;
          cell.value = safetyFactor;
          newsuggestedOrder[tableName][index]["safetyFactor"] = safetyFactor;
        } else if (cell.columnName === "Needed") {
          needed = calculateNeededValue(tableName, suggestedOrder, suggestedValue, yieldType, safetyFactor);
          cell.value = needed;
          newsuggestedOrder[tableName][index]["needed"] = needed;
        } else if (cell.columnName === "On Hand") {
          onHand = parseFloat(cell.value);
          newsuggestedOrder[tableName][index]["onHand"] = onHand;
        } else if (cell.columnName === "Prep/Pull Amount") {
          cell.value = (needed - onHand).toFixed(2);
          newsuggestedOrder[tableName][index]["prepPullAmount"] = cell.value;
        }
        return cell;
      });
    }),
  });
}

function calculateNeededValue(tableName, suggestedOrder, prepValue, yieldType, safetyFactor) {
  const todayForecast = suggestedOrder.forecastData.today;
  const tomorrowForecast = suggestedOrder.forecastData.tomorrow;
  const nextDayForecast = suggestedOrder.forecastData.nextDay;
  let needed = 0;
  safetyFactor = safetyFactor / 100 + 1;

  if (tableName === "today") {
    console.log("todayForecast: ", todayForecast, "prepValue: ", prepValue, "yieldType: ", yieldType, "safetyFactor: ", safetyFactor)
    needed = (todayForecast / (parseFloat(yieldType))) * safetyFactor;
  } else if (tableName === "tomorrow") {
    needed = ((todayForecast + tomorrowForecast) / (parseFloat(yieldType))) * safetyFactor;
  } else if (tableName === "nextDay") {
    needed = ((todayForecast + tomorrowForecast + nextDayForecast) / (parseFloat(yieldType))) * safetyFactor;
  }

  return needed.toFixed(2);
}

export const buildPrepTable = (
  suggestedOrderSection,
  setTable,
  tableState,
  onInputCellChange,
  handleDropdownChange
) => {
  const rows = suggestedOrderSection.map((item) => {
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
