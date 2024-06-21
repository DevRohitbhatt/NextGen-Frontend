import styled from "styled-components";
import { useEffect, useState } from "react";
import { AreaAPI } from "../apis/AreaAPI";
import { UnitAPI } from "../apis/UnitAPI";
import { UnitsAndAreasAPI } from "../apis/UnitsAndAreasAPI";


const UnitContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 30px;
  margin: 5px;
  cursor: pointer;
`;

const FormElementContainer = styled.div`
  width: 100%;
  border-radius: 6px;
  cursor: pointer;
`;

const FormUnitValue = styled.div`
  white-space: nowrap;
  border-radius: 6px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }
`;

const Label = styled.div`
  white-space: nowrap;
  font-size: 1.2em;
  font-weight: bold;
`;

const UnitValue = styled.div`
  white-space: nowrap;
  border-radius: 20px;
  border: 2px solid ${(props) => props.isEditable ? props.theme.lightGrey : `#D3D3D3`};
  background-color: ${(props) => props.isEditable ? `none` : props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.isEditable ? props.theme.primary : `#D3D3D3`};
  }
`;

export default function UnitSelector({ companyID, alignmentID, memberID, onClick , unitName, setUnitName, unitID, formVersion = false, isEditable = true}) {
  
  const GetUnitList = () => {
    UnitsAndAreasAPI.getbyid(companyID, alignmentID, memberID)
    .then((data) => {
      let foundUnit = false;
      if (data.data.units.length > 0) {
        let unitName = data.data.units.find(unit => unit.unitID === unitID).unitName;
        if (unitName) {
          setUnitName(unitName);
          foundUnit = true;
        }
      } else if (data.data.areas.length > 0 && unitName === "No Unit Selected") {
        setUnitName(data.data.areas.find(area => area.areaID === unitID).areaName);
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
    {formVersion ? (
      <FormElementContainer onClick={onClick}>
        <FormUnitValue>{unitName}</FormUnitValue>
      </FormElementContainer> 
    ) : (
      <UnitContainer onClick={isEditable ? onClick : () => {}} className="unit-selector">
        {isEditable ? (
          <Label>Select Unit(s)</Label>
        ) : (
          <Label>Unit</Label>
        )}
        <UnitValue isEditable={isEditable}>{unitName}</UnitValue>
      </UnitContainer>
    )}
    </>
  );
}
