import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SlArrowDown, SlArrowUp } from 'react-icons/sl';
import PropTypes from 'prop-types';
import { handleVendorItemChange, handleEdit } from '../../functions/suggestedOrderFunctions.js';
import { SetOrderLimitsModal, Tooltip } from '../index.js';

const TableCell = styled.div`
	position: relative;
	font-size: 14px;
	justify-content: ${(props) => (props.columntype === 'number' ? 'center' : 'left')};
	border-bottom: 1px solid ${(props) => props.theme.lightGrey};
	padding: 10px 0;
	height: 25px;
	// overflow: hidden;
	display: flex;
	flex-direction: row;
	gap: 20px;
`;

const StyledCell = styled.div`
	width: 100%;
	min-width: ${(props) => props.$columnWidth || '145px'};

	text-align: ${(props) => (props.columntype === 'number' || props.columntype === 'percent' ? 'center' : 'left')};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const LimitsCell = styled.div`
	width: 100%;
	min-width: ${(props) => props.$columnWidth || '145px'};
	text-align: center;
	cursor: pointer;
	padding: 3px 0px;
	border-radius: 8px;
	transition: all 0.1s ease;
	&:hover {
		background-color: ${(props) => props.theme.primary};
		color: white;
	}
`;

const Select = styled.select`
	width: 100%;
	border: none;
	background: #efefef;
	padding: 4px 8px;
	border-radius: 50px;
`;

const SlArrowUpIcon = styled(SlArrowUp)`
	font-weight: bold;
	margin-right: 10px;
	stroke: #000000;
	stroke-width: 10;
`;

const SlArrowDownIcon = styled(SlArrowDown)`
	font-weight: bold;
	margin-right: 10px;
	stroke: #000000;
	stroke-width: 10;
`;

const InputCell = styled.input`
	border: none;
	min-width: ${(props) => props.$columnWidth || '145px'};
	padding: 5px 0px;
	border-radius: 8px;
	width: 100%;
	text-align: center;
	background: ${(props) => props.$isOutOfBounds && props.theme.error};
`;
const DollarSign = styled.span`
	font-size: 1em;
`;
const PercentSign = styled.span`
	font-size: 1em;
