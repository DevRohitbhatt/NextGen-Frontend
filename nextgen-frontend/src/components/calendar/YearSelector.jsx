import { useRef } from 'react';
import PropTypes from 'prop-types';
import { AiFillDownSquare } from 'react-icons/ai';

const YearSelector = ({ selectedYear, onChange, yearIDList }) => {
	const years = yearIDList || Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
	const selectRef = useRef(null);
	const handleYearChange = (e) => onChange(parseInt(e.target.value));
	const handleIconClick = () => selectRef.current.click();

	return (
		<div className='relative w-[154px]'>
			<div
				className='w-full h-7 bg-[#e6e7e8] border-none pl-2 pt-1 text-black font-semibold text-sm'
				onClick={handleIconClick}
			>
				{selectedYear}
				<div className='absolute top-0 flex items-center h-full text-4xl -right-1 text-[var(--tw-primary)]'>
					<AiFillDownSquare />
				</div>
			</div>
			<select
				className='absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer'
				ref={selectRef}
				defaultValue={selectedYear}
				onChange={handleYearChange}
			>
				{years.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>
		</div>
	);
};

YearSelector.propTypes = {
	selectedYear: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
	yearIDList: PropTypes.arrayOf(PropTypes.number),
};

export default YearSelector;
