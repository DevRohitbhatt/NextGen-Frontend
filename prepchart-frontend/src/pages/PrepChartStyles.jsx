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
  font-size: 2.75rem;
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

export const TableHeaderCell = styled.div`
  font-weight: bold;
  font-size: 1.2em;
  margin: 0 5px;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.columnInfo};
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
`;

export const TableCell = styled.div`
  font-size: 1em;
  margin: 0 5px;
`;

export const Input = styled.input`
  width: 75%;
  padding: 5px 0;
  border: none;
  border-radius: 5px;
  font-size: 1em;

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.lightGrey};
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.lightGrey};
  }
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
export const CalendarBoxWrapper = styled.div`
  display: grid;
  grid-template-columns: 33.3fr 33.3fr 33.3fr;
`;
export const Label=styled.label`
    font-weight: bold;
    font-size: 12px;
`;
