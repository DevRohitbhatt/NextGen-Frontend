

export function onInputCellChange(e, row, columnName, tableName, tableData, setTable, prepChart, setPrepChart) {
  if (columnName === "On Hand") {
    if (!isNaN(parseInt(e.target.value))) {
      setTable({
        ...tableData,
        rows: tableData.rows.map((item, index) => {
          let needed, onHand = 0;
          if (index === row) {
            item.map((cell) => {
              if (cell.columnName === "Needed") {
                needed = parseInt(cell.value);
              }else if (cell.columnName === "On Hand") {
                onHand = parseInt(e.target.value);
                if (cell.columnName === columnName) {
                  cell.value = parseInt(e.target.value);
                }
              }else if (cell.columnName === "Prep/Pull Amount") {
                cell.value = needed - onHand;
              }
            });
          }
        }),
      });
    }
    const newPrepChart = prepChart;
    newPrepChart[tableName][row][columnName] = parseInt(e.target.value);
    setPrepChart(newPrepChart);
  }
}

export const buildPrepTable = (prepChartSection, setTable, tableState, onInputCellChange) => {
  const rows = prepChartSection.map((item) => {
    return [
      { value: item.itemName, cellType: "", columnName: "Item Name" },
      { value: item.PrepType[0], cellType: "", columnName: "Prep Type" },
      { value: item.YieldType, cellType: "", columnName: "Yield/Type" },
      {
        value: item.SafetyFactor,
        cellType: "input",
        columnName: "Safety Factor",
        handleOnChange: { onInputCellChange },
      },
      {
        value: item.Needed,
        cellType: "input",
        columnName: "Needed",
        handleOnChange: { onInputCellChange },
      },
      {
        value: item.OnHand,
        cellType: "input",
        columnName: "On Hand",
        handleOnChange: { onInputCellChange },
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