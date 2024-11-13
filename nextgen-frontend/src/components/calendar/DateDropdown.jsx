import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '../../components';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';
import { getCall } from '../../apis/network';

const DateDropdown = ({ handleFromDateChange, handleToDateChange }) => {
	const {
		companyID,

		defaultUnitID,
	} = useSelector((state) => state.globalState);

	const [date, setDate] = useState(() => {
		const date = new Date();
		const day = date.getDay();
		const diff = date.getDate() - day + (day === 0 ? -6 : 1);
		const fromDate = dateFormat(new Date(date.setDate(diff)), 'mm/dd/yyyy');
		const toDate = dateFormat(new Date(date.setDate(diff + 6)), 'mm/dd/yyyy');
		return `${fromDate} - ${toDate}`;
	});
	const [dateOptions, setDateOptions] = useState([]);
	const [isDateLoading, setIsDateLoading] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				setIsDateLoading(true);
				const getData = {
					url: 'companyUnitDates',
					urlParams: {
						companyId: companyID,
						unitId: defaultUnitID,
					},
				};

				const result = await getCall(getData);

				setDateOptions(
					result.data.map((date) => ({
						name: date,
					}))
				);
				handleDateChange(date);
			} catch (error) {
				console.log('Error in fetching date options', error);
			} finally {
				setIsDateLoading(false);
			}
		})();
	}, [companyID, defaultUnitID]);

	const handleDateChange = (date) => {
		setDate(date);
		const [fromDate, toDate] = date.split(' - ');
		handleFromDateChange(fromDate);
		handleToDateChange(toDate);
	};

	return (
		<div className='z-20 min-w-64'>
			<Dropdown
				title='Select Date'
				selectedOption={isDateLoading ? 'Loading...' : date}
				onChange={handleDateChange}
				options={dateOptions}
				onOptionChange={handleDateChange}
			/>
		</div>
	);
};
DateDropdown.propTypes = {
	handleFromDateChange: PropTypes.func.isRequired,
	handleToDateChange: PropTypes.func.isRequired,
};

export default DateDropdown;
