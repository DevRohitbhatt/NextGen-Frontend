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
import Modal from "../components/Modal.jsx";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaArrowDownWideShort, FaArrowUpShortWide } from "react-icons/fa6";
import ExportOptions from "../components/ExportOptions.jsx";
import { UnitAPI } from "../apis/UnitAPI.jsx";
import SearchUnit from "../components/SearchUnit.jsx";

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
  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelecteUnit] = useState("");
  const [SelecteUnitName, setSelecteUnitName] = useState("");
  const [filteredUnit, setFilteredUnit] = useState([]);
  const [IsActive, setIsActive] = useState([]);

  useEffect(() => {
    todayItemRef.current = todayItem;
    TomorrowItemRef.current = TomorrowItem;
    NextDayItemmRef.current = NextDayItem;
  }, [todayItem, TomorrowItem, NextDayItem]);

  useEffect(() => {
    fetchData(); // Call fetchData function on component mount
    GetUnitList();
  }, []);

  const fetchData = () => {
    setIsLoading(true); // Set loading to true before fetching data
    PrepChartTemplateAPI.get(1, 1)
      .then((data) => {
        buildPrepMasterTable(data.InventoryList);
        setIsLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set loading to false if there's an error
      });
  };

  const GetUnitList = () => {
    UnitAPI.get(1, 1)
      .then((data) => {
        UnitListItem(data.Units);
        if (data.Units.length > 0) {
          setSelecteUnit(data.Units[0].UnitID);
          setSelecteUnitName(data.Units[0].Name);
          setIsActive(data.Units[0].UnitID);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const UnitListItem = (UnitItem) => {
    setUnitsList({
      rows: UnitItem,
    });
    setFilteredUnit(UnitItem); // Initially, set filtered rows to all rows
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
        (item.Description &&
          item.Description.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.InventoryItemID &&
          item.InventoryItemID.toString()
            .toLowerCase()
            .includes(keyword.toLowerCase())) ||
        (item.ThawTime &&
          item.ThawTime.toString()
            .toLowerCase()
            .includes(keyword.toLowerCase()))
    );
    setFilteredItem(filtered);
  };

  const SearchUnitItem = (keyword) => {
    const filtered = unitsList.rows.filter(
      (item) =>
        (item.Name &&
          item.Name.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.UnitID &&
          item.UnitID.toString().toLowerCase().includes(keyword.toLowerCase()))
    );
    setFilteredUnit(filtered);
  };

  const [{ isOverToday }, dropToday] = useDrop(() => ({
    accept: "content",
    drop: (item) => DropToday(item.InventoryItemID),
    collect: (monitor) => ({
      isOverToday: !!monitor.isOver(),
    }),
  }));

  const [{ isOverTomorrow }, dropTomorrow] = useDrop(() => ({
    accept: "content",
    drop: (item) => DropTomorrow(item.InventoryItemID),
    collect: (monitor) => ({
      isOverTomorrow: !!monitor.isOver(),
    }),
  }));

  const [{ isOverNextDay }, dropNextDay] = useDrop(() => ({
    accept: "content",
    drop: (item) => DropNextDay(item.InventoryItemID),
    collect: (monitor) => ({
      isOverNextDay: !!monitor.isOver(),
    }),
  }));

  const DropToday = (InventoryItemID) => {
    const isDuplicate = todayItemRef.current.some(
      (item) => item.InventoryItemID === InventoryItemID
    );
    if (!isDuplicate) {
      const DropToDayItem = ItemList.filter(
        (Items) =>
          InventoryItemID === Items.InventoryItemID &&
          todayItem.InventoryItemID != InventoryItemID
      );
      setTodayItem((todayItem) => [...todayItem, DropToDayItem[0]]);
    }
  };

  const DropTomorrow = (InventoryItemID) => {
    const isDuplicate = TomorrowItemRef.current.some(
      (item) => item.InventoryItemID === InventoryItemID
    );
    if (!isDuplicate) {
      const DropTomorrowItem = ItemList.filter(
        (Items) => InventoryItemID === Items.InventoryItemID
      );
      setTomorrowItem((TomorrowItem) => [...TomorrowItem, DropTomorrowItem[0]]);
    }
  };

  const DropNextDay = (InventoryItemID) => {
    const isDuplicate = NextDayItemmRef.current.some(
      (item) => item.InventoryItemID === InventoryItemID
    );
    if (!isDuplicate) {
      const DropNextDayItem = ItemList.filter(
        (Items) => InventoryItemID === Items.InventoryItemID
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
    return items.sort((a, b) => a.InventoryItemID - b.InventoryItemID);
  };

  // Function to handle sorting by Description
  const sortItemsByDescription = (items) => {
    return items.sort((a, b) => a.Description.localeCompare(b.Description));
  };

  // Function to toggle sorting order and reorder items
  const handleSorting = (sortBy, setItems, items, sortOrder, setSortOrder) => {
    let sortedItems;
    if (sortBy === "InventoryID") {
      sortedItems =
        sortOrder === "asc"
          ? sortItemsByInventoryID(items)
          : sortItemsByInventoryID(items).reverse();
    } else if (sortBy === "Description") {
      sortedItems =
        sortOrder === "asc"
          ? sortItemsByDescription(items)
          : sortItemsByDescription(items).reverse();
    }
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setItems(sortedItems);
  };

  // Function to handle row deletion
  const handleDelete = (InventoryItemID, day) => {
    // Determine which list to update based on the 'day' parameter
    let updatedItems;
    switch (day) {
      case "today":
        updatedItems = todayItem.filter(
          (item) => item.InventoryItemID !== InventoryItemID
        );
        setTodayItem(updatedItems);
        break;
      case "tomorrow":
        updatedItems = TomorrowItem.filter(
          (item) => item.InventoryItemID !== InventoryItemID
        );
        setTomorrowItem(updatedItems);
        break;
      case "nextDay":
        updatedItems = NextDayItem.filter(
          (item) => item.InventoryItemID !== InventoryItemID
        );
        setNextDayItem(updatedItems);
        break;
      default:
        break;
    }
  };

  const handleUnitSelectChange = (event) => {
    setSelecteUnit(event.target.value);
    const UnitId = event.target.value;
    const selectedText = event.target.textContent;
    // Set the selected text to the state variable
    setSelecteUnitName(selectedText);

    // UnitAPI.get(1, UnitId)
    // .then((data) => {
    //   buildPrepMasterTable(data.InventoryList);
    //   setIsLoading(false); // Set loading to false after data is fetched
    // })
    // .catch((error) => {
    //   console.error("Error fetching data:", error);
    //   setIsLoading(false); // Set loading to false if there's an error
    // });
  };
  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart Template</Styled.PageTitle>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <Styled.OptionsRow>
            <Styled.DateAndUnitContainer>
              <UnitSelector onClick={handleUnitSelectorClick} UnitName={SelecteUnitName} />
              <Modal
                show={showModal}
                handleClose={() => {
                  setShowModal(false);
                  SearchUnitItem("");
                }}
              >
                <Styled.PopupContainer>
                  <Styled.LeftUnitList>
                    <label>Filter</label>
                    <Styled.InputGroup>
                      <SearchUnit
                        list={unitsList}
                        onSearch={(keyword) => SearchUnitItem(keyword)}
                      />
                    </Styled.InputGroup>
                    <div className="unitList">
                      <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                        {filteredUnit.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => setIsActive(item.UnitID)}
                            value={item.UnitID}
                            className={IsActive === item.UnitID ? "active" : ""}
                          >
                            {item.Name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Styled.LeftUnitList>
                  <Styled.RightUnitList>
                    <Styled.Span>{SelecteUnitName}</Styled.Span>
                    <div className="unitList">
                      <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                        {filteredUnit.map((item, index) => (
                          <li key={index} value={item.UnitID}>
                            {item.Name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Styled.RightUnitList>
                </Styled.PopupContainer>
              </Modal>
            </Styled.DateAndUnitContainer>
            <Styled.SaveOptionsContainer>
              <ExportOptions
                includeSave={true}
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
                      : [{ Description: "No data found " }]
                  }
                  isDrag={true}
                  usetablerows={true}
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
                            "Description",
                            setTodayItem,
                            todayItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        Description{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {todayItem.length > 0 ? "" : placeholder}
                    {todayItem.map((item, index) => (
                      <>
                        <InventoryItem
                          key={item.InventoryItemID}
                          InventoryItemID={item.InventoryItemID}
                          Description={item.Description}
                          moveItem={() =>
                            handleReorder(todayItem, setTodayItem)
                          }
                          columnIndex={index}
                        />
                        <FaRegTrashAlt
                          className="delete"
                          onClick={() =>
                            handleDelete(item.InventoryItemID, "today")
                          }
                        />
                      </>
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
                            "Description",
                            setTomorrowItem,
                            TomorrowItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        Description{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {TomorrowItem.length > 0 ? "" : placeholder}
                    {TomorrowItem.map((item, index) => (
                      <>
                        <InventoryItem
                          key={item.InventoryItemID}
                          InventoryItemID={item.InventoryItemID}
                          Description={item.Description}
                          moveItem={handleReorder(
                            TomorrowItem,
                            setTomorrowItem
                          )}
                          columnIndex={index}
                        />
                        <FaRegTrashAlt
                          className="delete"
                          onClick={() =>
                            handleDelete(item.InventoryItemID, "tomorrow")
                          }
                        />
                      </>
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
                            "Description",
                            setNextDayItem,
                            NextDayItem,
                            sortOrder,
                            setSortOrder
                          )
                        }
                      >
                        Description{" "}
                        {sortOrder === "asc" ? (
                          <FaArrowDownWideShort className="asc" />
                        ) : (
                          <FaArrowUpShortWide className="desc" />
                        )}
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {NextDayItem.length > 0 ? "" : placeholder}
                    {NextDayItem.map((item, index) => (
                      <>
                        <InventoryItem
                          key={item.InventoryItemID}
                          InventoryItemID={item.InventoryItemID}
                          Description={item.Description}
                          moveItem={handleReorder(NextDayItem, setNextDayItem)}
                          columnIndex={index}
                        />
                        <FaRegTrashAlt
                          className="delete"
                          onClick={() =>
                            handleDelete(item.InventoryItemID, "nextDay")
                          }
                        />
                      </>
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
