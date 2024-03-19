import styled from "styled-components";
import { useEffect, useState } from "react";
import { AreaAPI } from "../apis/AreaAPI";
import { UnitAPI } from "../apis/UnitAPI";


const UnitContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 30px;
  margin: 5px;
  cursor: pointer;
`;

const Label = styled.div`
  white-space: nowrap;
  font-size: 1.2em;
  font-weight: bold;
`;

const UnitValue = styled.div`
  white-space: nowrap;
  border-radius: 20px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }
`;

export default function UnitSelector({ onClick ,UnitName}) {

  const [SelecteUnitName, setSelecteUnitName] = useState("");

  useEffect(() => {
    setSelecteUnitName(UnitName); // Bind UnitName to selectedUnitName on page load
  }, [UnitName]); // Re-run effect when UnitName prop changes
  
  if (UnitName === "") {
    GetUnitList();
  }
  const GetUnitList = () => {
    UnitAPI.getUnitsByCompany(1, 1)
    .then((data) => {
      console.log(data.Units)
      if (data.Units.length > 0) {
        setSelecteUnitName(data.Units[0].Name);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  };
  
  return (
    <>
    <UnitContainer onClick={onClick}>
      <Label>Select Unit(s)</Label>
      <UnitValue >{SelecteUnitName}</UnitValue>
    </UnitContainer>
    </>
  );
}
