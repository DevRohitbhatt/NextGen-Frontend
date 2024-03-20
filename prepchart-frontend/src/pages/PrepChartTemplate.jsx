import { useEffect, useState, useRef } from "react";
import { InventoryItem } from "../components/DraggableInventoryItem.jsx";
import { useDrop } from "react-dnd";
import * as Styled from "./PrepChartTempStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import Table from "../components/TableBuilder.jsx";
import { PrepChartTemplateAPI } from "../apis/PrepChartTemplateAPI.jsx";
import { FaRegSave } from "react-icons/fa";
import SearchBar from "../components/SearchBar.jsx";
import UnitModal from "../components/UnitModal.jsx";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaArrowDownWideShort, FaArrowUpShortWide } from "react-icons/fa6";
import ExportOptions from "../components/ExportOptions.jsx";
import { AreaAPI } from "../apis/AreaAPI.jsx";
import { UnitAPI } from "../apis/UnitAPI.jsx";

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
  const [selectedUnitName, setSelectedUnitName] = useState("No Store Selected");
  const [selectedUnit, setSelectedUnit] = useState();
  const [prepChartTemplateID, setPrepChartTemplateID] = useState();

  useEffect(() => {
    todayItemRef.current = todayItem;
    TomorrowItemRef.current = TomorrowItem;
    NextDayItemmRef.current = NextDayItem;
  }, [todayItem, TomorrowItem, NextDayItem]);

  useEffect(() => {
    if (!selectedUnit) {
      console.log("testing");
      let parameters = decodeURIComponent(window.location.search.replace("?data=", ""));
      if (parameters)
        parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID(1021);
      parameters ? setSelectedUnit(parameters.User_DefaultUnitID) : setSelectedUnit(51);
      fetchData(1021, 51);
    }
    else {
      fetchData(companyID, selectedUnit); // Call fetchData function on component mount
    }
  }, []);

  const fetchData = (companyID, selectedUnit) => {
    setIsLoading(true); // Set loading to true before fetching data
    PrepChartTemplateAPI.get(companyID, selectedUnit)
      .then((data) => {
        setPrepChartTemplateID(data.prepChartTemplateID);
        insertData(data);
        console.log(data);
        setIsLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set loading to false if there's an error
      });
    PrepChartTemplateAPI.getInventoryItems(companyID)
      .then((data) => {
        buildPrepMasterTable(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const insertData = (data) => {
    setTodayItem(data.prepChartTemplate.find((item) => item.prepGroupKey === "Today").inventoryItemList);
    setTomorrowItem(data.prepChartTemplate.find((item) => item.prepGroupKey === "Tomorrow").inventoryItemList);
    setNextDayItem(data.prepChartTemplate.find((item) => item.prepGroupKey === "Next Day").inventoryItemList);
  };
  const buildPrepMasterTable = (prepChartSection) => {
    setMasterTable({
      ...prepTableStructure,
      rows: prepChartSection,
    });
    ItemList = prepChartSection;
    setFilteredItem(prepChartSection); // Initially, set filtered rows to all rows
    console.log("Item List",prepChartSection)
  };

  const SearchItem = (keyword) => {
    const filtered = MasterTable.rows.filter(
      (item) =>
        (item.description &&
          item.description.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.inventoryItemID && item.inventoryItemID.toString()
            .toLowerCase()
            .includes(keyword.toLowerCase()))
    );
    setFilteredItem(filtered);
    console.log("Filterd Item List",filtered)
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
      const DropToDayItem = ItemList.filter(
        (Items) =>
          inventoryItemID === Items.inventoryItemID &&
          todayItem.inventoryItemID != inventoryItemID
      );
      setTodayItem((todayItem) => [...todayItem, DropToDayItem[0]]);
    }
    
  };

  const DropTomorrow = (inventoryItemID) => {
    const isDuplicate = TomorrowItemRef.current.some(
      (item) => item.inventoryItemID === inventoryItemID
    );
    if (!isDuplicate) {
      const DropTomorrowItem = ItemList.filter(
        (Items) => inventoryItemID === Items.inventoryItemID
      );
      setTomorrowItem((TomorrowItem) => [...TomorrowItem, DropTomorrowItem[0]]);
    }
  };

  const DropNextDay = (inventoryItemID) => {
    const isDuplicate = NextDayItemmRef.current.some(
      (item) => item.inventoryItemID === inventoryItemID
    );
    if (!isDuplicate) {
      const DropNextDayItem = ItemList.filter(
        (Items) => inventoryItemID === Items.inventoryItemID
      );
      setNextDayItem((NextDayItem) => [...NextDayItem, DropNextDayItem[0]]);
    }
  };

  const handleReorder = (items, setItems) => (dragIndex, hoverIndex) => {
    const draggedItem = items[dragIndex];
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems(...dragIndex, 1);
      newItems(...hoverIndex, 0, draggedItem);
      return newItems;
    });
  };

  const handleUnitSelectorClick = () => {
    setShowModal(true); // Open the modal when UnitSelector is clicked
  };

  // Function to handle sorting by Inventory ID
  const sortItemsByInventoryID = (items) => {
    return items.sort((a, b) => a.inventoryItemID - b.inventoryItemID);
  };

  // Function to handle sorting by description
  const sortItemsBydescription = (items) => {
    return items.sort((a, b) => a.description.localeCompare(b.description));
  };

  // Function to toggle sorting order and reorder items
  const handleSorting = (sortBy, setItems, items, sortOrder, setSortOrder) => {
    let sortedItems;
    if (sortBy === "InventoryID") {
      sortedItems =
        sortOrder === "asc"
          ? sortItemsByInventoryID(items)
          : sortItemsByInventoryID(items).reverse();
    } else if (sortBy === "description") {
      sortedItems =
        sortOrder === "asc"
          ? sortItemsBydescription(items)
          : sortItemsBydescription(items).reverse();
    }
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setItems(sortedItems);
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

  const handleUnitSelection = (selectedUnitName) => {
    setSelectedUnitName(selectedUnitName);
    setShowModal(false); // Close the date modal after selection
  };

  const handleSave = () => {
    const prepChartTemplate = constructPrepChartTemplate();
  }

  function constructPrepChartTemplate() {
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
      unitIDList: [selectedUnit],
      prepChartTemplateID: prepChartTemplateID,
      prepChartTemplate: prepChartTemplate,
    }
    return PrepChartTemplateAPI.save(json);
}


  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart Template</Styled.PageTitle>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <Styled.OptionsRow>
            <Styled.DateAndUnitContainer>
              <UnitSelector
                onClick={handleUnitSelectorClick}
                UnitName={selectedUnitName}
              />
              <UnitModal
                show={showModal}
                handleClose={() => {
                  setShowModal(false);
                }}
                handleUnitSelection={handleUnitSelection}
              />
            </Styled.DateAndUnitContainer>
            <Styled.SaveOptionsContainer>
              <ExportOptions
                includeSave={true}
                handleSaveClick={handleSave}
              />
            </Styled.SaveOptionsContainer>
          </Styled.OptionsRow>

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
                />

              </Styled.TableLeft> 
            </Styled.InventoryItemsContainer>

            <Styled.TableRight>
              <Styled.RightTblMarg>
                <Styled.TableHeaderTop>Today</Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropToday}
                    style={{ border: isOverToday ? "1px solid red" : "" }}
                  >
                    <Styled.TableHeaderRight>
                      <Styled.TableHeaderCell
                        onClick={() =>
                          handleSorting(
                            "InventoryID",
                            setTodayItem,
                            todayItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        Inventory ID{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell
                        onClick={() =>
                          handleSorting(
                            "description",
                            setTodayItem,
                            todayItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        description{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {todayItem.length > 0 ? "" : placeholder}
             
                    {todayItem.map((item) => (
                      <div key={item.inventoryItemID}> 
                        <InventoryItem
                          key={item.inventoryItemID}
                          inventoryItemID={item.inventoryItemID}
                          description={item.description.trim()}
                          moveItem={() =>
                            handleReorder(todayItem, setTodayItem)
                          }
                          columnIndex={item.inventoryItemID}
                        />
                        <FaRegTrashAlt
                          className="delete"
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
                      <Styled.TableHeaderCell
                        onClick={() =>
                          handleSorting(
                            "InventoryID",
                            setTomorrowItem,
                            TomorrowItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        Inventory ID{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell
                        onClick={() =>
                          handleSorting(
                            "description",
                            setTomorrowItem,
                            TomorrowItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        description{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {TomorrowItem.length > 0 ? "" : placeholder}
                    {TomorrowItem.map((item) => (
                      <div key={item.inventoryItemID}>
                        <InventoryItem
                          key={item.inventoryItemID}
                          inventoryItemID={item.inventoryItemID}
                          description={item.description.trim()}
                          moveItem={handleReorder(
                            TomorrowItem,
                            setTomorrowItem
                          )}
                          columnIndex={item.inventoryItemID}
                        />
                        <FaRegTrashAlt
                          className="delete"
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
                      <Styled.TableHeaderCell
                        onClick={() =>
                          handleSorting(
                            "InventoryID",
                            setNextDayItem,
                            NextDayItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        Inventory ID{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell
                        onClick={() =>
                          handleSorting(
                            "description",
                            setNextDayItem,
                            NextDayItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        description{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {NextDayItem.length > 0 ? "" : placeholder}
                    {NextDayItem.map((item) => (
                      <div key={item.inventoryItemID}>
                        <InventoryItem
                          key={item.inventoryItemID}
                          inventoryItemID={item.inventoryItemID}
                          description={item.description}
                          moveItem={handleReorder(NextDayItem, setNextDayItem)}
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
