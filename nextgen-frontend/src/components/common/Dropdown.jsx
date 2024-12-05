import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const Dropdown = ({ options, selectedOption, onOptionChange, title, isEditable = true }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const handleOptionClick = (optionValue) => {
		onOptionChange(optionValue);
		setIsOpen(false);
	};

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dropdownRef]);

	return (
		<div
			className='relative flex flex-col justify-center w-full mx-1 dropdown-selector rounded-3xl'
			ref={dropdownRef}
		>
			<h3 className='mb-1 ml-2 text-xl font-semibold text-nowrap'>{title}</h3>
			<div
				className={`flex items-center justify-between w-full px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl ${
					isEditable
						? ' hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] cursor-pointer'
						: 'border-[#D3D3D3] bg-gray-200 hover:border-[#d3d3d3]'
				}`}
				onClick={isEditable ? () => setIsOpen(!isOpen) : undefined}
			>
				<p className='truncate'>{selectedOption}</p>
				<span className={`ml-2 transition ease-linear delay-300 transform `}>
					{isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
				</span>
			</div>
			{isOpen && (
				<ul className='absolute top-full left-0 rounded-lg text-center bg-white  shadow-[0px_5px_20px_-10px_rgba(0,_0,_0,_0.5)] z-10 mt-[1px] w-full overflow-y-auto max-h-96 tableHOC overflow-hidden'>
					{options.map((option, index) => (
						<li
							className='cursor-pointer bg-[#f9f9f9] rounded-md px-5 py-1 mb-2 font-semibold text-gray-800 hover:border border border-transparent hover:border-[var(--tw-primary)] mx-2 my-2'
							key={index}
							onClick={() => handleOptionClick(option.name)}
						>
							{option.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

Dropdown.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string,
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		})
	).isRequired,
	selectedOption: PropTypes.string.isRequired,
	onOptionChange: PropTypes.func.isRequired,
	title: PropTypes.string,
	isEditable: PropTypes.bool,
};

Dropdown.defaultProps = {
	onOptionChange: () => {},
};

export default Dropdown;
