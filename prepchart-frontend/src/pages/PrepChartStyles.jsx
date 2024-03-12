import styled from "styled-components";

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
  width: ${(props) => props.width ? props.width : "100%"};
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
  font-size: 1.0em;
  margin: 0 5px;
`;

export const Input = styled.input`
  width: 75%;
  padding: 5px 0;
  border: none;
  border-radius: 5px;
  font-size: 1.0em;

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.lightGrey};
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.lightGrey};
  }
`;
