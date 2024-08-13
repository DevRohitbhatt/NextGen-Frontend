import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import PropTypes from 'prop-types';
import { Tooltip, SearchBar, TreeNode } from '../index.js';
import { FaInfoCircle } from 'react-icons/fa';

const InfoIcon = styled(FaInfoCircle)`
	color: ${(props) => props.theme.secondary};
	width: 10px;
	position: absolute;
	left: -12px;
	top: 0;
`;

const StyledTable = styled.div`
	border-radius: 30px;
	padding: ${(props) => (props.$scrollable ? '0 15px 0 0' : '15px')};
	display: grid;
	grid-template-columns: ${(props) => (props.columnWidths ? props.columnWidths : 'auto')}; // Use the prop here
	grid-auto-rows: auto;
	align-items: center;

	overflow-y: ${(props) => (props.$scrollable ? 'scroll' : 'hidden')};

	&::-webkit-scrollbar {
		width: 15px;
	}

	&::-webkit-scrollbar-track-piece {
		background: #f1f1f1;
		border-radius: 30px;
	}

	&::-webkit-scrollbar-thumb {
		background: ${(props) => props.theme.primary};
		border-radius: 30px;
		padding: 18px !important;
		cursor: pointer;
	}

	&::-webkit-scrollbar-button:start:decrement {
		height: 94px;
		display: block;
		background: transparent;
	}

	&::-webkit-scrollbar-button:end:increment {
		height: 20px;
		display: block;
		background: transparent;
	}

	h3 {
		margin-bottom: 20px;
		font-size: 1.75em;
	}
`;

const ButtonContainer = styled.div`
	margin-bottom: 10px;
	display: flex;
	gap: 10px;
`;

const ButtonAndSearchContainer = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
`;

const TableHeader = styled.div`
	width: 100%;
	display: flex;
	gap: 15px;
	margin-bottom: 10px;
	padding-bottom: 10px;
	//  min-width:145px;
	border-bottom: 2px solid ${(props) => props.theme.primary};
`;

const TableHeaderCell = styled.div`
	font-weight: 500;
	font-size: 14px;
	// height: 44px;
	padding: 10px 0;
	width: 100%;
	min-width: ${(props) => props.$columnWidth || '145px'};
	text-align: ${(props) => (props.columntype === 'number' || props.columntype === 'percent' ? 'center' : 'left')};
`;

const HeaderCellContainer = styled.div`
	position: relative;
	width: fit-content;
	margin: ${(props) => (props.columntype === 'number' || props.columntype === 'percent' ? 'auto' : 'none')};
`;

const CollapseButton = styled.button`
	box-shadow: inset 0 0 0 2px ${(props) => props.theme.primary};
	transition: color 0.25s 0.0833333333s;
	position: relative;
	border-radius: 0px;
	width: 164px;
	margin: 0 auto;
	background-color: ${(props) => (props.isActive ? props.theme.primary : props.theme.White)};
	color: ${(props) => (props.isActive ? props.theme.white : props.theme.primary)};

	&::after {
		border: 0 solid transparent;
		box-sizing: border-box;
		content: '';
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
		content: '';
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
		border-color: ${(props) => props.theme.white};
		transition: border-color 0s, width 0.25s, height 0.25s;
		width: 100%;
		height: 100%;
		transition-delay: 0s, 0.25s, 0s;
	}
	&:hover::before {
		border-color: ${(props) => props.theme.white};
		transition: border-color 0s, width 0.25s, height 0.25s;
		width: 100%;
		height: 100%;
		transition-delay: 0s, 0s, 0.25s;
	}
	&:hover {
		border-color: transparent;
		color: ${(props) => props.theme.white};
		background: ${(props) => props.theme.primary};
	}
	&:focus {
		outline: none;
	}
