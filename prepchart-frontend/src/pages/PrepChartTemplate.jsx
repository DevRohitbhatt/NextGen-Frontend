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
  const [companyID, setCompanyID] = useState(1021);
  const [selectedUnitName, setSelectedUnitName] = useState("No Unit Selected");
  const [selectedUnit, setSelectedUnit] = useState(51);
  const [isUnitSelected, setIsUnitSelected] = useState(false);
  const [prepChartTemplateID, setPrepChartTemplateID] = useState();
  //const draggingPos = useRef(null);
  const dragOverPos = useRef(null);
  const [isSave, setIsSave] = useState(false);
  const [saveUnitId, setSaveUnitId] = useState();

  useEffect(() => {
    todayItemRef.current = todayItem;
    TomorrowItemRef.current = TomorrowItem;
    NextDayItemmRef.current = NextDayItem;
  }, [todayItem, TomorrowItem, NextDayItem]);

  const draggingPos = useRef({ index: -1, section: "" });
  const handleDragStart = (index, section) => {
    draggingPos.current = { index, section };
  };

  const handleDragEnter = (index, section) => {
    // Check if the drag enters a different position
    console.log("Index",index);
    console.log("section",section);
    if (
      index !== draggingPos.current.index ||
      section !== draggingPos.current.section
    ) {
      // Update the state only if the drag enters a different position
      const newItems = [...getSectionItems(draggingPos.current.section)];

      // Remove the dragged item from its original position
      const draggedItem = newItems.splice(draggingPos.current.index, 1)[0];

      // Insert the dragged item at the new position
      newItems.splice(index, 0, draggedItem);

      // Update the state based on the section
      switch (draggingPos.current.section) {
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
      // Update dragging position
      draggingPos.current = { index, section };
    }
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
      console.log(parameters);
      if (parameters) parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters
        ? setSelectedUnit(parameters.User_DefaultUnitID)
        : setSelectedUnit();
      if (parameters.User_DefaultUnitID) {
        fetchData(parameters.CompanyID, parameters.User_DefaultUnitID);
        setIsUnitSelected(true);
      } else {
        setIsUnitSelected(false);
        setIsLoading(false);
      }
    } else {
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
        console.log(data);
        buildPrepMasterTable(data);
        setIsUnitSelected(true);
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

  // const DropToday = (inventoryItemID) => {
  //   const isDuplicate = todayItemRef.current.some(
  //     (item) => item.inventoryItemID === inventoryItemID
  //   );
  //   if (!isDuplicate) {
  //     const DropToDayItem = ItemList.filter(
  //       (Items) =>
  //         inventoryItemID === Items.inventoryItemID &&
  //         todayItem.inventoryItemID != inventoryItemID
  //     );
  //     setTodayItem((todayItem) => [...todayItem, DropToDayItem[0]]);
  //   }
  // };
  
  // const DropTomorrow = (inventoryItemID) => {
  //   const isDuplicate = TomorrowItemRef.current.some(
  //     (item) => item.inventoryItemID === inventoryItemID
  //   );
  //   if (!isDuplicate) {
  //     const DropTomorrowItem = ItemList.filter(
  //       (Items) =>
  //         inventoryItemID === Items.inventoryItemID &&
  //         TomorrowItem.inventoryItemID != inventoryItemID
  //     );
  //     setTomorrowItem((TomorrowItem) => [...TomorrowItem, DropTomorrowItem[0]]);
  //   }
  // };

  // const DropNextDay = (inventoryItemID) => {
  //   const isDuplicate = NextDayItemmRef.current.some(
  //     (item) =>
  //       item.inventoryItemID === inventoryItemID &&
  //       NextDayItem.inventoryItemID != inventoryItemID
  //   );
  //   if (!isDuplicate) {
  //     const DropNextDayItem = ItemList.filter(
  //       (Items) => inventoryItemID === Items.inventoryItemID
  //     );
  //     setNextDayItem((NextDayItem) => [...NextDayItem, DropNextDayItem[0]]);
  //   }
  // };

  const DropToday = (inventoryItemID) => {
    const isDuplicate = todayItemRef.current.some(
      (item) => item.inventoryItemID === inventoryItemID
    );
    if (!isDuplicate) {
      const DropToDayItem = ItemList.find(
        (item) => item.inventoryItemID === inventoryItemID
      );
      if (DropToDayItem) {
        if (draggingPos.current.index !== -1) {
          setTodayItem((todayItem) => {
            const newTodayItem = [...todayItem];
            newTodayItem.splice(draggingPos.current.index, 0, DropToDayItem);
            return newTodayItem;
          });
        }
        else
        {
          const DropToDayItem = ItemList.filter(
            (Items) => inventoryItemID === Items.inventoryItemID
          );
          setTodayItem((TodayItem) => [...TodayItem, DropToDayItem[0]]);
        }
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
        if (draggingPos.current.index !== -1) {
          setTomorrowItem((TomorrowItem) => {
            const newTomorrowItem = [...TomorrowItem];
            newTomorrowItem.splice(draggingPos.current.index, 0, DropTomorrowItem);
            return newTomorrowItem;
          });
        }
        else
        {
          const DropTomorrowItem = ItemList.filter(
            (Items) => inventoryItemID === Items.inventoryItemID
          );
          setTomorrowItem((TomorrowItem) => [...TomorrowItem, DropTomorrowItem[0]]);
        }
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
        if (draggingPos.current.index !== -1) {
          setNextDayItem((NextDayItem) => {
            const newNextDayItem = [...NextDayItem];
            newNextDayItem.splice(draggingPos.current.index, 0, DropNextDayItem);
            return newNextDayItem;
          });
        }
        else
        {
          const DropNextDayItem = ItemList.filter(
            (Items) => inventoryItemID === Items.inventoryItemID
          );
          setNextDayItem((NextDayItem) => [...NextDayItem, DropNextDayItem[0]]);
        }
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

    //const prepChartTemplate = constructPrepChartTemplate(selectedUnit);
  };
  const handleUnitSaveSelection = (unitName, unitID) => {
    const prepChartTemplate = constructPrepChartTemplate(unitID);
  };
  const handleSaveButtonClick = () => {};

  function constructPrepChartTemplate(unitID) {
    const prepChartTemplate = [
      {
        prepGroupKey: "Today",
        inventoryItemList: todayItem,
      },
      {
        prepGroupKey: "Tomorrow",
        inventoryItemList: TomorrowItem,
      },
      {
        prepGroupKey: "Next Day",
        inventoryItemList: NextDayItem,
      },
    ];
    const json = {
      companyID: companyID,
      unitIDList: [unitID],
      prepChartTemplateID: prepChartTemplateID,
      prepChartTemplate: prepChartTemplate,
    };
    return PrepChartTemplateAPI.save(json);
    //console.log("Save list", unitID);
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

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart Template</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector
            onClick={handleUnitSelectorClick}
            unitName={selectedUnitName}
            setUnitName={setSelectedUnitName}
            unitID={selectedUnit}
          />
          <UnitModal
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
        <div>
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
                <Styled.TableHeaderTop>Today</Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className={`drop-board`}
                    ref={dropToday}
                    style={{ border: isOverToday ? "1px solid red" : "" }}
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
                        onDragStart={() => handleDragStart(index, "today")}
                        onDragEnter={() => handleDragEnter(index, "today")}
                        onDragOver={(e) => e.preventDefault()}
                        className={
                          index === draggingPos.current.index
                            ? `dragging ${isOverToday ? "" : ""}`
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
                            handleDelete(item.inventoryItemID, "today")
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Styled.Table>
              </Styled.RightTblMarg>

              <Styled.RightTblMarg>
                <Styled.TableHeaderTop>Tomorrow</Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropTomorrow}
                    style={{ border: isOverTomorrow ? "1px solid red" : "" }}
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
                        onDragStart={() => handleDragStart(index, "tomorrow")}
                        onDragEnter={() => handleDragEnter(index, "tomorrow")}
                        onDragOver={(e) => e.preventDefault()}
                        className={
                          index === draggingPos.current.index
                            ? `dragging ${isOverTomorrow ? "" : ""}`
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
              </Styled.RightTblMarg>
              <Styled.RightTblMarg>
                <Styled.TableHeaderTop>Next Day</Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropNextDay}
                    style={{ border: isOverNextDay ? "1px solid red" : "" }}
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
                        onDragStart={() => handleDragStart(index, "nextDay")}
                        onDragEnter={() => handleDragEnter(index, "nextDay")}
                        onDragOver={(e) => e.preventDefault()}
                        className={
                          index === draggingPos.current.index
                            ? `dragging ${isOverNextDay ? "" : ""}`
                            : ""
                        }
                      >
                        <InventoryItem
                          key={item.inventoryItemID}
                          inventoryItemID={item.inventoryItemID}
                          description={item.description}
                          // moveItem={handleReorder(NextDayItem, setNextDayItem)}
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
              </Styled.RightTblMarg>
            </Styled.TableRight>
          </div>
        </div>
      )}
    </Styled.PageContainer>
  );
}
