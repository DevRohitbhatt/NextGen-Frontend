import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const PercentageCell = ({ value, row, columnName, tableName, handleInputCellChange, columntype, isInput }) => {
	const [percentage, setPercentage] = useState(value);
	const inputRef = useRef(null);

	if (!isInput) {
		return (
			<div
				className={classNames(
					'relative text-sm py-2 overflow-hidden flex flex-row',
					columntype === 'number' ? 'justify-center' : 'justify-start',
					'border-b border-gray-300'
				)}
			>
				{value}
				<span className="text-sm">%</span>
			</div>
		);
	}

	const handleInputChange = (e) => {
		const numericValue = e.target.value.replace(/[^0-9.]/g, '');
		setPercentage(numericValue);
	};

	const updateInputWidth = () => {
		inputRef.current.style.width = `${inputRef.current.value.length}ch`;
	};

	useEffect(() => {
		setPercentage(value);
	}, [value]);

	useEffect(() => {
		updateInputWidth();
	}, [percentage]);

	return (
		<div
			className={classNames(
				'relative text-sm py-2 overflow-hidden flex flex-row',
				columntype === 'number' ? 'justify-center' : 'justify-start',
				'border-b border-gray-300'
			)}
		>
			<input
				ref={inputRef}
				value={percentage}
				onChange={handleInputChange}
				onBlur={(e) => handleInputCellChange(e, row, columnName, tableName)}
				className={classNames(
					'border-none rounded-md text-sm overflow-hidden whitespace-nowrap',
					columntype === 'number' ? 'text-center' : 'text-left',
					'focus:outline-none focus:bg-gray-200 hover:bg-gray-200'
				)}
			/>
			<span className="text-sm">%</span>
		</div>
	);
};

const DollarCell = ({ value, row, columnName, tableName, handleInputCellChange, columntype, isInput, isTotal }) => {
	const [dollar, setDollar] = useState(value);
	const inputRef = useRef(null);

	if (!isInput) {
		return (
			<div
				className={classNames(
					'relative text-sm py-2 overflow-hidden flex flex-row',
					columntype === 'number' ? 'justify-center' : 'justify-start',
					'border-b border-gray-300',
					isTotal ? 'bg-gray-200 font-bold px-1 border-t border-b border-black' : ''
				)}
			>
				<span className="text-sm">$</span>
				{value}
			</div>
		);
	}

	const handleInputChange = (e) => {
		setDollar(e.target.value);
	};

	const updateInputWidth = () => {
		inputRef.current.style.width = `${inputRef.current.value.length}ch`;
	};

	useEffect(() => {
		setDollar(Math.round(value));
	}, [value]);

	useEffect(() => {
		updateInputWidth();
	}, [dollar]);

	return (
		<div
			className={classNames(
				'relative text-sm py-2 overflow-hidden flex flex-row',
				columntype === 'number' ? 'justify-center' : 'justify-start',
				'border-b border-gray-300'
			)}
		>
			<span className="text-sm">$</span>
			<input
				ref={inputRef}
				value={dollar}
				onChange={handleInputChange}
				onBlur={(e) => handleInputCellChange(e, row, columnName, tableName)}
				className={classNames(
					'border-none rounded-md text-sm overflow-hidden whitespace-nowrap',
					columntype === 'number' ? 'text-center' : 'text-left',
					'focus:outline-none focus:bg-gray-200 hover:bg-gray-200'
				)}
			/>
		</div>
	);
};

export default function Cell({
	value,
	cellType,
	row,
	columnName,
	columntype,
	isInput,
	handleInputCellChange,
	handleDropdownChange,
	tableName,
	isTotal,
}) {
	if (cellType === 'input') {
		return (
			<div
				className={classNames(
					'relative text-sm py-2 overflow-hidden flex flex-row',
					columntype === 'number' ? 'justify-center' : 'justify-start',
					'border-b border-gray-300'
				)}
			>
				<input
					type="text"
					defaultValue={value.toString() !== '0' ? value : ''}
					onBlur={(e) => handleInputCellChange(e, row, columnName, tableName)}
					className={classNames(
						'border-none rounded-md text-sm overflow-hidden whitespace-nowrap',
						columntype === 'number' ? 'text-center' : 'text-left',
						'focus:outline-none focus:bg-gray-200 hover:bg-gray-200'
					)}
				/>
			</div>
		);
	} else if (cellType === 'percent') {
		return (
			<PercentageCell
				value={value}
				row={row}
				columnName={columnName}
				tableName={tableName}
				handleInputCellChange={handleInputCellChange}
				columntype={columntype}
				isInput={isInput}
			/>
		);
	} else if (cellType === 'dollar') {
		return (
			<DollarCell
				value={value}
				row={row}
				columnName={columnName}
				tableName={tableName}
				handleInputCellChange={handleInputCellChange}
				columntype={columntype}
				isInput={isInput}
				isTotal={isTotal}
			/>
		);
	} else if (cellType === 'dropdown') {
		let selectedOption = value.find((option) => option.isSelected);
		if (!selectedOption) {
			selectedOption = value[0];
			value[0].isSelected = true;
		}
		return (
			<div
				className={classNames(
					'relative text-sm py-2 overflow-hidden flex flex-row',
					columntype === 'number' ? 'justify-center' : 'justify-start',
					'border-b border-gray-300'
				)}
			>
				<select
					onChange={(e) => handleDropdownChange(e, row, columnName, tableName)}
					defaultValue={selectedOption.option}
					className="w-full border-none rounded-md text-sm focus:outline-none hover:bg-gray-200 cursor-pointer"
				>
					{value.map((option, index) => (
						<option key={index} value={option.prepType}>
							{option.option}
						</option>
					))}
				</select>
			</div>
		);
	} else {
		return (
			<div
				className={classNames(
					'relative text-sm py-2 overflow-hidden flex flex-row',
					columntype === 'number' ? 'justify-center' : 'justify-start',
					'border-b border-gray-300',
					isTotal ? 'bg-gray-200 font-bold px-1 border-t border-b border-black' : ''
				)}
			>
				{value}
			</div>
		);
	}
}

Cell.propTypes = {
	value: PropTypes.any,
	cellType: PropTypes.string,
	row: PropTypes.number,
	tableName: PropTypes.string,
	columnName: PropTypes.string,
	columntype: PropTypes.string,
	isInput: PropTypes.bool,
	handleInputCellChange: PropTypes.func,
	handleDropdownChange: PropTypes.func,
	isTotal: PropTypes.bool,
};
