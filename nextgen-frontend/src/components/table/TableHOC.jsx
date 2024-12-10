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
	getGroupedRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	flexRender,
} from '@tanstack/react-table';
import useTableView from '../../hooks/useTableView';
import ColumnFilter from './ColumnFilter';

const getCommonPinningStyles = (column, row) => {
	const isPinned = column.getIsPinned();
	const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
	const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

	return {
		boxShadow:
			row === 'footer' || row === 'header'
				? null
				: isLastLeftPinnedColumn
				? '-4px 0 4px -4px var(--tw-primary) inset'
				: isFirstRightPinnedColumn
				? '4px 0 4px -4px gray inset'
				: undefined,
		left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
		right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
		position: isPinned ? 'sticky' : '',
		width: column.getSize(),
		zIndex: isPinned ? 1 : 0,
		backgroundColor: 'white',
	};
};

function TableHOC({
	columns,
	data,
	isHeader = true,
	isPaginated = false,
	isFooter = false,
	view,
	isTableRendered,
	setIsTableRendered,
	setTableState,
	expandCollapseButtons = false,
	enableColumnFilters = false,
	headerPosition = 'center',
	dataPosition = 'text-center',
	detailOnTop,
	onCallBack,
}) {
	const [expanded, setExpanded] = useState({});
	const [columnFilters, setColumnFilters] = useState([]);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
	const [grouping, setGrouping] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [columnPinning, setColumnPinning] = useState({});

	const table = useReactTable({
		data,
		columns,
		filterFns: {},
		state: {
			columnPinning,
			expanded,
			columnFilters,
			pagination,
			grouping,
			columnVisibility,
		},
		onColumnPinningChange: setColumnPinning,
		onColumnVisibilityChange: setColumnVisibility,
		onGroupingChange: setGrouping,
		onPaginationChange: setPagination,
		enableColumnFilters: enableColumnFilters,
		onColumnFiltersChange: setColumnFilters,
		onExpandedChange: setExpanded,
		getSubRows: (row) => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(isPaginated && { getPaginationRowModel: getPaginationRowModel() }),
		getExpandedRowModel: getExpandedRowModel(),
		getFacetedRowModel: getFacetedRowModel(), // client-side faceting
		getFacetedUniqueValues: getFacetedUniqueValues(),
		//filterFromLeafRows: true,
		//maxLeafRowFilterDepth: 1,
		columnResizeMode: 'onChange',
		debugTable: false,
	});

	console.log(view);
	useTableView(table, view, isTableRendered);

	useEffect(() => {
		if (setTableState) {
			setTableState(table.getState());
		}
		table.getAllColumns().map((column) => {
			if (column.columnDef.show === false) {
				column.toggleVisibility(false);
			} else {
				if (table.getExpandedDepth() < column.columnDef.showDepth) {
					column.toggleVisibility(false);
				} else {
					column.toggleVisibility(true);
				}
			}
		});
	}, [table, table.getState().expanded]);

	useEffect(() => {
		const newGrouping = [];
		table.getHeaderGroups().forEach((headerGroup) => {
			headerGroup.headers.forEach((header) => {
				if (header.column.columnDef.groupBy && !newGrouping.includes(header.column.id)) {
					newGrouping.push(header.column.id);
				}
			});
		});

		table.setGrouping(newGrouping);
	}, [table]);

	useEffect(() => {
		const currentExpanded = table.getState().expanded;
		table.setExpanded(currentExpanded);
	}, [columnFilters]);

	//Set isTableRendered to true after the table has rendered once
	useEffect(() => {
		if (table.getRowModel().rows.length > 0 && !isTableRendered && setIsTableRendered) {
			setIsTableRendered(true);
		}
	}, [table.getRowModel().rows.length, isTableRendered, setIsTableRendered]);

	return (
		<div className='rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-3 p-3'>
			<div className='flex items-center gap-2'>
				{expandCollapseButtons && (
					<div className='flex items-center my-4 space-x-4'>
						<button
							onClick={() => table.toggleAllRowsExpanded(true)}
							className={`flex items-center w-[164px] justify-center gap-[10px] px-5 py-[10px] font-medium border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button ${
								table.getIsAllRowsExpanded()
									? 'bg-[var(--tw-primary)] text-white'
									: 'text-[var(--tw-primary)]'
							}`}
						>
							Expand All
							<IoIosArrowDown />
						</button>
						<button
							onClick={() => table.toggleAllRowsExpanded(false)}
							className={`flex items-center w-[164px] justify-center gap-[10px] px-5 py-[10px] font-medium border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button ${
								table.getIsAllRowsExpanded()
									? 'text-[var(--tw-primary)]'
									: 'bg-[var(--tw-primary)] text-white'
							}`}
						>
							Collapse All
							<IoIosArrowUp />
						</button>
					</div>
				)}
				<div className='text-xl font-bold'>{detailOnTop}</div>
			</div>

			{/* table */}
			<div className='tableHOC pr-1 max-h-[60vh] overflow-auto'>
				<table className='w-full border-collapse table-auto select-none'>
					{isHeader && (
						<thead className='sticky top-0 z-[2] w-full bg-white shadow-[0_-1px_0_var(--tw-primary)_inset]'>
							{table.getHeaderGroups().map((headerGroup) => (
								<>
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<th
													key={header.id}
													colSpan={header.colSpan}
													className='py-2'
													style={{
														minWidth: header.getSize(),
														width: 'auto',
														...getCommonPinningStyles(header.column, 'header'),
													}}
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
																			? `cursor-pointer flex gap-1 items-center text-${headerPosition}`
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
														<div>
															<div
																{...{
																	className: header.column.getCanSort()
																		? `cursor-pointer flex gap-1 items-center text-${headerPosition}`
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
															{!header.isPlaceholder &&
																header.column.getCanPin() &&
																header.column.columnDef.pinDirection &&
																header.column.getIsPinned() !==
																	header.column.columnDef.pinDirection &&
																header.column.pin(header.column.columnDef.pinDirection)}
															{header.column.columnDef.groupBy === true
																? header.column.getToggleGroupingHandler(true)
																: null}
														</div>
													)}
												</th>
											);
										})}
									</tr>
									{/*  column filters */}
									{enableColumnFilters && (
										<tr key={headerGroup.id}>
											{headerGroup.headers.map((header) => {
												return (
													<th
														key={header.id}
														colSpan={header.colSpan}
														className='p-1 py-2 text-right border-b border-gray-300 cursor-pointer'
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
									)}
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
									className={`h-[35px] font-normal border-y relative hover:bg-gray-100 ${
										row.getCanExpand() ? 'cursor-pointer' : 'cursor-default'
									}`}
									onClick={(e) => {
										e.stopPropagation();
										if (!row.getCanExpand()) {
											onCallBack(row.original);
										} else if (row.getCanExpand()) {
											row.getToggleExpandedHandler()(e);
										}
									}}
								>
									{row.getVisibleCells().map((cell) => {
										return (
											<td
												key={cell.id}
												className={`${dataPosition} text-nowrap`}
												style={
													cell.column.columnDef.pinDirection
														? getCommonPinningStyles(cell.column)
														: {}
												}
											>
												{cell.getIsGrouped() ? (
													// If it's a grouped cell, add an expander and row count
													<div className='flex items-center gap-2'>
														{flexRender(cell.column.columnDef.cell, cell.getContext())} (
														{row.subRows.length})
													</div>
												) : cell.getIsPlaceholder() ? null : (
													flexRender(cell.column.columnDef.cell, cell.getContext())
												)}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>

					{/* footer */}
					{isFooter && (
						<tfoot className='sticky z-[2] bg-white h-fit -bottom-1 shadow-[0_1px_0_var(--tw-primary)_inset]'>
							{table.getFooterGroups().map((footerGroup) => (
								<>
									<tr className='' key={footerGroup.id}>
										{footerGroup.headers.map((footer) => (
											<td
												key={footer.id}
												className='p-2 text-left cursor-pointer shadow-[0_1px_0_var(--tw-primary)_inset] '
												style={{
													width: footer.getSize(),
													...getCommonPinningStyles(footer.column, 'footer'),
												}}
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
							className='px-3 py-1 mx-1 bg-white border border-gray-300 active:outline-[var(--tw-primary)] hover:bg-gray-200 disabled:bg-gray-100'
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							First
						</button>

						<button
							className='px-3 py-1 mx-1 bg-white border border-gray-300 active:outline-[var(--tw-primary)] hover:bg-gray-200 disabled:bg-gray-100'
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
							className='px-3 py-1 mx-1 bg-white border border-gray-300 active:outline-[var(--tw-primary)] hover:bg-gray-200 disabled:bg-gray-100'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</button>

						<button
							className='px-3 py-1 mx-1 bg-white border border-gray-300 active:outline-[var(--tw-primary)] hover:bg-gray-200 disabled:bg-gray-100'
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
						{[10, 20, 25].map((pageSize) => (
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
	view: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
	isHeader: PropTypes.bool,
	isPaginated: PropTypes.bool,
	isFooter: PropTypes.bool,
	isTableRendered: PropTypes.bool,
	setIsTableRendered: PropTypes.func,
	setTableState: PropTypes.func,
	expandCollapseButtons: PropTypes.bool,
	enableColumnFilters: PropTypes.bool,
	headerPosition: PropTypes.string,
	dataPosition: PropTypes.string,
	detailOnTop: PropTypes.node,
	onCallBack: PropTypes.func,
};

export default TableHOC;
