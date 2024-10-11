import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaSortAlphaUp, FaInfoCircle, FaSortAlphaDownAlt } from 'react-icons/fa';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { Tooltip } from '../index';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getExpandedRowModel,
	getSortedRowModel,
	flexRender,
} from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useTableView from '../../hooks/useTableView';

function DndTable({
	columns,
	data,
	isHeader = true,
	isPaginated = false,
	isFooter = false,
	view,
	isTableRendered,
	setIsTableRendered,
	expandCollapseButtons = false,
	enableColumnFilters = false,
	headerPosition = 'center',
	dataPosition = 'text-left',
}) {
	const [expanded, setExpanded] = useState({});
	const [columnFilters, setColumnFilters] = useState([]);
	const [rows, setRows] = useState(data);

	const table = useReactTable({
		data: rows,
		columns,
		state: {
			expanded,
			columnFilters,
		},
		enableColumnFilters: enableColumnFilters,
		onColumnFiltersChange: setColumnFilters,
		onExpandedChange: setExpanded,
		getSubRows: (row) => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(isPaginated && { getPaginationRowModel: getPaginationRowModel() }),
		getExpandedRowModel: getExpandedRowModel(),
		debugTable: false,
	});

	useTableView(table, view, isTableRendered);

	//Set isTableRendered to true after the table has rendered once
	useEffect(() => {
		if (table.getRowModel().rows.length > 0 && !isTableRendered && setIsTableRendered) {
			setIsTableRendered(true);
		}
	}, [table.getRowModel().rows.length, isTableRendered, setIsTableRendered]);

	// Handle drag and drop
	const handleOnDragEnd = (result) => {
		// Return early if no destination (drag outside the table)
		if (!result.destination) return;

		// Update the row positions
		const updatedRows = Array.from(rows);
		const [draggedRow] = updatedRows.splice(result.source.index, 1);
		updatedRows.splice(result.destination.index, 0, draggedRow);

		setRows(updatedRows); // Update the state with reordered rows
	};

	return (
		<div className='rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-3 p-3'>
			{/* expand/collapse all button */}
			{expandCollapseButtons && (
				<div className='flex items-center my-4 space-x-4'>
					<button
						onClick={() => table.toggleAllRowsExpanded(false)}
						className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
							table.getIsAllRowsExpanded()
								? 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
								: 'bg-[var(--tw-primary)] text-white'
						}`}
					>
						Collapse All
						<IoIosArrowDown />
					</button>
					<button
						onClick={() => table.toggleAllRowsExpanded(true)}
						className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
							table.getIsAllRowsExpanded()
								? 'bg-[var(--tw-primary)] text-white'
								: 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
						}`}
					>
						Expand All
						<IoIosArrowUp />
					</button>
				</div>
			)}

			<DragDropContext onDragEnd={handleOnDragEnd}>
				<Droppable droppableId='tableRows'>
					{(provided) => (
						<div
							className='DndTable pr-1 max-h-[60vh] overflow-auto'
							{...provided.droppableProps}
							ref={provided.innerRef}
						>
							<table className='w-full border-collapse table-fixed select-none'>
								{isHeader && (
									<thead className='sticky top-0 z-[2] w-full bg-white'>
										{table.getHeaderGroups().map((headerGroup) => (
											<tr key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<th key={header.id} colSpan={header.colSpan} className='p-2'>
														{header.column.columnDef.tooltip ? (
															<Tooltip content={header.column.columnDef.tooltip}>
																{header.isPlaceholder ? null : (
																	<div
																		{...{
																			className: header.column.getCanSort()
																				? 'cursor-pointer flex gap-1 items-center'
																				: '',
																			onClick:
																				header.column.getToggleSortingHandler(),
																		}}
																		style={{ justifyContent: headerPosition }}
																	>
																		<FaInfoCircle className='text-tooltip' />
																		{flexRender(
																			header.column.columnDef.header,
																			header.getContext()
																		)}
																		{{
																			asc: <FaSortAlphaUp />,
																			desc: <FaSortAlphaDownAlt />,
																		}[header.column.getIsSorted()] ?? null}
																	</div>
																)}
															</Tooltip>
														) : (
															<div
																{...{
																	className: header.column.getCanSort()
																		? 'cursor-pointer flex gap-1 items-center'
																		: '',
																	onClick: header.column.getToggleSortingHandler(),
																}}
																style={{ justifyContent: headerPosition }}
															>
																{flexRender(
																	header.column.columnDef.header,
																	header.getContext()
																)}
																{{
																	asc: <FaSortAlphaUp />,
																	desc: <FaSortAlphaDownAlt />,
																}[header.column.getIsSorted()] ?? null}
															</div>
														)}
													</th>
												))}
											</tr>
										))}
									</thead>
								)}
								<tbody>
									{table.getRowModel().rows.map((row, index) => (
										<Draggable
											key={row.id}
											draggableId={`row-${row.id}-${index}`} // Ensure unique ID for each row
											index={index}
										>
											{(provided) => (
												<tr
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													ref={provided.innerRef}
													className={`h-[35px] border-b hover:bg-gray-100 ${
														row.getCanExpand() ? 'cursor-pointer' : 'cursor-default'
													}`}
													onClick={row.getCanExpand() ? row.getToggleExpandedHandler() : null}
												>
													{row.getVisibleCells().map((cell) => (
														<td key={cell.id} className={`px-2 ${dataPosition}`}>
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</td>
													))}
												</tr>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</tbody>

								{/* footer */}
								{isFooter && (
									<tfoot className='sticky bottom-0 '>
										{table.getFooterGroups().map((footerGroup) => (
											<>
												<tr className='bg-white' key={footerGroup.id}>
													{footerGroup.headers.map((footer) => (
														<td
															key={footer.id}
															className='px-2 py-4 text-left border-b border-gray-300 cursor-pointer'
															style={{ width: footer.getSize() }}
															colSpan={footer.colSpan}
														>
															{flexRender(
																footer.column.columnDef.footer,
																footer.getContext()
															)}
														</td>
													))}
												</tr>
											</>
										))}
									</tfoot>
								)}
							</table>
						</div>
					)}
				</Droppable>
			</DragDropContext>

			<div className='h-2' />
			{/* pagination */}
			{isPaginated && (
				<div className='flex items-center justify-center px-4 py-3 border-t-[1px]'>
					<div className='flex gap-2'>
						<button
							className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							First
						</button>

						<button
							className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Prev
						</button>

						<div className='flex items-center gap-1'>
							<span>Page</span>
							<span>
								{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
							</span>
						</div>

						<button
							className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</button>

						<button
							className='px-3 py-1 mx-1 bg-white border border-gray-300 hover:bg-gray-200 disabled:bg-gray-100'
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							Last
						</button>
					</div>

					<select
						className='px-3 py-1 ml-2 border border-gray-300'
						value={table.getState().pagination.pageSize}
						onChange={(e) => {
							table.setPageSize(Number(e.target.value));
						}}
					>
						{[5, 10, 20].map((pageSize) => (
							<option key={pageSize} value={pageSize}>
								{`${pageSize} per page`}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
}

DndTable.propTypes = {
	view: PropTypes.object.isRequired,
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
	isHeader: PropTypes.bool,
	isPaginated: PropTypes.bool,
	isFooter: PropTypes.bool,
	isTableRendered: PropTypes.bool,
	setIsTableRendered: PropTypes.func,
	expandCollapseButtons: PropTypes.bool,
	enableColumnFilters: PropTypes.bool,
	headerPosition: PropTypes.string,
	dataPosition: PropTypes.string,
};

export default DndTable;