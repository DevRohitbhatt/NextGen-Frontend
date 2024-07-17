import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import SearchVendor from "./SearchVendor";
import SearchUnit from "./ModalSearchBar";
import ModalSearchBar from "./ModalSearchBar";
import * as Styled from "./styles/VendorModalStyles";

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
const LeftVendorList = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;
const InputGroup = styled.div`
  position: relative;
`;
const RightVendorList = styled.div`
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
const VendorContainer = styled.div`
  border: 0.25px solid #808285;
  border-radius: 8px;
  margin: 10px 0px;
  overflow-y: scroll;
  height: 233px;
`;

const VendorList = styled.ul`
  list-style: none;
  padding: 0px;
  margin: 0px;
`;

const VendorListItem = styled.li`
  padding: 4px 10px 4px 10px;
  cursor: pointer;
  border-bottom: 0.25px solid ${(props) => (props.$isArea ? "#fff" : props.theme.lightGrey)};
  background: ${(props) => (props.$isActive ? props.theme.primary : (props.$isArea ? props.theme.lightGrey : "#fff"))};
  color: ${(props) => (props.$isActive ? "#fff" :  "#000")};
`;

const VendorModal = ({
  vendorData,
  vendorID,
  vendorName,
  show,
  handleClose,
  handleVendorSelection,
  isSaveVendor = false,
  isMultiVendor = false,
  handleVendorSaveSelection,
}) => {
  const [vendorsList, setVendorsList] = useState(vendorData.data || []);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState(vendorName);
  const [selectedVendor, setSelectedVendor] = useState(vendorID);

  useEffect(() => {
    if (vendorData) {
      setVendorsList(vendorData.data);
      setSelectedVendorName(vendorName);
      setSelectedVendor(vendorID);
      console.log(vendorID)
      if (vendorID !== 0) {
        setSelectedVendors([{ id: vendorID, name: vendorName }]);
      }
    }
  }, [vendorData, vendorName, vendorID]);

  useEffect(() => {
    if (vendorsList)
      populateFilteredList(vendorsList);
  }, [vendorsList]);

  const populateFilteredList = (list) => {
    const listWithFlag = list.map((item) => ({
      id: item.vendorID,
      name: item.vendorName,
    }));
    setFilteredList(listWithFlag);
  };

  const searchItem = (keyword) => {
    if (keyword.length > 0) {
      const filteredList = vendorsList.filter(
        (item) =>
          (item.vendorName &&
            item.vendorName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
          (item.vendorID &&
            item.vendorID.toString().toLowerCase().includes(keyword.toLowerCase()))
      );
      populateFilteredList(filteredList);
    } else {
      populateFilteredList(vendorsList);
    }
  };

  const handleSelectChange = (event) => {
    const selectedVendorId = event.target.value;
    setSelectedVendor(selectedVendorId);
    const selectedText = event.target.textContent;
    setSelectedVendorName(selectedText);
  };

  const updateSelectedVendor = (selectedVenderList) => {
    if (selectedVenderList.length > 1) {
      setSelectedVendor(null);
      setSelectedVendorName("Multiple Vendors");
    } else if (selectedVenderList.length === 1) {
      setSelectedVendor(selectedVenderList[0].id);
      setSelectedVendorName(selectedVenderList[0].name);
    } else {
      setSelectedVendor(0);
      setSelectedVendorName("No Vendor Selected");
    }
  }

  const handleSaveButtonClick = () => {
    handleVendorSaveSelection(selectedVendors);
    handleClose();
  };

  const handleItemClick = (id, name) => {
    if (selectedVendors.some((v) => v.id === id)) {
      const newSelectedVendors = selectedVendors.filter((item) => item.id !== id);
      setSelectedVendors(newSelectedVendors);
      updateSelectedVendor(newSelectedVendors);
    } else {
      setSelectedVendors([...selectedVendors, { id: id, name: name }]);
      updateSelectedVendor([...selectedVendors, { id: id, name: name }]);
    }
  };

  const handleSingleSelection = (id, name) => {
    setSelectedVendor(id);
    setSelectedVendorName(name);
    setSelectedVendors([{ id: id, name: name }]);
  };

  const handleOkButtonClick = () => {
    if (isMultiVendor) {
      handleVendorSelection(selectedVendors);
    } else {
      handleVendorSelection(selectedVendorName, selectedVendor);
    }
    handleClose();
  };

  const handleCancelClick = () => {
    setSelectedVendor(vendorID);
    setSelectedVendorName(vendorName);
    setSelectedVendors([{ id: vendorID, name: vendorName }]);
    handleClose();
  };

  return show ? (
    <Styled.ModalDialog>
      <Styled.ModalOverlay>
        <Styled.ModalContent>
          <ModalHeader>
            {isSaveVendor ? (
              <h4>Select Vendor(s) to save</h4>
            ) : (
              <h4>Select a Vendor</h4>
            )}
            <Styled.CloseButton onClick={handleClose}>
              <FaTimes className="close" />
            </Styled.CloseButton>
          </ModalHeader>
        </Styled.ModalContent>
        <Styled.ModalBody>
          <Styled.PopupContainer>
            <Styled.LeftVendorList>
              <label>Filter</label>
              <Styled.InputGroup>
                <ModalSearchBar onSearch={searchItem} />
              </Styled.InputGroup>
              <Styled.VendorContainer>
                {isMultiVendor ? (
                  <Styled.VendorList>
                    {filteredList.map((item, index) => (
                      <Styled.VendorListItem
                        key={index}
                        onClick={() => handleItemClick(item.id, item.name)}
                        $isActive={selectedVendors.some((vendor) => vendor.id === item.id)}
                        value={item.id}
                      >
                        {item.name}
                      </Styled.VendorListItem>
                    ))}
                  </Styled.VendorList>
                ) : (
                  <Styled.VendorList>
                    {filteredList.map((item, index) => (
                      <Styled.VendorListItem
                        key={index}
                        onClick={() => handleSingleSelection(item.id, item.name)}
                        value={item.id}
                        $isActive={selectedVendor === item.id}
                      >
                        {item.name}
                      </Styled.VendorListItem>
                    ))}
                  </Styled.VendorList>
                )}
              </Styled.VendorContainer>
            </Styled.LeftVendorList>
            <Styled.RightVendorList>
              <Styled.Span>{selectedVendorName}</Styled.Span>
              <Styled.VendorContainer>
                <Styled.VendorList>
                  {selectedVendors.map((item, index) => (
                    <Styled.VendorListItem
                      key={index}
                      onClick={() => handleItemClick(item.id, item.name)}
                      value={item.id}
                    >
                      {item.name}
                    </Styled.VendorListItem>
                  ))}
                </Styled.VendorList>
              </Styled.VendorContainer>
            </Styled.RightVendorList>
          </Styled.PopupContainer>
        </Styled.ModalBody>
        <Styled.ModalFooter>
          {isSaveVendor ? (
            <>
              <Styled.FooterButton onClick={handleSaveButtonClick}>Save</Styled.FooterButton>
              <Styled.FooterButton onClick={handleCancelClick}>Cancel</Styled.FooterButton>
            </>
          ) : (
            <>
              <Styled.FooterButton onClick={handleOkButtonClick}>Ok</Styled.FooterButton>
              <Styled.FooterButton onClick={handleCancelClick}>Cancel</Styled.FooterButton>
            </>
          )}
        </Styled.ModalFooter>
      </Styled.ModalOverlay>
    </Styled.ModalDialog>
  ) : null;
};

VendorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleVendorSelection: PropTypes.func,
  isSaveUnit: PropTypes.bool,
};

export default VendorModal;
