import styled from "styled-components";

export const PageContainer = styled.div`
  width: 85%;
  margin: auto;
`;

export const PageTitle = styled.div`
  font-size: 2.75rem;
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
  width: 70%;
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

  h3 {
    margin-bottom: 20px;
    font-size: 1.75em;
  }
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 4fr 1.5fr;
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
  grid-template-columns: 1.5fr 4fr 1.5fr;
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 8px 8px;
`;
export const TableHeaderRight = styled.div`
  display: grid;
  grid-template-columns: 13fr 1.5fr;
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};

`;
export const TableHeaderTop = styled.div`
  display: grid;
  grid-template-columns: 13fr 1.5fr 1.5fr;
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  `;
export const TableRowRight = styled.div`
  display: grid;
  grid-template-columns: 13fr 1.5fr 1.5fr;
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
  width: 100%;
`;
export const TableCell = styled.div`
  font-size: 1.0em;
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
  width: 30%;
`;

export const Maindiv=styled.div`
width:100%;
display: flex;
gap: 40px;
`;

export const RightTblMarg=styled.div`
margin-bottom: 12px;
`;
