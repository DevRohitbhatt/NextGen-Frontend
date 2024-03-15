import styled from "styled-components";
import PropTypes from "prop-types";

const DateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 30px;
  margin: 5px;
  cursor: pointer;
`;

const Label = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  white-space: nowrap;
`;

const DateValue = styled.div`
  white-space: nowrap;
  border-radius: 20px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }
`;

DateSelector.propTypes = {
  ToDate: PropTypes.instanceOf(Date),
  FromDate: PropTypes.instanceOf(Date),
};

export default function DateSelector({ ToDate,FromDate ,onClick}) {
  return (
    <>
     <DateContainer onClick={onClick}>
      <Label>Select Date</Label>
      <DateValue>{FromDate.toLocaleDateString() +" - "+ ToDate.toLocaleDateString()}</DateValue>
    </DateContainer>
    </>
   
  );
}
