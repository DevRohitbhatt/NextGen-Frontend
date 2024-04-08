import ExcelJS from 'exceljs';
import { AdjustColumnWidth } from './utils/excelUtils';

const createHeaderRow = (worksheet, title) => {
  const headerRow = worksheet.addRow([title]);
  headerRow.font = { bold: true, size: 18 };
};

const createInfoRow = (worksheet, info) => {
  if (info) {
    const infoRow = worksheet.addRow([info]);
    infoRow.font = { bold: true };
  }
};

const addTable = (worksheet, table, index, lastColumn, lastRow) => {
  const tableData = table.data.map((row) => Object.values(row));
  const headerRowOffset = table.hasTableHeader !== false ? 1 : 0;
  const startColumn = table.float === 'right' ? lastColumn + 2 : 1;
  const startRow = table.float === 'right' ? lastRow + headerRowOffset : worksheet.rowCount === 0 ? 0 : worksheet.rowCount + 2;

  let updatedLastRow = startRow - 1; 

  if (table.hasTableHeader !== false) {
    const tableHeaderCell = worksheet.getCell(`${String.fromCharCode(64 + startColumn)}${startRow}`);
    tableHeaderCell.value = table.name;
    tableHeaderCell.font = { bold: true, size: 14 };
    worksheet.mergeCells(`${String.fromCharCode(64 + startColumn)}${startRow}:${String.fromCharCode(64 + lastColumn)}${startRow}`);
  }

  const tableRef = `${String.fromCharCode(64 + startColumn)}${startRow + headerRowOffset}`;
  worksheet.addTable({
    name: table.name || `Table${index + 1}`,
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

  updatedLastRow = startRow + headerRowOffset ; // Update updatedLastRow to the row number after the table
  return { lastColumn: startColumn + table.columns.length - 1, lastRow: updatedLastRow };
};

export const exportToExcel = (data, filename, spreadSheetTitle, date, unitName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  createHeaderRow(worksheet, spreadSheetTitle);
  createInfoRow(worksheet, `Unit: ${unitName}`);
  createInfoRow(worksheet, `Date: ${date}`);

  let lastColumn = 1;
  let lastRow = 1;

  data.forEach((table, index) => {
    const { lastColumn: updatedLastColumn, lastRow: updatedLastRow } = addTable(worksheet, table, index, lastColumn, lastRow);
    lastColumn = updatedLastColumn;
    lastRow = updatedLastRow;
  });

  AdjustColumnWidth(worksheet);
  worksheet.views = [{ showGridLines: false }];
  worksheet.headerFooter.oddHeader = '&C&16&"Calibri,Regular"PrepChart';

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
  });
};