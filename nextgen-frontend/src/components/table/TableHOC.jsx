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
import useTableView from '../../hooks/useTableView';
import ColumnFilter from './ColumnFilter';

function TableHOC({
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
	dataPosition = 'text-center',
}) {
	const [expanded, setExpanded] = useState({});
	const [columnFilters, setColumnFilters] = useState([]);
	const table = useReactTable({
		data,
		columns,
		filterFns: {},
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
		//filterFromLeafRows: true,
		//maxLeafRowFilterDepth: 1,
		debugTable: false,
	});

	useTableView(table, view, isTableRendered);

	//Set isTableRendered to true after the table has rendered once
	useEffect(() => {
		if (table.getRowModel().rows.length > 0 && !isTableRendered && setIsTableRendered) {
			setIsTableRendered(true);
		}
	}, [table.getRowModel().rows.length, isTableRendered, setIsTableRendered]);

	return (
		<div className='rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-10 p-3'>
			{/* expand/collapse all button */}
			{expandCollapseButtons && (
				<div className='flex items-center my-4 space-x-4'>
					<button
						onClick={() => table.toggleAllRowsExpanded(false)}
						className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-primary  hover:text-white hover:bg-primary focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
							table.getIsAllRowsExpanded() ? 'text-primary bg-secondary' : 'bg-primary text-white'
						}`}
					>
						Collapse All
						<IoIosArrowDown />
					</button>
					<button
						onClick={() => table.toggleAllRowsExpanded(true)}
						className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-primary  hover:text-white hover:bg-primary focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
							table.getIsAllRowsExpanded() ? 'bg-primary text-white' : 'text-primary bg-secondary'
						}`}
					>
						Expand All
						<IoIosArrowUp />
					</button>
				</div>
			)}

			{/* table */}
			<div className='pr-1 max-h-[60vh] overflow-scroll scrollbar scrollbar-thumb-rounded-3xl scrollbar-thumb-primary scrollbar-track-secondary'>
				<table className='w-full border-collapse table-fixed select-none'>
					{isHeader && (
						<thead className='sticky top-0 z-[2] w-full bg-white outline-2 outline outline-primary'>
							{table.getHeaderGroups().map((headerGroup) => (
								<>
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<th
													key={header.id}
													colSpan={header.colSpan}
													className='px-2 py-4'
													style={{ width: header.getSize() }}
												>
													{header.column.columnDef.tooltip ? (
														<Tooltip
															content={header.column.columnDef.tooltip}
															direction='left'
														>
															{header.isPlaceholder ? null : (
																<div
																	{...{
																		className: header.column.getCanSort()
																			? 'cursor-pointer flex gap-1 items-center '
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
													) : header.isPlaceholder ? null : (
														<div
															{...{
																className: header.column.getCanSort()
																	? 'cursor-pointer flex gap-1 items-center '
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
											);
										})}
									</tr>
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<th
													key={header.id}
													colSpan={header.colSpan}
													className='px-2 pb-4 text-right border-b border-gray-300 cursor-pointer'
													style={{ width: header.getSize() }}
												>
													{header.isPlaceholder ? null : (
														<>
															{header.column.getCanFilter() ? (
																<div>
																	<ColumnFilter column={header.column} />
																</div>
															) : null}
														</>
													)}
												</th>
											);
										})}
									</tr>
								</>
							))}
						</thead>
					)}

					{/* body */}
					<tbody>
						{table.getRowModel().rows.map((row) => {
							return (
								<tr
									key={row.id}
									className={`h-12 text-sm font-normal border-b relative hover:bg-gray-100 ${
										row.getCanExpand() ? 'cursor-pointer' : 'cursor-default'
									}`}
									onClick={row.getCanExpand() ? row.getToggleExpandedHandler() : null}
								>
									{row.getVisibleCells().map((cell) => {
										return (
											<td key={cell.id} className={`px-2 ${dataPosition}`}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							);
						})}
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
												{flexRender(footer.column.columnDef.footer, footer.getContext())}
											</td>
										))}
									</tr>
								</>
							))}
						</tfoot>
					)}
				</table>
			</div>
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
TableHOC.propTypes = {
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

export default TableHOC;
