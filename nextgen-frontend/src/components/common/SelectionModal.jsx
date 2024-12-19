import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import { ModalSearchBar } from '../index';

const SelectionModal = ({ title, data, show, headers, handleClose, handleSelection, selectedItemKey }) => {
	const [items, setItems] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);

	useEffect(() => {
		if (data) {
			setItems(data);
			setFilteredList(data);
		}
	}, [data]);

	const handleSearch = (keyword) => {
		if (keyword.length > 0) {
			const filteredItems = items.filter((item) =>
				headers.some((header) => item[header.key]?.toString().toLowerCase().includes(keyword.toLowerCase()))
			);
			setFilteredList(filteredItems);
		} else {
			setFilteredList(items);
		}
	};

	const handleItemClick = (item) => {
		setSelectedItem(item);
	};

	const handleOkButtonClick = () => {
		if (selectedItem) {
			handleSelection(selectedItem[selectedItemKey], selectedItem);
		}
		handleClose();
	};

	const handleCancelClick = () => {
		setSelectedItem(null);
		handleClose();
	};

	return show ? (
		<div className='fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black bg-opacity-50'>
			<div className='bg-white rounded-lg shadow-lg w-[500px] overflow-hidden'>
				<div className='bg-[var(--tw-primary)] text-white px-4 py-2 flex justify-between items-center'>
					<h4>{title}</h4>
					<button
						className='px-2 py-1 text-white bg-transparent border border-white rounded focus:outline-none'
						onClick={handleClose}
					>
						<FaTimes />
					</button>
				</div>

				<div className='px-4 text-xs'>
					<div className='pt-2'>
						<label>Filter</label>
						<div className='relative'>
							<ModalSearchBar onSearch={(keyword) => handleSearch(keyword)} />
						</div>
					</div>

					<div className='sticky top-0 z-10 grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] mt-4 font-bold bg-white leading-[18px]'>
						{headers.map((header, index) => (
							<div key={index}>{header.label}</div>
						))}
					</div>

					<div className='border border-gray-400 rounded-lg overflow-y-auto h-[233px] my-3 dropdownList leading-[18px]'>
						<ul>
							{filteredList.map((item, index) => (
								<li
									key={index}
									onClick={() => handleItemClick(item)}
									className={`px-2 py-1 cursor-pointer border-b border-gray-200 ${
										selectedItem?.[selectedItemKey] === item[selectedItemKey]
											? 'bg-[var(--tw-primary)] text-white'
											: 'bg-white text-black'
									}`}
								>
									<div className='grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))]'>
										{headers.map((header) => (
											<div key={header.key}>
												{header.key === 'price'
													? item[header.key]?.toFixed(2)
													: item[header.key]}
											</div>
										))}
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className='flex justify-center gap-4 py-3 bg-gray-100'>
					<button
						className='w-28 px-4 py-2 border border-[var(--tw-primary)] rounded hover:bg-[var(--tw-primary)] hover:text-white'
						onClick={handleOkButtonClick}
					>
						Ok
					</button>
					<button
						className='w-28 px-4 py-2 border border-[var(--tw-primary)] rounded hover:bg-[var(--tw-primary)] hover:text-white'
						onClick={handleCancelClick}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	) : null;
};

SelectionModal.propTypes = {
	title: PropTypes.string.isRequired,
	data: PropTypes.array.isRequired,
	show: PropTypes.bool.isRequired,
	headers: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			key: PropTypes.string.isRequired,
		})
	).isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSelection: PropTypes.func.isRequired,
	selectedItemKey: PropTypes.string.isRequired,
};

export default SelectionModal;
