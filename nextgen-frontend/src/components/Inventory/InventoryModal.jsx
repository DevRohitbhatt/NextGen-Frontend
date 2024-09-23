import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as Styled from '../styles/MenuModalStyles.jsx';
import { FaTimes } from 'react-icons/fa';
import { ModalHeader } from 'react-bootstrap';
import { ModalSearchBar } from '../index';

const InventoryModal = ({
  InventoryData,
  show,
  handleClose,
  handleInventorySelection
}) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (InventoryData) {
      setMenuItems(InventoryData);
      setFilteredList(InventoryData);
    }
  }, [InventoryData]);

  const handleSearch = (keyword) => {
    if (keyword.length > 0) {
      const filteredItems = menuItems.filter((item) =>
        item.description.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredList(filteredItems);
    } else {
      setFilteredList(menuItems);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    console.log("item",item);
    
  };

  const handleOkButtonClick = () => {
    handleInventorySelection(selectedItem?.inventoryItemID, selectedItem?.description);    
    handleClose();
  };

  const handleCancelClick = () => {
    setSelectedItem(null);
    handleClose();
  };

  // Define headers and keys
  const headers = [
    { label: 'Qsr Inventory Item ID', key: 'inventoryItemID' },
    { label: 'Description', key: 'description' }
  ];

  return show ? (
    <Styled.ModalDialog>
      <Styled.ModalOverlay>
        <Styled.ModalContent>
          <ModalHeader>
            <h4>Select an Inventory item</h4>

            <Styled.CloseButton onClick={handleClose}>
              <FaTimes className="close" />
            </Styled.CloseButton>
          </ModalHeader>
        </Styled.ModalContent>

        <Styled.ModalBody>
          <Styled.PopupContainer>
            <Styled.LeftUnitList>
              <label>Filter</label>
              <Styled.InputGroup>
                <ModalSearchBar onSearch={(keyword) => handleSearch(keyword)} />
              </Styled.InputGroup>

              <Styled.InventoryHeader >
                {headers.map((header, index) => (
                  <div key={index}>{header.label}</div>
                ))}
              </Styled.InventoryHeader>
              
              <Styled.UnitContainer>
                <Styled.UnitList value={selectedItem?.inventoryItemID}>
                  {filteredList.map((item, index) => (
                    <Styled.UnitListItem
                      key={index}
                      onClick={() => handleItemClick(item)}
                      value={item.menuID}
                      className={selectedItem?.inventoryItemID === item.inventoryItemID ? 'active' : ''}
                      $isActive={selectedItem?.inventoryItemID === item.inventoryItemID}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr' }}>
                        {headers.map((header) => (
                          <div key={header.key}>
                            {item[header.key]}
                          </div>
                        ))}
                      </div>
                    </Styled.UnitListItem>
                  ))}
                </Styled.UnitList>
              </Styled.UnitContainer>
            </Styled.LeftUnitList>
          </Styled.PopupContainer>
        </Styled.ModalBody>

        <Styled.ModalFooter>
          <Styled.FooterButton onClick={handleOkButtonClick}>Ok</Styled.FooterButton>
          <Styled.FooterButton onClick={handleCancelClick}>Cancel</Styled.FooterButton>
        </Styled.ModalFooter>
      </Styled.ModalOverlay>
    </Styled.ModalDialog>
  ) : null;
};

InventoryModal.propTypes = {
  InventoryData: PropTypes.array.isRequired,  // Change from object to array
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleInventorySelection: PropTypes.func,
};

export default InventoryModal;