`;
const EditableCell = ({ value, title, onChange, DataType, isOutOfBounds = false, columnWidth }) => {
	const [inputValue, setInputValue] = useState(value);

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleBlur = () => {
		onChange(inputValue);
	};

	useEffect(() => {
		setInputValue(value);
	}, [value]);

	return (
		<>
			{DataType === 'string' || DataType === 'percent' ? (
				<InputCell
					type='text'
					title={title}
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleBlur}
					$columnWidth={columnWidth}
					$isOutOfBounds={isOutOfBounds}
				/>
			) : isOutOfBounds ? (
				<Tooltip content='Order quantity is not within the order limits.' direction='left'>
					<InputCell
						type='number'
						value={inputValue}
						onChange={handleInputChange}
						onBlur={handleBlur}
						$columnWidth={columnWidth}
						$isOutOfBounds={isOutOfBounds}
					/>
				</Tooltip>
			) : (
				<InputCell
					type='number'
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleBlur}
					$columnWidth={columnWidth}
					$isOutOfBounds={isOutOfBounds}
				/>
			)}
		</>
	);
};

const DropdownCell = ({ value, title, options, onChange }) => {
	return (
		<Select 
			value={value}
			title={title}
			onChange={(e) => onChange(e.target.value)}>
			{options.map((item, index) => (
				<option key={index} value={item.qsrItemID}>
					{item.description}
				</option>
			))}
		</Select>
	);
};

const OrderLimitsCell = ({
	orderLimits,
	mappingQuantityMultiplier,
	inventoryItemID,
	columntype,
	onClick,
	columnWidth,
}) => {
	const orderLimit = orderLimits?.find((item) => item.qsrInventoryItemID === inventoryItemID);
	let minOrderQuantity = 0;
	let maxOrderQuantity = 0;
	if (orderLimit) {
		minOrderQuantity = orderLimit.minOrderQuantity * mappingQuantityMultiplier;
		maxOrderQuantity = orderLimit.maxOrderQuantity * mappingQuantityMultiplier;
	}
	return (
		<LimitsCell columntype={columntype} onClick={onClick} $columnWidth={columnWidth} className='order-limits'>
			{minOrderQuantity} | {maxOrderQuantity}
		</LimitsCell>
	);
};

const TreeNode = ({
	companyAndUnitData,
	node: initialNode,
	isExpanded,
	onToggleNode,
	onEdit,
	columnWidths,
	isEditable,
	dataTypes,
	setQid,
	orderLimits,
	setOrderLimits,
}) => {
	const [selectedVendorItems, setSelectedVendorItems] = useState([]);
	const [node, setNode] = useState(initialNode);
	const [isOrderLimitModalOpen, setIsOrderLimitModalOpen] = useState(false);
	const [orderLimitModalData, setOrderLimitModalData] = useState({});

	useEffect(() => {
		setNode(initialNode);
	}, [initialNode]);
	const toggleNode = () => {
		onToggleNode(node);
	};

	const handleEditfield = async (field, value, index) => {
		try {
			const updatedNode = await handleEdit(
				field,
				value,
				index,
				node,
				selectedVendorItems,
				setSelectedVendorItems,
				onEdit,
				setQid,
				orderLimits
			);
			if (!updatedNode) {
				throw new Error('Failed to update node');
			}
			const updatedSuggestedOrderItem = node.suggestedOrderItem.map((item) => {
				const updatedVendorItems = updatedNode.suggestedOrderItem.find(
					(updatedItem) => updatedItem.qsrInventoryItemID === item.qsrInventoryItemID
				).vendorItems;
				return {
					...item,
					vendorItems: item.vendorItems.map((vendorItem) => {
						const updatedVendorItem = updatedVendorItems.find(
							(updatedItem) => updatedItem?.vendorItemReference === vendorItem.vendorItemReference
						);
						return updatedVendorItem ? updatedVendorItem : vendorItem;
					}),
				};
			});

			const newNode = {
				...node,
				suggestedOrderItem: updatedSuggestedOrderItem,
			};

			setNode(newNode);
			onEdit(newNode);
		} catch (error) {
			console.error('Error updating node:', error);
		}
	};

	const handleVendorChange = (selectedQsrItemID, index) => {
		handleVendorItemChange(node, selectedQsrItemID, index, setSelectedVendorItems, onEdit);
	};

	const formatPercentage = (value) => {
		if (value && value !== '%' && value !== null && value !== '') {
			// Try to avoid string Checking issues
			try {
				if (value.endsWith('%')) {
					return value;
				}
			} catch (error) {
				// console.warn(error);
			}
			// setEditValue(value + "%");

			return value + '%';

			// if (value.endsWith("%")) {
			//   return value;
			// } else {
			//   return value + "%";
			// }
		} else {
			return '0%';
		}
	};

	const openOrderLimitModal = (inventoryItemData, vendorItemData) => {
		let itemOrderQuantities = orderLimits?.find(
			(item) => inventoryItemData.qsrInventoryItemID === item.qsrInventoryItemID
		);
		if (!itemOrderQuantities) {
			itemOrderQuantities = {
				qsrInventoryItemID: inventoryItemData.qsrInventoryItemID,
				minOrderQuantity: 0,
				maxOrderQuantity: 0,
			};
		}
		setOrderLimitModalData({
			inventoryItemData,
			vendorItemData,
			itemOrderQuantities,
		});
		setIsOrderLimitModalOpen(true);
	};

	const checkOrderQtyOutOfBounds = (quantity, inventoryItemID, mappingQuantityMultiplier) => {
		var limits = orderLimits?.find((item) => item.qsrInventoryItemID === inventoryItemID);
		if (limits) {
			const max = limits.maxOrderQuantity * mappingQuantityMultiplier;
			const min = limits.minOrderQuantity * mappingQuantityMultiplier;
			if (quantity < min) {
				return true;
			} else if (quantity > max && max > 0) {
				return true;
			} else return false;
		}
	};

	useEffect(() => {
		const initialSelectedVendorItems = [];
		node.suggestedOrderItem.forEach((childNode, index) => {
			const defaultVendorItem = childNode.vendorItems.find((vendorItem) => vendorItem.isSelected);
			initialSelectedVendorItems[index] = defaultVendorItem;
		});
		setSelectedVendorItems(initialSelectedVendorItems);
	}, [node]);
	return (
		<>
			<div className={` relative text-sm border-b border-[var(--tw-secondary)] bg-gray-100`}>
				<div className=' py-1 font-semibold'>
					<div className=' flex cursor-pointer ' onClick={toggleNode}>
						{isExpanded ? <SlArrowUpIcon /> : <SlArrowDownIcon />}
						{node.name}
					</div>
				</div>
			</div>
			<SetOrderLimitsModal
				companyAndUnitData={companyAndUnitData}
				isOpen={isOrderLimitModalOpen}
				onClose={() => setIsOrderLimitModalOpen(false)}
				inventoryItemData={orderLimitModalData.inventoryItemData}
				vendorItemData={orderLimitModalData.vendorItemData}
				itemOrderQuantities={orderLimitModalData.itemOrderQuantities}
				setOrderLimits={setOrderLimits}
				orderLimits={orderLimits}
			/>
			{isExpanded &&
				node.suggestedOrderItem &&
				node.suggestedOrderItem.map((childNode, index) =>
					!childNode.isHidden ? (
						<div className=' relative items-center text-sm border-b border-gray-300 py-1 flex justify-center gap-[10px]' key={index}>
							<StyledCell $columnWidth={columnWidths[0]} title={childNode.invItemDescription}>{childNode.invItemDescription}</StyledCell>
							<StyledCell $columnWidth={columnWidths[1]}>
								{childNode.vendorItems && (
									<DropdownCell
										value={selectedVendorItems[index]?.qsrItemID || ''}
										title={selectedVendorItems[index]?.description}
										options={childNode.vendorItems}
										onChange={(value) => handleVendorChange(value, index)}
									/>
								)}
							</StyledCell>
							{selectedVendorItems[index] && (
								<>
									{isEditable[0] ? (
										<EditableCell
											value={selectedVendorItems[index].vendorItemReference}
											onChange={(value) => handleEditfield('vendorItemReference', value, index)}
											DataType={dataTypes[2]}
											columnWidth={columnWidths[2]}
										/>
									) : (
										<StyledCell $columnWidth={columnWidths[2]}>
											{selectedVendorItems[index].vendorItemReference}
										</StyledCell>
									)}
									{isEditable[1] ? (
										<EditableCell
											value={selectedVendorItems[index].unitOfMeasure}
											onChange={(value) => handleEditfield('unitOfMeasure', value, index)}
											DataType={dataTypes[3]}
											columnWidth={columnWidths[3]}
										/>
									) : (
										<StyledCell $columnWidth={columnWidths[3]}>
											{selectedVendorItems[index].unitOfMeasure}
										</StyledCell>
									)}
									{isEditable[2] ? (
										<EditableCell
											value={selectedVendorItems[index].packSize}
											onChange={(value) => handleEditfield('packSize', value, index)}
											DataType={dataTypes[4]}
											columnWidth={columnWidths[4]}
										/>
									) : (
										<StyledCell $columnWidth={columnWidths[4]}>
											{selectedVendorItems[index].packSize}
										</StyledCell>
									)}
									{isEditable[3] ? (
										<>
											<DollarSign>$</DollarSign>
											<EditableCell
												value={selectedVendorItems[index].latestInvoicePrice}
												onChange={(value) =>
													handleEditfield('latestInvoicePrice', value, index)
												}
												DataType={dataTypes[5]}
												style={{ textAlign: 'center' }}
												columnWidth={columnWidths[5]}
											/>
										</>
									) : (
										<StyledCell style={{ textAlign: 'center' }} $columnWidth={columnWidths[5]}>
											<DollarSign>$</DollarSign>
											{selectedVendorItems[index].latestInvoicePrice}
										</StyledCell>
									)}
									{isEditable[4] ? (
										<>
											<EditableCell
												value={formatPercentage(selectedVendorItems[index].safetyFactor)}
												onChange={(value) => handleEditfield('safetyFactor', value, index)}
												DataType={dataTypes[6]}
												columnWidth={columnWidths[6]}
											/>
										</>
									) : (
										<StyledCell $columnWidth={columnWidths[6]}>
											{selectedVendorItems[index].safetyFactor}
											<PercentSign>%</PercentSign>
										</StyledCell>
									)}

									{isEditable[5] ? (
										<EditableCell
											value={selectedVendorItems[index].suggestedQty}
											onChange={(value) => handleEditfield('suggestedQty', value, index)}
											DataType={dataTypes[7]}
											columnWidth={columnWidths[7]}
										/>
									) : (
										<StyledCell columntype={dataTypes[7]} $columnWidth={columnWidths[7]}>
											{selectedVendorItems[index].suggestedQty}
										</StyledCell>
									)}
									{isEditable[6] ? (
										<EditableCell
											value={selectedVendorItems[index].onHandQty}
											onChange={(value) => handleEditfield('onHandQty', value, index)}
											DataType={dataTypes[8]}
											columnWidth={columnWidths[8]}
										/>
									) : (
										<StyledCell $columnWidth={columnWidths[8]}>
											{selectedVendorItems[index].onHandQty}
										</StyledCell>
									)}
									{
										<OrderLimitsCell
											columntype={dataTypes[8]}
											onClick={() => {
												const inventoryItemData = {
													qsrInventoryItemID: childNode.qsrInventoryItemID,
													invItemDescription: childNode.invItemDescription,
													invItemMainUOM: childNode.invItemMainUOM,
												};
												const selectedVendorItemData = {
													description: selectedVendorItems[index].description,
													unitOfMeasure: selectedVendorItems[index].unitOfMeasure,
													mappingQuantityMultiplier:
														selectedVendorItems[index].mappingQuantityMultiplier,
												};
												openOrderLimitModal(inventoryItemData, selectedVendorItemData);
											}}
											orderLimits={orderLimits}
											mappingQuantityMultiplier={
												selectedVendorItems[index].mappingQuantityMultiplier
											}
											inventoryItemID={childNode.qsrInventoryItemID}
											columnWidth={columnWidths[9]}
										/>
									}
									{isEditable[7] ? (
										<EditableCell
											value={selectedVendorItems[index].orderQty}
											isOutOfBounds={checkOrderQtyOutOfBounds(
												selectedVendorItems[index].orderQty,
												childNode.qsrInventoryItemID,
												selectedVendorItems[index].mappingQuantityMultiplier
											)}
											onChange={(value) => handleEditfield('orderQty', value, index)}
											DataType={dataTypes[10]}
											columnWidth={columnWidths[10]}
										/>
									) : (
										<StyledCell $columnWidth={columnWidths[10]}>
											{selectedVendorItems[index].orderQty}
										</StyledCell>
									)}
									{isEditable[8] ? (
										<EditableCell
											value={selectedVendorItems[index].extendedPrice}
											// value={(selectedVendorItems[index].latestInvoicePrice * selectedVendorItems[index].orderQty).toFixed(2)}
											onChange={(value) => handleEditfield('extendedPrice', value, index)}
											DataType={dataTypes[11]}
											columnWidth={columnWidths[11]}
										/>
									) : (
										<StyledCell columntype={dataTypes[11]} $columnWidth={columnWidths[11]}>
											{selectedVendorItems[index].extendedPrice}
										</StyledCell>
									)}
								</>
							)}
						</div>
					) : null
				)}
		</>
	);
};

TreeNode.propTypes = {
	node: PropTypes.object.isRequired,
	isExpanded: PropTypes.bool,
	onToggleNode: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	columnWidths: PropTypes.string,
	isEditable: PropTypes.arrayOf(PropTypes.bool).isRequired,
	dataTypes: PropTypes.array,
	setQid: PropTypes.func,
};

export default TreeNode;
