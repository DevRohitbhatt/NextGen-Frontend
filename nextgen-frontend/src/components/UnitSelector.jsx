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

export default function UnitSelector({ onClick, companyID, alignmentID, unitName, setUnitName, unitID, isEditable=true, formVersion=false}) {
  
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
