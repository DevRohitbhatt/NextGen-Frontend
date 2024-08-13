import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { ModalHeader } from 'react-bootstrap';
import { ModalSearchBar } from '../index';
import * as Styled from '../styles/VendorModalStyles';

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
			console.log(vendorID);
			if (vendorID !== 0) {
				setSelectedVendors([{ id: vendorID, name: vendorName }]);
			}
		}
	}, [vendorData, vendorName, vendorID]);

	useEffect(() => {
		if (vendorsList) populateFilteredList(vendorsList);
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
					(item.vendorName && item.vendorName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
					(item.vendorID && item.vendorID.toString().toLowerCase().includes(keyword.toLowerCase()))
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
			setSelectedVendorName('Multiple Vendors');
		} else if (selectedVenderList.length === 1) {
			setSelectedVendor(selectedVenderList[0].id);
			setSelectedVendorName(selectedVenderList[0].name);
		} else {
			setSelectedVendor(0);
			setSelectedVendorName('All Vendors');
		}
	};

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
			handleVendorSelection(selectedVendorName, selectedVendors);
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
						{isSaveVendor ? <h4>Select Vendor(s) to save</h4> : <h4>Select a Vendor</h4>}
						<Styled.CloseButton onClick={handleClose}>
							<FaTimes className='close' />
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
