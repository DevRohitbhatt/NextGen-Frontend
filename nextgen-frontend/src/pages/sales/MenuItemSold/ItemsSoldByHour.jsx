import { useEffect, useMemo, useState } from "react";
import { getCall } from "../../../apis/network";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import {
  UnitSelector,
  CalendarModal,
  UnitModal,
  ExportOptions,
  DateSelector,
  PdfBuilder,
  ExcelExport as exportToExcel,
  TableHOC,
  Menu,
  Inventory,
  Loader,
  SelectionModal,
} from "../../../components";
import dateFormat from "dateformat";
import { createColumnHelper } from "@tanstack/react-table";
import itemSoldByHour from "../../../assets/introJSSteps/menuItemSold/itemSoldByHour";

const columnHelper = createColumnHelper();

const ItemsSoldByHour = () => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    groupOrUnitAccess,
    defaultUnitID,
    groupOrUnitAccessName,
    defaultUnitName,
  } = useSelector((state) => state.globalState);
  const [menuItemSoldData, setMenuItemSoldData] = useState([]);
  const [isTableRendered, setIsTableRendered] = useState(true);

  //Menu Items
  const [menuItemList, setMenuItemList] = useState([]);

  //Inventory Items
  const [inventoryItemList, setInventoryItemList] = useState([]);

  //loading and error state variables
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Menu Items Sold, please try again later."
  );

  //selected unit state variables
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showModal, setUnitShowModal] = useState(false);

  //selected menu items
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [selectedMenuName, setselectedMenuName] = useState("No Menu Selected");
  const [showMenuModal, setShowMenuModal] = useState(false);

  //selected Inventory items
  const [selectedInventory, setSelectedInventory] = useState(0);
  const [selectedInventoryName, setselectedInventoryName] = useState(
    "No Inventory Selected"
  );
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  //calendar state variables
  const [selectedFromDate, setSelectedFromDate] = useState();
  const [selectedToDate, setSelectedToDate] = useState();
  const [showDateModal, setShowDateModal] = useState(false);

  const [salesType, setSalesType] = useState("SalesNet");
  const [item, setItem] = useState("Menu");
  const [itemValue, setItemValue] = useState(0);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isGroupByUnitChecked, setIsGroupByUnitChecked] = useState(false);
  const [inventoryFirstRender, setInventoryFirstRender] = useState(false);

  const inventoryHeaders = [
    { label: "Qsr Inventory Item ID", key: "inventoryItemID" },
    { label: "Description", key: "description" },
  ];

  const menuHeaders = [
    { label: "Item ID", key: "itemID" },
    { label: "Description", key: "description" },
    { label: "Full Description", key: "fullDescription" },
    { label: "Price", key: "price" },
  ];

  //IntroJS variables for the help steps
  const [introSteps, setIntroSteps] = useState({
    steps: itemSoldByHour(),
    initialStep: 0,
    stepsEnabled: false,
  });

  const viewValueMap = {
    menu: 0,
    inventory: 1,
  };

  //Default date get
  const getDefaultDates = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDefaultDates();
  }, []);

  const handleItemChange = (option) => {
    setItem(option);
    setMenuItemSoldData([]);
    if (option === "Inventory") {
      setInventoryFirstRender(false);
    }
    const value = viewValueMap[option.toLowerCase()] || 0;
    setItemValue(value);
  };

  const handleSalesChange = (option) => {
    setSalesType(option);
    setMenuItemSoldData([]);
  };

  const generatedColumns = useMemo(
    () => [
      columnHelper.accessor("unit", {
        id: "unit",
        header: "Unit",
        dataType: "number",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("hour", {
        id: "hour",
        header: "Hour",
        dataType: "string",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("menuItem", {
        id: "menuItem",
        header: "Menu Item",
        dataType: "string",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("sold", {
        id: "sold",
        header: "# Sold",
        dataType: "string",
        cell: (info) => info.getValue() || "",
      }),
      columnHelper.accessor("discPrice", {
        id: "discPrice",
        header: "Item Sales",
        dataType: "string",
        cell: ({ row, getValue }) =>
          row.getCanExpand()
            ? ""
            : `$${
                getValue() !== null && getValue() !== undefined
                  ? getValue().toFixed(2)
                  : "0.00"
              }`,
      }),
      ...(itemValue === 1
        ? [
            columnHelper.accessor("caseUnitName", {
              id: "caseUnitName",
              header: "Case Unit Name",
              dataType: "string",
              cell: (info) => info.getValue() || "",
            }),
            columnHelper.accessor("usageCases", {
              id: "usageCases",
              header: "Usage Cases",
              dataType: "string",
              cell: (info) => `${info.getValue()}%` || "",
            }),
            columnHelper.accessor("countDisplayUnitName", {
              id: "countDisplayUnitName",
              header: "Count Name",
              dataType: "string",
              cell: (info) => info.getValue() || "",
            }),
            columnHelper.accessor("usageCountDisplayUnits", {
              id: "usageCountDisplayUnits",
              header: "Usage Count",
              dataType: "string",
              cell: (info) => `${info.getValue()}%` || "",
            }),
          ]
        : []),
    ],
    [itemValue]
  );

  const [columns, setColumns] = useState(generatedColumns);

  useEffect(() => {
    setColumns(generatedColumns);
  }, [generatedColumns]);

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

  useEffect(() => {
    if (companyID && alignmentID && (groupOrUnitAccess || selectedUnit)) {
      fetchData(companyID);
    } else {
      setErrorMessage(
        "An issue occurred while loading the Menu List or Inventory List. Please try again later."
      );
    }
  }, [companyID, alignmentID, groupOrUnitAccess, selectedUnit]);

  const fetchData = async (companyId) => {
    setIsItemsLoading(true);
    await Promise.all([fetchMenu(companyId), fetchInventory(companyId)]);
    setIsItemsLoading(false);
  };

  const fetchMenu = async (companyId) => {
    try {
      setIsError(false);
      const getData = {
        url: "MenuItemsByCompanyID",
        urlParams: {
          companyId: companyId,
        },
      };

      const result = await getCall(getData);

      setMenuItemList(result.data);
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        "There was an issue loading your menu, please try again later."
      );
      console.error("Error getting menus: ", error);
    }
  };

  const fetchInventory = async (companyId) => {
    try {
      setIsError(false);
      const getData = {
        url: "InventoryByCompanyID",
        urlParams: {
          companyId: companyId,
        },
      };

      const result = await getCall(getData);

      setInventoryItemList(result.data);
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        "There was an issue loading your inventory, please try again later."
      );
      console.error("Error getting inventory: ", error);
    }
  };

  const fetchSoldByHourData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setIsTableRendered(false);
      if (
        (itemValue === 0 && (!selectedMenu || selectedMenu <= 0)) ||
        (itemValue === 1 && (!selectedInventory || selectedInventory <= 0))
      ) {
        setIsLoading(false);
        setIsError(true);
        setErrorMessage(
          "Please select according to the Item Type you have chosen !"
        );
        return false;
      }
      const getData = {
        url: "MenuItemSoldHourData",
        urlParams: {
          companyId: companyID,
          alignmentId: alignmentID,
          memberId: selectedUnit,
          fromDate: dateFormat(selectedFromDate, "yyyy-mm-dd"),
          toDate: dateFormat(selectedToDate, "yyyy-mm-dd"),
          menuItemIds: itemValue === 0 ? selectedMenu : 0,
          inventoryItemIds: itemValue === 1 ? selectedInventory : 0,
          itemType: itemValue,
        },
      };

      const result = await getCall(getData);

      const newData = result.data.menuItemSoldEmployeeModels.map((item) => ({
        unit: item.name,
        total:
          salesType === "SalesNet"
            ? result.data.salesTotal
            : result.data.grossTotal,
        hour: item.hour,
        menuItem: item.description,
        sold: item.quant,
        discPrice: item?.discPrice,
        caseUnitName: item.caseUnitName,
        usageCases: (item.usageCases * 100).toFixed(2),
        countDisplayUnitName: item.countDisplayUnitName,
        usageCountDisplayUnits: (
          Number(item.usageCountDisplayUnits) * 100
        ).toFixed(2),
      }));

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
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setUnitShowModal(false);
  };

  //Menu item
  const handleMenuSelection = (MenuID, item) => {
    setSelectedMenu(MenuID);
    setselectedMenuName(item.description);
    setShowMenuModal(false);
  };

  //Inventory item
  const handleInventorySelection = (itemID, item) => {
    setSelectedInventory(itemID);
    setselectedInventoryName(item.description);
    setShowInventoryModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };

  const handleGroupChange = (e) => {
    const isChecked = e.target.checked;
    setIsGroupByUnitChecked(isChecked);

    const option = isChecked ? "Unit" : "None";

    const groupByColumns = {
      None: [],
      Unit: ["unit"],
    };

    const selectedGroupByColumns = groupByColumns[option] || [];

    const newColumns = generatedColumns.map((column) =>
      selectedGroupByColumns.includes(column.id)
        ? { ...column, groupBy: true, show: false }
        : column
    );

    const calculateTotalCost = (rows, item) =>
      rows.reduce(
        (acc, subRow) => acc + parseFloat(subRow.original[item] || 0),
        0
      );

    const calculateNestedTotalCost = (rows, item) =>
      rows.reduce(
        (acc, subRow) => acc + calculateTotalCost(subRow.subRows, item),
        0
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
                  }: ${
                    row.original[selectedGroupByColumns[row.depth]]
                  } (Total Quantity: ${
                    selectedGroupByColumns.length === 1
                      ? calculateTotalCost(row.subRows, "sold")
                      : row.depth === 0
                      ? calculateNestedTotalCost(row.subRows, "sold")
                      : calculateTotalCost(row.subRows, "sold")
                  } Total Amount: $${
                    selectedGroupByColumns.length === 1
                      ? calculateTotalCost(row.subRows, "discPrice").toFixed(2)
                      : row.depth === 0
                      ? calculateNestedTotalCost(
                          row.subRows,
                          "discPrice"
                        ).toFixed(2)
                      : calculateTotalCost(row.subRows, "discPrice").toFixed(2)
                  }) `
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
          size: 20,
        })
      );
      setColumns((prev) => [...newColumns]);
    } else {
      setColumns(generatedColumns);
    }

    if (isTableRendered) {
      fetchSoldByHourData();
    }
  };

  const handlePDFClick = () => {
    if (!columns || columns.length === 0) {
      console.error("Columns are not defined or empty");
      return;
    }

    if (!menuItemSoldData || menuItemSoldData.length === 0) {
      console.error("Menu Items Sold report data is not defined or empty");
      return;
    }

    const pdfData = {
      title: "Menu Items Sold",
      subHeaders: [
        `${dateFormat(selectedFromDate, "mm-dd-yyyy")} to ${dateFormat(
          selectedToDate,
          "mm-dd-yyyy"
        )} | ${selectedUnitName} | ${item} Items: ${selectedMenuName} | ${
          salesType === "SalesNet" ? "Net Sales:" : "Gross Sales:"
        } $${menuItemSoldData[0]?.total?.toFixed(2)}`,
      ],
      exportType: "pdf",
      pageOrientation: "landscape",
      body: buildPDFBody(),
    };

    console.log("PDF Data: ", pdfData);

    PdfBuilder(pdfData);
  };

  const buildPDFBody = () => {
    const body = [
      {
        type: "table",
        title: `Items Sold By Hour | ${item}`,
        widths: [
          "auto",
          "auto",
          "auto",
          "auto",
          "auto",
          ...(itemValue === 1 ? ["auto", "auto", "auto", "auto"] : []),
        ],
        dataTypes: [
          "string",
          "string",
          "string",
          "number",
          "number",
          ...(itemValue === 1 ? ["string", "number", "string", "number"] : []),
        ],
        data: isGroupByUnitChecked
          ? {
              columnHeaders: columns.slice(1).map((column) => column.header),
              rows: menuItemSoldData.map((row) =>
                columns.slice(1).map((column) => ({
                  value: row[column.id] || "0 ",
                  cellType: column.dataType,
                  columnName: column.header,
                }))
              ),
            }
          : {
              columnHeaders: columns.map((column) => column.header),
              rows: menuItemSoldData.map((row) =>
                columns.map((column) => ({
                  value: row[column.id] || "0 ",
                  cellType: column.dataType,
                  columnName: column.header,
                }))
              ),
            },
      },
    ];

    return body;
  };

  const handleCSVClick = () => {
    const csvHeaders = [
      "Unit",
      "Hour",
      "Menu Item",
      "# Sold",
      "Item Sales",
      ...(itemValue === 1
        ? ["Case Unit Name", "Usage Cases", "Count Name", "Use Count"]
        : []),
    ];
    const csvData = menuItemSoldData.flatMap((item) =>
      [
        item.unit,
        item.hour,
        item.menuItem,
        item.sold,
        item.discPrice,
        ...(itemValue === 1
          ? [
              item.caseUnitName,
              item.usageCases,
              item.countDisplayUnitName,
              item.usageCountDisplayUnits,
            ]
          : []),
      ].join(",")
    );

    if (csvHeaders.length > 0 && csvData.length > 0) {
      const csvString = [csvHeaders.join(","), ...csvData].join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = url;
      tempLink.setAttribute("download", "menuItemSold.csv");
      tempLink.click();
    } else {
      console.error("No data available for CSV export");
    }
  };

  const handleExcelClick = () => {
    const data = [
      {
        name:
          itemValue === 0
            ? `Items Sold By Hour | Menu Item: ${selectedMenuName}`
            : `Items Sold By Hour | Inventory Item: ${selectedInventoryName}`,
        columns: [
          { name: "Unit", filter: "text" },
          { name: "Hour", filter: "text" },
          { name: "Menu Item", filter: "text" },
          { name: "# Sold", filter: "text" },
          { name: "Item Sales", filter: "text" },
          ...(itemValue === 1
            ? [
                { name: "Case Unit Name", filter: "text" },
                { name: "Usage Cases", filter: "text" },
                { name: "Count Name", filter: "text" },
                { name: "Use Count", filter: "text" },
              ]
            : []),
        ],
        data: menuItemSoldData.flatMap((item) => ({
          Unit: item.unit,
          Hour: item.hour,
          "Menu Item": item.menuItem,
          "# Sold": item.sold,
          "Item Sales": item.discPrice,
          ...(itemValue === 1
            ? {
                "Case Unit Name": item.caseUnitName,
                "Usage Cases": item.usageCases,
                "Count Name": item.countDisplayUnitName,
                "Use Count": item.usageCountDisplayUnits,
              }
            : {}),
        })),
      },
    ];

    const filename = "MenuItemSold";
    const spreadSheetTitle = "Menu Item Sold";
    const date = `${dateFormat(selectedFromDate, "mm-dd-yyyy")} to ${dateFormat(
      selectedToDate,
      "mm-dd-yyyy"
    )}`;

    exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
  };

  const Table = (
    <TableHOC
      columns={columns}
      data={menuItemSoldData}
      isTableRendered={isTableRendered}
      setIsTableRendered={setIsTableRendered}
      detailOnTop={`${
        salesType === "SalesNet" ? "Net Sales:" : "Gross Sales:"
      } $${menuItemSoldData[0]?.total?.toFixed(2) || 0}`}
    />
  );

  const handleMenuClick = () => {
    setShowMenuModal(true);
  };

  const handleInventoryClick = () => {
    setShowInventoryModal(true);
  };

  const componentMap = {
    Menu: (
      <Menu
        companyId={companyID}
        menuName={isItemsLoading ? "Loading..." : selectedMenuName}
        setMenuName={setselectedMenuName}
        onClick={handleMenuClick}
      />
    ),
    Inventory: (
      <Inventory
        companyId={companyID}
        InventoryName={isItemsLoading ? "Loading..." : selectedInventoryName}
        setInventoryName={setselectedInventoryName}
        onClick={handleInventoryClick}
      />
    ),
  };

  return (
    <>
      <Steps
        enabled={introSteps.stepsEnabled}
        steps={introSteps.steps}
        initialStep={introSteps.initialStep}
        onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
      />

      <header className="optionsBar mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-1">
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
            <div className="pl-1 mt-6">
              <input
                onChange={handleGroupChange}
                checked={isGroupByUnitChecked}
                className="mr-1 accent-[var(--tw-primary)]"
                type="checkbox"
              />
              Group By Unit
            </div>
            <div className="run-button" onClick={fetchSoldByHourData}>
              <div className="py-3 ml-2 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7">
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
        </div>
        <div className="flex mt-2">
          <div className="mt-2 itemType-selector">
            <label className="block ml-2 mb-1 mt-[-12px] text-lg font-semibold">
              Select Item Type
            </label>
            <div className="p-3 border-2 border-solid rounded-[1.5rem] checkbox-group hover:border-primary">
              <div className="flex flex-row space-x-6">
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="Menu"
                    name="itemType"
                    value="Menu"
                    checked={item === "Menu"}
                    onChange={() => handleItemChange("Menu")}
                    className="cursor-pointer accent-[var(--tw-primary)]"
                  />
                  <label htmlFor="Menu" className="ml-2">
                    Menu
                  </label>
                </div>
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="Inventory"
                    name="ItemType"
                    value="Inventory"
                    checked={item === "Inventory"}
                    onChange={() => handleItemChange("Inventory")}
                    className="cursor-pointer accent-[var(--tw-primary)]"
                  />
                  <label htmlFor="Inventory" className="ml-2">
                    Inventory
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 ml-2 item-selector">
            <label className="block ml-2 mb-1 mt-[-12px] text-lg font-semibold">
              {item === "Menu" ? "Menu Items" : "Inventory Items"}
            </label>
            <div className="w-56 cursor-pointer">
              {componentMap[item === "Menu" ? "Menu" : "Inventory"]}
            </div>
          </div>

          <div className="pl-2 mt-2 sale-selector">
            <label className="block ml-2 mb-1 mt-[-12px] text-lg font-semibold">
              Sales
            </label>
            <div className="p-3 border-2 border-solid rounded-[1.5rem] checkbox-group hover:border-primary">
              <div className="flex flex-row space-x-6">
                <div className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="Net"
                    name="salesType"
                    value="Net"
                    checked={salesType === "SalesNet"}
                    onChange={() => handleSalesChange("SalesNet")}
                    className="cursor-pointer accent-[var(--tw-primary)]"
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
                    className="cursor-pointer accent-[var(--tw-primary)]"
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

      {/* Display the table if there is no error and the data is not loading */}
      {isError ? (
        <div>{errorMessage}</div>
      ) : (
        <div className="relative w-full min-h-56">
          <Loader loading={isLoading} />
          {!isLoading &&
            (menuItemSoldData.length > 0 ? (
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

        <SelectionModal
          title="Select a Menu Item"
          data={menuItemList}
          show={showMenuModal}
          headers={menuHeaders}
          handleClose={() => {
            setShowMenuModal(false);
          }}
          handleSelection={handleMenuSelection}
          selectedItemKey="itemID"
        />

        <SelectionModal
          title="Select an Inventory Item"
          data={inventoryItemList}
          show={showInventoryModal}
          headers={inventoryHeaders}
          handleClose={() => {
            setShowInventoryModal(false);
          }}
          handleSelection={handleInventorySelection}
          selectedItemKey="inventoryItemID"
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
    </>
  );
};

export default ItemsSoldByHour;
