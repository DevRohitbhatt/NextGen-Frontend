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

export default function UnitSelector({ onClick, companyID, alignmentID, memberName, setMemberName, memberID, isEditable=true, includeAreas=false, formVersion=false,isInvalid=false}) {
  console.log("UnitSelector",isInvalid);
  useEffect(() => {
    const fetchUnitList = async () => {
      await UnitsAndAreasAPI.getbyid(companyID, alignmentID, memberID)
      .then((response) => {
        if (response.data.areas.length > 0 && includeAreas) {
          const areaName = response.data.areas.find(area => area.areaID === memberID).areaName;
          if (areaName) {
            setMemberName(areaName);
            return;
          }
        }
        if(response.data.units.length > 0) {
          const unitName = response.data.units.find(unit => unit.unitID === memberID).unitName;
          if (unitName) {
            setMemberName(unitName);
            return;
          }
        } 
        setMemberName("No unit selected")
      }).catch((error) => {
        setMemberName("No unit selected")
      });
      
    };
    if (companyID && alignmentID && memberID)
      fetchUnitList();
  }, [memberID]);

  return (
    <>
    {formVersion ? (
      <FormElementContainer onClick={onClick}>
        <FormUnitValue style={isInvalid ? { borderColor: 'red' } : {}}>{memberName}</FormUnitValue>
      </FormElementContainer> 
    ) : (
      <UnitContainer onClick={isEditable ? onClick : () => {}} className="unit-selector" >
        {isEditable ? (
          <Label>Select Unit(s)</Label>
        ) : (
          <Label>Unit</Label>
        )}
        <UnitValue  isEditable={isEditable}>{memberName}</UnitValue>
      </UnitContainer>
    )}
    </>
  );
}
