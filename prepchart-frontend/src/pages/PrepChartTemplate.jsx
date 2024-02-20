import React, { useEffect, useState } from 'react';
import { InventoryItem } from '../components/DraggableInventoryItem.jsx';
import { useDrop } from 'react-dnd';
import * as Styled from "./PrepChartTempStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import Table from "../components/TableBuilder.jsx";
import { PrepChartTempAPI } from "../apis/PrepChartTempAPI.jsx";
import { FaRegSave } from "react-icons/fa";

var ItemList = [];


const prepTableStructure = {
  columnHeaders : [
    "Inventory ID",
    "Description",
    "Thaw Time (Hrs)",
  ],
  columnWidths : "1.5fr 2fr 1fr",
  rows : [],
};

export default function PrepChartTemplate() {
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [todayItem, setTodayItem] = useState([])
    const [TomorrowItem, setTomorrowItem] = useState([])
    const [NextDayItem, setNextDayItem] = useState([])
    const [MasterTable, setMasterTable] = useState({
      ...prepTableStructure,
    });
    const [filteredRows, setFilteredRows] = useState([]);

    useEffect(() => {
      setIsLoading(true);
      PrepChartTempAPI.get(1, 1).then((data) => {
        buildPrepMasterTable(data.InventoryList,setMasterTable);
        setIsLoading(false);
      });
    }, []);
   
    const buildPrepMasterTable = (prepChartSection, setMasterTable) => {
      const rows = prepChartSection.map((item) => {
        return item;
      });
      
      setMasterTable({
        ...MasterTable,
        rows: rows,
        
      });
      ItemList = rows;   
      filterRows();   
    };

    const filterRows = () => {
      const filtered = MasterTable.rows.filter((item) =>
        item.Description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRows(filtered);
    };
  
    const handleSearchInputChange = (event) => {
      setSearchQuery(event.target.value);
    };
  
    useEffect(() => {
      filterRows();
    }, [searchQuery,MasterTable.rows]);
  
    const [{isOverToday}, dropToday] = useDrop(() => ({
        accept: "content",
        drop: (item) => DropToday(item.InventoryItemID),
        collect: (monitor) => ({
          isOverToday: !!monitor.isOver(),
        }),
    }))
  
    const [{isOverTomorrow}, dropTomorrow] = useDrop(() => ({
        accept: "content",
        drop: (item) => DropTomorrow(item.InventoryItemID),
        collect: (monitor) => ({
          isOverTomorrow: !!monitor.isOver(),
        }),
    }))
    
    const [{isOverNextDay}, dropNextDay] = useDrop(() => ({
        accept: "content",
        drop: (item) => DropNextDay(item.InventoryItemID),
        collect: (monitor) => ({
          isOverNextDay: !!monitor.isOver(),
        }),
    }))
    
    const DropToday  = (InventoryItemID) => {
        const DropToDayItem = ItemList.filter(Items => InventoryItemID === Items.InventoryItemID)
        setTodayItem(todayItem => [...todayItem, DropToDayItem[0]])
    }

    const DropTomorrow = (InventoryItemID) => {
            const DropTomorrowItem = ItemList.filter(Items => InventoryItemID === Items.InventoryItemID)
            setTomorrowItem(TomorrowItem => [...TomorrowItem, DropTomorrowItem[0]])
        }
      
   const DropNextDay = (InventoryItemID) => {
          const DropNextDayItem = ItemList.filter(Items => InventoryItemID === Items.InventoryItemID)
          setNextDayItem(NextDayItem => [...NextDayItem, DropNextDayItem[0]])
      }
     
    const Today = todayItem.map(Items => <InventoryItem Description={Items.Description} ThawTime={Items.ThawTime} />)

    const Tomorrow = TomorrowItem.map(Items => <InventoryItem Description={Items.Description} ThawTime={Items.ThawTime} />)
    
    const NextDay = NextDayItem.map(Items => <InventoryItem Description={Items.Description} ThawTime={Items.ThawTime} />)
    
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
          
          <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInputChange} className='Search'
            />
            <Styled.SaveOption>
            <Styled.OptionImage>
              <FaRegSave className='btn-save' />
            </Styled.OptionImage>
            
          </Styled.SaveOption>
        </Styled.SaveOptionsContainer>
       
      </Styled.OptionsRow>
      
        <div className='container'>
        <Styled.TableLeft>
          <Styled.TableTitle>Inventory Items</Styled.TableTitle>
        <Table
            columnHeaders={MasterTable.columnHeaders}
            columnwidths={MasterTable.columnWidths}
            rows={filteredRows}
            isDrag={true}
          />
        </Styled.TableLeft>
        <Styled.TableRight>
      <Styled.RightTblMarg>
      <Styled.TableHeaderTop>
        <Styled.TableHeaderCell>Today</Styled.TableHeaderCell>
        </Styled.TableHeaderTop>
        <Styled.Table>
          
        <div className='drop-board' draggable="false" ref={dropToday} style={{border: isOverToday ? '1px solid red' : ''}} >
        
        <Styled.TableHeaderRight>
          <Styled.TableHeaderCell>Prep Period	</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
        </Styled.TableHeaderRight>
                {Today}
            </div>
       </Styled.Table>
       </Styled.RightTblMarg>
       
       <Styled.RightTblMarg>
       <Styled.TableHeaderTop>
        <Styled.TableHeaderCell>Tomorrow</Styled.TableHeaderCell>
        </Styled.TableHeaderTop>
      <Styled.Table>
      <div className='drop-board' ref={dropTomorrow}  style={{border: isOverTomorrow ? '1px solid red' : ''} } >
      
        <Styled.TableHeaderRight>
          <Styled.TableHeaderCell>Prep Period	</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
        </Styled.TableHeaderRight>
        {Tomorrow}
        </div>
        </Styled.Table>
      </Styled.RightTblMarg>
      <Styled.RightTblMarg>
      <Styled.TableHeaderTop>
        <Styled.TableHeaderCell>Next Day</Styled.TableHeaderCell>
        </Styled.TableHeaderTop>
      <Styled.Table>
      <div className='drop-board' ref={dropNextDay} style={{border: isOverNextDay ? '1px solid red' : ''}} >
      
        <Styled.TableHeaderRight>
          <Styled.TableHeaderCell>Prep Period	</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
        </Styled.TableHeaderRight>
        {NextDay}
        </div>
        </Styled.Table>
      </Styled.RightTblMarg>
      </Styled.TableRight>
        </div>
       </div>
    )}
        </Styled.PageContainer>
    )
}