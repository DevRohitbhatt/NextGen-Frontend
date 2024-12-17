import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCall } from "../../apis/network";
import { Steps } from "intro.js-react";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import {
  Loader,
  UnitSelector,
  CalendarModal,
  UnitModal,
  ExportOptions,
  DateSelector,
  PdfBuilder,
  ExcelExport as exportToExcel,
  TableHOC,
  Dropdown,
  LineChart,
  Modal,
} from "../../components";
import { createColumnHelper } from "@tanstack/react-table";
import dateFormat from "dateformat";
import salesVsLabor from "../../assets/introJSSteps/salesVsLabor";
import { formattingData } from "../../functions/formatingCurrency";

const columnHelper = createColumnHelper();

const SalesVsLabor = () => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    groupOrUnitAccess,
    defaultUnitID,
    groupOrUnitAccessName,
    defaultUnitName,
  } = useSelector((state) => state.globalState);

  const [salesVsLaborData, setSalesVsLaborData] = useState([]);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);

  //loading and error state variables
  const [isLoading, setIsLoading] = useState(false);
  const [isDateLoading, setIsDateLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Sales Vs Labor Report, please try again later."
  );

  //selected unit state variables
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  //calendar state variables
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);

  const [selectedReportType, setSelectedReportType] = useState("Hourly");
  const reportTypeOptions = [
    { name: "Hourly" },
    { name: "Half Hour" },
    { name: "Qtr Hour" },
  ];
  const [groupBy, setGroupBy] = useState("Date");
  const groupByOptions = [{ name: "Date" }, { name: "Unit" }];

  const [chartData, setChartData] = useState({});

  //IntroJS variables for the help steps
  const [introSteps, setIntroSteps] = useState({
    steps: salesVsLabor(),
    initialStep: 0,
    stepsEnabled: false,
  });

  // columns for tableHOC
  const memoizedColumns = useMemo(
    () => [
      columnHelper.accessor("unitName", {
        id: "unitName",
        header: "Unit",
        dataType: "string",
      }),
      columnHelper.accessor("date", {
        id: "date",
        header: "Date",
        dataType: "string",
      }),
      columnHelper.accessor("time", {
        id: "time",
        header: "Time",
        dataType: "string",
        size: 180,
      }),
      columnHelper.accessor("grossSales", {
        id: "grossSales",
        header: "Gross Sales",
        cell: ({ row }) =>{ 
          let perGrossSales = calculateSum(row, "grossSales");
          perGrossSales = formattingData(parseFloat(perGrossSales))
          return `${perGrossSales}`
        },
        dataType: "number",
        footer: ({ table }) =>{
          let grossSale = calculateFooterSum(table, "grossSales");
          grossSale = formattingData(parseFloat(grossSale))
          return (
          <div className="text-center">
            {grossSale}
          </div>
        )},
        size: 60,
      }),
      columnHelper.accessor("sales", {
        id: "sales",
        header: "Sales",
        cell: ({ row }) =>{
          let cellSales = calculateSum(row, "sales");
          cellSales = formattingData(parseFloat(cellSales))
          return`${cellSales}`},
        dataType: "number",
        footer: ({ table }) =>{ 
          let footerSales = formattingData(parseFloat(calculateFooterSum(table, "sales")))
          return (
          <div className="text-center">
            {footerSales}
          </div>
        )
      },
        size: 60,
      }),
      columnHelper.accessor("variableLaborMinutes", {
        id: "variableLaborMinutes",
        header: "Variable Labor Minutes",
        cell: ({ row }) => calculateSum(row, "variableLaborMinutes"),
        dataType: "number",
        footer: ({ table }) => (
          <div className="text-center">
            {calculateFooterSum(table, "variableLaborMinutes")}
          </div>
        ),
        size: 60,
      }),

      columnHelper.accessor("variableLaborHours", {
        id: "variableLaborHours",
        header: "Variable Labor Hours",
        cell: ({ row }) => {
          let calculatevariableLaborHours = calculateSum(
            row,
            "variableLaborHours"
          );
          return parseFloat(calculatevariableLaborHours).toFixed(2);
        },
        dataType: "number",
        footer: ({ table }) => (
          <div className="text-center">
            {calculateFooterSum(table, "variableLaborHours")}
          </div>
        ),
        size: 60,
      }),
      columnHelper.accessor("variableLaborDollars", {
        id: "variableLaborDollars",
        header: "Variable Labor Dollars",
        cell: ({ row }) => {
          let calculatelaberDollars = calculateSum(row, "variableLaborDollars");
          calculatelaberDollars = formattingData(parseFloat(calculatelaberDollars));
          return `${calculatelaberDollars}`;
        },
        dataType: "number",
        size: 60,
        footer: ({ table }) => (
          <div className="text-center">
            {formattingData(parseFloat(calculateFooterSum(table, "variableLaborDollars")))}
          </div>
        ),
      }),
      columnHelper.accessor("laborPercent", {
        id: "laborPercent",
        header: "Labor Percent",
        cell: ({ row }) => `${calculateLaborPercent(row)}%`,
        dataType: "number",
        footer: ({ table }) => (
          <div className="text-center">{calculateLaborPctFooter(table)}%</div>
        ),
        size: 60,
      }),
    ],
    []
  );
  const [columns, setColumns] = useState(memoizedColumns);

  //Default date get
  const getDefaultDates = async () => {
    try {
      setIsDateLoading(true);
      const getData = {
        url: "getCurrentPeriodDates",
        urlParams: {
          companyId: companyID,
        },
      };

      const result = await getCall(getData, false);
      if (result?.data?.weekMaxDate) {
        const maxDate = new Date(result?.data?.weekMaxDate);
        const minDate = new Date(result?.data?.weekMinDate);
        setSelectedFromDate(minDate);
        setSelectedToDate(maxDate);
      }
    } catch (error) {
    } finally {
      setIsDateLoading(false);
    }
  };

  useEffect(() => {
    getDefaultDates();
  }, []);

  const calculateSum = (row, accessor) => {
    if (row.getCanExpand()) {
      const sum = row.subRows.reduce((acc, subrow) => {
        if (subrow.getCanExpand()) {
          return (
            acc +
            subrow.subRows.reduce(
              (subAcc, subSubrow) =>
                subAcc + parseFloat(subSubrow.original[accessor]),
              0
            )
          );
        } else {
          return acc + parseFloat(subrow.original[accessor]);
        }
      }, 0);
      return accessor === "variableLaborMinutes" ? sum : sum.toFixed(2);
    } else {
      return row.original[accessor];
    }
  };

  const calculateLaborPercent = (row) => {
    if (row.getCanExpand()) {
      const totalLaborDollars = row.subRows.reduce((acc, subrow) => {
        if (subrow.getCanExpand()) {
          return (
            acc +
            subrow.subRows.reduce(
              (subAcc, subSubrow) =>
                subAcc + parseFloat(subSubrow.original["variableLaborDollars"]),
              0
            )
          );
        } else {
          return acc + parseFloat(subrow.original["variableLaborDollars"]);
        }
      }, 0);

      const totalSales = row.subRows.reduce((acc, subrow) => {
        if (subrow.getCanExpand()) {
          return (
            acc +
            subrow.subRows.reduce(
              (subAcc, subSubrow) =>
                subAcc + parseFloat(subSubrow.original["sales"]),
              0
            )
          );
        } else {
          return acc + parseFloat(subrow.original["sales"]);
        }
      }, 0);

      return ((totalLaborDollars / totalSales) * 100).toFixed(2);
    } else {
      return row.original["laborPercent"];
    }
  };

  const calculateLaborPctFooter = (table) => {
    const totalLaborDollars = table
      .getCoreRowModel()
      .rows.reduce((acc, row) => {
        if (row.getCanExpand()) {
          return (
            acc +
            row.subRows.reduce(
              (subAcc, subrow) =>
                subAcc + parseFloat(subrow.original["variableLaborDollars"]),
              0
            )
          );
        } else {
          return acc + parseFloat(row.original["variableLaborDollars"]);
        }
      }, 0);

    const totalSales = table.getCoreRowModel().rows.reduce((acc, row) => {
      if (row.getCanExpand()) {
        return (
          acc +
          row.subRows.reduce(
            (subAcc, subrow) => subAcc + parseFloat(subrow.original["sales"]),
            0
          )
        );
      } else {
        return acc + parseFloat(row.original["sales"]);
      }
    }, 0);

    return ((totalLaborDollars / totalSales) * 100).toFixed(2);
  };

  const calculateFooterSum = (table, accessor) => {
    return table
      .getCoreRowModel()
      .rows.reduce((acc, row) => acc + parseFloat(row.original[accessor]), 0)
      .toFixed(accessor === "variableLaborMinutes" ? 0 : 2);
  };

  useEffect(() => {
    if (groupOrUnitAccess || defaultUnitID) {
      setSelectedUnit(groupOrUnitAccess || defaultUnitID);
    }
    if (groupOrUnitAccessName || defaultUnitName) {
      setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
    }
  }, [
    defaultUnitID,
    groupOrUnitAccess,
    defaultUnitName,
    groupOrUnitAccessName,
  ]);

  const fetchSalesVslaborReport = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const getData = {
        url: "salesVsLabor",
        urlParams: {
          companyId: companyID,
          alignmentId: alignmentID,
          memberId: selectedUnit,
          fromDate: dateFormat(selectedFromDate, "yyyy-mm-dd"),
          toDate: dateFormat(selectedToDate, "yyyy-mm-dd"),
          reportType:
            reportTypeOptions.findIndex(
              (option) => option.name === selectedReportType
            ) + 1,
        },
      };

      const result = await getCall(getData);

      const newData = result.data.map((item) => {
	
        const quarterMinutes = item.quarterHourText || item.quarterHourText == ":00"
          ? parseInt(item.quarterHourText.replace(":", ""), 10)
          : 0;

        const halfMinutes = item.halfHourText
          ? parseInt(item.halfHourText.replace(":", ""), 10)
          : 0;

        const minutes = quarterMinutes || halfMinutes;

        const time = dateFormat(
          new Date(0, 0, 0, item.hour, minutes),
          "h:MM TT"
        );

        return {
          date: dateFormat(new Date(item.date), "mm-dd-yyyy"),
          unitName: item.unitName,
          time: time, // Use the formatted time
          grossSales: item.salesGross.toFixed(2),
          sales: item.sales.toFixed(2),
          variableLaborMinutes: item.variableLaborMinutes,
          variableLaborHours: item.variableLaborMinutes / 60,
          variableLaborDollars: item.variableLabor,
          laborPercent: (item.laborPct * 100).toFixed(2),
        };
      });
      setSalesVsLaborData(newData);
      handleGroupByChange(groupBy);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(
        "There was an issue loading your data, please try again later."
      );
      console.error("Error getting Sales Vs Labor data: ", error);
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setUnitShowModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };

  const handleGroupByChange = (option) => {
    setGroupBy(option);
    const groupByColumns = {
      Date: ["date", "unitName"],
      Unit: ["unitName", "date"],
    };

    const selectedGroupByColumns = groupByColumns[option] || [];
    const newColumns = memoizedColumns.map((column) => ({
      ...column,
      groupBy: selectedGroupByColumns.includes(column.id),
      show: !selectedGroupByColumns.includes(column.id),
    }));

    const orderedColumns = [];
    selectedGroupByColumns.forEach((colId) => {
      const colIndex = newColumns.findIndex((column) => column.id === colId);
      if (colIndex > -1) {
        orderedColumns.push(newColumns[colIndex]);
        newColumns.splice(colIndex, 1);
      }
    });

    // Combine the ordered columns with the remaining columns
    const finalColumns = [...orderedColumns, ...newColumns];

    finalColumns.unshift(
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          if (!row.getCanExpand()) return null;

          const label =
            row.depth < selectedGroupByColumns.length
              ? `${
                  finalColumns.find(
                    (col) => col.id === selectedGroupByColumns[row.depth]
                  )?.header
                }: ${row.original[selectedGroupByColumns[row.depth]]} `
              : "";

          return (
            <div
              {...{
                style: {
                  cursor: "pointer",
                  paddingLeft: `${row.depth * 2}rem`,
                },
                className:
                  "flex items-center absolute top-0 bottom-0 gap-2 font-bold top-0 bottom-0 capitalize",
              }}
            >
              {row.getIsExpanded() ? (
                <CiSquareMinus className="text-[20px]" />
              ) : (
                <CiSquarePlus className="text-[20px]" />
              )}
              {label}
            </div>
          );
        },
        size: 20,
      })
    );

    setColumns(finalColumns);
  };

  const handleChartClick = () => {
    setIsChartLoading(true);
    const uniqueDates = [...new Set(salesVsLaborData.map((item) => item.date))];
    const totalSales = uniqueDates.map((date) => {
      const items = salesVsLaborData.filter((item) => item.date === date);
      return items
        .reduce((acc, item) => acc + parseFloat(item.sales), 0)
        .toFixed(2);
    });
    const totalGrossSales = uniqueDates.map((date) => {
      const items = salesVsLaborData.filter((item) => item.date === date);
      return items
        .reduce((acc, item) => acc + parseFloat(item.grossSales), 0)
        .toFixed(2);
    });
    const totalLaborDollars = uniqueDates.map((date) => {
      const items = salesVsLaborData.filter((item) => item.date === date);
      return items
        .reduce((acc, item) => acc + parseFloat(item.variableLaborDollars), 0)
        .toFixed(2);
    });

    const chartData = {
      series: [
        {
          name: "Sales",
          data: totalSales,
        },
        {
          name: "Gross Sales",
          data: totalGrossSales,
        },
        {
          name: "Labor Dollars",
          data: totalLaborDollars,
        },
      ],
      xAxis: {
        categories: uniqueDates,
        tickPlacement: "between",
      },
      yAxis: {
        categories: Array.from(
          {
            length:
              Math.ceil(
                Math.max(
                  ...totalSales,
                  ...totalGrossSales,
                  ...totalLaborDollars
                ) / 250
              ) + 1,
          },
          (_, i) => 100 + i * 250
        ),
        labels: {
          showAlways: true,
          formatter: function (value) {
            return Math.round(value);
          },
        },
        axisBorder: {
          show: true,
        },
        axisTicks: {
          show: true,
        },
      },
      colors: ["#4F81BD", "#C0504D", "#9BBB59"],
    };

    setChartData(chartData);
    setIsChartLoading(false);
    setIsChartModalOpen(!isChartModalOpen);
  };

  // Function to handle the PDF export
  const handlePDFClick = () => {
    const pdfData = {
      title: "Sales Vs Labor Report",
      subHeaders: [
        `Unit:${selectedUnitName} | Date Range:${dateFormat(
          selectedFromDate,
          "mm-dd-yyyy"
        )} to ${dateFormat(selectedToDate, "mm-dd-yyyy")}`,
      ],
      exportType: "pdf",
      pageOrientation: "landscape",
      body: [
        {
          type: "table",
          widths: new Array(columns.slice(1).length).fill("auto"),
          dataTypes: columns.slice(1).map((column) => column.dataType),
          data: {
            columnHeaders: columns.slice(1).map((column) => column.header),
            rows: salesVsLaborData.map((row) =>
              columns.slice(1).map((column) => ({
                value: row[column.id],
                cellType: column.dataType,
                columnName: column.header,
              }))
            ),
          },
        },
      ],
    };

    PdfBuilder(pdfData);
  };

  // Function to handle the CSV export
  const handleCSVClick = () => {
    const csvHeaders = columns.slice(1).map((column) => column.header);
    const csvData = salesVsLaborData.map((row) =>
      columns
        .slice(1)
        .map((column) => `"${row[column.id]}"`)
        .join(",")
    );
    const csvString = [csvHeaders.join(","), ...csvData].join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", "salesVsLabor.csv");
    tempLink.click();
  };

  // Function to handle the Excel export
  const handleExcelClick = () => {
    const data = [
      {
        name: "",
        columns: columns
          .slice(1)
          .map((column) => ({ name: column.header, filterButton: true })),
        data: salesVsLaborData.map((row) =>
          columns.slice(1).map((column) => row[column.id])
        ),
      },
    ];

    const filename = `salesVsLabor_${selectedUnitName}_${dateFormat(
      selectedFromDate,
      "mm-dd-yyyy"
    )}_to_${dateFormat(selectedToDate, "mm-dd-yyyy")}`;
    const spreadSheetTitle = "Sales Vs Labor Report";
    const date = `${dateFormat(selectedFromDate, "mm-dd-yyyy")} to ${dateFormat(
      selectedToDate,
      "mm-dd-yyyy"
    )}`;

    exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
  };

  const detailOnTop = (
    <button
      className="flex items-center gap-2 px-4 py-3 border-solid  focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-base font-medium text-[var(--tw-primary)] ml-2"
      onClick={handleChartClick}
    >
      Chart This Data
    </button>
  );

  const Table = (
    <TableHOC
      columns={columns}
      data={salesVsLaborData}
      isFooter={true}
      expandCollapseButtons={true}
      detailOnTop={detailOnTop}
    />
  );

  return (
    <>
      <div className="w-[98%] mx-auto">
        <Steps
          enabled={introSteps.stepsEnabled}
          steps={introSteps.steps}
          initialStep={introSteps.initialStep}
          onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
        />
        <h2 className="my-4 text-[20px] leading-tight text-left pageTitle">
          Sales Vs Labor
        </h2>
        <header className="optionsBar flex justify-between items-center mb-0 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
          <div className="flex items-center">
            <UnitSelector
              companyId={companyID}
              alignmentId={alignmentID}
              memberID={selectedUnit}
              memberName={selectedUnitName}
              includeAreas={true}
              setMemberName={setSelectedUnitName}
              onClick={() => setUnitShowModal(true)}
            />
            <DateSelector
              toDate={selectedToDate}
              fromDate={selectedFromDate}
              isDateRange={true}
              onClick={() => setShowDateModal(true)}
              extraClass={"w-[219px]"}
            />
            <div className="w-36 reportType-selector">
              <Dropdown
                title="Report"
                options={reportTypeOptions}
                selectedOption={selectedReportType}
                onOptionChange={(option) => setSelectedReportType(option)}
              />
            </div>
            <div className="w-32 ml-2 group-by">
              <Dropdown
                title="Group By"
                options={groupByOptions}
                selectedOption={groupBy}
                onOptionChange={(option) => setGroupBy(option)}
              />
            </div>
            <div className="run-button" onClick={fetchSalesVslaborReport}>
              <div className="py-3 ml-3 text-[16px] font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7">
                Run
              </div>
            </div>
          </div>
          <div>
            <ExportOptions
              includePDF={true}
              handlePDFClick={handlePDFClick}
              includeCSV={true}
              handleCSVClick={handleCSVClick}
              includeExcel={true}
              handleExcelClick={handleExcelClick}
              includeHelp={true}
              handleHelpClick={() =>
                setIntroSteps({ ...introSteps, stepsEnabled: true })
              }
            />
          </div>
        </header>

        {/* Display the table if there is no error and the data is not loading */}

        {isError ? (
          <div>{errorMessage}</div>
        ) : (
          <div className="relative w-full min-h-56">
            <Loader loading={isLoading} />
            {!isLoading &&
              (salesVsLaborData.length > 0 ? (
                <div className="paged-table">{Table}</div>
              ) : !selectedUnit ? (
                <div className="mt-10 text-xl font-medium text-center">
                  No Unit Selected
                </div>
              ) : (
                <div className="mt-10 text-xl font-medium text-center">
                  No data available
                </div>
              ))}
          </div>
        )}

        <div>
          <UnitModal
            unitData={unitsAndAreasList}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            show={showModal}
            includeAreas={true}
            handleClose={() => {
              setUnitShowModal(false);
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
          <Modal
            isOpen={isChartModalOpen}
            onClose={() => setIsChartModalOpen(!isChartModalOpen)}
            title="Sales Vs Labor Chart"
          >
            <div className="w-[60rem] p-4">
              {isChartLoading ? (
                <Loader loading={isChartLoading} />
              ) : (
                <LineChart chartData={chartData} />
              )}
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default SalesVsLabor;
