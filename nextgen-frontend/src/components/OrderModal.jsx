import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import Dropdown from "../components/DropDown";
import DateRangePicker from "../components/DateRange";
import { useNavigate } from 'react-router-dom';
import VendorSelector from "./VendorSelector";
import VendorModal from "./VendorModal";
import UnitSelector from "./UnitSelector";
import UnitModal from "./UnitModal";

const ModalOverlay = styled.div`
  position: fixed;
  width: 600px;
  height: auto;
  background-color: #fff;
  display: block;
  z-index: 9;
  border-radius: 4px;
  box-shadow: 0px 0px 10px #00000047;
  overflow: hidden;
  left: 38%;
  top: 6%;
`;

const ModalContent = styled.div`
`;

const ModalHeader = styled.div`
  background-color: ${(props) => props.theme.primary};
  color: #fff;
  padding: 10px;
  font-weight: 650;
  font-size: 15px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 12px;
  background-color: transparent;
  color: #fff;
  cursor: pointer;
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
  margin: 10px;
  align-items: center;
`;

const Select = styled.select`
  width: 75%;
  padding: 8px 10px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;

  &:focus {
    outline: none;
    border: 2px solid ${(props) => props.theme.primary};
  }

`;

const Option = styled.option`
  
`;

const OrderModal = ({
  companyID,
  alignmentID,
  memberID,
  unitData,
  vendorData,
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
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [selectedVendorName, setSelectedVendorName] = useState("No Vendor Selected");
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [errorMessage, setErrorMessage] = useState(
    'There was an error trying to load the Suggested Order, please try again later.'
  );
  const [isError, setIsError] = useState(false);
  const [showVendorModal, setVendorShowModal] = useState(false);
  const [showUnitModal, setUnitShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (unitData && unitData.units && unitData.areas) {
      setUnitsList(unitData.units);
      setAreasList(unitData.areas);
      setSelectedUnitName(unitName);
      setSelectedUnit(unitID);
      setSelectedUnits([{ id: unitID, name: unitName, isArea: false }]);
    } else {

    }
  }, [unitData, unitName, unitID]);

  useEffect(() => {
    populateFilteredList(unitsList, areasList);
  }, []);

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
    
  };

  const handleUnitItemClick = (name, id) => {
    setSelectedUnit(id);
    setSelectedUnitName(name);
  };

  const handleVendorChange = (newVendorName, newVendorID) => {
    setSelectedVendor(newVendorID);
    setSelectedVendorName(newVendorName)
  };

  const handleNextButtonClick = () => {
    navigate('/SuggestedOrder', {
      state: {
        company: companyID,
        unit: selectedUnit,
        unitName: selectedUnitName,
        vendorID: selectedVendor,
        vendorName: selectedVendorName,
        dates: selectedDates
      }
    });
    handleClose();
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
                  <Titles>Select Unit</Titles>
                  <UnitSelector
                    companyID={companyID}
                    alignmentID={alignmentID}
                    memberID={memberID}
                    unitID={selectedUnit}
                    unitName={selectedUnitName}
                    setUnitName={setSelectedUnitName}
                    onClick={() => setUnitShowModal(true)}
                    formVersion={true}
                  />
                  <UnitModal
                    show={showUnitModal}
                    handleClose={() => setUnitShowModal(false)}
                    handleUnitSelection={handleUnitItemClick}
                    unitData={unitData}
                    unitID={selectedUnit}
                    unitName={selectedUnitName}
                  />
                </Rows>
                <Rows>
                  <Titles>Select Vendor</Titles>
                  <VendorSelector
                    vendorID = {selectedVendor}
                    vendorName = {selectedVendorName}
                    setVendorName={setSelectedVendorName}
                    onClick={() => setVendorShowModal(true)}
                    formVersion={true}
                  />
                  <VendorModal
                    show={showVendorModal}
                    handleClose={() => setVendorShowModal(false)}
                    handleVendorSelection={handleVendorChange}
                    vendorData={vendorData}
                    vendorID={selectedVendor}
                    vendorName={selectedVendorName}
                  />
                </Rows>
                <Rows>
                  <Titles>Date Range</Titles>
                  <DateRangePicker
                    selectedDates={selectedDates}
                    onDateChange={setSelectedDates}
                  />
                </Rows>
              </LeftSection>
            </PopupContainer>
          </ModalBody>

          <ModalFooter>
            <FooterButton onClick={handleNextButtonClick}>Next</FooterButton>
            <FooterButton onClick={handleCancelClick}>Cancel</FooterButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </ModalDialog>
  ) : null;
};

OrderModal.propTypes = {
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
