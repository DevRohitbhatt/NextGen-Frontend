import pdfMake from "pdfmake/build/pdfmake";

pdfMake.fonts = {
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

const generateSalesSummaryPDF = (data) => {
  // Format helpers
  const formatCurrency = (value) =>
    value !== undefined && value !== null
      ? `$${parseFloat(value).toFixed(2)}`
      : "$0.00";

  const formatPercent = (value) =>
    value !== undefined && value !== null
      ? `${(value * 100).toFixed(2)}%`
      : "0%";

  // Sections
  const grossSalesSection = {
    table: {
      widths: ["70%", "30%"], // Adjust widths to your needs
      body: [
        [
          { text: "Gross Sales", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.salesGross),
        ],
        [
          { text: "Net Sales", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.salesNet),
        ],
        [
          { text: "Tax", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.salesTax),
        ],
        [
          { text: "Comps", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.comps),
        ],
        [
          { text: "Promotions", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.promo),
        ],
        [
          { text: "Refunds", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.refunds),
        ],
        [
          { text: "Voids", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.voids),
        ],
        [
          { text: "Sales Non Cash", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.salesFood),
        ],
        [
          { text: "Deposits", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.deposits),
        ],
        [
          { text: "Cash OverShort", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.cashOverShort),
        ],
        [
          { text: "Order Count", style: "tableHeader" },
          data.viewActivityDaily[0]?.transactions || "0",
        ],
        [
          { text: "Covers", style: "tableHeader" },
          data.viewActivityDaily[0]?.nrsTotalOpen || "0",
        ],
        [
          { text: "Order Average", style: "tableHeader" },
          formatCurrency(
            data.viewActivityDaily[0]?.salesNet /
              data.viewActivityDaily[0]?.transactions
          ),
        ],
        [
          { text: "Labor Cost", style: "tableHeader" },
          formatCurrency(
            data.viewActivityDaily[0]?.laborVariable +
              data.viewActivityDaily[0]?.laborSalary
          ),
        ],
        [
          { text: "Labor Hours", style: "tableHeader" },
          `${
            data.viewActivityDaily[0]?.laborVariableHours +
            data.viewActivityDaily[0]?.laborSalaryHours
          }`,
        ],
        [
          { text: "Labor Percent", style: "tableHeader" },
          `${(
            ((data.viewActivityDaily[0]?.laborVariable +
              data.viewActivityDaily[0]?.laborSalary) /
              data.viewActivityDaily[0]?.salesNet) *
            100
          ).toFixed(2)}%`,
        ],
        [
          { text: "Gift Cards Redeemed", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.giftCertificate),
        ],
        [
          { text: "Gift Cards Sold", style: "tableHeader" },
          formatCurrency(data.viewActivityDaily[0]?.giftCertificatesSold),
        ],
      ],
    },
    layout: "noBorders", // Change layout as per your design needs
  };

  const categorySalesSection = {
    table: {
      headerRows: 1,
      widths: ["40%", "20%", "20%", "20%"],
      body: [
        [
          { text: "Name", style: "tableHeader" },
          { text: "Qty Items", style: "tableHeader" },
          { text: "Sales Net", style: "tableHeader" },
          { text: "Percent", style: "tableHeader" },
        ],
        ...data.categorySummary.map((item) => [
          item.categoryName,
          item.quantityItems,
          formatCurrency(item.salesNet),
          formatPercent(item.percentOfTotal),
        ]),
      ],
    },
  };

  const paymentsSection = {
    table: {
      headerRows: 1,
      widths: ["25%", "15%", "20%", "15%", "15%", "10%"],
      body: [
        [
          { text: "Name", style: "tableHeader" },
          { text: "Quantity", style: "tableHeader" },
          { text: "Amount", style: "tableHeader" },
          { text: "Tips", style: "tableHeader" },
          { text: "Total", style: "tableHeader" },
          { text: "Percent", style: "tableHeader" },
        ],
        ...data.paymentsSummary.map((item) => [
          item.name,
          item.quantity,
          formatCurrency(item.amount),
          formatCurrency(item.tip),
          formatCurrency(item.amount + item.tip),
          formatPercent(item.percentOfTotal),
        ]),
      ],
    },
  };

  const discountsSection = {
    table: {
      headerRows: 1,
      widths: ["40%", "20%", "20%", "20%"],
      body: [
        [
          { text: "Name", style: "tableHeader" },
          { text: "Tickets", style: "tableHeader" },
          { text: "Amount", style: "tableHeader" },
          { text: "Items", style: "tableHeader" },
        ],
        ...data.discountSummary.map((item) => [
          item.typeItemName,
          item.quantityTickets,
          formatCurrency(item.amountDiscount),
          item.quantityTicketItems,
        ]),
      ],
    },
  };

  // PDF Content
  const docDefinition = {
    content: [
      { text: "Sales Summary", style: "header" },
      {
        text: `${data.metaInfo.groupOrUnitAccessName} - ${data.metaInfo.selectedUnitName}`,
        style: "subheader",
      },
      grossSalesSection,
      { text: "Category Sales", style: "sectionHeader" },
      categorySalesSection,
      { text: "Payments", style: "sectionHeader" },
      paymentsSection,
      { text: "Discounts", style: "sectionHeader" },
      discountsSection,
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 10],
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: "#CCCCCC",
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
    pageMargins: [20, 20, 20, 20],
  };

  // Generate the PDF
  pdfMake.createPdf(docDefinition).open();
};

export default generateSalesSummaryPDF;
