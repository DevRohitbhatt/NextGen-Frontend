import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    return cell.value.find((option) => option.IsSelected).PrepType;
  } else {
    return cell.value !== 0 ? cell.value : "";
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
}
