import { useState } from 'react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getExpandedRowModel,
	flexRender,
} from '@tanstack/react-table';

function TableHOC2(columns, data, isPaginated = true) {
	const [expanded, setExpanded] = useState({});

	const table = useReactTable({
		data,
		columns,
		state: {
			expanded,
		},
		onExpandedChange: setExpanded,
		getSubRows: (row) => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		...(isPaginated && { getPaginationRowModel: getPaginationRowModel() }),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		filterFromLeafRows: true,
		maxLeafRowFilterDepth: 1,
		debugTable: true,
	});

	return (
		<div className='rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-10 p-3'>
			{/* expand/collapse all button */}
			<div className='flex items-center my-4 space-x-4'>
				<button
					onClick={() => table.toggleAllRowsExpanded(false)}
					className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
						table.getIsAllRowsExpanded() ? 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]' : 'bg-[var(--tw-primary)] text-white'
					}`}
				>
					Collapse All
					<IoIosArrowDown />
				</button>
				<button
					onClick={() => table.toggleAllRowsExpanded(true)}
					className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
						table.getIsAllRowsExpanded() ? 'bg-[var(--tw-primary)] text-white' : 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
					}`}
				>
					Expand All
					<IoIosArrowUp />
				</button>
			</div>

			{/* table */}
			<div className='pr-1 max-h-[60vh] overflow-scroll scrollbar scrollbar-thumb-rounded-3xl scrollbar-thumb-[var(--tw-primary)] scrollbar-track-[var(--tw-secondary)]'>
				<table className='w-full border-collapse table-fixed '>
					<thead className='sticky top-0 w-full bg-white border-b-2 border-solid border-[var(--tw-primary)]'>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<th
											key={header.id}
											colSpan={header.colSpan}
											className='px-2 py-4 text-left border-b border-gray-300 cursor-pointer'
											style={{ width: header.getSize() }}
										>
											{header.isPlaceholder ? null : (
												<div>
													{flexRender(header.column.columnDef.header, header.getContext())}
												</div>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => {
							return (
								<tr key={row.id} className='h-12 text-sm font-normal border-b hover:bg-gray-100'>
									{row.getVisibleCells().map((cell) => {
										return (
											<td key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>

					{/* <tfoot className='sticky bottom-0 '>
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
					</tfoot> */}
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

export default TableHOC2;
