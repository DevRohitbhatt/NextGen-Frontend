import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as Styled from '../styles/MenuModalStyles.jsx';
import { FaTimes } from 'react-icons/fa';
import { ModalHeader } from 'react-bootstrap';
import { ModalSearchBar } from '../index';

const MenuModal = ({ menuData, show, handleClose, handleMenuSelection }) => {
	const [menuItems, setMenuItems] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);

	useEffect(() => {
		if (menuData) {
			setMenuItems(menuData);
			setFilteredList(menuData);
		}
	}, [menuData]);

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
	};

	const handleOkButtonClick = () => {
		handleMenuSelection(selectedItem?.itemID, selectedItem?.description);

		handleClose();
	};

	const handleCancelClick = () => {
		setSelectedItem(null);
		handleClose();
	};

	// Define headers and keys
	const headers = [
		{ label: 'Item ID', key: 'itemID' },
		{ label: 'Description', key: 'description' },
		{ label: 'Full Description', key: 'fullDescription' },
		{ label: 'Price', key: 'price' },
	];

	return show ? (
		<Styled.ModalDialog>
			<Styled.ModalOverlay>
				<Styled.ModalContent>
					<ModalHeader>
						<h4>Select a Menu Item</h4>

						<Styled.CloseButton onClick={handleClose}>
							<FaTimes className='close' />
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

							<Styled.MenuHeader>
								{headers.map((header, index) => (
									<div key={index}>{header.label}</div>
								))}
							</Styled.MenuHeader>

							<Styled.UnitContainer>
								<Styled.UnitList value={selectedItem?.itemID}>
									{filteredList.map((item, index) => (
										<Styled.UnitListItem
											key={index}
											onClick={() => handleItemClick(item)}
											value={item.menuID}
											className={selectedItem?.itemID === item.itemID ? 'active' : ''}
											$isActive={selectedItem?.itemID === item.itemID}
										>
											<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr 1fr' }}>
												{headers.map((header) => (
													<div key={header.key}>
														{header.key === 'price'
															? item[header.key].toFixed(2)
															: item[header.key]}
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

MenuModal.propTypes = {
	menuData: PropTypes.array.isRequired, // Change from object to array
	show: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleMenuSelection: PropTypes.func,
};

export default MenuModal;
