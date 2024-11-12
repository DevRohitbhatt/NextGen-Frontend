import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '../../components';
import dateFormat from 'dateformat';

const DateDropdown = ({ selectedFromDate, selectedToDate, handleFromDateChange, handleToDateChange }) => {
	const [date, setDate] = useState(
		`${dateFormat(selectedFromDate, 'mm/dd/yyyy')} - ${dateFormat(selectedToDate, 'mm/dd/yyyy')}`
	);
	const dateOptions = [
		{ name: '11/18/2024 - 11/24/2024' },
		{ name: '11/11/2024 - 11/17/2024' },
		{ name: '11/04/2024 - 11/10/2024' },
		{ name: '10/28/2024 - 11/03/2024' },
		{ name: '10/21/2024 - 10/27/2024' },
		{ name: '10/14/2024 - 10/20/2024' },
		{ name: '10/07/2024 - 10/13/2024' },
		{ name: '09/30/2024 - 10/06/2024' },
		{ name: '09/23/2024 - 09/29/2024' },
		{ name: '09/16/2024 - 09/22/2024' },
		{ name: '09/09/2024 - 09/15/2024' },
		{ name: '09/02/2024 - 09/08/2024' },
	];

	const handleDateChange = (date) => {
		setDate(date);
		const [fromDate, toDate] = date.split(' - ');
		handleFromDateChange(fromDate);
		handleToDateChange(toDate);
	};

	return (
		<div className='w-64'>
			<Dropdown
				title='Select Date'
				selectedOption={date}
				onChange={handleDateChange}
				options={dateOptions}
				onOptionChange={handleDateChange}
			/>
		</div>
	);
};
DateDropdown.propTypes = {
	selectedFromDate: PropTypes.instanceOf(Date).isRequired,
	selectedToDate: PropTypes.instanceOf(Date).isRequired,
	handleFromDateChange: PropTypes.func.isRequired,
	handleToDateChange: PropTypes.func.isRequired,
};

export default DateDropdown;
