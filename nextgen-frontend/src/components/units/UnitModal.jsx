import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as Styled from '../styles/UnitModalStyles.jsx';
import { FaTimes } from 'react-icons/fa';
import { ModalHeader } from 'react-bootstrap';
import { ModalSearchBar } from '../index';
const UnitModal = ({
	unitData,
	memberID,
	memberName,
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
	const [selectedMemberName, setSelectedMemberName] = useState(memberName);
	const [selectedUnit, setSelectedUnit] = useState(memberID);

	useEffect(() => {
		if (unitData && unitData.units && unitData.areas) {
			setUnitsList(unitData.units);
			setAreasList(unitData.areas);
			setSelectedMemberName(memberName);
			setSelectedUnit(memberID);
			if (includeAreas) {
				populateSelectedUnits(memberID, memberName);
			} else setSelectedUnits([{ id: memberID, name: memberName, isArea: false }]);
		} else {
		}
	}, [unitData, memberName, memberID]);

	const populateSelectedUnits = (id, name) => {
		const area = areasList.find((area) => area.areaID === id);
		let areaUnits = [];

		if (area) {
			areaUnits = [
				...area.unitList.map((unit) => ({ id: unit.unitID, name: unit.unitName, isArea: false })),
				{ id, name, isArea: true },
			];
		} else {
			areaUnits = [{ id, name, isArea: false }];
		}

		setSelectedUnits(areaUnits);
		updateSelectedUnit(areaUnits);
	};

	useEffect(() => {
		populateFilteredList(unitsList, areasList);
	}, [unitsList, areasList, includeAreas]);

	const populateFilteredList = (units, areas) => {
		if (includeAreas) {
			const areaListWithFlag = areas.map((area) => ({ id: area.areaID, name: area.areaName, isArea: true }));
			const unitListWithFlag = units.map((unit) => ({ id: unit.unitID, name: unit.unitName, isArea: false }));
			setFilteredList([...areaListWithFlag, ...unitListWithFlag]);
		} else {
			const unitListWithFlag = units.map((unit) => ({ id: unit.unitID, name: unit.unitName, isArea: false }));
			setFilteredList(unitListWithFlag);
		}
	};

	const handleSearch = (keyword) => {
		if (keyword.length > 0) {
			const filteredUnits = unitsList.filter(
				(item) =>
					(item.unitName && item.unitName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
					(item.unitId && item.unitId.toString().toLowerCase().includes(keyword.toLowerCase()))
			);
			const filteredAreas = areasList.filter(
				(item) =>
					(item.areaName && item.areaName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
					(item.areaID && item.areaID.toString().toLowerCase().includes(keyword.toLowerCase()))
			);

			populateFilteredList(filteredUnits, filteredAreas);
		} else {
			populateFilteredList(unitsList, areasList);
		}
	};

	const handleSaveButtonClick = () => {
		handleUnitSaveSelection(selectedUnits);
		handleClose();
	};

	const updateSelectedUnit = (selectedUnitList) => {
		if (!selectedUnitList || selectedUnitList.length === 0) {
			setSelectedUnit(null);
			setSelectedMemberName('No unit selected');
			return;
		}

		if (selectedUnitList.length === 1) {
			setSelectedUnit(selectedUnitList[0].id);
			setSelectedMemberName(selectedUnitList[0].name);
			return;
		}

		const areas = selectedUnitList.filter((unit) => unit.isArea);

		if (areas.length === 1) {
			setSelectedUnit(areas[0].id);
			setSelectedMemberName(areas[0].name);
		} else {
			setSelectedUnit(null);
			setSelectedMemberName('Multiple Units Selected');
		}
	};

	const handleMultipleUnitSelection = (id, name, isArea) => {
		const area = areasList.find((area) => area.areaID === id);

		if (isArea && area) {
			const areaUnits = area.unitList.map((unit) => ({ id: unit.unitID, name: unit.unitName, isArea: false }));
			const newSelectedUnits = selectedUnits.some((unit) => unit.id === id)
				? selectedUnits.filter(
						(unit) => !areaUnits.some((areaUnit) => areaUnit.id === unit.id) && id !== unit.id
				  )
				: [
						...selectedUnits.filter((unit) => !areaUnits.some((areaUnit) => areaUnit.id === unit.id)),
						{ id, name, isArea },
						...areaUnits.filter(
							(unit) => !selectedUnits.some((selectedUnit) => selectedUnit.id === unit.id)
						),
				  ];

			setSelectedUnits(newSelectedUnits);
			updateSelectedUnit(newSelectedUnits);
			return;
		}

		const newSelectedUnits = selectedUnits.some((unit) => unit.id === id)
			? selectedUnits.filter((item) => item.id !== id)
			: [...selectedUnits, { id, name, isArea }];

		setSelectedUnits(newSelectedUnits);
		updateSelectedUnit(newSelectedUnits);
	};

	const handleSingleUnitOrAreaSelection = (id, name, isArea) => {
		if (isArea) {
			setSelectedUnits([]);
			populateSelectedUnits(id, name);
		} else {
			setSelectedUnit(id);
			setSelectedMemberName(name);
			setSelectedUnits([{ id: id, name: name, isArea: false }]);
		}
	};

	const handleOkButtonClick = () => {
		handleUnitSelection(selectedMemberName, selectedUnit);
		handleClose();
	};

	const handleCancelClick = () => {
		setSelectedUnit(memberID);
		setSelectedMemberName(memberName);
		setSelectedUnits([{ id: memberID, name: memberName, isArea: false }]);
		handleClose();
	};

	return show ? (
		<Styled.ModalDialog className='z-50' style={{zIndex:999}}>
			<Styled.ModalOverlay>
				<Styled.ModalContent>
					<ModalHeader>
						{isSaveUnit ? <h4>Select Unit(s) to save</h4> : <h4>Select a Unit or Area</h4>}

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
							<Styled.UnitContainer>
								{isMultiUnit ? (
									<Styled.UnitList value={selectedUnit}>
										{filteredList.map((item, index) => (
											<Styled.UnitListItem
												key={index}
												onClick={() => {
													handleMultipleUnitSelection(item.id, item.name, item.isArea);
												}}
												$isActive={
													selectedUnits.some((unit) => unit.id === item.id) ? true : false
												}
												value={item.id}
												$isArea={item.isArea}
											>
												{item.name}
											</Styled.UnitListItem>
										))}
									</Styled.UnitList>
								) : (
									<Styled.UnitList value={selectedUnit}>
										{filteredList.map((item, index) => (
											<Styled.UnitListItem
												key={index}
												onClick={() => {
													handleSingleUnitOrAreaSelection(item.id, item.name, item.isArea);
												}}
												value={item.id}
												className={selectedUnit === item.id ? true : false}
												$isArea={item.isArea}
												$isActive={selectedUnit === item.id}
											>
												{item.name}
											</Styled.UnitListItem>
										))}
									</Styled.UnitList>
								)}
							</Styled.UnitContainer>
						</Styled.LeftUnitList>
						<Styled.RightUnitList>
							<Styled.Span>{selectedMemberName}</Styled.Span>
							<Styled.UnitContainer className='unitList'>
								<Styled.UnitList value={selectedUnit}>
									{selectedUnits.map((item, index) =>
										!item.isArea ? (
											<Styled.UnitListItem
												key={index}
												value={item.id}
												onClick={() => {}}
												className={selectedUnit === item.id ? 'active' : ''}
											>
												{item.name}
											</Styled.UnitListItem>
										) : null
									)}
								</Styled.UnitList>
							</Styled.UnitContainer>
						</Styled.RightUnitList>
					</Styled.PopupContainer>
				</Styled.ModalBody>

				<Styled.ModalFooter>
					{isSaveUnit ? (
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

UnitModal.propTypes = {
	show: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleUnitSelection: PropTypes.func,
	isSaveUnit: PropTypes.bool,
};

export default UnitModal;
