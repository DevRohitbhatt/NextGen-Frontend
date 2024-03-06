import ExcelJS from 'exceljs';
import { AdjustColumnWidth } from './utils/excelUtils';

export const exportToExcel = (data, filename) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  const header = Object.keys(data[0]);
  let lastColumn = 1; // Initialize lastColumn to 1
  let lastRow = 1;

  data.forEach((table, index) => {
    const tableData = table.data.map((row) => Object.values(row));

    // If float is 'right', start the table from the next column of the last column of the previous table
    // If it's 'left' or not specified, start the table from the first column
    let startColumn = table.float === 'right' ? lastColumn + 2 : 1;
    let startRow = table.float === 'right' ? lastRow : worksheet.rowCount === 0 ? 0 : worksheet.rowCount + 2;

    lastRow = worksheet.rowCount === 0 ? 0 : worksheet.rowCount + 2;
    // Add header cell above the table
    if (table.hasTableHeader !== false) {
      worksheet.getCell(`${String.fromCharCode(64 + startColumn)}${startRow}`).value = table.name;
      worksheet.mergeCells(`${String.fromCharCode(64 + startColumn)}${startRow}:${String.fromCharCode(64 + lastColumn)}${startRow}`);
    }

    let tableRef = `${String.fromCharCode(64 + startColumn)}${startRow + 1}`;


    worksheet.addTable({
      name: `${table.name}` || `Table${index + 1}`,
      ref: tableRef,
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium9',
        showRowStripes: true,
      },
      columns: table.columns,
      rows: tableData,
    });

    const tableObj = worksheet.getTable(`${table.name}` || `Table${index + 1}`);
    console.log(tableObj);

    // Merge cells based on cellSpan property
    // tableObj.table.columns.forEach((column, columnIndex) => {
    //   tableObj.table.rows.forEach((row, rowIndex) => {
    //     const cellSpan = table.cellSpan || 1;
    //     if (cellSpan > 1) {
    //       const endColumn = startColumn + columnIndex + cellSpan - 1;
    //       worksheet.mergeCells(`${String.fromCharCode(64 + startColumn + columnIndex)}${startRow + rowIndex + 1}:${String.fromCharCode(64 + endColumn)}${startRow + rowIndex + 1}`);
    //     }
    //   });
    // });

    // Update lastColumn to the column number of the last column of the current table
    lastColumn = startColumn + table.columns.length - 1;
  });
  data.forEach((table, index) => {
    worksheet.getRow(worksheet.rowCount + 1).values = [null];
    worksheet.addRow({ [header[0]]: `Table${index + 1}` });
  });
  AdjustColumnWidth(worksheet);
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
  });

}