import { useState, useEffect } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FiEdit2 } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
import { FaCheck } from 'react-icons/fa6';
import Modal from '../common/Modal';
import PropTypes from 'prop-types';

export const TableCell = ({ getValue, row, column, table }) => {
	const initialValue = getValue();
	const columnMeta = column.columnDef.meta;
	const tableMeta = table.options.meta;
	const [value, setValue] = useState(initialValue);
	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);
	const onBlur = () => {
		tableMeta?.updateData(row.index, column.id, value);
	};
	const onSelectChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
		console.log('newValue', newValue);

		const isDuplicate = table.options.data.find((row, index) => index !== row.index && row.mainItem === newValue);
		if (!isDuplicate) {
			tableMeta?.updateData(row.index, column.id, newValue);
		} else {
			alert('Item is already present');
			setValue(initialValue);
		}
	};
	if (tableMeta?.editedRows[row.id]) {
		return columnMeta?.type === 'select' ? (
			<select className='py-1 text-left' onChange={onSelectChange} value={initialValue}>
				{columnMeta?.options?.map((option) => (
					<option
						className='cursor-pointer bg-[#f9f9f9] rounded-md px-5 py-1 mb-2 font-semibold text-gray-800 hover:border border border-transparent hover:border-[var(--tw-primary)] mx-2 my-2'
						key={option.value}
						value={option.value}
					>
						{option.label}
					</option>
				))}
			</select>
		) : (
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={onBlur}
				className='py-1 text-center'
				type={columnMeta?.type || 'text'}
			/>
		);
	}
	return <span>{value}</span>;
};

export const EditCell = ({ row, table }) => {
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
	const meta = table.options.meta;
	const setEditedRows = (e) => {
		const elName = e.currentTarget.name;
		meta?.setEditedRows((old) => ({
			...old,
			[row.id]: !old[row.id],
		}));
		if (elName !== 'edit') {
			meta?.revertData(row.index, e.currentTarget.name === 'cancel');
		}
	};
	const deleteRow = () => {
		setIsDeleteConfirm(true);
		// meta?.deleteRow(row.index);
	};
	return (
		<div className='edit-cell-container'>
			{meta?.editedRows[row.id] ? (
				<div className='edit-cell'>
					<button
						className='border hover:border-[green] focus:outline-none'
						onClick={setEditedRows}
						name='done'
					>
						<FaCheck className='text-[green]' />
					</button>
					<button
						onClick={setEditedRows}
						className='border hover:border-[red] focus:outline-none'
						name='cancel'
					>
						<RxCross2 className='text-[red]' />
					</button>
				</div>
			) : (
				<div className='edit-cell'>
					<button
						onClick={setEditedRows}
						className='border hover:border-[blue] focus:outline-none'
						name='edit'
					>
						<FiEdit2 className='text-[blue]' />
					</button>
					<button onClick={deleteRow} className='border hover:border-[red] focus:outline-none' name='delete'>
						<RxCross2 className='text-[red]' />
					</button>
				</div>
			)}
			<Modal title={'Delete Item'} isOpen={isDeleteConfirm} onClose={() => setIsDeleteConfirm(false)}>
				<div className='px-10 py-4'>
					<p>Are you sure you want to delete this item?</p>
					<div className='flex justify-around mt-4'>
						<button
							onClick={() => {
								meta?.deleteRow(row.index);
								setIsDeleteConfirm(false);
							}}
							className='flex items-center gap-2 px-8 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
						>
							Yes
						</button>
						<button
							onClick={() => setIsDeleteConfirm(false)}
							className='flex items-center gap-2 px-8 py-2 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button text-[var(--tw-primary)]'
						>
							No
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

const EditableTableHOC = ({
	data,
	setData,
	columns,
	headerPosition = 'justify-center',
	isAddNew = false,
	setIsAddNew,
}) => {
	const [originalData, setOriginalData] = useState(() => [...data]);
	const [editedRows, setEditedRows] = useState({});
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		meta: {
			editedRows,
			setEditedRows,
			revertData: (rowIndex, revert) => {
				if (revert) {
					setData((old) => old.map((row, index) => (index === rowIndex ? originalData[rowIndex] : row)));
				} else {
					setOriginalData((old) => old.map((row, index) => (index === rowIndex ? data[rowIndex] : row)));
				}
				setIsAddNew(false);
			},
			updateData: (rowIndex, columnId, value) => {
				setData((old) => {
					return old.map((row, index) => {
						if (index === rowIndex) {
							return {
								...old[rowIndex],
								[columnId]: value,
							};
						}
						return row;
					});
				});
				setIsAddNew(false);
			},
			deleteRow: (rowIndex) => {
				setData((old) => old.filter((_, index) => index !== rowIndex));
			},
		},
	});

	useEffect(() => {
		setOriginalData([...data]);
		if (isAddNew) {
			setEditedRows((old) => ({
				...old,
				[data.length - 1]: true,
			}));
		}
	}, [data]);

	return (
		<div className='tableHOC pr-1 max-h-[60vh] overflow-auto'>
			<table className='w-full border-collapse table-auto select-none'>
				<thead className='sticky top-0 z-[2] w-full bg-white shadow-[0_-1px_0_var(--tw-primary)_inset]'>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className={`py-2 ${headerPosition}`}
									style={{
										minWidth: header.getSize(),
										width: 'auto',
									}}
								>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className='h-[35px] font-normal border-y relative hover:bg-gray-100'>
							{row.getVisibleCells().map((cell) => (
								<td className={`${cell.column.columnDef.dataPosition} text-nowrap`} key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
EditableTableHOC.propTypes = {
	data: PropTypes.array.isRequired,
	setData: PropTypes.func.isRequired,
	columns: PropTypes.array.isRequired,
	headerPosition: PropTypes.string,
	isAddNew: PropTypes.bool,
	setIsAddNew: PropTypes.func,
};

export default EditableTableHOC;
