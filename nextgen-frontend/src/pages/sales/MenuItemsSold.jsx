import { useEffect, useMemo, useState } from "react";
import { getCall } from "../../apis/network";
import { Steps } from "intro.js-react";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import {
  UnitSelector,
  CalendarModal,
  UnitModal,
  ExportOptions,
  DateSelector,
  PdfBuilder,
  ExcelExport as exportToExcel,
  TableHOC2,
  Dropdown,
} from "../../components";
import { createColumnHelper } from "@tanstack/react-table";
import actualFoodCosts from "../../assets/introJSSteps/actualFoodCosts";

const columnHelper = createColumnHelper();

const MenuItemsSold = () => {
  const [companyId, setCompanyId] = useState();
  const [alignmentId, setAlignmentId] = useState();
  const [memberId, setMemberId] = useState();
  const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
  const [menuItemSoldData, setMenuItemSoldData] = useState([]);
  const [isTableRendered, setIsTableRendered] = useState(true);

  //loading and error state variables
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Menu Items Sold, please try again later."
  );

  //selected unit state variables
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setselectedUnitName] = useState("No Unit Selected");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  //calendar state variables
  const [selectedFromDate, setSelectedFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  );
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);

  //dropdown variables
  const [viewWeek, setViewWeek] = useState("All");
  const [viewWeekValue, setViewWeekValue] = useState(0);
  const [view, setView] = useState("summary"); // Default to "summary"
  const [viewValue, setViewValue] = useState(0);
  const [salesType, setSalesType] = useState("SalesNet"); // Default to "Net"

  //IntroJS variables for the help steps
  const [introSteps, setIntroSteps] = useState({
    steps: actualFoodCosts(),
    initialStep: 0,
    stepsEnabled: false,
  });

  // set dropdown iteams
  const dropdownOptions = [
    { name: "All" },
    { name: "Sunday" },
    { name: "Monday" },
    { name: "Tuesday" },
    { name: "Wednesday" },
    { name: "Thursday" },
    { name: "Friday" },
    { name: "Saturday" },
  ];

  // Create a mapping object for day names to values
  const dayValueMap = {
    All: 0,
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
  };

  const viewValueMap = {
    summary: 0,
    byUnit: 1,
    topSellers: 2,
  };

  const handleViewWeekChange = (option) => {
    setViewWeek(option);
    const value = dayValueMap[option] || 0; // Default to 0 if option is not found
    setViewWeekValue(value);
  };

  const handleViewChange = (option) => {
    setView(option);
    const value = viewValueMap[option] || 0; // Default to 0 if option is not found
    setViewValue(value);
  };

  const handleSalesChange = (option) => {
    setSalesType(option);
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "actions",
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <div
              {...{
                style: {
                  cursor: "pointer",
                  paddingLeft: `${row.depth * 2}rem`,
                },
                className: "inline-block",
              }}
            >
              {row.getIsExpanded() ? (
                <CiSquareMinus className="text-[20px]" />
              ) : (
                <CiSquarePlus className="text-[20px]" />
              )}
            </div>
          ) : null,
        size: "80",
      }),
      columnHelper.accessor("description", {
        id: "Item",
        header: "Item",
        dataType: "string",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("unitName", {
        id: "Unit",
        header: "Unit",
        dataType: "string",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("quant", {
        id: "Quantity",
        header: "Quantity",
        dataType: "number",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("discPrice", {
        id: "Amount",
        header: "Amount",
        dataType: "number",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("itemSoldPct", {
        id: "ItemSold",
        header: "Item Sold%",
        dataType: "number",
        cell: (info) => {
          const value = info.getValue();
          return value != null ? `${parseFloat(value).toFixed(2)}%` : "";
        },
      }),
      columnHelper.accessor("quantity_Avg", {
        id: "AvgItemQunt",
        header: "Avg Item Quantity",
        dataType: "number",
        cell: (info) => info.getValue() || "",
      }),
    ],
    []
  );

  useEffect(() => {
    // Fetch initial data
    if (!selectedUnit) {
      let parameters = decodeURIComponent(
        window.location.search.replace("?data=", "")
      );
      if (parameters) {
        parameters = JSON.parse(parameters);
        setCompanyId(parameters.CompanyId);
        setAlignmentId(parameters.AlignmentId);
        localStorage.setItem("companyId", parameters.CompanyId);
        localStorage.setItem("alignmentId", parameters.AlignmentId);
        fetchData(parameters.CompanyID, parameters.AlignmentId);
      } else if (localStorage.getItem("groupOrUnitAccess")) {
        setCompanyId(parseInt(localStorage.getItem("companyId")));
        setAlignmentId(parseInt(localStorage.getItem("alignmentId")));
        fetchData(
          localStorage.getItem("companyId"),
          localStorage.getItem("alignmentId")
        );
      } else {
        setCompanyId(1021);
        setAlignmentId(1110);
        setMemberId(51);
        setSelectedUnit(0);
        fetchData(1021, 1110, 5199);
      }
    } else {
      setErrorMessage(
        "There was an issue loading your orders, please try again later."
      );
    }
  }, []);

  const fetchData = async (companyId, alignmentId, selectedUnit) => {
    setIsLoading(true);
    await Promise.all([fetchUnits(companyId, alignmentId, selectedUnit)]);
    setIsLoading(false);
  };

  // Fetching Units and Areas
  const fetchUnits = async (companyId, alignmentId, memberId) => {
    try {
      setIsLoading(true);
      setIsError(false);
      const getData = {
        url: "unitsAndArea",
        urlParams: {
          companyId: companyId,
          alignmentId: alignmentId,
          memberId: memberId,
        },
      };

      const result = await getCall(getData);
      setUnitsAndAreasList(result.data);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(
        "There was an issue loading your units, please try again later."
      );
      console.error("Error getting units: ", error);
    }
  };

  const handleRun = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setIsTableRendered(false);

      // Define the URL mapping based on viewValue
      const urlMapping = {
        0: "MenuItemSoldSummaryReport",
        1: "MenuItemSoldUnitReport",
        2: "MenuItemSoldSellersReport",
      };

      // Get the URL based on viewValue
      const url = urlMapping[viewValue] || "MenuItemSoldSummaryReport"; // Default URL if viewValue is not found
      const getData = {
        url: url,
        urlParams: {
          companyId: companyId,
          alignmentId: alignmentId,
          memberId: selectedUnit,
          fromDate: selectedFromDate.toLocaleDateString("en-CA"),
          toDate: selectedToDate.toLocaleDateString("en-CA"),
          groupingId: viewValue,
          DOW: viewWeekValue,
          columnName: salesType,
        },
      };

      const result = await getCall(getData);

      // Declare newData variable
      let newData;

      // Conditional mapping based on salesType
      if (salesType !== "2") {
        newData = result.data.map((category) => ({
          category: category.category,
          total: category.total,
          subRows: category.menuItemSoldTotalsModels.map((item) => ({
            unitName: item.unitName,
            grouping1: item.grouping1,
            itemId: item.itemId,
            description: item.description,
            quant: item.quant,
            discPrice: item.discPrice,
            quantity_Avg: item.quantity_Avg,
            discPrice_Avg: item.discPrice_Avg,
            itemSoldPct: item.itemSoldPct,
          })),
        }));
      } else {
        // Direct binding without additional mapping
        newData = result.data.map((category) => ({
          category: category.category,
          total: category.total,
          menuItemSoldTotalsModels: category.menuItemSoldTotalsModels,
        }));
      }

      setMenuItemSoldData(newData);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(
        "There was an issue loading your data, please try again later."
      );
      console.error("Error getting Menu Item Sold Report data: ", error);
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setselectedUnitName(unitName);
    setSelectedUnit(unitID);
    setUnitShowModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };
  // Function to handle the PDF export
  const handlePDFClick = () => {
    if (!columns || columns.length === 0) {
      console.error("Columns are not defined or empty");
      return;
    }

    if (!menuItemSoldData || menuItemSoldData.length === 0) {
      console.error("Voids report data is not defined or empty");
      return;
    }

    const pdfData = {
      title: "Menu Items Sold",
      subHeaders: [
        `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
      ],
      exportType: "pdf",
      pageOrientation: "landscape",
      body: buildPDFBody(),
    };

    PdfBuilder(pdfData);
  };

  const buildPDFBody = () => {
    // Map through each row of menuItemSoldData
    const body = menuItemSoldData.map((row) => {
      return {
        type: "table",
        title: row.unitName, // Set the department as the title
        widths: [
          "auto", // Unit name
          "auto", // Grouping (category)
          "auto", // Item ID
          "auto", // Item description
          "auto", // Quantity sold
          "auto", // Discounted price
          "auto", // Average quantity sold
          "auto", // Average discounted price
          "auto", // Percentage of items sold
        ],
        dataTypes: [
          "string", // Unit name
          "string", // Grouping (category)
          "string", // Item ID
          "string", // Item description
          "number", // Quantity sold
          "number", // Discounted price
          "number", // Average quantity sold
          "number", // Average discounted price
          "number", // Percentage of items sold
        ],
        data: formatPDFData(row.subRows), // Use a formatter for the subRows data
      };
    });

    return body; // Return the constructed body for PDF
  };

  const formatPDFData = (data) => {
    return {
      columnHeaders: [
        "Unit Name",
        "Grouping",
        "Item ID",
        "Description",
        "Quantity Sold",
        "Discounted Price",
        "Average Quantity Sold",
        "Average Discounted Price",
        "Percentage of Items Sold",
      ],
      rows: data.flatMap((row) =>
        row.menuItemSoldTotalsModels.map((item) => [
          {
            value: item.unitName || "N/A", // Use "N/A" if unitName is null
            cellType: "string",
            columnName: "Unit Name",
          },
          {
            value: item.grouping1,
            cellType: "string",
            columnName: "Grouping",
          },
          {
            value: item.itemId,
            cellType: "string",
            columnName: "Item ID",
          },
          {
            value: item.description,
            cellType: "string",
            columnName: "Description",
          },
          {
            value: item.quant,
            cellType: "number",
            columnName: "Quantity Sold",
          },
          {
            value: item.discPrice,
            cellType: "number",
            columnName: "Discounted Price",
          },
          {
            value: item.quantity_Avg,
            cellType: "number",
            columnName: "Average Quantity Sold",
          },
          {
            value: item.discPrice_Avg,
            cellType: "number",
            columnName: "Average Discounted Price",
          },
          {
            value: Number(item.itemSoldPct).toFixed(2),
            cellType: "number",
            columnName: "Percentage of Items Sold",
          },
        ])
      ),
    };
  };

  // Function to handle the Excel export
  const handleExcelClick = () => {
       // Define the data structure for the Excel export
    const data = [
      {
        name: "Menu Items Sold",
        columns: [
          { name: "Unit Name", filter: "text" },
          { name: "Grouping", filter: "text" },
          { name: "Item ID", filter: "text" },
          { name: "Description", filter: "text" },
          { name: "Quantity Sold", filter: "text" },
          { name: "Discounted Price", filter: "text" },
          { name: "Average Quantity Sold", filter: "text" },
          { name: "Average Discounted Price", filter: "text" },
          { name: "Percentage of Items Sold", filter: "text" },
        ],
        data: menuItemSoldData.flatMap((category) =>
          category.menuItemSoldTotalsModels.map((item) => ({
            "Unit Name": item.unitName || "N/A", // Use "N/A" if unitName is null
            Grouping: item.grouping1,
            "Item ID": item.itemId,
            Description: item.description,
            "Quantity Sold": item.quant,
            "Discounted Price": item.discPrice,
            "Average Quantity Sold": item.quantity_Avg,
            "Average Discounted Price": item.discPrice_Avg,
            "Percentage of Items Sold": Number(item.itemSoldPct).toFixed(2),
          }))
        ),
      },
    ];

    const filename = "MenuItemSold";
    const spreadSheetTitle = "Menu Item Sold Report";
    const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

    exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
  };

  const Table = (
    <TableHOC2
      columns={columns}
      data={menuItemSoldData}
      view={viewWeek}
      isTableRendered={isTableRendered}
      setIsTableRendered={setIsTableRendered}
      expandCollapseButtons={true}
    />
  );

  return (
    <div className="w-[85%] mx-auto">
      <Steps
        enabled={introSteps.stepsEnabled}
        steps={introSteps.steps}
        initialStep={introSteps.initialStep}
        onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
      />
      <h2 className="mt-4 mb-10 text-3xl font-semibold capitalize">
        Menu Items Sold
      </h2>
      <header className="space-y-3 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3">
            <UnitSelector
              companyId={companyId}
              alignmentId={alignmentId}
              memberId={selectedUnit}
              memberName={selectedUnitName}
              includeAreas={true}
              setMemberName={setselectedUnitName}
              onClick={() => setUnitShowModal(true)}
            />
            <DateSelector
              toDate={selectedToDate}
              fromDate={selectedFromDate}
              isDateRange={true}
              onClick={() => setShowDateModal(true)}
            />
            <div className="w-36">
              <Dropdown
                title="Day of the week"
                options={dropdownOptions}
                selectedOption={viewWeek}
                onOptionChange={handleViewWeekChange}
              />
            </div>
            <div className="run-button" onClick={handleRun}>
              <div className="py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7">
                Run
              </div>
            </div>
          </div>

          <div>
            <ExportOptions
              includePDF={true}
              handlePDFClick={handlePDFClick}
              includeCSV={true}
              includeExcel={true}
              handleExcelClick={handleExcelClick}
              includeHelp={true}
              handleHelpClick={() =>
                setIntroSteps({ ...introSteps, stepsEnabled: true })
              }
            />
          </div>
        </div>
        <div className="flex">
          <div>
            <label className="block ml-2 mb-1 mt-[-12px] text-lg font-semibold">
              View
            </label>
            <div className="p-3 border-2 border-gray-300 rounded-[1.5rem] checkbox-group hover:border-primary">
              <div className="flex flex-row space-x-6">
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="summary"
                    name="reportType"
                    value="summary"
                    checked={view === "summary"}
                    onChange={() => handleViewChange("summary")}
                    className="cursor-pointer checkbox-radio"
                  />
                  <label htmlFor="summary" className="ml-2">
                    Summary
                  </label>
                </div>
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="byUnit"
                    name="reportType"
                    value="byUnit"
                    checked={view === "byUnit"}
                    onChange={() => handleViewChange("byUnit")}
                    className="cursor-pointer checkbox-radio"
                  />
                  <label htmlFor="byUnit" className="ml-2">
                    By Unit
                  </label>
                </div>
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="topSellers"
                    name="reportType"
                    value="topSellers"
                    checked={view === "topSellers"}
                    onChange={() => handleViewChange("topSellers")}
                    className="checkbox-radio"
                  />
                  <label htmlFor="topSellers" className="ml-2">
                    Top Sellers
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="pl-2">
            <label className="block ml-2 mb-1 mt-[-12px] text-lg font-semibold">
              Sales
            </label>
            <div className="p-3 border-2 border-gray-300 rounded-[1.5rem] checkbox-group hover:border-primary">
              <div className="flex flex-row space-x-6">
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="Net"
                    name="salesType"
                    value="Net"
                    checked={salesType === "SalesNet"}
                    onChange={() => handleSalesChange("SalesNet")}
                    className="cursor-pointer checkbox-radio"
                  />
                  <label htmlFor="Net" className="ml-2">
                    Net
                  </label>
                </div>
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="Gross"
                    name="salesType"
                    value="Gross"
                    checked={salesType === "SalesGross"}
                    onChange={() => handleSalesChange("SalesGross")}
                    className="cursor-pointer checkbox-radio"
                  />
                  <label htmlFor="Gross" className="ml-2">
                    Gross
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>{errorMessage}</div>
      ) : (
        <>
          {menuItemSoldData.length > 0 && (
            <div className="paged-table">{Table}</div>
          )}
        </>
      )}{" "}
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
      </div>
    </div>
  );
};

export default MenuItemsSold;
