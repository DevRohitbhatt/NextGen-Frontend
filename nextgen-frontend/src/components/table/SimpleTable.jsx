import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, SimpleTableRow as Row } from '../index.js';
import { FaInfoCircle } from 'react-icons/fa';

const TableComponent = ({ data, headers, onRowClick, itemsPerPageOptions = [5, 10, 20], isPaginated = true }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
	const [tableData, setTableData] = useState(data);
	const [filters, setFilters] = useState(() => headers.reduce((acc, header) => ({ ...acc, [header.key]: '' }), {}));
	const [filteredData, setFilteredData] = useState(data);

	useEffect(() => {
		if (data) {
			let filtered = data;

			// Apply filters
			Object.keys(filters).forEach((key) => {
				if (filters[key]) {
					filtered = filtered.filter((item) =>
						item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())
					);
				}
			});

			setFilteredData(filtered);
		}
	}, [data, filters]);

	const handleFilterChange = (key, value) => {
		setFilters((prevFilters) => ({
			...prevFilters,
			[key]: value,
		}));
	};

	const sortedData   = () => {
    let sortableData = [...filteredData]; 
    if (sortConfig.key) {
        sortableData.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableData;
	};

	const handleSort = (key) => {
		let direction = 'asc';
		if (sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });
	};

	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (e) => {
		setItemsPerPage(parseInt(e.target.value));
		setCurrentPage(1); 
	};

	const totalPages = Math.ceil(tableData?.length / itemsPerPage);
	const startIndex = isPaginated ? (currentPage - 1) * itemsPerPage : 0;
	const endIndex = isPaginated ? Math.min(startIndex + itemsPerPage, tableData?.length) : tableData?.length;

	const handleRowClick = (selectedRow) => {
		onRowClick(selectedRow);
	};

	return (
		<div>
			<div className=' simpleTableContainer m-5 pr-1 max-h-[60vh] overflow-x-auto '>
				<table className='w-full border-collapse table-fixed'>
					<thead className='sticky top-0 bg-white border-b border-gray-300'>
						<tr className=''>
							{headers.map((header, index) => (
								<React.Fragment key={index}>
									<th
										className='gap-3 p-2 text-left border-b border-gray-300 cursor-pointer  '
										onClick={() => handleSort(header.key)}
									>
										{header.toolTipDirection === '' || !header.toolTipDirection ? (
											<>
												{header.label}
												{" "}
												{sortConfig.key === header.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
											</>
										) : header.toolTipDirection === 'left' ? (
											<Tooltip content={header.toolTip} direction='left'>
												<FaInfoCircle className='inline text-[var(--tw-primary)]' /> 
													{header.label }
													{" "}
													{sortConfig.key === header.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
											</Tooltip>
										) : (
											<Tooltip content={header.toolTip} direction='right'>
												{header.label}
												{" "}
												{sortConfig.key === header.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
												<FaInfoCircle className='inline text-[var(--tw-secondary)]' />
											</Tooltip>
										)}{' '}
									</th>
								</React.Fragment>
							))}
						</tr>
						<tr>
							{headers.map((header, index) => (
								<React.Fragment key={index}>
									<th className='p-2 border-b border-gray-300'>
										<input
											type='text'
											className='box-border w-full p-1 border-2 border-gray-300 border-solid hover:border-[var(--tw-primary)] focus:border-[var(--tw-primary)] focus:outline-none'
											value={filters[header.key] || ''}
											onChange={(e) => handleFilterChange(header.key, e.target.value)}
										/>
									</th>
								</React.Fragment>
							))}
						</tr>
					</thead>
					<tbody className='max-h-[50vh]'>
						{(() => {
							const sortedDataArray = sortedData();
							return (sortedDataArray.length === 0 ? (
									<tr>
											<td colSpan={headers.length} className='py-4 text-center'>
													No data found for the given parameters.
											</td>
									</tr>
							) : (
									sortedDataArray
											.slice(startIndex, endIndex)
											.map((row, rowIndex) => (
													<Row headers={headers} key={rowIndex} item={row} onItemClick={handleRowClick} />
											))
							));
						})()}
					</tbody>
				</table>
			</div>
			{!isPaginated ? null : (
				<div className='flex items-center justify-center mt-5'>
					<button
						className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
						onClick={() => handlePageChange(1)}
						disabled={currentPage === 1}
					>
						First
					</button>
					<button
						className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						Prev
					</button>
					<span className='mx-2'>
						Page {currentPage} of {totalPages}
					</span>
					<button
						className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
					<button
						className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
						onClick={() => handlePageChange(totalPages)}
						disabled={currentPage === totalPages}
					>
						Last
					</button>
					<select
						className='px-3 py-1 ml-2 border border-gray-300'
						value={itemsPerPage}
						onChange={handlePageSizeChange}
					>
						{itemsPerPageOptions.map((option, index) => (
							<option key={index} value={option}>
								{option} per page
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
};

TableComponent.propTypes = {
	data: PropTypes.array,
	headers: PropTypes.array,
	onRowClick: PropTypes.func,
	itemsPerPageOptions: PropTypes.array,
};

export default TableComponent;
