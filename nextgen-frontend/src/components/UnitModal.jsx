import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import SearchUnit from "./ModalSearchBar";
import ModalSearchBar from "./ModalSearchBar";

const ModalOverlay = styled.div`
  position: fixed;
  width: 500px;
  height: auto;
  background-color: #fff;
  display: block;
  z-index: 9;
  border-radius: 8px;
  box-shadow: 0px 0px 10px #00000047;
  overflow: hidden;
  left: 38%;
  top: 6%;
`;

const ModalContent = styled.div`
  // background-color: white;
  // padding: 20px;
  // border-radius: 8px;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background: ${(props) => props.theme.primary};
  color: #fff;
  padding: 10px 14px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 12px;
  background-color: transparent;
  cursor: pointer;
  color: #fff;
  border: 0.25px solid #fff;
  padding: 3px;
  border-radius: 0px;
  padding-bottom: 0;
`;
const ModalDialog = styled.div`
  position: fixed;
  background: #00000073;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9;
`;
const FooterButton = styled.button`
  box-shadow: inset 0 0 0 2px ${(props) => props.theme.primary};
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 110px;

  &::after {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }
  &::before {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }
  &:hover::after {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
  }
  &:hover::before {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0s, 0.25s;
  }
  &:hover {
    border-color: transparent;
    color: #fff;
    background: ${(props) => props.theme.primary};
  }
`;
const ModalFooter = styled.div`
  background: #efefef;
  display: flex;
  justify-content: center;
  gap: 11px;
  padding: 0.75rem;
`;
const ModalBody = styled.div`
  padding: 0px 14px;
`;
export const PopupContainer = styled.div`
  grid-column-gap: 20px;
  display: grid;
  grid-template-columns: 50fr 50fr;
  margin-top: 10px;
`;
const LeftUnitList = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;
const InputGroup = styled.div`
  position: relative;
`;
const RightUnitList = styled.div`
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
const Span = styled.span`
  background: ${(props) => props.theme.primary};
  display: block;
  text-align: center;
  color: #fff;
  border-radius: 4px;
  margin-top: -9px;
  padding: 10px;
  min-height: 18px;
`;
const UnitContainer = styled.div`
  border: 0.25px solid #808285;
  border-radius: 8px;
  margin: 10px 0px;
  overflow-y: scroll;
  height: 233px;

  &::-webkit-scrollbar {
    background: #ffffff;
    width: 15px;
    height: 15px;
    cursor: pointer;
    border: 14px solid #fff;
    outline: 0.25px solid #808285;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 30px;
    padding: 18px !important;
    border: 2px solid #fff;
    cursor: pointer;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.secondary};
  }  
`;

const UnitList = styled.ul`
  list-style: none;
  padding: 0px;
  margin: 0px;
`;

const UnitListItem = styled.li`
  padding: 4px 10px 4px 10px;
  cursor: pointer;
  border-bottom: 0.25px solid ${(props) => (props.$isArea ? "#fff" : props.theme.lightGrey)};
  background: ${(props) => (props.$isActive ? props.theme.primary : (props.$isArea ? props.theme.lightGrey : "#fff"))};
  color: ${(props) => (props.$isActive ? "#fff" :  "#000")};
