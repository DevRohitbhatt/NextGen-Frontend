import styled from "styled-components";

export const UnloadedMessage = styled.div`
  font-size: 1.5em;
  margin: auto;
  width: 100%;
  text-align: center;
`;

export const PageContainer = styled.div`
  width: 85%;
  margin: auto;
`;

export const PageTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizes.large};
  line-height: 1.1;
  margin: 15px 0 40px 0;
`;
export const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  border-radius: 30px;
  padding: 10px 20px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
`;

export const DateAndUnitContainer = styled.div`
  display: flex;
  margin: auto;
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
export const MessageContainer=styled.div`

`;

export const ForeCastAndSafetyFactor = styled.div`
  display: flex;
  margin: auto;
  gap: 40px;
`;

export const Table = styled.div`
  width: ${(props) => (props.width ? props.width : "100%")};
  border-radius: 30px;
  padding: 20px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);

  h3 {
    margin-bottom: 20px;
    font-size: 1.75em;
  }
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.columnInfo};
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;

export const InventoryItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 27px;
`;

export const AddItemModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: end;
  margin: 20px;
`;

export const AddNewItemButton = styled.button`
  all: unset;
  padding: 10px 20px;
  border-radius: 30px;
  background-color: ${(props) => props.theme.primary};
  color: #fff;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.secondary};
  }
`;
