import styled from "styled-components";
import { useEffect, useState } from "react";
import { UnitsAndAreasAPI } from "../apis/UnitsAndAreasAPI";


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

export default function UnitSelector({ onClick, companyID, alignmentID, unitName, setUnitName, unitID, label}) {
  
  useEffect(() => {
    const fetchUnitList = async () => {
      await UnitsAndAreasAPI.getbyid(companyID, alignmentID, unitID)
      .then((response) => {
        if(response.data.units.length === 0) {
          setUnitName("No unit selected");
          return;
        } else {
          setUnitName(response.data.units[0].unitName);
        }
      }).catch((error) => {
        console.log(error);
        setUnitName("No unit selected")
      });
      
    };
    if (companyID && alignmentID && unitID)
      fetchUnitList();
  }, [unitID]);

  
  return (
    <>
    <UnitContainer onClick={onClick} className="unit-selector">
      <Label>{label}</Label>
      <UnitValue >{unitName}</UnitValue>
    </UnitContainer>
    </>
  );
}
