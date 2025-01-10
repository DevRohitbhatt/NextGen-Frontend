import React, { useEffect, useState } from "react";
import {
  CalendarModal,
  DateSelector,
  Dropdown,
  ExportOptions,
  Loader,
  PdfBuilder,
  UnitModal,
  UnitSelector,
} from "../../components";
import { getCall } from "../../apis/network";
import { useSelector } from "react-redux";
import dateFormat from "dateformat";
import { addDecimals, formattingData } from "../../functions/formatingCurrency";
import generateSalesSummaryPDF from "../../components/exportOptions/SalesSumarayexportPdf";
import exportToExcel from "../../components/exportOptions/ExcelExport";

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
  const [salesSummrayData, setSelesSummrayDaata] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
        url: "GetSaleSummeryReport",
        urlParams: {
          companyId: companyID,
          alignmentId: alignmentID,
          //   memberId: selectedUnit,
          fromDate: "2024-11-11", //dateFormat(selectedFromDate, 'yyyy-mm-dd'),
          toDate: "2024-11-11", //dateFormat(selectedToDate, 'yyyy-mm-dd'),
          UnitID: selectedUnit,
        },
      };

      const result = await getCall(getData);
      if (result?.data) {
        let a = await aggregateData(result.data.viewActivityDaily);
        console.log(a, "<");
        let viewActivityDaily = a.map((item) => {
          let activity = {
            ...item,
            orderAverage: formattingData(item?.salesNet / item?.transactions),
            laborCost: formattingData(item?.laborVariable + item?.laborSalary),
            laborHours: formattingData(
              item?.laborVariableHours + item?.laborSalary
            ),
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
        setSelesSummrayDaata(result?.data);
        console.log(JSON.stringify(viewActivityDaily));

        // console.log(JSON.stringify(result.data))
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
  //   useEffect(() => {
  //     if (selectedUnit) {
  //       getSalesData();
  //     }
  //   }, [selectedUnit]);

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
          `$${salesSummaryData.viewActivityDaily[0]?.salesFood?.toFixed(2)}`,
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
    const categorySalesSection = {
      name: "Category Sales",
      columns: [
        { name: "Category" },
        { name: "Qty Items" },
        { name: "Sales Net" },
        { name: "Percent" },
      ],
      data: salesSummaryData.categorySummary.map((item) => [
        item.categoryName,
        item.quantityItems,
        `$${item.salesNet?.toFixed(2)}`,
        `${(item.percentOfTotal * 100).toFixed(2)}%`,
      ]),
    };

    data.push(categorySalesSection);

    // Payments Section
    const paymentsSection = {
      name: "Payments",
      columns: [
        { name: "Payment Method" },
        { name: "Quantity" },
        { name: "Amount" },
        { name: "Tips" },
        { name: "Total" },
        { name: "Percent" },
      ],
      data: salesSummaryData.paymentsSummary.map((item) => [
        item.name,
        item.quantity,
        `$${item.amount?.toFixed(2)}`,
        `$${item.tip?.toFixed(2)}`,
        `$${(item.amount + item.tip)?.toFixed(2)}`,
        `${(item.percentOfTotal * 100).toFixed(2)}%`,
      ]),
    };

    data.push(paymentsSection);

    // Discounts Section
    const discountsSection = {
      name: "Discounts",
      columns: [
        { name: "Name" },
        { name: "Quantity" },
        { name: "Total" },
        { name: "Items" },
      ],
      data: salesSummaryData.discountSummary.map((item) => [
        item.typeItemName,
        item.quantityTickets,
        `$${item.amountDiscount?.toFixed(2)}`,
        item.quantityTicketItems,
      ]),
    };

    data.push(discountsSection);

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

  const multiplieForPercent = (value) => {
    let recivedValue = value * 100;
    return recivedValue.toFixed(2);
  };
  return (
    <div className="w-[85%] mx-auto">
      {/* <h1 className="text-2xl font-bold text-center mb-6">Sales Summary</h1> */}
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
            toDate={new Date()}
            fromDate={new Date()}
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
            <div className="py-3 ml-1 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7">
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
                "2024-11-11",
                "Charleys Philly Steak - CPSW"
              );
            }}
            includeHelp={true}

            // handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
          />
        </div>
      </header>
      {/* Gross Sales Section */}
      {isLoading && <Loader loading={isLoading} />}
      {Object.keys(salesSummrayData).length > 0 ? (
        <>
          <div className="bg-white shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] rounded-lg mb-6 p-4 mt-[15px]">
            <h2 className="text-lg font-semibold mb-4">
              {groupOrUnitAccessName} - {selectedUnitName}
            </h2>
            <div className="max-h-[500px] overflow-auto tableHOC">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">Gross Sales</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.salesGross
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Net Sales</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.salesNet
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Tax</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.salesTax
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 p-2">Comps</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.comps
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Promotions</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.promo
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Refunds</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.refunds
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 p-2">Voids</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.voids
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">
                      Sales Non Cash
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.salesFood
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Deposits</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.deposits
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">
                      Cash OverShort
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.cashOverShort
                      )}
                    </td>
                  </tr>
                  {/* Add more rows as needed */}
                  <tr>
                    <td className="border border-gray-300 p-2">Order Count</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.transactions
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Covers</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.nrsTotalOpen
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">
                      Order Average
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {salesSummrayData?.viewActivityDaily[0]?.orderAverage}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 p-2">Labor Cost</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {salesSummrayData?.viewActivityDaily[0]?.laborCost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Labor Hours</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {salesSummrayData?.viewActivityDaily[0]?.laborHours}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 p-2">
                      Labor Percent
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {salesSummrayData?.viewActivityDaily[0]?.laborPercent}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">
                      Gift Cards Redeemed
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]?.giftCertificate
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">
                      Gift Card sold
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formattingData(
                        salesSummrayData?.viewActivityDaily[0]
                          ?.giftCertificatesSold
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Sales Section */}
          {Object.keys(salesSummrayData).length > 0 && (
            <div className="bg-white shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] rounded-lg mb-6 p-4 mt-[15px]">
              <h3 className="text-lg font-semibold mb-4">Category Sales</h3>
              <div className="max-h-[500px] overflow-auto tableHOC">
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-200 sticky top-[-1px]">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">
                        Name
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        Qty Items
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        Qty Mode
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        Total
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        Percent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesSummrayData.categorySummary.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">
                          {item.categoryName}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {addDecimals(item.quantityItems)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {addDecimals(item.quantityModifiers)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          ${formattingData(item.salesNet)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {multiplieForPercent(item.percentOfTotal)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-200 sticky bottom-0">
                    <tr>
                      <td className="border border-gray-300 p-2 font-bold text-right">
                        Total
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-bold">
                        {addDecimals(
                          salesSummrayData.categorySummary.reduce(
                            (sum, item) => sum + item.quantityItems,
                            0
                          )
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-bold">
                        {formattingData(
                          salesSummrayData.categorySummary.reduce(
                            (sum, item) => sum + item.quantityModifiers,
                            0
                          )
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-bold">
                        {formattingData(
                          salesSummrayData.categorySummary.reduce(
                            (sum, item) => sum + item.salesNet,
                            0
                          )
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-bold">
                        {/* 100% */}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
          {/* Payments Section */}
          <div className="bg-white shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] rounded-lg p-4 mt-[15px]">
            <h3 className="text-lg font-semibold mb-4">Payments</h3>
            <div className="max-h-[500px] overflow-auto tableHOC">
              <table className="table-auto w-full  border border-gray-300">
                <thead className="">
                  <tr className="bg-gray-200 sticky top-[-1px] m-o">
                    <th className="  text-left ">Name</th>
                    <th className=" p-2 text-right ">Quantity</th>
                    <th className=" p-2 text-right ">Payments</th>
                    <th className=" p-2 text-right ">Tips</th>
                    <th className=" p-2 text-right ">Total</th>
                    <th className=" p-2 text-right ">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {salesSummrayData.paymentsSummary.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        {item.name}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {addDecimals(item.quantity)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {formattingData(item.amount)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {formattingData(item.tip)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {formattingData(item.amount + item.tip)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {addDecimals(item.percentOfTotal * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200 sticky bottom-0">
                  <tr>
                    <td className="border border-gray-300 p-2 font-bold text-right">
                      Total
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {salesSummrayData.paymentsSummary.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {formattingData(
                        salesSummrayData.paymentsSummary.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        )
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {formattingData(
                        salesSummrayData.paymentsSummary.reduce(
                          (sum, item) => sum + item.tip,
                          0
                        )
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {formattingData(
                        salesSummrayData.paymentsSummary.reduce(
                          (sum, item) => sum + item.amount + item.tip,
                          0
                        )
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {/* 100% */}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="bg-white shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] rounded-lg p-4 mt-[15px]">
            <h3 className="text-lg font-semibold mb-4">Discounts</h3>
            <div className="max-h-[500px] overflow-auto tableHOC">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200 sticky top-[-1px]">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">
                      Name
                    </th>
                    <th className="border border-gray-300 p-2 text-right">
                      Quantity
                    </th>
                    <th className="border border-gray-300 p-2 text-right">
                      Total
                    </th>
                    <th className="border border-gray-300 p-2 text-right">
                      Percent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesSummrayData.discountSummary.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        {item.typeItemName}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {item.quantityTickets}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {formattingData(item.amountDiscount)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {addDecimals(item.amountDiscountPercentOfTotal * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200 sticky bottom-0">
                  <tr>
                    <td className="border border-gray-300 p-2 font-bold text-right">
                      Total
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {salesSummrayData.discountSummary.reduce(
                        (sum, item) => sum + item.quantityTickets,
                        0
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {formattingData(
                        salesSummrayData.discountSummary.reduce(
                          (sum, item) => sum + item.amountDiscount,
                          0
                        )
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div>no data </div>
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
