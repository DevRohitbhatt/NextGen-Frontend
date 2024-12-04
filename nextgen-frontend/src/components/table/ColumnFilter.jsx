import { useState, useEffect, useRef } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import PropTypes from 'prop-types';

const ColumnFilter = ({ column }) => {
	const columnFilterValue = column.getFilterValue();
	const [filterType, setFilterType] = useState('contains');
	const [realValue, setRealValue] = useState();

	const sortedUniqueValues = Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000);

	const handleFilterChange = (value) => {
		setRealValue(value);
		let filterValue = value;

		if (value) {
			if (filterType === 'contains') {
				filterValue = sortedUniqueValues.filter((item) =>
					typeof item === 'string' ? item.toLowerCase().includes(value.toLowerCase()) : item == value
				);
			} else if (filterType === 'doesNotContain') {
				filterValue = sortedUniqueValues.filter(
					(item) => typeof item === 'string' && !item.toLowerCase().includes(value.toLowerCase())
				);
			} else if (filterType === 'startsWith') {
				filterValue = sortedUniqueValues.filter(
					(item) => typeof item === 'string' && item.toLowerCase().startsWith(value.toLowerCase())
				);
			} else if (filterType === 'endsWith') {
				filterValue = sortedUniqueValues.filter(
					(item) => typeof item === 'string' && item.toLowerCase().endsWith(value.toLowerCase())
				);
			} else if (filterType === 'equals') {
				filterValue = sortedUniqueValues.filter(
					(item) => typeof item === 'string' && item.toLowerCase() === value.toLowerCase()
				);
			} else if (filterType === 'doesNotEqual') {
				filterValue = sortedUniqueValues.filter(
					(item) => typeof item === 'string' && item.toLowerCase() !== value.toLowerCase()
				);
			}
		} else {
			filterValue = value;
		}

		if (typeof filterValue === 'string') {
			column.setFilterValue(filterValue.toLowerCase());
		} else {
			column.setFilterValue(filterValue);
		}
	};

	useEffect(() => {
		handleFilterChange(realValue);
	}, [filterType]);

	return (
		<DebouncedInput
			className=''
			onChange={handleFilterChange}
			placeholder={``}
			type='text'
			setFilterType={setFilterType}
			isFilterMenu={column.columnDef.isFilterMenu}
		/>
	);
};

function DebouncedInput({ value: initialValue, onChange, debounce = 500, setFilterType, isFilterMenu, ...props }) {
	const [value, setValue] = useState(initialValue);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const moreOptionsDropdown = useRef(null);

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [value]);

	return (
		<div
			className='box-border relative flex items-center w-full p-1 font-normal border-2 border-gray-300 border-solid hover:border-primary focus:border-primary focus:outline-none'
			onMouseLeave={() => setIsDropdownVisible(false)}
		>
			{isFilterMenu && <AiOutlineSearch onMouseEnter={() => setIsDropdownVisible(true)} />}
			<input
				style={{ marginLeft: '2px', outline: 'none', width: '100%' }}
				{...props}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>

			{isDropdownVisible && (
				<div
					className='absolute top-full z-50 p-2 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] bg-white rounded-md'
					ref={moreOptionsDropdown}
				>
					{['contains', 'doesNotContain', 'startsWith', 'endsWith', 'equals', 'doesNotEqual'].map((type) => (
						<div key={type} className='option mb-2 w-[200px]'>
							<button
								className='w-[100%] bg-[#f9f9f9]'
								onClick={() => {
									setFilterType(type);
									setIsDropdownVisible(false);
								}}
							>
								{type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
ColumnFilter.propTypes = {
	column: PropTypes.shape({
		getFilterValue: PropTypes.func.isRequired,
		getFacetedUniqueValues: PropTypes.func.isRequired,
		setFilterValue: PropTypes.func.isRequired,
	}).isRequired,
};

export default ColumnFilter;