`;

const UnitModal = ({
  unitData,
  unitID,
  unitName,
  show,
  handleClose,
  handleUnitSelection,
  isSaveUnit = false,
  isMultiUnit = false,
  includeAreas = false,
  handleUnitSaveSelection,
}) => {
  const [unitsList, setUnitsList] = useState(unitData?.units || []);
  const [areasList, setAreasList] = useState(unitData?.areas || []);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedUnitName, setSelectedUnitName] = useState(unitName);
  const [selectedUnit, setSelectedUnit] = useState(unitID);

  useEffect(() => {
    if (unitData && unitData.units && unitData.areas) {
      setUnitsList(unitData.units);
      setAreasList(unitData.areas);
      setSelectedUnitName(unitName);
      setSelectedUnit(unitID);
      setSelectedUnits([{id: unitID, name: unitName, isArea: false}]);
    } else {
    }
  }, [unitData, unitName, unitID]);


  useEffect(() => {
    PopulateFilteredList(unitsList, areasList);
  }, [unitsList, areasList, includeAreas]);

  const PopulateFilteredList = (units, areas) => {
    if (includeAreas) {
      const areaListWithFlag = areas.map(area => ({id: area.areaID, name: area.areaName, isArea: true}));
      const unitListWithFlag = units.map(unit => ({id: unit.unitID, name: unit.unitName, isArea: false}));
      setFilteredList([...areaListWithFlag, ...unitListWithFlag]);
    } else {
      const unitListWithFlag = units.map(unit => ({id: unit.unitID, name: unit.unitName, isArea: false}));
      setFilteredList(unitListWithFlag);
    }
  };

  const SearchUnitItem = (keyword) => {
    if (keyword.length > 0) {
      const filteredUnits = unitsList.filter(
        (item) =>
          (item.unitName &&
            item.unitName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
          (item.unitId &&
            item.unitId.toString().toLowerCase().includes(keyword.toLowerCase()))
      );
      const filteredAreas = areasList.filter(
        (item) =>
          (item.areaName &&
            item.areaName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
          (item.areaID &&
            item.areaID.toString().toLowerCase().includes(keyword.toLowerCase()))
      );
      
      PopulateFilteredList(filteredUnits, filteredAreas);
    }
    else {
      PopulateFilteredList(unitsList, areasList);
    }
  };

  const handleUnitSelectChange = (event) => {
    const selectedUnitId = event.target.value;
    setSelectedUnit(selectedUnitId);
    const selectedText = event.target.textContent;
    setSelectedUnitName(selectedText);
    const data = unitsList.filter(
      (item) => item.id === parseInt(selectedUnitId, 10)
    );
  };

  const handleSaveButtonClick = () => {
    handleUnitSaveSelection(selectedUnits);
    handleClose();
  };

  const handleUnitItemClick = (id, name, isArea) => {
    if (isArea) {
      let areaUnits = areasList.find((area) => area.areaID === id).unitList.map((unit) => ({id: unit.unitID, name: unit.unitName, isArea: false}));
      areaUnits.unshift({id, name, isArea});
      const selectedUnitIDs = new Set(selectedUnits.map(unit => unit.id));
      areaUnits = areaUnits.filter(unit => !selectedUnitIDs.has(unit.id));
      if (selectedUnits.some(unit => unit.id === id)) {
        const newSelectedUnits = selectedUnits.filter(unit => !areaUnits.some(areaUnit => areaUnit.id === unit.id));
        setSelectedUnits(newSelectedUnits);
      } else {
        setSelectedUnits([...selectedUnits, ...areaUnits]);
      }
    } else if (selectedUnits.some(unit => unit.id === id)) {
      const newSelectedUnits = selectedUnits.filter((item) => item.id !== id);
      setSelectedUnits(newSelectedUnits);
    }else {
      setSelectedUnits([...selectedUnits, {id: id, name: name, isArea: isArea}]);
    }
  };

  const handleSingleUnitSelection = (id, name) => {
    setSelectedUnit(id);
    setSelectedUnitName(name);
    setSelectedUnits([{id: id, name: name, isArea: false}]);
  };

  const handleOkButtonClick = () => {
    handleUnitSelection(selectedUnitName, selectedUnit);
    handleClose();
  };

  const handleCancelClick = () => {
    setSelectedUnit(unitID);
    setSelectedUnitName(unitName);
    setSelectedUnits([{id: unitID, name: unitName, isArea: false}]);
    handleClose();
  };

  return (
    show ? (
      <ModalDialog>
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              {isSaveUnit ? (
                <h4>Select Unit(s) to save</h4>
              ) : (
                <h4>Select a Unit or Area</h4>
              )}

              <CloseButton onClick={handleClose}>
                <FaTimes className="close" />
              </CloseButton>
            </ModalHeader>
          </ModalContent>

          <ModalBody>
            <PopupContainer>
              <LeftUnitList>
                <label>Filter</label>
                <InputGroup>
                  <ModalSearchBar
                    onSearch={(keyword) => SearchUnitItem(keyword)}
                  />
                </InputGroup>
                <UnitContainer >
                  {isMultiUnit ? (
                    <UnitList value={selectedUnit} onClick={handleUnitSelectChange}>
                      {filteredList.map((item, index) => (
                        <UnitListItem
                          key={index}
                          onClick={() => {
                            handleUnitItemClick(item.id, item.name, item.isArea),
                            setSelectedUnit(item.id),
                            setSelectedUnitName(item.name);
                          }}
                          $isActive={
                            selectedUnits.some((unit) => (unit.id === item.id)) ? true : false
                          }
                          value={item.id}
                          $isArea={item.isArea}
                        >
                          {item.name}
                        </UnitListItem>
                      ))}
                    </UnitList>
                  ) : (
                    <UnitList value={selectedUnit} onClick={handleUnitSelectChange}>
                      {filteredList.map((item, index) => (
                        <UnitListItem
                          key={index}
                          onClick={() => {
                            handleSingleUnitSelection(item.id, item.name)
                          }}
                          value={item.id}
                          className={selectedUnit === item.id ? true : false}
                        >
                          {item.name}
                        </UnitListItem>
                      ))}
                    </UnitList>
                  )}
                </UnitContainer>
              </LeftUnitList>
              <RightUnitList>
                <Span>{selectedUnitName}</Span>
                <UnitContainer className="unitList">
                  <UnitList value={selectedUnit} onClick={handleUnitSelectChange}>
                    {selectedUnits.map((item, index) => (
                      !item.isArea ? (
                        <UnitListItem
                          key={index}
                          value={item.id}
                          onClick={() => {
                            setSelectedUnit(item.id),
                            setSelectedUnitName(item.name);
                          }}
                          className={selectedUnit === item.id ? "active" : ""}
                        >
                          {item.name}
                        </UnitListItem>
                      ) : (null)
                    ))}
                  </UnitList>
                </UnitContainer>
              </RightUnitList>
            </PopupContainer>
          </ModalBody>

          <ModalFooter>
            {isSaveUnit ? (
              <>
                <FooterButton onClick={handleSaveButtonClick}>Save</FooterButton>
                <FooterButton onClick={handleCancelClick}>Cancel</FooterButton>
              </>
            ) : (
              <>
                <FooterButton onClick={handleOkButtonClick}>Ok</FooterButton>
                <FooterButton onClick={handleCancelClick}>Cancel</FooterButton>
              </>
            )}
          </ModalFooter>
        </ModalOverlay>
      </ModalDialog>
    ) : null
  );
};

UnitModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleUnitSelection: PropTypes.func,
  isSaveUnit: PropTypes.bool,
};

export default UnitModal;
