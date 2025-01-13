import React, { useEffect, useState } from "react";
import {
  CalendarModal,
  DateSelector,
  Dropdown,
  ExportOptions,
  Loader,
  PdfBuilder,
  TableHOC,
  UnitModal,
  UnitSelector,
} from "../../components";
import { getCall } from "../../apis/network";
import { useSelector } from "react-redux";
import dateFormat from "dateformat";
import {
  addDecimals,
  formattingData,
  valueFormatewithoutDecimal,
} from "../../functions/formatingCurrency";
import generateSalesSummaryPDF from "../../components/exportOptions/SalesSumarayexportPdf";
import exportToExcel from "../../components/exportOptions/ExcelExport";
import { Steps } from "intro.js-react";
import salesSummary from "../../assets/introJSSteps/salesSummary";

const SalesSummary = () => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    defaultUnitID,
    defaultUnitName,
    groupOrUnitAccess,
    groupOrUnitAccessName,
  } = useSelector((state) => state.globalState);

  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [salesSummrayData, setSelesSummrayData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [introSteps, setIntroSteps] = useState({
      steps: salesSummary(),
      initialStep: 0,
      stepsEnabled: false,
    });

  const categorySalesColumns = React.useMemo(
    () => [
      {
        accessorKey: "categoryName",
        header: () => <div className="w-full text-left">Name</div>,
        cell: (info) => (
          <div className="w-full text-left"> {info.getValue()}</div>
        ),
        footer: ({ table }) => "Total",
      },
      {
        accessorKey: "quantityItems",
        header: "Qty Items",
        cell: (info) => valueFormatewithoutDecimal(info.getValue()),
        footer: ({ table }) => {
          let qtyItem = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.quantityItems),
              0
            );
          return (
            <div className="w-full text-center">
              {valueFormatewithoutDecimal(qtyItem)}
            </div>
          );
        },
      },
      {
        accessorKey: "quantityModifiers",
        header: "Qty Mode",
        cell: (info) => valueFormatewithoutDecimal(info.getValue()),
        footer: ({ table }) => {
          let quantityModifiers = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.quantityModifiers),
              0
            );
          return (
            <div className="w-full text-center">
              {valueFormatewithoutDecimal(quantityModifiers)}
            </div>
          );
        },
      },
      {
        accessorKey: "salesNet",
        header: "Total",
        cell: (info) => formattingData(info.getValue()),
        footer: ({ table }) => {
          let salesNet = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.salesNet),
              0
            );
          return (
            <div className="w-full text-center">{formattingData(salesNet)}</div>
          );
        },
      },
      {
        accessorKey: "percentOfTotal",
        header: "Percent",
        cell: (info) => `${multiplyForPercent(info.getValue())}%`,
      },
    ],
    []
  );

  // Column definitions for Payments
  const paymentsColumns = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: <div className="w-full text-left">Name</div>,
        cell: (info) => (
          <div className="w-full text-left"> {info.getValue()}</div>
        ),
        footer: () => <div className="w-full text-left">Total</div>,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (info) => valueFormatewithoutDecimal(info.getValue()),
        footer: ({ table }) => {
          let quantity = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.quantity),
              0
            );
          return (
            <div className="w-full text-center">
              {valueFormatewithoutDecimal(quantity)}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Payments",
        cell: (info) => formattingData(info.getValue()),
        footer: ({ table }) => {
          let amount = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.amount),
              0
            );
          return (
            <div className="w-full text-center">{formattingData(amount)}</div>
          );
        },
      },
      {
        accessorKey: "tip",
        header: "Tips",
        cell: (info) => formattingData(info.getValue()),
        footer: ({ table }) => {
          let tip = table
            .getCoreRowModel()
            .rows.reduce((sum, item) => sum + parseFloat(item.original.tip), 0);
          return (
            <div className="w-full text-center" aria-hidden>
              {formattingData(tip)}
            </div>
          );
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: (info) =>
          formattingData(info.row.original.amount + info.row.original.tip),
        footer: ({ table }) => {
          let total = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) =>
                sum +
                parseFloat(item.original.amount) +
                parseFloat(item.original.tip),
              0
            );
          return (
            <div className="w-full text-center">{formattingData(total)}</div>
          );
        },
      },
      {
        accessorKey: "percentOfTotal",
        header: "Percent",
        cell: (info) => `${addDecimals(info.getValue() * 100)}%`,
      },
    ],
    []
  );

  // Column definitions for Discounts
  const discountsColumns = React.useMemo(
    () => [
      {
        accessorKey: "typeItemName",
        header: <div className="w-full text-left">Name</div>,
        cell: (info) => (
          <div className="w-full text-left">{info.getValue()}</div>
        ),
        footer: ({ table }) => <div className="w-full text-left">Total</div>,
      },
      {
        accessorKey: "quantityTickets",
        header: "Quantity",
        cell: (info) => valueFormatewithoutDecimal(info.getValue()),
        footer: ({ table }) => {
          let quantityTickets = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.quantityTickets),
              0
            );
          return (
            <div className="w-full text-center" aria-hidden>
              {valueFormatewithoutDecimal(quantityTickets)}
            </div>
          );
        },
      },
      {
        accessorKey: "amountDiscount",
        header: "Total",
        cell: (info) => formattingData(info.getValue()),
        footer: ({ table }) => {
          let amountDiscount = table
            .getCoreRowModel()
            .rows.reduce(
              (sum, item) => sum + parseFloat(item.original.amountDiscount),
              0
            );
          return (
            <div className="w-full text-center" aria-hidden>
              {formattingData(amountDiscount)}
            </div>
          );
        },
      },
      {
        accessorKey: "amountDiscountPercentOfTotal",
        header: "Percent",
        cell: (info) => `${addDecimals(info.getValue() * 100)}%`,
      },
    ],
    []
  );

  // Column definitions for View Activity Summary
  const activityColumns = React.useMemo(
    () => [
      { accessorKey: "label", header: "Name", cell: (info) => info.getValue() },
      {
        accessorKey: "value",
        header: "Value",
        cell: (info) => {
          let valueType = typeof info.getValue() === "string";
          return valueType ? info.getValue() : formattingData(info.getValue());
        },
      },
    ],
    []
  );

  // Transform View Activity Summary data
  const viewActivityData = React.useMemo(() => {
    const data =
      salesSummrayData?.viewActivityDaily &&
      salesSummrayData?.viewActivityDaily.length > 0
        ? salesSummrayData?.viewActivityDaily[0]
        : {};
    return [
      { label: "Gross Sales", value: data?.salesGross },
      { label: "Net Sales", value: data?.salesNet },
      { label: "Tax", value: data?.salesTax },
      { label: "Comps", value: data?.comps },
      { label: "Promotions", value: data?.promo },
      { label: "Refunds", value: data?.refunds },
      { label: "Voids", value: data?.voids },
      { label: "Sales Non Cash", value: data?.planSalesNet },
      { label: "Deposits", value: data?.deposits },
      { label: "Cash OverShort", value: data?.cashOverShort },
      { label: "Order Count", value: data?.transactions },
      { label: "Covers", value: data?.nrsTotalOpen },
      { label: "Order Average", value: data?.orderAverage },
      { label: "Labor Cost", value: data?.laborCost },
      { label: "Labor Hours", value: data?.laborHours },
      { label: "Labor Percent", value: `${data?.laborPercent}%` },
      { label: "Gift Cards Redeemed", value: data?.giftCertificate },
      { label: "Gift Cards Sold", value: data?.giftCertificatesSold },
    ];
  }, [salesSummrayData]);

  const aggregateData = async (viewActivityDaily) => {
    const result = {};

    viewActivityDaily.forEach((item) => {
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === "number") {
          result[key] = (result[key] || 0) + value; // Sum numeric values
        } else if (Array.isArray(value)) {
          result[key] = (result[key] || []).concat(value); // Merge arrays
        } else {
          result[key] = result[key] || value; // Store first occurrence of non-numeric
        }
      }
    });

    return [result];
  };
  const getSalesData = async () => {
    setIsLoading(true);
    try {
      const getData = {
        url: "GetSalesSummaryReport",
        urlParams: {
          companyId: companyID,
          alignmentId: alignmentID,
          fromDate: dateFormat(selectedFromDate, "yyyy-mm-dd"),
          toDate: dateFormat(selectedToDate, "yyyy-mm-dd"),
          UnitID: selectedUnit,
        },
      };

      const result = await getCall(getData);
      if (result?.data) {
        let totalOfViewActivity = await aggregateData(
          result.data.viewActivityDaily
        );
        let viewActivityDaily = totalOfViewActivity.map((item) => {
          let activity = {
            ...item,
            orderAverage: formattingData(item?.salesNet / item?.transactions),
            laborCost: formattingData(item?.laborVariable + item?.laborSalary),
            laborHours: addDecimals(
              item?.laborVariableHours + item?.laborSalary
            ),
            transactions: item.transactions + "",
            laborPercent:
              item?.laborVariable == 0
                ? 0.0
                : getLabourPercent(
                    item?.laborVariable,
                    item?.laborSalary,
                    item?.salesNet
                  ).toFixed(2),
          };
          return activity;
        });

        result.data.viewActivityDaily = viewActivityDaily;
        setSelesSummrayData(result?.data);
      }
    } catch (error) {
      console.log("errrrr=>", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowUnitModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };

  useEffect(() => {
    if (defaultUnitID) {
      setSelectedUnit(defaultUnitID);
    }
    if (defaultUnitName) {
      setSelectedUnitName(defaultUnitName);
    }
  }, [defaultUnitID, defaultUnitName]);

  const handlePDFClick = () => {
    const metaInfo = {
      groupOrUnitAccessName,
      selectedUnitName,
    };
    let data = salesSummrayData;
    data.metaInfo = metaInfo;
    generateSalesSummaryPDF(data);
  };

  const prepareExcelData = (salesSummaryData) => {
    const data = [];

    // Gross Sales Section
    const grossSalesSection = {
      name: "Gross Sales Data",
      columns: [{ name: "Metric" }, { name: "Value" }],
      data: [
        [
          "Gross Sales",
          `$${salesSummaryData.viewActivityDaily[0]?.salesGross?.toFixed(2)}`,
        ],
        [
          "Net Sales",
          `$${salesSummaryData.viewActivityDaily[0]?.salesNet?.toFixed(2)}`,
        ],
        [
          "Tax",
          `$${salesSummaryData.viewActivityDaily[0]?.salesTax?.toFixed(2)}`,
        ],
        [
          "Comps",
          `$${salesSummaryData.viewActivityDaily[0]?.comps?.toFixed(2)}`,
        ],
        [
          "Promotions",
          `$${salesSummaryData.viewActivityDaily[0]?.promo?.toFixed(2)}`,
        ],
        [
          "Refunds",
          `$${salesSummaryData.viewActivityDaily[0]?.refunds?.toFixed(2)}`,
        ],
        [
          "Voids",
          `$${salesSummaryData.viewActivityDaily[0]?.voids?.toFixed(2)}`,
        ],
        [
          "Sales Non Cash",
          `$${salesSummaryData.viewActivityDaily[0]?.planSalesNet?.toFixed(2)}`,
        ],
        [
          "Deposits",
          `$${salesSummaryData.viewActivityDaily[0]?.deposits?.toFixed(2)}`,
        ],
        [
          "Cash OverShort",
          `$${salesSummaryData.viewActivityDaily[0]?.cashOverShort?.toFixed(
            2
          )}`,
        ],
        [
          "Order Count",
          salesSummaryData.viewActivityDaily[0]?.transactions || "0",
        ],
        ["Covers", salesSummaryData.viewActivityDaily[0]?.nrsTotalOpen || "0"],
        [
          "Order Average",
          `$${(
            salesSummaryData.viewActivityDaily[0]?.salesNet /
            salesSummaryData.viewActivityDaily[0]?.transactions
          ).toFixed(2)}`,
        ],
        [
          "Labor Cost",
          `$${(
            salesSummaryData.viewActivityDaily[0]?.laborVariable +
            salesSummaryData.viewActivityDaily[0]?.laborSalary
          ).toFixed(2)}`,
        ],
        [
          "Labor Hours",
          `$${(
            salesSummaryData.viewActivityDaily[0]?.laborVariableHours +
            salesSummaryData.viewActivityDaily[0]?.laborSalaryHours
          ).toFixed(2)}`,
        ],
        [
          "Labor Percent",
          `${(
            ((salesSummaryData.viewActivityDaily[0]?.laborVariable +
              salesSummaryData.viewActivityDaily[0]?.laborSalary) /
              salesSummaryData.viewActivityDaily[0]?.salesNet) *
            100
          ).toFixed(2)}%`,
        ],
        [
          "Gift Cards Redeemed",
          `$${salesSummaryData.viewActivityDaily[0]?.giftCertificate?.toFixed(
            2
          )}`,
        ],
        [
          "Gift Cards Sold",
          `$${salesSummaryData.viewActivityDaily[0]?.giftCertificatesSold?.toFixed(
            2
          )}`,
        ],
      ],
    };

    data.push(grossSalesSection);

    // Category Sales Section
    let categoryData = [...salesSummaryData.categorySummary];
    categoryData[categoryData.length] = {
      categoryName: "Total",
      quantityItems: valueFormatewithoutDecimal(
        categoryData.reduce(
          (sum, item) => sum + parseFloat(item.quantityItems),
          0
        )
      ),
      quantityModifiers: valueFormatewithoutDecimal(
        categoryData.reduce(
          (sum, item) => sum + parseFloat(item.quantityModifiers),
          0
        )
      ),
      salesNet: categoryData.reduce(
        (sum, item) => sum + parseFloat(item.salesNet),
        0
      ),
      percentOfTotal: 1,
    };
    const categorySalesSection = {
      name: "Category Sales",
      columns: [
        { name: "Name" },
        { name: "Qty Items" },
        { name: "Qty Mode" },
        { name: "Sales Net" },
        { name: "Percent" },
      ],
      data: categoryData.map((item, index) => [
        item.categoryName,
        item.quantityItems,
        item.quantityModifiers,
        `$${item.salesNet?.toFixed(2)}`,
        `${(item.percentOfTotal * 100).toFixed(2)}%`,
      ]),
    };
    data.push(categorySalesSection);
    categoryData = [];

    // Payments Section
    let paymentData = [...salesSummaryData.paymentsSummary];

    // Add Total Row
    paymentData[paymentData.length] = {
      name: "Total",
      quantity: paymentData.reduce(
        (sum, item) => sum + parseFloat(item.quantity || 0),
        0
      ),
      amount: paymentData.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      ),
      tip: paymentData.reduce(
        (sum, item) => sum + parseFloat(item.tip || 0),
        0
      ),
      percentOfTotal: 1, // Total percent should always be 1 (or 100%)
    };
    const paymentsSection = {
      name: "Payments",
      columns: [
        { name: "Name" },
        { name: "Quantity" },
        { name: "Amount" },
        { name: "Tips" },
        { name: "Total" },
        { name: "Percent" },
      ],
      data: paymentData.map((item) => [
        item.name,
        item.quantity,
        `$${item.amount?.toFixed(2)}`,
        `$${item.tip?.toFixed(2)}`,
        `$${(item.amount + item.tip)?.toFixed(2)}`,
        `${(item.percentOfTotal * 100).toFixed(2)}%`,
      ]),
    };

    data.push(paymentsSection);
    paymentData = [];
    // Discounts Section
    let discountData = [...salesSummaryData.discountSummary];

    // Add Total Row
    discountData[discountData.length] = {
      typeItemName: "Total",
      quantityTickets: discountData.reduce(
        (sum, item) => sum + parseFloat(item.quantityTickets || 0),
        0
      ),
      amountDiscount: discountData.reduce(
        (sum, item) => sum + parseFloat(item.amountDiscount || 0),
        0
      ),
      quantityTicketItems: discountData.reduce(
        (sum, item) => sum + parseFloat(item.quantityTicketItems || 0),
        0
      ),
    };

    const discountsSection = {
      name: "Discounts",
      columns: [
        { name: "Name" },
        { name: "Quantity" },
        { name: "Total" },
        { name: "Percent" },
      ],
      data: discountData.map((item) => [
        item.typeItemName,
        item.quantityTickets,
        `$${item.amountDiscount?.toFixed(2)}`,
        item.quantityTicketItems,
      ]),
    };

    data.push(discountsSection);
    discountData = [];
    return data;
  };

  const handleExportToExcel = (
    salesSummaryData,
    filename,
    spreadSheetTitle,
    date,
    unitName
  ) => {
    const excelData = prepareExcelData(salesSummaryData);
    exportToExcel(excelData, filename, spreadSheetTitle, date, unitName);
  };

  const exportToCSV = (data, filename) => {
    const rows = [];

    // Helper to add sections to CSV
    const addSection = (section) => {
      if (section.name) {
        rows.push([section.name]); // Section title
      }
      if (section.columns) {
        rows.push(section.columns.map((col) => col.name)); // Column headers
      }
      if (section.data) {
        section.data.forEach((row) => {
          rows.push(row); // Data rows
        });
      }
      rows.push([]); // Empty row between sections
    };

    // Process data
    data.forEach(addSection);

    // Convert rows to CSV format
    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const handleExportToCSV = (salesSummaryData, filename) => {
    const csvData = prepareExcelData(salesSummaryData);
    exportToCSV(csvData, filename);
  };

  const getLabourPercent = (value, value2, value3) => {
    let a = value + value2;
    return (a / value3) * 100;
  };

  const multiplyForPercent = (value) => {
    let recivedValue = value * 100;
    return recivedValue.toFixed(2);
  };
  return (
    <div className="w-[98%] mx-auto pageContainer">
      <Steps
        enabled={introSteps.stepsEnabled}
        steps={introSteps.steps}
        initialStep={introSteps.initialStep}
        onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
      />
      <h2 className="my-2 text-[18px] leading-tight text-left pageTitle">
        Sales Summary
      </h2>
      <header className="optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
        <div className="flex items-center">
          <UnitSelector
            companyId={companyID}
            alignmentId={alignmentID}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            includeAreas={true}
            setMemberName={setSelectedUnitName}
            onClick={() => setShowUnitModal(true)}
          />
          <DateSelector
            toDate={selectedToDate}
            fromDate={selectedFromDate}
            isDateRange={true}
            onClick={() => setShowDateModal(true)}
            extraClass={"w-[219px]"}
          />

          <div
            className="run-button"
            onClick={() => {
              getSalesData();
            }}
          >
            <div className="py-2 ml-3 text-[14px] font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7">
              Run
            </div>
          </div>
        </div>
        <div>
          <ExportOptions
            includePDF={true}
            handlePDFClick={handlePDFClick}
            includeCSV={true}
            handleCSVClick={() =>
              handleExportToCSV(salesSummrayData, "Sales_Summary_Report")
            }
            includeExcel={true}
            handleExcelClick={() => {
              handleExportToExcel(
                salesSummrayData,
                "Sales_Summary_Report",
                "Sales Summary Report",
                `${dateFormat(selectedFromDate, "mm-dd-yyyy")} - ${dateFormat(
                  selectedToDate,
                  "mm-dd-yyyy"
                )}`,
                `${groupOrUnitAccessName} - ${selectedUnitName}`
              );
            }}
            includeHelp={true}
            handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}

            // handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
          />
        </div>
      </header>
      {/* Gross Sales Section */}
      {isLoading && <Loader loading={isLoading} />}
      {Object.keys(salesSummrayData).length > 0 ? (
        <>
          <div className="  rounded-lg mb-0 p-4  all">
            <div className="flex justify-between">
              {" "}
              <h2 className="text-lg font-semibold mb-4">
                {groupOrUnitAccessName} - {selectedUnitName}
              </h2>
              <h2 className="text-lg font-semibold mb-4">
                {dateFormat(selectedFromDate, "mm-dd-yyyy")} to{" "}
                {dateFormat(selectedToDate, "mm-dd-yyyy")}
              </h2>
            </div>
            <div className="paged-table">
              <TableHOC
                columns={activityColumns}
                data={viewActivityData}
                isHeader={false}
                dataPosition={"left"}
              />
            </div>
          </div>

          {/* Category Sales Section */}
          {Object.keys(salesSummrayData).length > 0 && (
            <div className=" paged-table rounded-lg p-4 mt-[-20px] categorySales">
              <h3 className="text-lg font-semibold mb-4">Category Sales</h3>
              <TableHOC
                columns={categorySalesColumns}
                data={salesSummrayData.categorySummary}
                isHeader={true}
                isFooter={true}
              />
            </div>
          )}
          {/* Payments Section */}
          <div className=" paged-table rounded-lg p-4 mt-[-20px] Payments">
            <h3 className="text-lg font-semibold mb-4">Payments</h3>
            <TableHOC
              columns={paymentsColumns}
              data={salesSummrayData.paymentsSummary}
              isHeader={true}
              isFooter={true}
            />
          </div>
          <div className=" paged-table rounded-lg p-4 mt-[-20px] Discounts">
            <h3 className="text-lg font-semibold mb-4">Discounts</h3>
            <TableHOC
              columns={discountsColumns}
              data={salesSummrayData.discountSummary}
              isHeader={true}
              isFooter={true}
            />
          </div>
        </>
      ) : (
        <div>
          {" "}
          <div className="mt-10 text-xl font-medium text-center">
            No data available
          </div>{" "}
        </div>
      )}
      <UnitModal
        unitData={unitsAndAreasList}
        memberID={selectedUnit}
        memberName={selectedUnitName}
        show={showUnitModal}
        includeAreas={true}
        handleClose={() => {
          setShowUnitModal(false);
        }}
        handleUnitSelection={handleUnitSelection}
      />
      <CalendarModal
        handleClose={() => setShowDateModal(false)}
        modalOpen={showDateModal}
        isDateRange={true}
        handleDateSelection={handleDateSelection}
        handleFromDateChange={(fromDate) => setSelectedFromDate(fromDate)}
        handleToDateChange={(toDate) => setSelectedToDate(toDate)}
        selectedFromDate={selectedFromDate}
        selectedToDate={selectedToDate}
      />
    </div>
  );
};

export default SalesSummary;
