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
  const title = { text: "", style: "subheader" };
  if (tableInfo.title) title.text = tableInfo.title;
  const table = {
    table: {
      headerRows: 1,
      widths: tableInfo.widths,
      body: [
        [
          ...tableInfo.data.columnHeaders.map((header) => ({
            text: header,
            style: "tableHeader",
          })),
        ],
        ...tableInfo.data.rows.map((row) =>
          row.map((cell) => ({
            
            text: getCellValue(cell),
            style: "tableCell",
          }))
        ),
      ],
    },
    layout: {
      fillColor: function (rowIndex, node, columnIndex) {
        return rowIndex % 2 === 0 ? "#E0E0E0" : null;
      },
    },
  };
  if (title.text === "") return { table };
  else return { title, table };
};

const getCellValue = (cell) => {
  if (Array.isArray(cell.value)) {
    return cell.value.find((option) => option.isSelected).option;
  } else {
    return cell.value !== 0 ? cell.value : "";
  }
}

function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, "export.csv");
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Anchor element with 'download' attribute not supported in this browser.");
    }
  }
}

export default function PdfBuilder(data) {
  const content = [];
  let columns = [];
  content.push({ text: data.title, style: "header" });
  data.body.map((section) => {
    if (section.type !== "table/Column" && columns.length > 0) {
      content.push({ columns: columns });
      columns = [];
    }
    if (section.type === "table") {
      const { title, table } = createTable(section);
      if (title) content.push(title);
      content.push(table);
    } else if (section.type === "table/Column") {
      const { title, table } = createTable(section);
      if (title) content.push(title);
      columns.push(table);
    }
  });
  const docDefinition = {
    content: content,
    styles: {
      header: {
        fontSize: 16,
        bold: true,
      },
      subheader: {
        fontSize: 14,
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
  };
  if (data.exportType === "pdf") {
    pdfMake.createPdf(docDefinition).open();
  }
  else if (data.exportType === "print") {
    pdfMake.createPdf(docDefinition).print();
  }
  else if (data.exportType === "csv") {
    let csvContent = "";
    data.body.forEach(section => {
      if (section.type === "table") {
        const tableInfo = section.data;
        csvContent += tableInfo.columnHeaders.join(",") + "\n";
        tableInfo.rows.forEach(row => {
          csvContent += row.map(cell => getCellValue(cell)).join(",") + "\n";
        });
      }
    });
    downloadCSV(csvContent);
  }

}
