import { useEffect, useState } from "react";
import { InventoryItem } from "../components/DraggableInventoryItem.jsx";
import { useDrop } from "react-dnd";
import * as Styled from "./PrepChartTempStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import Table from "../components/TableBuilder.jsx";
import { PrepChartTempAPI } from "../apis/PrepChartTemplateAPI.jsx";
import { FaRegSave } from "react-icons/fa";
import SearchBar from "../components/SearchBar.jsx";

var ItemList = [];
const placeholder = "  Column drop here .....";
const prepTableStructure = {
  columnHeaders: ["Inventory ID", "Description", "Thaw Time (Hrs)"],
  columnWidths: "1.5fr 2fr 1fr",
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

  useEffect(() => {
    fetchData(); // Call fetchData function on component mount
  }, []);

  const fetchData = () => {
    setIsLoading(true); // Set loading to true before fetching data
    PrepChartTempAPI.get(1, 1)
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
    const DropToDayItem = ItemList.filter(
      (Items) => InventoryItemID === Items.InventoryItemID
    );
    setTodayItem((todayItem) => [...todayItem, DropToDayItem[0]]);
  };

  const DropTomorrow = (InventoryItemID) => {
    const DropTomorrowItem = ItemList.filter(
      (Items) => InventoryItemID === Items.InventoryItemID
    );
    setTomorrowItem((TomorrowItem) => [...TomorrowItem, DropTomorrowItem[0]]);
  };

  const DropNextDay = (InventoryItemID) => {
    const DropNextDayItem = ItemList.filter(
      (Items) => InventoryItemID === Items.InventoryItemID
    );
    setNextDayItem((NextDayItem) => [...NextDayItem, DropNextDayItem[0]]);
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

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart Template</Styled.PageTitle>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <Styled.OptionsRow>
            <Styled.DateAndUnitContainer>
              <UnitSelector />
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
                hideInventoryItemID={true} // pass a prop to indicate if InventoryItemID should be hidden
              />
            </Styled.TableLeft>
            <Styled.TableRight>
              <Styled.RightTblMarg>
                <Styled.TableHeaderTop>
                  <h2>Today </h2>
                </Styled.TableHeaderTop>
                <Styled.Table>
                  <div
                    className="drop-board"
                    ref={dropToday}
                    style={{ border: isOverToday ? "1px solid red" : "" }}
                  >
                    <Styled.TableHeaderRight>
                      <Styled.TableHeaderCell>
                        Prep Period{" "}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {todayItem.length > 0 ? "" : placeholder}
                    {todayItem.map((item, index) => (
                      <InventoryItem
                        key={item.InventoryItemID}
                        InventoryItemID={item.InventoryItemID}
                        Description={item.Description}
                        ThawTime={item.ThawTime}
                        moveItem={() => handleReorder(todayItem, setTodayItem)}
                        columnIndex={index}
                        hideInventoryItemID={true} // pass a prop to indicate if InventoryItemID should be hidden
                      />
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
                      <Styled.TableHeaderCell>
                        Prep Period{" "}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {TomorrowItem.length > 0 ? "" : placeholder}
                    {TomorrowItem.map((item, index) => (
                      <InventoryItem
                        key={item.InventoryItemID}
                        InventoryItemID={item.InventoryItemID}
                        Description={item.Description}
                        ThawTime={item.ThawTime}
                        moveItem={handleReorder(TomorrowItem, setTomorrowItem)}
                        columnIndex={index}
                        hideInventoryItemID={true}
                      />
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
                      <Styled.TableHeaderCell>
                        Prep Period{" "}
                      </Styled.TableHeaderCell>
                      <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
                    </Styled.TableHeaderRight>
                    {NextDayItem.length > 0 ? "" : placeholder}
                    {NextDayItem.map((item, index) => (
                      <InventoryItem
                        key={item.InventoryItemID}
                        InventoryItemID={item.InventoryItemID}
                        Description={item.Description}
                        ThawTime={item.ThawTime}
                        moveItem={handleReorder(NextDayItem, setNextDayItem)}
                        columnIndex={index}
                        hideInventoryItemID={true}
                      />
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
