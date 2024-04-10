import { useEffect, useState, useRef } from "react";
import { InventoryItem } from "../components/DraggableInventoryItem.jsx";
import { useDrop } from "react-dnd";
import * as Styled from "./PrepChartTempStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import Table from "../components/TableBuilder.jsx";
import { PrepChartTemplateAPI } from "../apis/PrepChartTemplateAPI.jsx";
import SearchBar from "../components/SearchBar.jsx";
import UnitModal from "../components/UnitModal.jsx";
import { FaRegTrashAlt } from "react-icons/fa";
import ExportOptions from "../components/ExportOptions.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UnitsAndAreasAPI } from "../apis/UnitsAndAreasAPI.jsx";
import MinimizableContainer from "../components/MinimizableContainer.jsx";

var ItemList = [];
const placeholder = "  Column drop here .....";
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

  useEffect(() => {
    todayItemRef.current = todayItem;
    TomorrowItemRef.current = TomorrowItem;
    NextDayItemmRef.current = NextDayItem;
  }, [todayItem, TomorrowItem, NextDayItem]);

  const handleDrop = (index, section) => {
    handleDragEnter(index, section);
  };

  const handleDragStart = (index, section, isDragStart) => {
    draggingPos.current = { index, section, isDragStart };
  };

  const handleDragEnter = (index, section) => {
    if (
      (index !== draggingPos.current?.index ||
        section !== draggingPos.current?.section) &&
      draggingPos.current?.isDragStart
    ) {
      const newItems = [...getSectionItems(draggingPos.current?.section)];

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
    draggingPos.current = { index, section };
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
      .then((data) => {
        setPrepChartTemplateID(data.prepChartTemplateID);
        insertData(data);
        setIsLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set loading to false if there's an error
      });
    PrepChartTemplateAPI.getInventoryItems(companyID)
      .then((data) => {
        buildPrepMasterTable(data);
        setIsUnitSelected(true);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const fetchUnitData = (companyID, alignmentID, areaID) => {
    UnitsAndAreasAPI.getbyid(companyID, alignmentID, areaID)
      .then((data) => {
        setUnitData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const insertData = (data) => {
    if (data.prepChartTemplate.length > 0) {
      setTodayItem(
        data.prepChartTemplate.find((item) => item.prepGroupKey === "Today")
          .inventoryItemList
      );
      setTomorrowItem(
        data.prepChartTemplate.find((item) => item.prepGroupKey === "Tomorrow")
          .inventoryItemList
      );
      setNextDayItem(
        data.prepChartTemplate.find((item) => item.prepGroupKey === "Next Day")
          .inventoryItemList
      );
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

  const handleDropOver = (isDropOver, section) => {
    draggingPos.current = {
      index: draggingPos.current.index,
      section: section,
      isDragStart: draggingPos.current.isDragStart,
    };
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

  return (
    <Styled.PageContainer>
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
          <ExportOptions includeSave={true} handleSaveClick={handleSave} />
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
              <Styled.TableLeft>
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

            <Styled.TableRight>
              <Styled.RightTblMarg>
                <MinimizableContainer title="Today">
                  <Styled.Table>
                    <div
                      className={`drop-board`}
                      ref={dropToday}
                      style={{
                        border: isOverToday ? "1px solid red" : "",
                        paddingBottom: todayItem.length > 0 ? "20px" : "0",
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
                          draggable
                          onDragStart={() =>
                            handleDragStart(index, "today", true)
                          }
                          onDrop={() => {
                            handleDrop(index, "today"),
                              handleDropOver(false, "today");
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index,
                                    section: "today",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "today");
                          }}
                          onDragLeave={() => handleDropOver(false, "today")}
                          className={
                            index === draggingPos.current?.index
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
                    </div>
                  </Styled.Table>
                </MinimizableContainer>
              </Styled.RightTblMarg>

              <Styled.RightTblMarg>
                <MinimizableContainer title="Tomorrow">
                  <Styled.Table>
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
                          draggable
                          onDragStart={() =>
                            handleDragStart(index, "tomorrow", true)
                          }
                          onDrop={() => {
                            handleDrop(index, "tomorrow"),
                              handleDropOver(false, "tomorrow");
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index,
                                    section: "tomorrow",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "tomorrow");
                          }}
                          onDragLeave={() => handleDropOver(false, "tomorrow")}
                          className={
                            index === draggingPos.current?.index
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
                    </div>
                  </Styled.Table>
                </MinimizableContainer>
              </Styled.RightTblMarg>
              <Styled.RightTblMarg>
                <MinimizableContainer title="Next Day">
                  <Styled.Table>
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
                          draggable
                          onDragStart={() =>
                            handleDragStart(index, "nextDay", true)
                          }
                          onDrop={() => {
                            handleDrop(index, "nextDay"),
                              handleDropOver(false, "nextDay");
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(),
                              draggingPos.current?.isDragStart
                                ? ""
                                : (draggingPos.current = {
                                    index: index,
                                    section: "nextDay",
                                    isDragStart:
                                      draggingPos.current?.isDragStart,
                                  }),
                              handleDropOver(true, "nextDay");
                          }}
                          onDragLeave={() => {
                            handleDropOver(false, "nextDay"),
                              (draggingPos.current = {
                                index,
                                section: "nextDay",
                                isDragStart: draggingPos.current?.isDragStart,
                              });
                          }}
                          className={
                            index === draggingPos.current?.index
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
