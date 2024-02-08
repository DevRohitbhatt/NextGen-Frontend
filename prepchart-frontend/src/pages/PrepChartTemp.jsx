import React, { useState } from "react";
import { Picture } from "../components/Picture.jsx";
import { useDrop } from "react-dnd";
import Alldata from "../tempData/PrepChartTemp.json";
import * as Styled from "../pages/PrepChartTempStyles";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector";
import DateSelector from "../components/DateSelector.jsx";

const dragList = [
  {
    InventoryItemID: "30570",
    Description: "CHOCOLATE TOPPING HERSHEY'S 120 OZ",
    ThawTime: 30,
  },
  {
    InventoryItemID: "30571",
    Description: "CHIPOTLE SAUCE - I=A",
    ThawTime: 34,
  },
  {
    InventoryItemID: "30572",
    Description: "SAUCE SRIRACHA 20 OZ BTL - I=A",
    ThawTime: 12,
  },
  {
    InventoryItemID: "30573",
    Description: "(R) 9 Inch Bun",
    ThawTime: 23,
  },
  {
    InventoryItemID: "30574",
    Description: "(R) FRIES-5LB BAGS",
    ThawTime: 0,
  },
  {
    InventoryItemID: "30575",
    Description: "(R) CHICKEN",
    ThawTime: 15,
  },
  {
    InventoryItemID: "30570",
    Description: "CHOCOLATE TOPPING HERSHEY'S 120 OZ",
    ThawTime: 30,
  },
  {
    InventoryItemID: "30571",
    Description: "CHIPOTLE SAUCE - I=A",
    ThawTime: 34,
  },
  {
    InventoryItemID: "30572",
    Description: "SAUCE SRIRACHA 20 OZ BTL - I=A",
    ThawTime: 12,
  },
  {
    InventoryItemID: "30573",
    Description: "(R) 9 Inch Bun",
    ThawTime: 23,
  },
  {
    InventoryItemID: "30574",
    Description: "(R) FRIES-5LB BAGS",
    ThawTime: 0,
  },
  {
    InventoryItemID: "30575",
    Description: "(R) CHICKEN",
    ThawTime: 15,
  },
];
//const data = JSON.parse(JSON.stringify(Alldata));

const pictures = dragList.map((picture) => (
  <Picture
    Description={picture.Description}
    InventoryItemID={picture.InventoryItemID}
    ThawTime={picture.ThawTime}
  />
));
const Cell = ({ value }) => {
  return <Styled.TableCell>{value}</Styled.TableCell>;
};

function Dragdrop() {
  const [date, setDate] = useState(new Date());
  const [board, setBoard] = useState([]);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "content",
    drop: (item) => addImage(item.InventoryItemID),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [boardt, setBoardt] = useState([]);
  const [{ isOvert }, dropt] = useDrop(() => ({
    accept: "content",
    drop: (item) => addImaget(item.InventoryItemID),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [boardn, setBoardn] = useState([]);
  const [{ isOvern }, dropn] = useDrop(() => ({
    accept: "content",
    drop: (item) => addImagen(item.InventoryItemID),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addImage = (InventoryItemID) => {
    const droppedPictures = dragList.filter(
      (picture) => InventoryItemID === picture.InventoryItemID
    );
    setBoard((board) => [...board, droppedPictures[0]]);
  };
  const addImaget = (InventoryItemID) => {
    const droppedPictures = dragList.filter(
      (picture) => InventoryItemID === picture.InventoryItemID
    );
    setBoardt((boardt) => [...boardt, droppedPictures[0]]);
  };

  const addImagen = (InventoryItemID) => {
    const droppedPictures = dragList.filter(
      (picture) => InventoryItemID === picture.InventoryItemID
    );
    setBoardn((boardn) => [...boardn, droppedPictures[0]]);
  };

  const Today = board.map((picture) => (
    <Picture Description={picture.Description} ThawTime={picture.ThawTime} />
  ));

  const Tomorrow = boardt.map((picture) => (
    <Picture Description={picture.Description} ThawTime={picture.ThawTime} />
  ));

  const NextDay = boardn.map((picture) => (
    <Picture Description={picture.Description} ThawTime={picture.ThawTime} />
  ));

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart Template</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector />
          <DateSelector date={date}/>
        </Styled.DateAndUnitContainer>
        {/* <input   type="text"   placeholder="Search here"   onChange={handleChange}   value={searchInput} /> */}
        <Styled.ExportOptionsContainer>
          <Styled.ExportOption>
          </Styled.ExportOption>
        </Styled.ExportOptionsContainer>
      </Styled.OptionsRow>

      <div className="container">
        <Styled.OptionsRowtbl>
          <Styled.Table>
            <Styled.TableHeader>
              <Styled.TableHeaderCell>Inventory ID</Styled.TableHeaderCell>
              <Styled.TableHeaderCell>Description</Styled.TableHeaderCell>
              <Styled.TableHeaderCell>Thaw Time (Hrs)</Styled.TableHeaderCell>
            </Styled.TableHeader>
            <div className="drag-box">{pictures}</div>
          </Styled.Table>
        </Styled.OptionsRowtbl>
        <Styled.Rowright>
          <Styled.DivMargin>
            <Styled.Table>
              <div className="drop-board" ref={drop}>
                <Styled.TableHeaderRight>
                  <Styled.TableHeaderCell>Today</Styled.TableHeaderCell>
                </Styled.TableHeaderRight>
                <Styled.TableHeaderRight>
                  <Styled.TableHeaderCell>Prep Period </Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
                </Styled.TableHeaderRight>
                {Today}
              </div>
            </Styled.Table>
          </Styled.DivMargin>

          <Styled.DivMargin>
            <Styled.Table>
              <div className="drop-board" ref={dropt}>
                <Styled.TableHeaderRight>
                  <Styled.TableHeaderCell>Tomorrow</Styled.TableHeaderCell>
                </Styled.TableHeaderRight>
                <Styled.TableHeaderRight>
                  <Styled.TableHeaderCell>Prep Period </Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
                </Styled.TableHeaderRight>
                {Tomorrow}
              </div>
            </Styled.Table>
          </Styled.DivMargin>
          <Styled.DivMargin>
            <Styled.Table>
              <div className="drop-board" ref={dropn}>
                <Styled.TableHeaderRight>
                  <Styled.TableHeaderCell>Next Day</Styled.TableHeaderCell>
                </Styled.TableHeaderRight>
                <Styled.TableHeaderRight>
                  <Styled.TableHeaderCell>Prep Period </Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Item</Styled.TableHeaderCell>
                </Styled.TableHeaderRight>
                {NextDay}
              </div>
            </Styled.Table>
          </Styled.DivMargin>
        </Styled.Rowright>
      </div>
    </Styled.PageContainer>
  );
}

export default Dragdrop;
