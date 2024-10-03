import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const Dropdown = ({ options, selectedOption, onOptionChange, title }) => {
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
		<div className='relative flex flex-col justify-center m-1 dropdown-selector rounded-3xl' ref={dropdownRef}>
			<h3 className='mb-1 ml-2 text-xl font-bold text-nowrap'>{title}</h3>
			<div
				className='flex items-center justify-between w-full px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)]'
				onClick={() => setIsOpen(!isOpen)}
			>
				{selectedOption}
				<span className={`ml-2 transition ease-linear delay-300 transform `}>
					{isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
				</span>
			</div>
			{isOpen && (
				<ul className='absolute top-full left-0 text-nowrap max-h-[350px] overflow-y-scroll list-none bg-white rounded-md shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] z-10 mt-2'>
					{options.map((option, index) => (
						<li
							className='cursor-pointer hover:bg-[#f0f0f0] px-5 py-2'
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
};

Dropdown.defaultProps = {
	onOptionChange: () => {},
};

export default Dropdown;
