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
import { FaArrowDownWideShort,FaArrowUpShortWide } from "react-icons/fa6";

var ItemList = [];
const placeholder = "  Column drop here .....";
const prepTableStructure = {
  columnHeaders: ["Inventory ID", "Description", "Thaw Time (Hrs)"],
  columnWidths: "1fr 3fr 1fr",
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
  const [sortOrder, setSortOrder] = useState('asc');


  useEffect(() => {
    todayItemRef.current = todayItem;
    TomorrowItemRef.current = TomorrowItem;
    NextDayItemmRef.current = NextDayItem;
  }, [todayItem, TomorrowItem, NextDayItem]);

  useEffect(() => {
    fetchData(); // Call fetchData function on component mount
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
  if (sortBy === 'InventoryID') {
    sortedItems = sortOrder === 'asc' ? sortItemsByInventoryID(items) : sortItemsByInventoryID(items).reverse();
  } else if (sortBy === 'Description') {
    sortedItems = sortOrder === 'asc' ? sortItemsByDescription(items) : sortItemsByDescription(items).reverse();
  }
  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  setItems(sortedItems);
};

// Function to handle row deletion
const handleDelete = (InventoryItemID, day) => {
   // Determine which list to update based on the 'day' parameter
  let updatedItems;
  switch (day) {
    case 'today':
      updatedItems = todayItem.filter(item => item.InventoryItemID !== InventoryItemID);
      setTodayItem(updatedItems);
      break;
    case 'tomorrow':
      updatedItems = TomorrowItem.filter(item => item.InventoryItemID !== InventoryItemID);
      setTomorrowItem(updatedItems);
      break;
    case 'nextDay':
      updatedItems = NextDayItem.filter(item => item.InventoryItemID !== InventoryItemID);
      setNextDayItem(updatedItems);
      break;
    default:
      break;
  }
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
              <UnitSelector onClick={handleUnitSelectorClick} />
              <Modal show={showModal} handleClose={() => setShowModal(false)}>
                {/* Content of your modal */}
                           
              </Modal>
            </Styled.DateAndUnitContainer>
            <Styled.SaveOptionsContainer>
              <Styled.SaveOption>
                <Styled.OptionImage>
                  <FaRegSave className="btn-save" />
                </Styled.OptionImage>
              </Styled.SaveOption>
            </Styled.SaveOptionsContainer>
          </Styled.OptionsRow>

          <div className="search-bar">
            <h2 style={{ display: "contents" }}>Inventory Items</h2>
            <SearchBar
              list={MasterTable.rows}
              onSearch={(keyword) => SearchItem(keyword)}
            />
            <h2>Today </h2>
          </div>

          <div className="container">
            <Styled.TableLeft>
              <Table
                columnHeaders={MasterTable.columnHeaders}
                columnwidths={MasterTable.columnWidths}
                rows={
                  filteredItem.length > 0
                    ? filteredItem
                    : [{ Description: "No data found " }]
                }
                isDrag={true}
              />
            </Styled.TableLeft>
            <Styled.TableRight>
              <Styled.RightTblMarg>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropToday}
                    style={{ border: isOverToday ? "1px solid red" : "" }}
                  >
                    <Styled.TableHeaderRight>
                      <Styled.TableHeaderCell onClick={() => handleSorting('InventoryID', setTodayItem, todayItem, sortOrder, setSortOrder)}>
                        Inventory ID{" "}
                        {sortOrder === 'asc' ? <FaArrowDownWideShort className="asc"  /> : <FaArrowUpShortWide className="desc"  />}
                        
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell onClick={() => handleSorting('Description', setTodayItem, todayItem, sortOrder, setSortOrder)}>
                        Description{" "}
                        {sortOrder === 'asc' ? <FaArrowDownWideShort className="asc"  /> : <FaArrowUpShortWide className="desc"  />}
                        
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {todayItem.length > 0 ? "" : placeholder}
                    {todayItem.map((item, index) => (
                      <>
                      <InventoryItem
                        key={item.InventoryItemID}
                        InventoryItemID={item.InventoryItemID}
                        Description={item.Description}
                        moveItem={() => handleReorder(todayItem, setTodayItem)}
                        columnIndex={index}
                      />
                      <FaRegTrashAlt className="delete" onClick={() => handleDelete(item.InventoryItemID,'today')} />
                      </>
                      
                    ))}
                  </div>
                </Styled.Table>
              </Styled.RightTblMarg>

              <Styled.RightTblMarg>
                <Styled.TableHeaderTop>
                  <h2>Tomorrow</h2>
                </Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropTomorrow}
                    style={{ border: isOverTomorrow ? "1px solid red" : "" }}
                  >
                    <Styled.TableHeaderRight>
                      <Styled.TableHeaderCell onClick={() => handleSorting('InventoryID', setTomorrowItem, TomorrowItem, sortOrder, setSortOrder)}>
                        Inventory ID{" "}
                        {sortOrder === 'asc' ? <FaArrowDownWideShort className="asc"  /> : <FaArrowUpShortWide className="desc"  />}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell onClick={() => handleSorting('Description', setTomorrowItem, TomorrowItem, sortOrder, setSortOrder)}>
                      Description{" "}
                        {sortOrder === 'asc' ? <FaArrowDownWideShort className="asc"  /> : <FaArrowUpShortWide className="desc"  />}
                        
                      </Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {TomorrowItem.length > 0 ? "" : placeholder}
                    {TomorrowItem.map((item, index) => (
                      <>
                      <InventoryItem
                        key={item.InventoryItemID}
                        InventoryItemID={item.InventoryItemID}
                        Description={item.Description}
                        moveItem={handleReorder(TomorrowItem, setTomorrowItem)}
                        columnIndex={index}
                      />
                      <FaRegTrashAlt className="delete" onClick={() => handleDelete(item.InventoryItemID,'tomorrow')} />
                      </>
                    ))}
                  </div>
                </Styled.Table>
              </Styled.RightTblMarg>
              <Styled.RightTblMarg>
                <Styled.TableHeaderTop>
                  <h2>Next Day</h2>
                </Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropNextDay}
                    style={{ border: isOverNextDay ? "1px solid red" : "" }}
                  >
                    <Styled.TableHeaderRight>
                      <Styled.TableHeaderCell onClick={() => handleSorting('InventoryID', setNextDayItem, NextDayItem, sortOrder, setSortOrder)}>
                      Inventory ID{" "}
                        {sortOrder === 'asc' ? <FaArrowDownWideShort className="asc"  /> : <FaArrowUpShortWide className="desc"  />}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell onClick={() => handleSorting('Description', setNextDayItem, NextDayItem, sortOrder, setSortOrder)}>
                      Description{" "}
                        {sortOrder === 'asc' ? <FaArrowDownWideShort className="asc"  /> : <FaArrowUpShortWide className="desc"  />}
                        
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
                      <FaRegTrashAlt className="delete" onClick={() => handleDelete(item.InventoryItemID,'nextDay')} />
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
