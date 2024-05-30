import { useEffect, useState, useRef } from "react";
import { InventoryItem } from "../../components/DraggableInventoryItem.jsx";
import { useDrop } from "react-dnd";
import * as Styled from "./styles/PrepChartTempStyles.jsx";
import "../../components/UnitSelector.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import Table from "../../components/TableBuilder.jsx";
import { PrepChartTemplateAPI } from "../../apis/food-cost/PrepChartTemplateAPI.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import { FaRegTrashAlt } from "react-icons/fa";
import ExportOptions from "../../components/ExportOptions.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI.jsx";
import MinimizableContainer from "../../components/MinimizableContainer.jsx";
import Tooltip from "../../components/ToolTip.jsx";
import { FcInfo } from "react-icons/fc";
import { Steps, Hints } from "intro.js-react";
import "intro.js/introjs.css";
import IntroJS from "../../components/IntroJS.jsx";

var ItemList = [];
const placeholder = "  Column drop here .....";
const todayToolTip = "Items in Today section will use the selected date Forecasted sales to calculate the NEEDED prep or thaw quantity.";
const tomorrowToolTip = "Items in Tomorrow section will use the Today date + Tomorrow date Forecasted sales to calculate the NEEDED prep or thaw quantity"; 
const nextDayToolTip = "Items in Tomorrow section will use the Today date + Tomorrow date + Next Day Forecasted sales to calculate the NEEDED prep or thaw quantity.";
const prepTableStructure = {
  columnHeaders: ["Inventory ID", "Description"],
  dataTypes: ["string", "string"],
  columnWidths: "auto",
  rows: [],
};

