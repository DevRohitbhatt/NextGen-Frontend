import { useEffect, useMemo, useState } from "react";
import { getCall } from "../../apis/network";
import { Steps } from "intro.js-react";
import { useSelector, useDispatch } from "react-redux";
import { setVendorsList } from "../../reducer/slices/globalState";
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
  VendorSelector,
  VendorModal,
  Dropdown,
} from "../../components";
import { createColumnHelper } from "@tanstack/react-table";
import PurchaseAnalysi from "../../assets/introJSSteps/PurchaseAnalysis";
import { useLocation } from "react-router-dom";
import dateFormat from "dateformat";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import { formattingData } from "../../functions/formatingCurrency";

const columnHelper = createColumnHelper();

const PurchaseAnalysis = () => {
  const dispatch = useDispatch();
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    groupOrUnitAccess,
    defaultUnitID,
    groupOrUnitAccessName,
    defaultUnitName,
    vendorsList,
  } = useSelector((state) => state.globalState);
  const [purchasetData, setPurchaseData] = useState([]);

  //loading and error state variables
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Purchase Analysis Report, please try again later."
  );

  const [isTableRendered, setIsTableRendered] = useState(false);
  const [isLocationReportRendered, setIsLocationReportRendered] =
    useState(false);
  const [hasUnitChanged, setHasUnitchanged] = useState(true);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedAlignment, setSelectedAlignment] = useState(null);
  //selected unit state variables
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

  //selected vendor state variables
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [isVendorsLoading, setIsVendorsLoading] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState("All Vendors");
  const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility

  //calendar state variables
  const [selectedFromDate, setSelectedFromDate] = useState();
  const [selectedToDate, setSelectedToDate] = useState();
  const [showDateModal, setShowDateModal] = useState(false);

  const [receivedData, setReceivedData] = useState(null);

  const [selectedGroupBy, setSelectedGroupBy] = useState("None");
  const groupByOptions = [
    { name: "None" },
    { name: "Unit - GLCode" },
    { name: "Unit- Department" },
    { name: "Unit - Inventory Item" },
    { name: "Unit - Vendor Item - Inventory Item" },
    { name: "Unit - Vendor - Invoice" },
    { name: "Vendor - GLCode" },
    { name: "Vendor - Department" },
  ];

  const location = useLocation();

  //IntroJS variables for the help steps
  const [introSteps, setIntroSteps] = useState({
    steps: PurchaseAnalysi(),
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
        size: 200,
        enableHiding: true,
        filterFn: "arrIncludesSome",
      }),
      columnHelper.accessor("date", {
        id: "date",
        header: "Date",
        cell: ({ getValue }) => dateFormat(getValue(), "mm-dd-yyyy"),
        dataType: "date",
        filterFn: "arrIncludesSome",
        size: 100,
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Vendor",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 100,
      }),
      columnHelper.accessor("vendorInvoiceReference", {
        id: "vendorInvoiceReference",
        header: "Invoice Ref #",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 120,
      }),
      columnHelper.accessor("totalAmountIncludingTax", {
        id: "totalAmountIncludingTax",
        header: "Invoice Total",
        cell: ({ getValue }) => (getValue() ? `${getValue().toFixed(2)}` : ""),
        filterFn: "weakEquals",
        dataType: "number",
        size: 120,
      }),
      columnHelper.accessor("companyGLCode", {
        id: "companyGLCode",
        header: "GL Code",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 200,
      }),
      columnHelper.accessor("vendorItemDescription", {
        id: "vendorItemDescription",
        header: "Vendor Item",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 250,
      }),
      columnHelper.accessor("quantity", {
        id: "quantity",
        header: "Item Quantity",
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() ?? 0}</div>
        ),
        dataType: "number",
        filterFn: "weakEquals",
        size: 100,
        footer: ({ table }) => (
          <div className="font-bold text-center">
            {parseInt(
              table
                .getFilteredRowModel()
                .rows.reduce((acc, row) => acc + row.original.quantity, 0)
            )}
          </div>
        ),
      }),
      columnHelper.accessor("price", {
        id: "price",
        header: "Item Price",
        cell: ({ getValue }) =>
          getValue() ? `$${getValue().toFixed(2)}` : "$0.00",
        dataType: "number",
        filterFn: "weakEquals",
        size: 100,
      }),
      columnHelper.accessor("taxAmount", {
        id: "taxAmount",
        header: "Item Tax",
        cell: ({ getValue }) =>
          getValue() ? `$${getValue().toFixed(2)}` : "$0.00",
        dataType: "number",
        filterFn: "weakEquals",
        size: 100,
      }),
      columnHelper.accessor("extPrice", {
        id: "extPrice",
        header: "Item Total",
        cell: ({ getValue }) =>
          getValue() ? `$${getValue().toFixed(2)}` : "$0.00",
        footer: ({ table }) =>{
          let totalAmount = table.getFilteredRowModel().rows.reduce((acc, row) => acc + row.original.extPrice, 0)
          totalAmount = formattingData(totalAmount);
          
           return(
          <div className="font-bold text-start">
            {totalAmount}
          </div>
        )},
        dataType: "number",
        filterFn: "weakEquals",
        size: 100,
      }),
      columnHelper.accessor("department", {
        id: "department",
        header: "Department",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 150,
      }),
      columnHelper.accessor("subdepartment", {
        id: "subdepartment",
        header: "Sub Department",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 150,
      }),
      columnHelper.accessor("inventoryItemDescription", {
        id: "inventoryItemDescription",
        header: "Inventory Item",
        dataType: "string",
        filterFn: "arrIncludesSome",
        size: 300,
      }),
    ],
    []
  );
  const [columns, setColumns] = useState(memoizedColumns);

  useEffect(() => {
    if (groupOrUnitAccess || defaultUnitID) {
      setSelectedUnit(groupOrUnitAccess || defaultUnitID);
    }
    if (groupOrUnitAccessName || defaultUnitName) {
      setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
    }
    if (companyID) {
      setSelectedCompany(companyID);
    }
    if (alignmentID) {
      setSelectedAlignment(alignmentID);
    }
  }, [
    defaultUnitID,
    groupOrUnitAccess,
    defaultUnitName,
    groupOrUnitAccessName,
    companyID,
    alignmentID,
  ]);

  useEffect(() => {
    if (
      selectedCompany &&
      selectedAlignment &&
      (groupOrUnitAccess || selectedUnit)
    ) {
      fetchData(
        selectedCompany,
        selectedAlignment,
        groupOrUnitAccess || selectedUnit
      );
    } else {
      setErrorMessage(
        "An issue occurred while loading the vendors. Please try again later."
      );
    }
  }, [selectedCompany, selectedAlignment, groupOrUnitAccess, selectedUnit]);

  useEffect(() => {
    if (!isLocationReportRendered) {
      const searchParams = new URLSearchParams(window.location.search);
      const countsheetParam = searchParams.get("countsheet");

      if (countsheetParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(countsheetParam));
          setReceivedData(decodedData);
          setSelectedCompany(decodedData.companyId);
          setSelectedAlignment(decodedData.alignmentId);
          setSelectedUnit(decodedData.selectedUnit);
          setSelectedUnitName(decodedData.selectedUnitName);
          setSelectedVendor(decodedData.vendorId);
          setSelectedFromDate(new Date(decodedData.fromDate));
          setSelectedToDate(new Date(decodedData.toDate));
          //put companyId and AlignmentId in redux
          dispatch(setCompanyID(decodedData.companyId));
          dispatch(setAlignmentID(decodedData.alignmentId));
        } catch (error) {
          console.error("Error parsing countsheet data:", error);
        }
      }
    } else if (hasUnitChanged && isLocationReportRendered) {
      handleGroupByChange(selectedGroupBy, true);
      setHasUnitchanged(false);
      setPurchaseData([]);
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (receivedData) {
      fetchPurchaseAnalysisReport("Department");
    }
  }, [receivedData]);

  const getDefaultDates = async () => {
    try {
      const getData = {
        url: "getCurrentPeriodDates",
        urlParams: {
          companyId: selectedCompany,
        },
      };

      const result = await getCall(getData, false);
      if (result?.data?.weekMaxDate) {
        const maxDate = new Date(result?.data?.periodMaxDate);
        const minDate = new Date(result?.data?.periodMinDate);
        setSelectedFromDate(minDate);
        setSelectedToDate(maxDate);
      }
    } catch (error) {
      console.error("Error getting default dates: ", error);
    }
  };

  useEffect(() => {
		// check if window.location.search does not have a from date and to date
		if (!window.location.search.includes("fromDate") && !window.location.search.includes("toDate")) {
      getDefaultDates();
		}
  }, [selectedCompany]);

  const fetchData = async (companyId) => {
    setIsVendorsLoading(true);
    await Promise.all([fetchVendors(companyId)]);
    setIsVendorsLoading(false);
  };

  // This function fetches the vendors.
  const fetchVendors = async (companyID) => {
    try {
      setIsError(false);
      const getData = {
        url: "vendors",
        urlParams: {
          companyId: companyID,
        },
      };

      const result = await getCall(getData);
      dispatch(setVendorsList(result));
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        "There was an issue loading your vendors, please try again later."
      );
      console.error("Error getting vendors: ", error);
    }
  };

  const fetchPurchaseAnalysisReport = async (option) => {
    try {
      setIsLoading(true);
      setIsError(false);
      setIsTableRendered(false);

      const getData = {
        url: "PurchaseAnalysis",
        urlParams: {
          companyID: selectedCompany,
          alignmentID: selectedAlignment,
          memberId: selectedUnit,
          fromDate: dateFormat(selectedFromDate, "yyyy-mm-dd"),
          toDate: dateFormat(selectedToDate, "yyyy-mm-dd"),
          vendorId: selectedVendor,
        },
      };

      const result = await getCall(getData);

      const newData = result.data.map((item) => ({
        ...item,
        unitName: (
          location.state?.unitsAndAreasList || unitsAndAreasList
        )?.units?.find((unit) => unit.unitID === parseInt(item.unitId))
          ?.unitName,
        inventoryItemDescription: `${item.qsrInventoryItemID} - ${item.inventoryItemDescription}`,
      }));

      setPurchaseData(newData);
      setIsLoading(false);
      setIsTableRendered(true);
      if (option && isLocationReportRendered === false) {
        handleGroupByChange(option);
      }
      setIsLocationReportRendered(true);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(
        "There was an issue loading your data, please try again later."
      );
      console.error("Error getting Purchase Analysis Report data: ", error);
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

  const handleVendorSelection = (selectedVendorName, vendorList) => {
    setSelectedVendorName(selectedVendorName);
    setSelectedVendor(vendorList[0].id);
    setVendorShowModal(false);
  };

  const handleGroupByChange = (option, status) => {
    if (option !== "Department") {
      setSelectedGroupBy(option);
    }
    const groupByColumns = {
      None: [],
      Department: ["department", "subdepartment"],
      "Unit - GLCode": ["unitName", "companyGLCode"],
      "Unit- Department": ["unitName", "department", "subdepartment"],
      "Unit - Inventory Item": ["unitName", "inventoryItemDescription"],
      "Unit - Vendor Item - Inventory Item": [
        "unitName",
        "vendorItemDescription",
        "inventoryItemDescription",
      ],
      "Unit - Vendor - Invoice": ["unitName", "name", "vendorInvoiceReference"],
      "Vendor - GLCode": ["name", "companyGLCode"],
      "Vendor - Department": ["name", "department", "subdepartment"],
    };

    const selectedGroupByColumns = groupByColumns[option] || [];

    const newColumns = memoizedColumns.map((column) =>
      selectedGroupByColumns.includes(column.id)
        ? { ...column, groupBy: true, show: false }
        : column
    );

    if (option !== "None") {
      newColumns.unshift(
        columnHelper.display({
          id: "actions",
          cell: ({ row }) => {
            if (!row.getCanExpand()) return null;

            const label =
              row.depth < selectedGroupByColumns.length
                ? `${
                    columns.find(
                      (col) => col.id === selectedGroupByColumns[row.depth]
                    )?.header
                  }: ${row.original[selectedGroupByColumns[row.depth]]}`
                : "";

            return (
              <div
                {...{
                  style: {
                    cursor: "pointer",
                    paddingLeft: `${row.depth * 2}rem`,
                    width: "100%",
                  },
                  className:
                    "flex items-center gap-2 font-bold absolute bg-white inset-0 capitalize",
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
          size: 80,
        })
      );
    }

    setColumns(newColumns);

    if (isTableRendered && !status) {
      fetchPurchaseAnalysisReport();
    }
  };

  // Function to handle the PDF export
  const handlePDFClick = () => {
    const pdfData = {
      title: "Purchase Analysis Report",
      subHeaders: [
        `Unit:${selectedUnitName}  |  Vendor:${selectedVendorName}  |  Date Range:${dateFormat(
          selectedFromDate,
          "mm-dd-yyyy"
        )} to ${dateFormat(selectedToDate, "mm-dd-yyyy")}`,
      ],
      exportType: "pdf",
      pageOrientation: "landscape",
      body: [
        {
          type: "table",
          widths: new Array(columns.length).fill("auto"),
          dataTypes: columns.map((column) => column.dataType),
          data: {
            columnHeaders: columns.map((column) => column.header),
            rows: purchasetData.map((row) =>
              columns.map((column) => ({
                value:
                  column.id === "date"
                    ? dateFormat(row[column.id], "mm/dd/yyyy")
                    : row[column.id],
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

  // Function to handle the Excel export
  const handleExcelClick = () => {
    const data = [
      {
        name: "",
        columns:
          selectedGroupBy === "None"
            ? columns.map((column) => ({
                name: column.header,
                filterButton: true,
              }))
            : columns
                .slice(1)
                .map((column) => ({ name: column.header, filterButton: true })),
        data:
          selectedGroupBy === "None"
            ? purchasetData.map((row) =>
                columns.map((column) =>
                  column.id === "date"
                    ? dateFormat(row[column.id], "mm/dd/yyyy")
                    : row[column.id]
                )
              )
            : purchasetData.map((row) =>
                columns
                  .slice(1)
                  .map((column) =>
                    column.id === "date"
                      ? dateFormat(row[column.id], "mm/dd/yyyy")
                      : row[column.id]
                  )
              ),
      },
    ];

    const filename = `PurchaseAnalysis_${selectedUnitName}_${dateFormat(
      selectedFromDate,
      "mm-dd-yyyy"
    )}_to_${dateFormat(selectedToDate, "mm-dd-yyyy")}`;
    const spreadSheetTitle = "Purchase Analysis";
    const date = `${dateFormat(selectedFromDate, "mm-dd-yyyy")} to ${dateFormat(
      selectedToDate,
      "mm-dd-yyyy"
    )}`;

    exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
  };

  const Table = (
    <TableHOC
      columns={columns}
      data={purchasetData}
      isPaginated={true}
      isFooter={true}
      expandCollapseButtons={selectedGroupBy !== "None" ? true : false}
      enableColumnFilters={true}
      headerPosition="flex-start"
      dataPosition="text-start"
    />
  );

  return (
    <>
      <div className="w-[98%] mx-auto pageContainer">
        <Steps
          enabled={introSteps.stepsEnabled}
          steps={introSteps.steps}
          initialStep={introSteps.initialStep}
          onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
        />
        <h2 className="my-2 text-[18px] leading-tight text-left pageTitle">
          Purchase Analysis
        </h2>
        <header className="optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
          <div className="flex items-center">
            <UnitSelector
              companyID={selectedCompany}
              alignmentID={selectedAlignment}
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
            <VendorSelector
              vendorID={selectedVendor}
              vendorName={isVendorsLoading ? "Loading..." : selectedVendorName}
              setVendorName={setSelectedVendorName}
              onClick={() => setVendorShowModal(true)}
            />
            <div className="min-w-56">
              <Dropdown
                title="Group By"
                selectedOption={selectedGroupBy}
                options={groupByOptions}
                onOptionChange={handleGroupByChange}
              />
            </div>
            <div
              className="run-button"
              onClick={() => fetchPurchaseAnalysisReport()}
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
              includeCSV={false}
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
              (purchasetData.length > 0 ? (
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
            show={showUnitModal}
            includeAreas={true}
            handleClose={() => {
              setShowUnitModal(false);
            }}
            handleUnitSelection={handleUnitSelection}
          />

          <VendorModal
            vendorData={vendorsList}
            vendorID={selectedVendor}
            vendorName={selectedVendorName}
            show={showVendorModal}
            handleClose={() => {
              setVendorShowModal(false);
            }}
            handleVendorSelection={handleVendorSelection}
            isMultiVendor={true}
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
      </div>
    </>
  );
};

export default PurchaseAnalysis;