`;

export default function TreeTable({
	companyAndUnitData,
	data: initialData,
	setData,
	columnHeaders,
	headerClassNames,
	dataTypes,
	setQid,
	headerTooltips,
	toolTipDirection,
	onSearch,
	orderLimits,
	setOrderLimits,
	columnWidths,
	handleAddNewItem = null,
}) {
	const [expandedNodes, setExpandedNodes] = useState({});
	const [isCollapseActive, setIsCollapseActive] = useState(false);
	const [isExpandActive, setIsExpandActive] = useState(false);

	useEffect(() => {
		setIsCollapseActive(true);
		setIsExpandActive(false);
	}, [initialData]);

	const toggleNode = (node) => {
		const updatedExpandedNodes = { ...expandedNodes };
		updatedExpandedNodes[node.name] = !updatedExpandedNodes[node.name];
		setExpandedNodes(updatedExpandedNodes);
	};

	const handleEdit = (updatedNode) => {
		const updatedData = initialData.map((node) => {
			if (node.name === updatedNode.name) {
				return updatedNode;
			}
			return node;
		});
		setData(updatedData);
	};

	useEffect(() => {
		setData(initialData);
	}, [initialData]);

	const handleCollapseAll = () => {
		setExpandedNodes({});
		setIsCollapseActive(true);
		setIsExpandActive(false);
	};

	const handleExpandAll = () => {
		const allExpandedNodes = {};
		initialData.forEach((node) => {
			allExpandedNodes[node.name] = true;
		});
		setExpandedNodes(allExpandedNodes);
		setIsCollapseActive(false);
		setIsExpandActive(true);
	};

	const handleSearch = (searchTerm) => {
		onSearch(searchTerm, setExpandedNodes);
	};

	const isEditableArray = [false, false, false, false, true, false, true, true, false, false];
	return (
		<>
			<ButtonAndSearchContainer>
				<ButtonContainer>
					<CollapseButton isActive={isCollapseActive} onClick={handleCollapseAll}>
						Collapse All <MdKeyboardArrowDown />
					</CollapseButton>
					<CollapseButton isActive={isExpandActive} onClick={handleExpandAll}>
						Expand All <MdKeyboardArrowUp />
					</CollapseButton>
					{handleAddNewItem === null ? null : (
						<CollapseButton onClick={handleAddNewItem} isActive={true}>
							Add New Item
						</CollapseButton>
					)}
				</ButtonContainer>
				{onSearch ? <SearchBar data={initialData} onSearch={handleSearch} /> : null}
			</ButtonAndSearchContainer>
			<StyledTable className='tree-table'>
				<TableHeader className='Header'>
					{columnHeaders.map((header, index) => (
						<TableHeaderCell
							key={index}
							columntype={dataTypes[index]}
							$columnWidth={columnWidths[index]}
							className={headerClassNames[index]}
						>
							{headerTooltips ? (
								headerTooltips[index] === '' ? (
									<div> {header} </div>
								) : toolTipDirection[index] === 'left' ? (
									<Tooltip content={headerTooltips[index]} direction='left'>
										<HeaderCellContainer columntype={dataTypes[index]}>
											{header} <InfoIcon />
										</HeaderCellContainer>
									</Tooltip>
								) : (
									<Tooltip content={headerTooltips[index]} direction='left'>
										<HeaderCellContainer columntype={dataTypes[index]}>
											{header} <InfoIcon />
										</HeaderCellContainer>
									</Tooltip>
								)
							) : (
								<div>{header}</div>
							)}
						</TableHeaderCell>
					))}
				</TableHeader>
				{initialData.map((node, index) => (
					<TreeNode
						companyAndUnitData={companyAndUnitData}
						key={index}
						node={node}
						isExpanded={expandedNodes[node.name]}
						onToggleNode={toggleNode}
						headers={columnHeaders}
						onEdit={handleEdit}
						isEditable={isEditableArray}
						dataTypes={dataTypes}
						setQid={setQid}
						orderLimits={orderLimits}
						setOrderLimits={setOrderLimits}
						columnWidths={columnWidths}
					/>
				))}
			</StyledTable>
		</>
	);
}

TreeTable.propTypes = {
	columnHeaders: PropTypes.array,
	dataTypes: PropTypes.array,
	columnWidths: PropTypes.string,
	data: PropTypes.array,
	setQid: PropTypes.func,
	headerTooltips: PropTypes.array,
	toolTipDirection: PropTypes.array,
	onSearch: PropTypes.func,
};
