import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Tooltip, SimpleTableRow as Row } from '../index.js';
import { FaInfoCircle } from 'react-icons/fa';

const InfoIcon = styled(FaInfoCircle)`
	color: ${(props) => props.theme.secondary};
`;

const TableWrapper = styled.div`
	margin: 20px;
	padding-right: 5px;
	max-height: 60vh;
	overflow-y: auto;

	&::-webkit-scrollbar {
		margin-left: 5px;
		background: #ffffff;
		width: 15px;
		height: 15px;
		cursor: pointer;
		border-radius: 10px;
	}

	&::-webkit-scrollbar-thumb {
		background: ${(props) => props.theme.primary};
		border-radius: 30px;
		padding: 18px !important;
		border: 2px solid #fff;
		cursor: pointer;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: ${(props) => props.theme.secondary};
	}
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;

	thead {
		background-color: #fff;
		position: sticky;
		top: 0;
		border-bottom: 1px solid #ddd;
	}

	tbody {
		max-height: 50vh;
	}
`;

const TableHeader = styled.th`
	padding: 8px;
	border-bottom: 1px solid #ddd;
	cursor: pointer;
	text-align: left;
`;

const TableRow = styled.tr`
	border-bottom: 1px solid #ddd;
	&:last-child {
		border-bottom: none;
	}
`;

const PagingContainer = styled.div`
	margin-top: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const PageButton = styled.button`
	margin: 0 5px;
	padding: 5px 10px;
	border: 1px solid #ddd;
	background-color: ${({ isActive }) => (isActive ? '#ccc' : '#fff')};
	cursor: pointer;

	&:hover {
		background-color: #f2f2f2;
	}
`;

const PageSizeSelect = styled.select`
	margin-left: 10px;
	padding: 5px 10px;
`;

const PaginationInfo = styled.span`
	margin: 0 10px;
`;

const TableComponent = ({ data, headers, onRowClick, itemsPerPageOptions = [5, 10, 20], isPaginated = true }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
	const [tableData, setTableData] = useState(data);

	useEffect(() => {
		if (!data) {
			return;
		}
		setTableData(data);
	}, [data]);

	// Sort data based on the column header clicked
	const sortedData = () => {
		if (sortConfig.key) {
			const sorted = [...tableData].sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key]) {
					return sortConfig.direction === 'asc' ? -1 : 1;
				}
				if (a[sortConfig.key] > b[sortConfig.key]) {
					return sortConfig.direction === 'asc' ? 1 : -1;
				}
				return 0;
			});
			return sorted;
		}
		return tableData;
	};

	// Handle column header click to change sorting
	const handleSort = (key) => {
		let direction = 'asc';
		if (sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });
	};

	// Handle page change
	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	// Handle page size change
	const handlePageSizeChange = (e) => {
		setItemsPerPage(parseInt(e.target.value));
		setCurrentPage(1); // Reset to first page when changing page size
	};

	// Calculate total pages
	const totalPages = Math.ceil(tableData?.length / itemsPerPage);
	const startIndex = isPaginated ? (currentPage - 1) * itemsPerPage : 0;
	const endIndex = isPaginated ? Math.min(startIndex + itemsPerPage, tableData?.length) : tableData?.length;

	const handleRowClick = (selectedRow) => {
		onRowClick(selectedRow);
	};

	return (
		<TableWrapper>
			<Table className='paged-table'>
				<thead>
					<tr>
						{headers.map((header, index) => (
							<TableHeader key={index} onClick={() => handleSort(header.key)}>
								{header.toolTipDirection === '' || !header.toolTipDirection ? (
									header.label
								) : header.toolTipDirection === 'left' ? (
									<Tooltip content={header.toolTip} direction='left'>
										<InfoIcon /> {header.label}
									</Tooltip>
								) : (
									<Tooltip content={header.toolTip} direction='right'>
										{header.label} <InfoIcon />
									</Tooltip>
								)}{' '}
								{sortConfig.key === header.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
							</TableHeader>
						))}
					</tr>
				</thead>
				<tbody>
					{sortedData()?.length === 0 || !sortedData()?.length ? (
						<TableRow>
							<td colSpan={headers.length} style={{ textAlign: 'center' }}>
								No data found for the given parameters.
							</td>
						</TableRow>
					) : (
						sortedData()
							?.slice(startIndex, endIndex)
							.map((row, rowIndex) => (
								<Row headers={headers} key={rowIndex} item={row} onItemClick={handleRowClick} />
							))
					)}
				</tbody>
			</Table>
			{!isPaginated ? null : (
				<PagingContainer>
					<PageButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
						First
					</PageButton>
					<PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
						Prev
					</PageButton>
					<PaginationInfo>
						Page {currentPage} of {totalPages}
					</PaginationInfo>
					<PageButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
						Next
					</PageButton>
					<PageButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
						Last
					</PageButton>
					<PageSizeSelect value={itemsPerPage} onChange={handlePageSizeChange}>
						{itemsPerPageOptions.map((option, index) => (
							<option key={index} value={option}>
								{option} per page
							</option>
						))}
					</PageSizeSelect>
				</PagingContainer>
			)}
		</TableWrapper>
	);
};

TableComponent.propTypes = {
	data: PropTypes.array,
	headers: PropTypes.array,
	onRowClick: PropTypes.func,
	itemsPerPageOptions: PropTypes.array,
};

export default TableComponent;
