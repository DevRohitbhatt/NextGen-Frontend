import { useEffect, useReducer, useCallback, useRef, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { TiDelete } from 'react-icons/ti';
import { FaCheck } from 'react-icons/fa6';

import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	flexRender,
} from '@tanstack/react-table';

function useSkipper() {
	const shouldSkipRef = useRef(true);
	const shouldSkip = shouldSkipRef.current;

	const skip = useCallback(() => {
		shouldSkipRef.current = false;
	}, []);

	useEffect(() => {
		shouldSkipRef.current = true;
	});

	return [shouldSkip, skip];
}

export default function EditableTableHOC({
	data,
	columns,
	setData,
	headerPosition = 'text-center',
	dataPosition = 'text-center',
}) {
	const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
	const [editingRowId, setEditingRowId] = useState(null);
	const [value, setValue] = useState();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex,
		meta: {
			updateData: (rowIndex, columnId, value) => {
				skipAutoResetPageIndex();
				setData((old) =>
					old.map((row, index) => {
						if (index === rowIndex) {
							return {
								...old[rowIndex],
								[columnId]: value,
							};
						}
						return row;
					})
				);
			},
		},
		debugTable: true,
	});

	const handleEdit = (rowId) => {
		setEditingRowId(rowId);
	};

	const handleCancel = () => {
		setEditingRowId(null);
	};

	return (
		<div className='p-2'>
			<div className='tableHOC pr-1 max-h-[60vh] overflow-auto' />
			<table className='w-full border-collapse table-auto select-none'>
				<thead className='sticky top-0 z-[2] w-full bg-white shadow-[0_-1px_0_var(--tw-primary)_inset]'>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									colSpan={header.colSpan}
									className='py-2'
									style={{
										minWidth: header.getSize(),
										width: 'auto',
									}}
								>
									{header.isPlaceholder ? null : (
										<div className={`cursor-pointer items-center ${headerPosition}`}>
											{flexRender(header.column.columnDef.header, header.getContext())}
										</div>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className='h-[35px] font-normal border-y relative hover:bg-gray-100'>
							{row.getVisibleCells().map((cell, cellIndex) => (
								<td className={`${dataPosition} text-nowrap`} key={cell.id}>
									{cellIndex === 0 && (
										<div className='flex gap-2'>
											{editingRowId === row.id ? (
												<div className='flex gap-2'>
													<FaCheck
														onClick={(e) =>
															table.options.meta.updateData(
																row.index,
																cell.column.id,
																e.target.value
															)
														}
													/>
													<TiDelete onClick={handleCancel} />
												</div>
											) : (
												<div className='flex gap-2'>
													<FiEdit2 onClick={() => handleEdit(row.id)} />
													<TiDelete />
												</div>
											)}
										</div>
									)}
									{editingRowId === row.id && cellIndex !== 0 ? (
										<input
											value={value}
											onChange={(e) => setValue(e.target.value)}
											className='w-full'
										/>
									) : (
										flexRender(cell.column.columnDef.cell, cell.getContext())
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className='h-2' />
			{/* pagination */}
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
		</div>
	);
}
