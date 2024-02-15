import React, { useEffect, useState } from 'react';
import { InventoryItem } from '../components/DraggableInventoryItem.jsx';
import { useDrop } from 'react-dnd';
import * as Styled from "./PrepChartTempStyles.jsx";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import SaveIcon from '@mui/icons-material/Save';
import Table from "../components/TableBuilder.jsx";
import { PrepChartTempAPI } from "../apis/PrepChartTempAPI.jsx";

var IteamList = [];


const prepTableStructure = {
  columnHeaders : [
    "Inventory ID",
    "Description",
    "Thaw Time (Hrs)",
  ],
  columnWidths : "1.5fr 2fr 1fr",
  rows : [],
};

//const MasterList= IteamList.map((Iteams) =>( <InventoryItem Description={Iteams.Description} InventoryItemID={Iteams.InventoryItemID}  ThawTime={Iteams.ThawTime} />));


export default function PrepChartTemplate() {
  
    const [isLoading, setIsLoading] = useState(false);

    const [todayIteam, setTodayIteam] = useState([])
    const [TomorrowIteam, setTomorrowIteam] = useState([])
    const [NextDayIteam, setNextDayIteam] = useState([])
   
    const [MasterTable, setMasterTable] = useState({
      ...prepTableStructure,
    });

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


      IteamList = rows;
      
      
    };
    const [{isOver}, droptody] = useDrop(() => ({
        accept: "content",
        drop: (item) => DropToDay(item.InventoryItemID),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }))
    
    const [{isOvert}, droptmorrw] = useDrop(() => ({
        accept: "content",
        drop: (item) => DropTomorrow(item.InventoryItemID),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }))
    
    const [{isOvern}, dropnext] = useDrop(() => ({
        accept: "content",
        drop: (item) => DropNextDay(item.InventoryItemID),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }))
    
    const DropToDay = (InventoryItemID) => {
        const DropToDayIteam = IteamList.filter(Iteams => InventoryItemID === Iteams.InventoryItemID)
        setTodayIteam(todayIteam => [...todayIteam, DropToDayIteam[0]])
    }

    const DropTomorrow = (InventoryItemID) => {
            const DropTomorrowIteam = IteamList.filter(Iteams => InventoryItemID === Iteams.InventoryItemID)
            setTomorrowIteam(TomorrowIteam => [...TomorrowIteam, DropTomorrowIteam[0]])
        }
      
   const DropNextDay = (InventoryItemID) => {
          const DropNextDayIteam = IteamList.filter(Iteams => InventoryItemID === Iteams.InventoryItemID)
          setNextDayIteam(NextDayIteam => [...NextDayIteam, DropNextDayIteam[0]])
      }

    const Today = todayIteam.map(Iteams => <InventoryItem Description={Iteams.Description} ThawTime={Iteams.ThawTime} />)

    const Tomorrow = TomorrowIteam.map(Iteams => <InventoryItem Description={Iteams.Description} ThawTime={Iteams.ThawTime} />)
    
    const NextDay = NextDayIteam.map(Iteams => <InventoryItem Description={Iteams.Description} ThawTime={Iteams.ThawTime} />)
    
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
              <SaveIcon color="primary"  className='btn-save'   />
              {/* <img src={save} alt="Save" /> */}
            </Styled.OptionImage>
          </Styled.SaveOption>
        </Styled.SaveOptionsContainer>
      </Styled.OptionsRow>
        <div className='container'>
        <Styled.TableLeft>
        {/* <Styled.Table>
         */}
        <Table
            columnHeaders={MasterTable.columnHeaders}
            columnwidths={MasterTable.columnWidths}
            rows={MasterTable.rows}
            isDrag={true}
          />
           
        {/* </Styled.Table> */}
        </Styled.TableLeft>
        <Styled.TableRight>
      <Styled.RightTblMarg>
      <Styled.TableHeaderTop>
        <Styled.TableHeaderCell>Today</Styled.TableHeaderCell>
        </Styled.TableHeaderTop>
        <Styled.Table>
          
        <div className='drop-board' draggable="false" ref={droptody} >
        
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
      <div className='drop-board' ref={droptmorrw} >
      
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
      <div className='drop-board' ref={dropnext} >
      
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

//export default PrepChartTemplate