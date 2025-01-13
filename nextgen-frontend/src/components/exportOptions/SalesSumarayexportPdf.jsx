import pdfMake from "pdfmake/build/pdfmake";
import { addDecimals, formattingData, valueFormatewithoutDecimal } from "../../functions/formatingCurrency";

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
          formattingData(data.viewActivityDaily[0]?.salesGross),
        ],
        [
          { text: "Net Sales", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.salesNet),
        ],
        [
          { text: "Tax", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.salesTax),
        ],
        [
          { text: "Comps", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.comps),
        ],
        [
          { text: "Promotions", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.promo),
        ],
        [
          { text: "Refunds", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.refunds),
        ],
        [
          { text: "Voids", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.voids),
        ],
        [
          { text: "Sales Non Cash", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.planSalesNet),
        ],
        [
          { text: "Deposits", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.deposits),
        ],
        [
          { text: "Cash OverShort", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.cashOverShort),
        ],
        [
          { text: "Order Count", style: "tableHeader" },
          valueFormatewithoutDecimal(data.viewActivityDaily[0]?.transactions) || "0",
        ],
        [
          { text: "Covers", style: "tableHeader" },
          data.viewActivityDaily[0]?.nrsTotalOpen || "0",
        ],
        [
          { text: "Order Average", style: "tableHeader" },
          formattingData(
            data.viewActivityDaily[0]?.salesNet /
              data.viewActivityDaily[0]?.transactions
          ),
        ],
        [
          { text: "Labor Cost", style: "tableHeader" },
          formattingData(
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
          formattingData(data.viewActivityDaily[0]?.giftCertificate),
        ],
        [
          { text: "Gift Cards Sold", style: "tableHeader" },
          formattingData(data.viewActivityDaily[0]?.giftCertificatesSold),
        ],
      ],
    },
    layout: "noBorders", // Change layout as per your design needs
  };

  const categorySalesSection = {
    table: {
      headerRows: 1,
      widths: ["20%","20%", "20%", "20%", "20%"],
      body: [
        [
          { text: "Name", style: "tableHeader" },
          { text: "Qty Items", style: "tableHeader" },
          { text: "Qty Mode", style: "tableHeader" },
          { text: "Sales Net", style: "tableHeader" },
          { text: "Percent", style: "tableHeader" },
        ],
        ...data.categorySummary.map((item) => [
          item.categoryName,
          valueFormatewithoutDecimal(item.quantityItems),
          valueFormatewithoutDecimal(item.quantityModifiers),
          formattingData(item.salesNet),
          formatPercent(item.percentOfTotal),
        ]),
        [
          { text: "Total", style: "tableHeader" },
          valueFormatewithoutDecimal(data.categorySummary.reduce((sum, item) => sum + item.quantityItems, 0)),
          data.categorySummary.reduce((sum, item) => sum + item.quantityModifiers, 0),
          formattingData(
            data.categorySummary.reduce((sum, item) => sum + item.salesNet, 0)
          ),
          "100%",
        ],
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
          formattingData(item.amount),
          formattingData(item.tip),
          formattingData(item.amount + item.tip),
          formatPercent(item.percentOfTotal),
        ]),
        [
          { text: "Total", style: "tableHeader" },
          data.paymentsSummary.reduce((sum, item) => sum + item.quantity, 0),
          formattingData(
            data.paymentsSummary.reduce((sum, item) => sum + item.amount, 0)
          ),
          formattingData(
            data.paymentsSummary.reduce((sum, item) => sum + item.tip, 0)
          ),
          formattingData(
            data.paymentsSummary.reduce(
              (sum, item) => sum + item.amount + item.tip,
              0
            )
          ),
          "100%",
        ],
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
          { text: "Percent", style: "tableHeader" },
        ],
        ...data.discountSummary.map((item) => [
          item.typeItemName,
          item.quantityTickets,
          formattingData(item.amountDiscount),
          formatPercent(item.amountDiscountPercentOfTotal),
        ]),
        [
          { text: "Total", style: "tableHeader" },
          data.discountSummary.reduce(
            (sum, item) => sum + item.quantityTickets,
            0
          ),
          formattingData(
            data.discountSummary.reduce(
              (sum, item) => sum + item.amountDiscount,
              0
            )
          ),
          data.discountSummary.reduce(
            (sum, item) => sum + item.quantityTicketItems,
            0
          ),
        ],
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
        fontSize: 12,
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
