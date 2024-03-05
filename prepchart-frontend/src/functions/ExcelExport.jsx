import ExcelJS from 'exceljs';

export const exportToExcel = (data, filename) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  const header = Object.keys(data[0]);
//data object contains tables, loop through each table and with worksheet.addTable() add the table to the worksheet
  data.forEach((table, index) => {
    const tableData = table.data.map((row) => Object.values(row));
    console.log(table.columns)
    worksheet.addTable({
      name: `${table.name}` || `Table${index + 1}` ,
      ref: `A${worksheet.rowCount + 2}`,
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium9',
        showRowStripes: true,
      },
      columns: table.columns,
      rows: tableData,
    });
  });
  data.forEach((table, index) => {
    worksheet.getRow(worksheet.rowCount + 1).values = [null];
    worksheet.addRow({ [header[0]]: `Table${index + 1}` });
  });
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
  });

}