export default function PrepChartTemplate() {
  const [isLoading, setIsLoading] = useState(false);
  const [todayItem, setTodayItem] = useState([]);
  const [TomorrowItem, setTomorrowItem] = useState([]);
  const [NextDayItem, setNextDayItem] = useState([]);
  const [MasterTable, setMasterTable] = useState({
    ...prepTableStructure,
  });
  const [filteredItem, setFilteredItem] = useState([]);
  const todayItemRef = useRef(todayItem);
  const TomorrowItemRef = useRef(TomorrowItem);
  const NextDayItemmRef = useRef(NextDayItem);
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [sortOrder, setSortOrder] = useState("asc");
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState();
  const [areaID, setAreaID] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("No Unit Selected");
  const [selectedUnit, setSelectedUnit] = useState();
  const [isUnitSelected, setIsUnitSelected] = useState(false);
  const [prepChartTemplateID, setPrepChartTemplateID] = useState();
  const [isSave, setIsSave] = useState(false);
  const [unitData, setUnitData] = useState([]);
  const [saveUnitId, setSaveUnitId] = useState();
  const [isOverTodays, setIsOverToday] = useState(false);
  const [isOverTomorrows, setIsOverTomorrow] = useState(false);
  const [isOverNextDays, setIsOverNextDay] = useState(false);
  const draggingPos = useRef();

  const [introJS, setIntroJS] = useState ({ 
    stepsEnabled: false,
    initialStep: 0, 
    steps: [
      {
        element: ".unit-selector",
        intro: "Select a unit to create a Prep & Thaw template. The SAVE icon will allow the administrator to quickly SAVE and assign this particular prep & thaw template to any other unit or group of units. Friendly TIP: Remember to SAVE your template periodically while you build it.",
      },
      {
        element: ".save-option",
        intro: "SAVES the current template to this unit with the option to also SAVE (assign) to any other unit or area. Friendly TIP: To save considerable time, construct a temple for a large number of similar units and SAVE to all the like AND somewhat like units. Access the other unit/areas and simply modify and SAVE again. ",
      },
      {
        element: ".search-bar",
        intro: 'Search inventory items to drag and drop to the Prep & Thaw section(s) desired. Items can be added to any number of sections i.e. TODAY, TOMORROW, NEXT DAY. Items can be placed in any order desired within each section. Friendly TIP: A search for item “chicken” will produce ALL items with “chicken” anywhere in the item description therefore making it easy to drag ALL “chicken” items produced by the search'
      },
      {
        element: ".today-table",
        intro: "Items in the TODAY section will use the TODAY forecast to calculate the NEEDED prep and/or thaw amount of product to process. Friendly TIP: Items in this section are typical prep items for TODAY’s business. This could include product quantities to prepare OR thaw for use TODAY."
      },
      {
        element: ".tomorrow-table",
        intro: "Items in the TOMORROW section will use the TODAY + TOMORROW forecasts to calculate the NEEDED prep and/or thaw amount of product to process. Friendly TIP: Items in this section are typically items requiring a 24-hour thaw period to be ready for use.  This could also include product quantities to prep for a two day period having an adequate  prepared quality shelf life. "
      },
      {
        element: ".nextday-table",
        intro: "Items in the NEXT DAY section will use the TODAY + TOMORROW + NEXT DAY forecasts to calculate the NEEDED prep and/or thaw amount of product to process. Friendly TIP: Items in this section are typical items requiring a 48-hour thaw period to be ready for use. This could also include product quantities to prep for a three day period having an adequate prepared quality shelf life. "
      },
      {
        element: ".help-option",
        intro: "Use the HELP button and select View Tutorial to watch this guided tour any time!"
      }
    ],
  });

  useEffect(() => {
    todayItemRef.current = todayItem;
    TomorrowItemRef.current = TomorrowItem;
    NextDayItemmRef.current = NextDayItem;
  }, [todayItem, TomorrowItem, NextDayItem]);

  const handleDrop = (index, indexbg, section) => {
    handleDragEnter(index, indexbg, section);
  };

  const handleDragStart = (index, indexbg, section, isDragStart, isReorder) => {
    draggingPos.current = { indexbg: indexbg, section:section, isDragStart:isDragStart,isReorder: isReorder,IsSection:section };
  };

  const handleDragEnter = (index, indexbg, section) => {

    draggingPos.current.AnotherSection = (draggingPos.current.section === draggingPos.current.IsSection) ? true : false;

    if (draggingPos.current?.isReorder && (draggingPos.current.AnotherSection)) {
      index > 0 ? index-- : "";
    }
    else if ((!draggingPos.current.AnotherSection) && draggingPos.current?.isReorder)
    {
      index > 0 ? index++ : "";
    }
   
    if (
      (index !== draggingPos.current?.index ||
        section !== draggingPos.current?.section) &&
      draggingPos.current?.isDragStart
    ) {

      const newItems = getSectionItems(draggingPos.current?.section);

      const draggedItem = newItems.splice(draggingPos.current?.index, 1)[0];

      newItems.splice(index, 0, draggedItem);

      // Update the state based on the section
      switch (draggingPos.current?.section) {
        case "today":
          setTodayItem(newItems);
          break;
        case "tomorrow":
          setTomorrowItem(newItems);
          break;
        case "nextDay":
          setNextDayItem(newItems);
          break;
        default:
          break;
      }
    }
    draggingPos.current = { index, indexbg, section };
  };

  const getSectionItems = (section) => {
    switch (section) {
      case "today":
        return todayItem;
      case "tomorrow":
        return TomorrowItem;
      case "nextDay":
        return NextDayItem;
      default:
        return [];
    }
  };

  useEffect(() => {
    if (!selectedUnit) {
      let parameters = decodeURIComponent(
        window.location.search.replace("?data=", "")
      );
      if (parameters) parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters ? setAlignmentID(parameters.AlignmentId) : setAlignmentID();
      parameters ? setAreaID(parameters.User_GroupOrUnitAccess) : setAreaID();
      parameters
        ? setSelectedUnit(parameters.User_DefaultUnitID)
        : setSelectedUnit();
      if (parameters.User_DefaultUnitID) {
        fetchUnitData(
          parameters.CompanyID,
          parameters.AlignmentId,
          parameters.User_GroupOrUnitAccess
        );
        fetchData(parameters.CompanyID, parameters.User_DefaultUnitID);
        setIsUnitSelected(true);
      } else {
        setIsUnitSelected(false);
        setIsLoading(false);
      }
    } else {
      fetchUnitData(companyID, alignmentID, areaID);
      fetchData(companyID, selectedUnit); // Call fetchData function on component mount
    }
  }, []);

  const fetchData = (companyID, selectedUnit) => {
    setIsLoading(true); // Set loading to true before fetching data
    PrepChartTemplateAPI.get(companyID, selectedUnit)
      .then((result) => {
        const data = result.data;
        setPrepChartTemplateID(data.prepChartTemplateID);
        insertData(data);
        setIsLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set loading to false if there's an error
      });
    PrepChartTemplateAPI.getInventoryItems(companyID)
      .then((results) => {
        const data = results.data
        buildPrepMasterTable(data);
        setIsUnitSelected(true);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const fetchUnitData = (companyID, alignmentID, areaID) => {
    UnitsAndAreasAPI.getbyid(companyID, alignmentID, areaID)
      .then((results) => {
        const data = results.data;
        setUnitData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const insertData = (data) => {
    if (data.prepChartTemplate.length > 0) {
      if (data.prepChartTemplate[0]) {
        setTodayItem(
          data.prepChartTemplate.find((item) => item.prepGroupKey === "Today")
            .inventoryItemList
        );
      }
      if (data.prepChartTemplate[1]) {
        setTomorrowItem(
          data.prepChartTemplate.find((item) => item.prepGroupKey === "Tomorrow")
            .inventoryItemList
        );
      }
      if (data.prepChartTemplate[2]) {
        setNextDayItem(
          data.prepChartTemplate.find((item) => item.prepGroupKey === "Next Day")
            .inventoryItemList
        );
      }
    } else {
      setTodayItem([]);
      setTomorrowItem([]);
      setNextDayItem([]);
    }
  };
  const buildPrepMasterTable = (prepChartSection) => {
    setMasterTable({
      ...prepTableStructure,
      rows: prepChartSection,
    });
    ItemList = prepChartSection;
    setFilteredItem(prepChartSection); // Initially, set filtered rows to all rows
  };

  const SearchItem = (keyword) => {
    const filtered = MasterTable.rows.filter(
      (item) =>
        (item.description &&
          item.description.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.inventoryItemID &&
          item.inventoryItemID
            .toString()
            .toLowerCase()
            .includes(keyword.toLowerCase()))
    );
    setFilteredItem(filtered);
  };

  const [{ isOverToday }, dropToday] = useDrop(() => ({
    accept: "content",
    drop: (item) => DropToday(item.inventoryItemID),
    collect: (monitor) => ({
      isOverToday: !!monitor.isOver(),
    }),
  }));

  const [{ isOverTomorrow }, dropTomorrow] = useDrop(() => ({
    accept: "content",
    drop: (item) => DropTomorrow(item.inventoryItemID),
    collect: (monitor) => ({
      isOverTomorrow: !!monitor.isOver(),
    }),
  }));

  const [{ isOverNextDay }, dropNextDay] = useDrop(() => ({
    accept: "content",
    drop: (item) => DropNextDay(item.inventoryItemID),
    collect: (monitor) => ({
      isOverNextDay: !!monitor.isOver(),
    }),
  }));

  const DropToday = (inventoryItemID) => {
    const isDuplicate = todayItemRef.current.some(
      (item) => item.inventoryItemID === inventoryItemID
    );
    if (!isDuplicate) {
      const DropToDayItem = ItemList.find(
        (item) => item.inventoryItemID === inventoryItemID
      );
      if (DropToDayItem) {
        setTodayItem((todayItem) => {
          var TodayItems = [
            ...todayItem.slice(0, draggingPos.current?.index),
            DropToDayItem,
            ...todayItem.slice(draggingPos.current?.index),
          ];
          return (TodayItems = Array.from(
            new Set(TodayItems.map(JSON.stringify)),
            JSON.parse
          ));
        });
      }
    }
  };

  const DropTomorrow = (inventoryItemID) => {
    const isDuplicate = TomorrowItemRef.current.some(
      (item) => item.inventoryItemID === inventoryItemID
    );
    if (!isDuplicate) {
      const DropTomorrowItem = ItemList.find(
        (item) => item.inventoryItemID === inventoryItemID
      );
      if (DropTomorrowItem) {
        setTomorrowItem((TomorrowItem) => {
          var TomorrowItems = [
            ...TomorrowItem.slice(0, draggingPos.current?.index),
            DropTomorrowItem,
            ...TomorrowItem.slice(draggingPos.current?.index),
          ];
          return (TomorrowItems = Array.from(
            new Set(TomorrowItems.map(JSON.stringify)),
            JSON.parse
          ));
        });
      }
    }
  };

  const DropNextDay = (inventoryItemID) => {
    const isDuplicate = NextDayItemmRef.current.some(
      (item) => item.inventoryItemID === inventoryItemID
    );
    if (!isDuplicate) {
      const DropNextDayItem = ItemList.find(
        (item) => item.inventoryItemID === inventoryItemID
      );
      if (DropNextDayItem) {
        setNextDayItem((NextDayItem) => {
          var NextDayItems = [
            ...NextDayItem.slice(0, draggingPos.current?.index),
            DropNextDayItem,
            ...NextDayItem.slice(draggingPos.current?.index),
          ];
          return (NextDayItems = Array.from(
            new Set(NextDayItems.map(JSON.stringify)),
            JSON.parse
          ));
        });
      }
    }
  };

  const handleUnitSelectorClick = () => {
    setShowModal(true); // Open the modal when UnitSelector is clicked
    setIsSave(false);
  };

  // Function to handle row deletion
  const handleDelete = (inventoryItemID, day) => {
    // Determine which list to update based on the 'day' parameter
    let updatedItems;
    switch (day) {
      case "today":
        updatedItems = todayItem.filter(
          (item) => item.inventoryItemID !== inventoryItemID
        );
        setTodayItem(updatedItems);
        break;
      case "tomorrow":
        updatedItems = TomorrowItem.filter(
          (item) => item.inventoryItemID !== inventoryItemID
        );
        setTomorrowItem(updatedItems);
        break;
      case "nextDay":
        updatedItems = NextDayItem.filter(
          (item) => item.inventoryItemID !== inventoryItemID
        );
        setNextDayItem(updatedItems);
        break;
      default:
        break;
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    fetchData(companyID, unitID);
    setShowModal(false); // Close the date modal after selection
  };

  const handleOkButtonClick = (unitID) => {
    setSaveUnitId(unitID);
  };

  const handleSave = () => {
    setShowModal(true);
    setIsSave(true);
  };
  const handleUnitSaveSelection = (units) => {
    constructPrepChartTemplate(units);
  };
  const handleSaveButtonClick = () => {};

  function constructPrepChartTemplate(units) {
    const prepChartTemplate = [
      {
        PrepGroupKey: "Today",
        InventoryItemList: todayItem,
      },
      {
        PrepGroupKey: "Tomorrow",
        InventoryItemList: TomorrowItem,
      },
      {
        PrepGroupKey: "Next Day",
        InventoryItemList: NextDayItem,
      },
    ];
    const json = {
      CompanyID: companyID,
      UnitIDList: units.map((unit) => unit.id),
      PrepChartTemplateID: prepChartTemplateID,
      PrepChartTemplate: prepChartTemplate,
    };
    const jsonData = JSON.stringify(json);
    PrepChartTemplateAPI.save(jsonData)
      .then(() => {
        toast.success("Data saved successfully!");
      })
      .catch((error) => {
        toast.error("Error saving data");
      });
  }

  const handleSorting = (columnIndex) => {
    // Determine which column to sort based on the columnIndex
    switch (columnIndex) {
      case 0: // Sort by Inventory ID
        handleSortByInventoryID();
        break;
      case 1: // Sort by Description
        handleSortByDescription();
        break;
      default:
        break;
    }
  };

  // Function to handle sorting by Inventory ID
  const handleSortByInventoryID = () => {
    const sortedItems =
      sortOrder === "asc"
        ? MasterTable.rows
            .slice()
            .sort((a, b) => a.inventoryItemID - b.inventoryItemID)
        : MasterTable.rows
            .slice()
            .sort((a, b) => b.inventoryItemID - a.inventoryItemID);

    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setFilteredItem(sortedItems);
  };

  // Function to handle sorting by Description
  const handleSortByDescription = () => {
    const sortedItems =
      sortOrder === "asc"
        ? MasterTable.rows
            .slice()
            .sort((a, b) => a.description.localeCompare(b.description))
        : MasterTable.rows
            .slice()
            .sort((a, b) => b.description.localeCompare(a.description));

    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setFilteredItem(sortedItems);
  };

  const handleDropOver = (isDropOver, section, index) => {

    if (draggingPos.current.isDragStart) {
      (draggingPos.current.indexbg = index),
      (draggingPos.current.section = section);
    } else {
      draggingPos.current = {
        index: draggingPos.current.index,
        indexbg: draggingPos.current.indexbg,
        section: section,
        isDragStart: draggingPos.current.isDragStart,
      };
    }
    switch (section) {
      case "today":
        setIsOverToday(isDropOver);
        break;
      case "tomorrow":
        setIsOverTomorrow(isDropOver);
        break;
      case "nextDay":
        setIsOverNextDay(isDropOver);
        break;
      default:
        break;
    }
  };

  const handleIntroStart = () => {
    setIntroJS({ ...introJS, stepsEnabled: true });
  };

  const todayTitle = () => {
    return <div>
      <Tooltip content={todayToolTip} direction="top">
        <FcInfo /> Today
      </Tooltip>
    </div>
  };

  const tomorrowTitle = () => {
    return <div>
      <Tooltip content={tomorrowToolTip} direction="top">
        <FcInfo /> Tomorrow
      </Tooltip>
    </div>
  };

  const nextDayTitle = () => {
    return <div>
      <Tooltip content={nextDayToolTip} direction="top">
        <FcInfo /> Next Day
      </Tooltip>
    </div>
  };

  return (
    <Styled.PageContainer>
      <Steps
        enabled={introJS.stepsEnabled}
        steps={introJS.steps}
        initialStep={0}
        onExit={() => setIntroJS({ ...introJS, stepsEnabled: false })}
      />
      <Styled.PageTitle>Prep Chart Template</Styled.PageTitle>
      <Styled.OptionsRow>
        <ToastContainer />
        <Styled.DateAndUnitContainer>
          <UnitSelector
            onClick={handleUnitSelectorClick}
            unitName={selectedUnitName}
            setUnitName={setSelectedUnitName}
            unitID={selectedUnit}
          />
          <UnitModal
            unitData={unitData}
            unitID={selectedUnit}
            unitName={selectedUnitName}
            show={showModal}
            handleClose={() => {
              setShowModal(false);
            }}
            handleUnitSelection={handleUnitSelection}
            handleSaveButtonClick={
              !isSave ? handleOkButtonClick : handleSaveButtonClick
            }
            handleUnitSaveSelection={handleUnitSaveSelection}
            isSaveUnit={isSave}
            isMultiUnit={isSave}
            includeAreas={isSave}
          />
        </Styled.DateAndUnitContainer>
        <Styled.SaveOptionsContainer>
          <ExportOptions includeSave={true} handleSaveClick={handleSave} includeHelp={true} handleHelpClick={handleIntroStart} className="export-options" />
        </Styled.SaveOptionsContainer>
      </Styled.OptionsRow>
      {isLoading ? (
        <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
      ) : !isUnitSelected ? (
        <Styled.UnloadedMessage>
          No unit selected, Please select a unit.
        </Styled.UnloadedMessage>
      ) : (
        <>
          <div className="container">
            <Styled.InventoryItemsContainer>
              <Styled.InventoryItemsTitle>
                <Styled.TableHeaderTop>Inventory Items</Styled.TableHeaderTop>
                <SearchBar
                  list={MasterTable.rows}
                  onSearch={(keyword) => SearchItem(keyword)}
                />
              </Styled.InventoryItemsTitle>
              <Styled.TableLeft className="inventory-items"> 
                <Table
                  columnHeaders={MasterTable.columnHeaders}
                  columnwidths={MasterTable.columnWidths}
                  dataTypes={MasterTable.dataTypes}
                  rows={
                    filteredItem.length > 0
                      ? filteredItem
                      : [{ description: "No data found " }]
                  }
                  isDrag={true}
                  usetablerows={true}
                  className={"Tblleft"}
                  scrollable={true}
                  handleSorting={handleSorting}
                  isSorting={true}
                />
              </Styled.TableLeft>
            </Styled.InventoryItemsContainer>

            <Styled.TableRight className="drop-tables">
              <Styled.RightTblMarg>
                <MinimizableContainer title={todayTitle}>
                  <Styled.Table className="today-table">
                    <div
                      className={`drop-board`}
                      ref={dropToday}
                      style={{
                        border: isOverToday ? "1px solid red" : "",
                      }}
                    >
                      <Styled.TableHeaderRight>
                        <Styled.TableHeaderCell>
                          Inventory ID
                        </Styled.TableHeaderCell>
                        <Styled.TableHeaderCell>
                          Description
                        </Styled.TableHeaderCell>
                      </Styled.TableHeaderRight>
                      {todayItem.length > 0 ? "" : placeholder}

                      {todayItem.map((item, index) => (
                        <div
                          key={item.inventoryItemID}
                          // draggable
                          // onDragStart={() =>
                          //   handleDragStart(index, index, "today", true, true)
                          // }
                          onDrop={() => {
                            handleDrop(index, "today"),
                              handleDropOver(false, "today", index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index,
                                    indexbg: index,
                                    section: "today",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "today", index);
                          }}
                          onDragLeave={() =>
                            handleDropOver(false, "today", index)
                          }
                          className={
                            index === draggingPos.current?.indexbg
                              ? `dragging ${
                                  isOverTodays ? "drop-highlight" : ""
                                }`
                              : ""
                          }
                        >
                          <InventoryItem
                            inventoryItemID={item.inventoryItemID}
                            description={item.description?.trim()}
                            columnIndex={item.inventoryItemID}
                          />
                          <FaRegTrashAlt
                            className={`delete`}
                            onClick={() =>
                              handleDelete(item.inventoryItemID, "today")
                            }
                          />
                        </div>
                      ))}
                      {todayItem.length > 0 ? (
                        <Styled.AddNewItems
                          onDrop={() => {
                            handleDrop(todayItem.length, "today"),
                              handleDropOver(false, "today");
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index: todayItem.length,
                                    indexbg: todayItem.length,
                                    section: "today",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "today", todayItem.length);
                          }}
                          className={
                            todayItem.length === draggingPos.current?.indexbg
                              ? `dragging ${
                                  isOverTodays ? "drop-highlight" : ""
                                }`
                              : ""
                          }
                        >
                          Drop items here or in the list above
                        </Styled.AddNewItems>
                      ) : null}
                    </div>
                  </Styled.Table>
                </MinimizableContainer>
              </Styled.RightTblMarg>

              <Styled.RightTblMarg>
                <MinimizableContainer title={tomorrowTitle}>
                  <Styled.Table className="tomorrow-table">
                    <div
                      className="drop-board"
                      ref={dropTomorrow}
                      style={{
                        border: isOverTomorrow ? "1px solid red" : "",
                        paddingBottom: TomorrowItem.length > 0 ? "20px" : "0",
                      }}
                    >
                      <Styled.TableHeaderRight>
                        <Styled.TableHeaderCell>
                          Inventory ID{" "}
                        </Styled.TableHeaderCell>
                        <Styled.TableHeaderCell>
                          description{" "}
                        </Styled.TableHeaderCell>
                      </Styled.TableHeaderRight>
                      {TomorrowItem.length > 0 ? "" : placeholder}
                      {TomorrowItem.map((item, index) => (
                        <div
                          key={item.inventoryItemID}
                          // draggable
                          // onDragStart={() =>
                          //   handleDragStart(index, index,"tomorrow", true, true)
                          // }
                          onDrop={() => {
                            handleDrop(index, index, "tomorrow"),
                              handleDropOver(false, "tomorrow", index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index,
                                    indexbg: index,
                                    section: "tomorrow",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "tomorrow", index);
                          }}
                          onDragLeave={() =>
                            handleDropOver(false, "tomorrow", index)
                          }
                          className={
                            index === draggingPos.current?.indexbg
                              ? `dragging ${
                                  isOverTomorrows ? "drop-highlight" : ""
                                }`
                              : ""
                          }
                        >
                          <InventoryItem
                            inventoryItemID={item.inventoryItemID}
                            description={item.description.trim()}
                            columnIndex={item.inventoryItemID}
                          />
                          <FaRegTrashAlt
                            className={`delete`}
                            onClick={() =>
                              handleDelete(item.inventoryItemID, "tomorrow")
                            }
                          />
                        </div>
                      ))}
                      {TomorrowItem.length > 0 ? (
                        <Styled.AddNewItems
                          onDrop={() => {
                              handleDrop(TomorrowItem.length, "tomorrow"),
                              handleDropOver(false, "tomorrow");
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index: TomorrowItem.length,
                                    indexbg: TomorrowItem.length,
                                    section: "tomorrow",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "tomorrow", TomorrowItem.length);
                          }}
                          className={
                            TomorrowItem.length === draggingPos.current?.indexbg
                              ? `dragging ${
                                  isOverTomorrows ? "drop-highlight" : ""
                                }`
                              : ""
                          }
                        >
                          Drop items here or in the list above
                        </Styled.AddNewItems>
                      ) : null}
                    </div>
                  </Styled.Table>
                </MinimizableContainer>
              </Styled.RightTblMarg>
              <Styled.RightTblMarg>
                <MinimizableContainer title={nextDayTitle}>
                  <Styled.Table className="nextday-table">
                    <div
                      className="drop-board"
                      ref={dropNextDay}
                      style={{
                        border: isOverNextDay ? "1px solid red" : "",
                        paddingBottom: NextDayItem.length > 0 ? "20px" : "0",
                      }}
                    >
                      <Styled.TableHeaderRight>
                        <Styled.TableHeaderCell>
                          Inventory ID{" "}
                        </Styled.TableHeaderCell>
                        <Styled.TableHeaderCell>
                          description{" "}
                        </Styled.TableHeaderCell>
                      </Styled.TableHeaderRight>
                      {NextDayItem.length > 0 ? "" : placeholder}
                      {NextDayItem.map((item, index) => (
                        <div
                          key={item.inventoryItemID}
                          // draggable
                          // onDragStart={() =>
                          //   handleDragStart(index,index, "nextDay", true, true)
                          // }
                          onDrop={() => {
                            handleDrop(index, "nextDay"),
                              handleDropOver(false, "nextDay", index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index,
                                    indexbg: index,
                                    section: "nextDay",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "nextDay", index);
                          }}
                          onDragLeave={() => {
                            handleDropOver(false, "nextDay", index)
                              
                          }}
                          className={
                            index === draggingPos.current?.indexbg
                              ? `dragging ${
                                  isOverNextDays ? "drop-highlight" : ""
                                }`
                              : ""
                          }
                        >
                          <InventoryItem
                            inventoryItemID={item.inventoryItemID}
                            description={item.description}
                            columnIndex={item.inventoryItemID}
                          />
                          <FaRegTrashAlt
                            className="delete"
                            onClick={() =>
                              handleDelete(item.inventoryItemID, "nextDay")
                            }
                          />
                        </div>
                      ))}
                      {NextDayItem.length > 0 ? (
                        <Styled.AddNewItems
                          onDrop={() => {
                              handleDrop(NextDayItem.length, "nextDay"),
                              handleDropOver(false, "nextDay");
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index: NextDayItem.length,
                                    indexbg: NextDayItem.length,
                                    section: "nextDay",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "nextDay", NextDayItem.length);
                          }}
                          className={
                            NextDayItem.length === draggingPos.current?.indexbg
                              ? `dragging ${
                                  isOverNextDays ? "drop-highlight" : ""
                                }`
                              : ""
                          }
                        >
                          Drop items here or in the list above
                        </Styled.AddNewItems>
                      ) : null}
                    </div>
                  </Styled.Table>
                </MinimizableContainer>
              </Styled.RightTblMarg>
            </Styled.TableRight>
          </div>
        </>
      )}
    </Styled.PageContainer>
  );
}
