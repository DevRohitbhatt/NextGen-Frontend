import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import { AreaAPI } from "../apis/AreaAPI";
import { UnitAPI } from "../apis/UnitAPI";
import SearchUnit from "./SearchUnit";

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
  background: #364790;
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
  box-shadow: inset 0 0 0 2px #364790;
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
    background: #364790;
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
  background: #364790;
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
`;

const UnitModal = ({
  show,
  handleClose,
  handleUnitSelection,
  isSaveUnit = true,
  handleUnitSaveSelection,
}) => {
  const [unitsList, setUnitsList] = useState([]);
  const [filteredUnit, setFilteredUnit] = useState([]);
  const [selectedUnit, setSelecteUnit] = useState("");
  const [SelecteUnitName, setSelecteUnitName] = useState("");
  const [IsActive, setIsActive] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);

  useEffect(() => {
    GetUnitList();
  }, []);

  useEffect(() => {
    // Select the default unit when the component mounts
    if (filteredUnit.length > 0) {
      setSelectedUnits([filteredUnit[7].UnitID]);
      setSelecteUnitName(filteredUnit[7].Name);
    }
  }, [filteredUnit]);

  const UnitListItem = (UnitItem) => {
    setUnitsList({
      rows: UnitItem,
    });
    setFilteredUnit(UnitItem); // Initially, set filtered rows to all rows
  };
  const GetUnitList = () => {
    UnitAPI.getUnitsByCompany(1, 1)
      .then((data) => {
        UnitListItem(data.Units);
        if (data.Units.length > 0) {
          // setUnitList(data.Units);
          setSelecteUnit(data.Units[7].UnitID);
          setSelecteUnitName(data.Units[7].Name);
          setIsActive(data.Units[7].UnitID);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const SearchUnitItem = (keyword) => {
    if (!isNaN(keyword) || keyword === "") {
      const filtered = unitsList.rows.filter(
        (item) =>
          (item.Name &&
            item.Name.toLowerCase().includes(keyword.toLowerCase())) ||
          (item.UnitID &&
            item.UnitID.toString()
              .toLowerCase()
              .includes(keyword.toLowerCase()))
      );
      setFilteredUnit(filtered);
    }
  };

  const handleUnitSelectChange = (event) => {
    const selectedUnitId = event.target.value;
    setSelecteUnit(selectedUnitId);
    const selectedText = event.target.textContent;
    setSelecteUnitName(selectedText);

    // Fetch data for the other list based on the selected unit ID
    // Unitlist.getByUnitId(selectedUnitId)
    //   .then((data) => {
    //     setAnotherList(data);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching data from Unit list API:", error);
    //   });
    const data = unitList.filter(
      (item) => item.UnitID === parseInt(selectedUnitId, 10)
    );
    setUnitList(data);
  };

  const handleOkButtonClick = () => {
    handleUnitSelection(SelecteUnitName, selectedUnit);
    handleClose();
  };
  const handleSaveButtonClick = () => {
    // Pass necessary data to the parent function
    handleUnitSaveSelection(SelecteUnitName, [...selectedUnits]);
    handleClose();
  };

  const handleUnitItemClick = (unitID) => {
    if (selectedUnits.includes(unitID)) {
      setSelectedUnits(selectedUnits.filter((id) => id !== unitID));
    } else {
      setSelectedUnits([...selectedUnits, unitID]);
    }
  };
  const handleCancelClick = () => {
    setSelectedUnits([filteredUnit[7].UnitID]); // Reset selected units
    handleClose();
  };
  if (!show) {
    return null;
  }

  return (
    <ModalDialog>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            {isSaveUnit ? (
              <h4>Select a Unit Save Template</h4>
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
                <SearchUnit
                  list={unitsList}
                  onSearch={(keyword) => SearchUnitItem(keyword)}
                />
              </InputGroup>
              <UnitContainer className="unitList">
                {isSaveUnit ? (
                  <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                    {filteredUnit.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          handleUnitItemClick(item.UnitID),
                            setIsActive(item.UnitID);
                        }}
                        className={
                          selectedUnits.includes(item.UnitID) ? "active" : ""
                        }
                        value={item.UnitID}
                      >
                        {item.Name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                    {filteredUnit.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => setIsActive(item.UnitID)}
                        value={item.UnitID}
                        className={IsActive === item.UnitID ? "active" : ""}
                      >
                        {item.Name}
                      </li>
                    ))}
                  </ul>
                )}
              </UnitContainer>
            </LeftUnitList>
            <RightUnitList>
              <Span>{SelecteUnitName}</Span>
              <UnitContainer className="unitList">
                <ul value={selectedUnit} onClick={handleUnitSelectChange}>
                  {unitList.map((item, index) => (
                    <li
                      key={index}
                      value={item.UnitID}
                      onClick={() => setIsActive(item.UnitID)}
                      className={IsActive === item.UnitID ? "active" : ""}
                    >
                      {item.UnitID} {item.Name}
                    </li>
                  ))}
                </ul>
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
              <FooterButton onClick={handleClose}>Cancel</FooterButton>
            </>
          )}
        </ModalFooter>
      </ModalOverlay>
    </ModalDialog>
  );
};

UnitModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleUnitSelection: PropTypes.func,
  isSaveUnit: PropTypes.bool,
};

export default UnitModal;
