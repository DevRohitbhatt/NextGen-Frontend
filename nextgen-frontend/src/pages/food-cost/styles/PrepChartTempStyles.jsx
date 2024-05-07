import styled from "styled-components";

export const PageContainer = styled.div`
  width: 85%;
  margin: auto;
`;

export const UnloadedMessage = styled.div`
  font-size: 1.5em;
  margin: auto;
  width: 100%;
  text-align: center;
`;

export const InventoryItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 55%;
  position: sticky;
  top: 0;
  height: 500px;
`;

export const PageTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizes.large};
  line-height: 1.1;
  margin: 15px 0 40px 0;
  text-align: left;
`;

export const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  border-radius: 15px;
  padding: 10px 20px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
`;
export const TableLeft = styled.div`
  // display: flex;
  // justify-content: space-between;
  // margin-bottom: 40px;
  // border-radius: 30px;
  // padding: 10px 20px;
  // box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
`;

export const SaveOptionsContainer = styled.div`
  display: flex;
  justify-content: end;
  margin: auto;
  width: 100%;
`;

export const SaveOption = styled.div`
  margin-left: 10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.primary};
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.primary};
    color: white;
  }
`;

export const OptionImage = styled.div`
  position: absolute;
  top: 15%;
  width: 100%;
  text-align: center;

  img {
    width: 40px;
    color: white;
  }
  img:hover {
    filter: brightness(0) invert(1);
  }
`;

export const DateAndUnitContainer = styled.div`
  display: flex;
  margin: auto;
`;

export const Table = styled.div`
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
  position: relative;

  h3 {
    margin-bottom: 20px;
    font-size: 1.75em;
  }
`;

export const InventoryItemsTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 4fr;
  width: 100%;
  // margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
  text-align: left;
`;

export const TableHeaderCell = styled.div`
  font-weight: bold;
  font-size: 1.2em;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 8px 8px;
`;
export const TableHeaderRight = styled.div`
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;
export const TableHeaderTop = styled.div`
  font-weight: bold;
  font-size: 1.5em;
  text-align: left;
  margin-top: 25px;
  margin-bottom: 25px;
`;
export const TableCell = styled.div`
  font-size: 1em;
`;

export const TableRight = styled.div`
  // display: flex;
  // justify-content: space-between;
  // margin-bottom: 40px;
  // border-radius: 30px;
  // padding: 10px 20px;
  // box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
  // // width: 40%;
  // float: right;
  width: 45%;
`;
export const TableTitle = styled.div`
  font-size: 1.2em;
  line-height: 1.1;
  margin: 0px 0px 0px 9px;
  text-align: left;
  padding-bottom: 2px;
  font-weight: bold;
`;

export const AddNewItems = styled.div`
  text-align: center;
  padding: 10px;
  :hover {
    border-top: 1px solid ${(props) => props.theme.primary};
  }
`;

export const RightTblMarg = styled.div`
  margin-bottom: 12px;
`;
export const PopupContainer = styled.div`
  grid-column-gap: 20px;
  display: grid;
  grid-template-columns: 50fr 50fr;
  margin-top: 10px;
`;
export const LeftUnitList = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;
export const InputGroup = styled.div`
  position: relative;
`;
export const RightUnitList = styled.div`
  display: block;
  color: #000;
  font-weight: 400;
  font-size: 12px;
  padding: 10px 0px;
  border-radius: 4px;
  margin-top: 13px;
  padding: 10px;
  min-height: 24px;
`;
export const Span = styled.span`
  background: #364790;
  display: block;
  text-align: center;
  color: #fff;
  border-radius: 4px;
  margin-top: -9px;
  padding: 10px;
  min-height: 18px;
`;
