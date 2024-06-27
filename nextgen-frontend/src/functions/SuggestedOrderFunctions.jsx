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
