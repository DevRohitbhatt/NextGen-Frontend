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

export default function UnitSelector({ onClick , unitName, setUnitName, unitID}) {
  
  const GetUnitList = () => {
    UnitAPI.getUnitsByCompany(1, 1)
    .then((data) => {
      if (data.Units.length > 0) {
        setUnitName(data.Units.find(unit => unit.UnitID === unitID).Name);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  };
  if (unitName === "No Unit Selected" && unitID) {
    GetUnitList();
  }
  
  return (
    <>
    <UnitContainer onClick={onClick} className="unit-selector">
      <Label>Select Unit(s)</Label>
      <UnitValue >{unitName}</UnitValue>
    </UnitContainer>
    </>
  );
}
