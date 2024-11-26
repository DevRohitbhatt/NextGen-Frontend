import ExcelJS from 'exceljs';
import { AdjustColumnWidth } from '../../functions/utils/excelUtils';

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
	const headerRowOffset = table.hasTableHeader !== false ? 1 : 0;
	const startColumn = table.float === 'right' ? lastColumn + 2 : 1;
	const startRow =
		table.float === 'right' ? lastRow + headerRowOffset : worksheet.rowCount === 0 ? 0 : worksheet.rowCount + 2;

	let updatedLastRow = startRow - 1;

	if (table.hasTableHeader !== false) {
		const tableHeaderCell = worksheet.getCell(`${String.fromCharCode(64 + startColumn)}${startRow}`);
		tableHeaderCell.value = table.name;
		tableHeaderCell.font = { bold: true, size: 14 };
		worksheet.mergeCells(
			`${String.fromCharCode(64 + startColumn)}${startRow}:${String.fromCharCode(
				64 + startColumn + table.columns.length - 1
			)}${startRow}`
		);
	}

	if (table.colored) {
		const startRowWithHeaderOffset = startRow + headerRowOffset + 1;
		table.data.forEach((rowData, rowIndex) => {
			rowData.forEach((cellData, columnIndex) => {
				const cell = worksheet.getCell(startRowWithHeaderOffset + rowIndex, startColumn + columnIndex);
				cell.value = cellData.value;
				const rgbaToArgb = (rgba) => {
					const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
					if (!match) return '';

					let [r, g, b, a = 1] = match.slice(1);
					if (a == 255) a = 1;
					const alpha = Math.round(parseFloat(a) * 255)
						.toString(16)
						.padStart(2, '0')
						.toUpperCase();
					const red = parseInt(r, 10).toString(16).padStart(2, '0').toUpperCase();
					const green = parseInt(g, 10).toString(16).padStart(2, '0').toUpperCase();
					const blue = parseInt(b, 10).toString(16).padStart(2, '0').toUpperCase();

					return `${alpha}${red}${green}${blue}`;
				};

				if (cellData.color) {
					const fillColor = cellData.color ? rgbaToArgb(cellData.color) : '';
					cell.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: fillColor },
					};
				} else {
					const fillColor = cellData.fontColor ? rgbaToArgb(cellData.fontColor) : '';
					cell.font = {
						color: { argb: fillColor },
					};
				}
			});
		});
	}

	const tableData = table.data.map((row) => (table.colored ? row.map((cell) => cell.value) : Object.values(row)));
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
		columns: table.columns.map((col) => ({ name: col.name, filterButton: true })),
		rows: tableData,
	});

	updatedLastRow = startRow + headerRowOffset + tableData.length; // Update updatedLastRow to the row number after the table
	return { lastColumn: startColumn + table.columns.length - 1, lastRow: updatedLastRow };
};

const exportToExcel = (data, filename, spreadSheetTitle, date, unitName) => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Sheet 1');

	createHeaderRow(worksheet, spreadSheetTitle);
	createInfoRow(worksheet, `Unit: ${unitName}`);
	createInfoRow(worksheet, `Date: ${date}`);

	let lastColumn = 1;
	let lastRow = 1;

	data.forEach((table, index) => {
		const { lastColumn: updatedLastColumn, lastRow: updatedLastRow } = addTable(
			worksheet,
			table,
			index,
			lastColumn,
			lastRow
		);
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

export default exportToExcel;
