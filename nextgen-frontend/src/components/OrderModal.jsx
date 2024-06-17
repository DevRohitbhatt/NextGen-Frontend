import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import Dropdown from "../components/DropDown";
import DateRangePicker from "../components/DateRange";
import { VendorAPI } from "../apis/food-cost/VendorAPI";

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
  background: #efefef;
  color: #364790;

  &::after,
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
  }

  &::after {
    border-top-width: 2px;
    border-right-width: 2px;
  }

  &::before {
    border-bottom-width: 2px;
    border-left-width: 2px;
  }

  &:hover::after,
  &:hover::before {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
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

const PopupContainer = styled.div`
  grid-column-gap: 20px;
  margin-top: 10px;
`;

const LeftSection = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;
const Titles = styled.span`
  font-weight: bold;
  width: 50%;
  font-weight: 700;
`;

const Rows = styled.div`
  display: flex;
`;

const OrderModal = ({
  companyID,
  unitData,
  unitID,
  unitName,
  show,
  handleClose,
  handleUnitSelection,
  includeAreas = false,
  handleUnitSaveSelection,
  title
}) => {
  const [unitsList, setUnitsList] = useState([]);
  const [areasList, setAreasList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedUnitName, setSelectedUnitName] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [vendorsList, setVendorsList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(
    'There was an error trying to load the Suggested Order, please try again later.'
  );
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (unitData && unitData.units && unitData.areas) {
      setUnitsList(unitData.units);
      setAreasList(unitData.areas);
      setSelectedUnitName(unitName);
      setSelectedUnit(unitID);
      setSelectedUnits([{ id: unitID, name: unitName, isArea: false }]);
    } else {
      console.log('No data found');
    }
  }, [unitData, unitName, unitID]);

  useEffect(() => {
    populateFilteredList(unitsList, areasList);
    fetchVendors();
  }, [unitsList, areasList, includeAreas]);

  const fetchVendors = async () => {
    try {
      const response = await VendorAPI.VendorsAPI(companyID);
      setVendorsList(response);
    } catch (error) {
      setIsError(true);
      if (error.response?.status === 404) {
        setErrorMessage('Vendors not found for the given parameters.');
      } else if (error.response?.status === 403) {
        setErrorMessage('Access denied. You do not have permission to view vendors.');
      } else {
        setErrorMessage('An error occurred while getting vendors.');
      }
    }
  };

  const populateFilteredList = (units, areas) => {
    const unitListWithFlag = units.map((unit) => ({
      id: unit.unitID,
      name: unit.unitName,
      isArea: false
    }));
    if (includeAreas) {
      const areaListWithFlag = areas.map((area) => ({
        id: area.areaID,
        name: area.areaName,
        isArea: true
      }));
      setFilteredList([...areaListWithFlag, ...unitListWithFlag]);
    } else {
      setFilteredList(unitListWithFlag);
    }
  };

  const handleUnitSelectChange = (selectedOption) => {
    setSelectedUnit(selectedOption.value);
    setSelectedUnitName(selectedOption.label);
  };

  const handleSaveButtonClick = () => {
    handleUnitSaveSelection(selectedUnits);
    handleClose();
  };

  const handleUnitItemClick = (id, name, isArea) => {
    if (isArea) {
      let areaUnits = areasList
        .find((area) => area.areaID === id)
        .unitList.map((unit) => ({
          id: unit.unitID,
          name: unit.unitName,
          isArea: false
        }));
      areaUnits.unshift({ id, name, isArea });
      if (selectedUnits.some((unit) => unit.id === id)) {
        const newSelectedUnits = selectedUnits.filter(
          (unit) => !areaUnits.some((areaUnit) => areaUnit.id === unit.id)
        );
        setSelectedUnits(newSelectedUnits);
      } else {
        setSelectedUnits([...selectedUnits, ...areaUnits]);
      }
    } else {
      const newSelectedUnits = selectedUnits.some((unit) => unit.id === id)
        ? selectedUnits.filter((item) => item.id !== id)
        : [...selectedUnits, { id, name, isArea }];
      setSelectedUnits(newSelectedUnits);
    }
  };

  const handleCancelClick = () => {
    setSelectedUnit(unitID);
    setSelectedUnitName(unitName);
    setSelectedUnits([{ id: unitID, name: unitName, isArea: false }]);
    handleClose();
  };

  return show ? (
    <ModalDialog>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            {title}
            <CloseButton onClick={handleClose}>
              <FaTimes className="close" />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <PopupContainer>
              <LeftSection>
                <Rows>
                  <Titles>Unit :</Titles>
                  <Dropdown
                    options={unitsList.map((unit) => ({
                      label: unit.unitName,
                      value: unit.unitID
                    }))}
                    onChange={handleUnitSelectChange}
                  />
                </Rows>
                <Rows>
                  <Titles>Select Vendors</Titles>
                  <Dropdown
                    options={vendorsList.map((vendor) => ({
                      label: vendor.vendorName,
                      value: vendor.vendorID
                    }))}
                  />
                </Rows>
                <Rows>
                  <Titles>Delivery Date</Titles>
                  <DateRangePicker
                    selectedDates={selectedDates}
                    onDateChange={setSelectedDates}
                  />
                </Rows>
              </LeftSection>
            </PopupContainer>
          </ModalBody>

          <ModalFooter>
            <FooterButton onClick={handleSaveButtonClick}>Save</FooterButton>
            <FooterButton onClick={handleCancelClick}>Cancel</FooterButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </ModalDialog>
  ) : null;
};

OrderModal.propTypes = {
  unitData: PropTypes.object.isRequired,
  unitID: PropTypes.number.isRequired,
  unitName: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleUnitSelection: PropTypes.func.isRequired,
  includeAreas: PropTypes.bool,
  handleUnitSaveSelection: PropTypes.func,
  title: PropTypes.string
};

export default OrderModal;
