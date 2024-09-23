import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.fonts = {
	Roboto: {
		normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
		bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
		italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
		bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
	},
};

const createTable = (tableInfo) => {
	const title = { text: '', style: 'tableTitle' };
	if (tableInfo.title) title.text = tableInfo.title;
	const table = {
		table: {
			headerRows: 1,
			widths: tableInfo.widths,
			body: [
				[
					...tableInfo.data.columnHeaders.map((header) => ({
						text: header,
						style: 'tableHeader',
					})),
				],
				...tableInfo.data.rows.map((row) =>
					row.map((cell, index) => ({
						text: getCellValue(cell, tableInfo.dataTypes ? tableInfo.dataTypes[index] : ''),
						style: 'tableCell',
					}))
				),
			],
		},
		layout: {
			fillColor: function (rowIndex, node, columnIndex) {
				return rowIndex % 2 === 0 ? '#E0E0E0' : null;
			},
		},
	};

	if (title.text === '') return { table };
	else return { title, table };
};

const getCellValue = (cell, dataType) => {
	if (Array.isArray(cell.value)) {
		return cell.value.find((option) => option.isSelected).option;
	} else if (dataType === 'currency') {
		return cell.value
			? cell.value.toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
			  })
			: '';
	} else if (dataType === 'currency rounded') {
		const roundedValue = Math.round(cell.value);
		return '$' + roundedValue.toLocaleString('en-US');
	} else if (dataType === 'percent') {
		return `${cell.value}%`;
	} else {
		return cell.value !== 0 ? cell.value : '';
	}
};

export default function PdfBuilder(data) {
	const content = [];
	let columns = [];
	content.push({ text: data.title, style: 'header' });
	if (data.subHeaders) {
		data.subHeaders.map((subHeader) => {
			content.push({ text: subHeader, style: 'subheader' });
		});
	}
	data.body.map((section) => {
		if (section.type !== 'table/Column' && columns.length > 0) {
			content.push({ columns: columns });
			columns = [];
		}
		if (section.type === 'table') {
			const { title, table } = createTable(section);
			if (title) content.push(title);
			content.push(table);
		} else if (section.type === 'table/Column') {
			const { title, table } = createTable(section);
			if (title) content.push(title);
			columns.push(table);
		}
	});

	const docDefinition = {
		pageSize: data.pageSize || 'A4',
		pageOrientation: data.pageOrientation || 'portrait',
		content: content,
		...(data.exportType === 'pdf' && { pageMargins: [20, 20, 20, 20] }),

		styles: {
			header: {
				fontSize: 16,
				bold: true,
			},
			subheader: {
				fontSize: 12,
				bold: true,
				margin: [0, 5, 0, 0],
			},
			tableTitle: {
				fontSize: 12,
				bold: true,
				margin: [0, 10, 0, 5],
			},
			tableHeader: {
				bold: true,
				fontSize: 9,
				margin: [0, 2, 0, 2],
			},
			tableCell: {
				fontSize: 9,
			},
		},
		defaultStyle: {
			columnGap: 10,
		},
	};

	if (data.exportType === 'pdf') {
		pdfMake.createPdf(docDefinition).open();
	} else if (data.exportType === 'print') {
		pdfMake.createPdf(docDefinition).print();
	}
}
