import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Styled from '../styles/DateModalStyles.jsx';
import { FaTimes } from 'react-icons/fa';
import { YearSelector, CalendarSelector, Loader } from '../index.js';
import Calendar from 'react-calendar';
import { getCall } from '../../apis/network.js';
import { useSelector } from 'react-redux';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const CalendarModal = ({
	handleClose,
	selectedFromDate,
	selectedToDate,
	modalOpen,
	isDateRange,
	handleDateSelection,
	periodDatesEndpoint = 'getAllPeriodDates',
}) => {
	const { companyID } = useSelector((state) => state.globalState);
	const [initialFromDate, setInitialFromDate] = useState(selectedFromDate);
	const [initialToDate, setInitialToDate] = useState(selectedToDate);
	const [localFromDate, setLocalFromDate] = useState(selectedFromDate);
	const [localToDate, setLocalToDate] = useState(selectedToDate);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [yearIDList, setYearIDList] = useState([]);
	const [showCalendar, setShowCalendar] = useState(false);
	const [dynamicData, setDynamicData] = useState([]);
	const [allDatesData, setAllDatesData] = useState([]);
	const [isDatesLoading, setIsDatesLoading] = useState(true);

	const columns = [
		columnHelper.accessor('periodID', {
			id: 'periodID',
			header: 'Period',
		}),
		columnHelper.accessor('periodMinDate', {
			id: 'periodMinDate',
			header: 'From',
		}),
		columnHelper.accessor('periodMaxDate', {
			id: 'periodMaxDate',
			header: 'To',
		}),
	];

	useEffect(() => {
		if (modalOpen) {
			setInitialFromDate(selectedFromDate);
			setInitialToDate(selectedToDate);
			setLocalFromDate(selectedFromDate);
			setLocalToDate(selectedToDate);
		}
	}, [modalOpen, selectedFromDate, selectedToDate, companyID]);

	useEffect(() => {
		getDynamicDates();
	}, []);

	useEffect(() => {
		if (dynamicData) {
			const newData = allDatesData
				?.filter((entry) => entry.yearID === selectedYear)
				.map((entry) => ({
					periodID: entry.periodID,
					periodMinDate: dateFormat(new Date(entry.periodMinDate), 'mm/dd/yyyy'),
					periodMaxDate: dateFormat(new Date(entry.periodMaxDate), 'mm/dd/yyyy'),
				}));
			setDynamicData(newData);
		}
	}, [selectedYear, allDatesData]);

	const getDynamicDates = async () => {
		try {
			setIsDatesLoading(true);
			const getData = {
				fullUrl: 'api/company/settings/' + periodDatesEndpoint,
				urlParams: {
					companyId: companyID,
				},
			};

			const result = await getCall(getData);

			if (result && result.data) {
				const newData = result?.data.map((entry) => ({
					yearID: entry.yearID,
					periodID: entry.periodID,
					periodMinDate: dateFormat(new Date(entry.periodMinDate), 'mm/dd/yyyy'),
					periodMaxDate: dateFormat(new Date(entry.periodMaxDate), 'mm/dd/yyyy'),
				}));

				const yearList = result?.data.map((entry) => entry.yearID).filter((value, index, self) => self.indexOf(value) === index);
				setYearIDList(yearList);

				setAllDatesData(result.data);
				setDynamicData(newData);
			}
			setIsDatesLoading(false);
		} catch (error) {
			console.error('Error fetching dynamic dates', error);
		}
	};

	const handleYearChange = (newYear) => {
		setSelectedYear(newYear);
	};

	const handleInputChange = (date) => {
		if (isDateRange) {
			setLocalFromDate(date);
			setLocalToDate(date);
		} else {
			setLocalFromDate(date);
		}
	};

	const toggleCalendar = () => {
		setShowCalendar(!showCalendar);
	};

	const handleOkButtonClick = () => {
		if (isDateRange && new Date(localToDate) >= new Date(localFromDate)) {
			handleDateSelection(localFromDate, localToDate);
		} else {
			handleDateSelection(localFromDate, localFromDate);
		}
		handleClose();
	};

	const handleCloseModal = () => {
		// Reset the dates to their initial values on cancel
		setLocalFromDate(initialFromDate);
		setLocalToDate(initialToDate);
		handleClose();
	};

	const getDatesFromRows = (dates) => {
		let fromdate = new Date(dates?.periodMinDate);
		let todate = new Date(dates?.periodMaxDate);
		setLocalFromDate(fromdate);
		setLocalToDate(todate);
	};

	return (
		<>
			{modalOpen && (
				<div className='fixed bg-[#00000073] w-full h-dvh left-0 top-0 z-10'>
					<div
						className={`fixed bg-white rounded-lg shadow-lg overflow-hidden lg:left-1/3   top-[6%] 
              ${
                isDateRange ? '' : 'lg:w-96 mx-2 lg:mx-0'
							}`
            } 
					>
						<div className='flex items-center justify-between px-4 py-2 text-white bg-[var(--tw-primary)]'>
							{isDateRange ? (
								<h4>Select a business period or Date Range</h4>
							) : (
								<h4>Select a business Date</h4>
							)}
							<button
								className='p-1 text-white bg-transparent border-[0.25px] border-white border-solid rounded-none cursor-pointer hover:bg-white hover:text-[var(--tw-primary)] focus:outline-none'
								onClick={handleCloseModal}
							>
								<FaTimes className='close' />
							</button>
						</div>
						<div className='w-full mx-auto'>
							{!isDateRange ? (
								<Calendar
									onChange={handleInputChange}
									value={localFromDate}
									onClickDay={toggleCalendar}
									className='tailwind-calendar'
									calendarType='US'
								/>
							) : (
								<>
									<div className='flex px-4 pt-4'>
										<div>
											<span className='text-xs font-bold'>From:</span>
											<CalendarSelector
												handleDateChange={(date) => {
													setLocalFromDate(date);
												}}
												selectedFromDate={localFromDate}
												date={localFromDate}
											/>
										</div>
										<div>
											<span className='text-xs font-bold'>To:</span>
											<CalendarSelector
												handleDateChange={(date) => setLocalToDate(date)}
												selectedToDate={localToDate}
												date={localToDate}
											/>
										</div>
										<div className='yeardiv'>
											<span className='text-xs font-bold'>Show Periods For Year:</span>
											<YearSelector selectedYear={selectedYear} onChange={handleYearChange} yearIDList={yearIDList}/>
										</div>
									</div>

									{isDatesLoading ? (
										<div className='h-48 p-4 m-auto'>
											<Loader loading={isDatesLoading} />
										</div>
									) : (
										<div className='px-4 py-4 bg-white '>
											<div className='m-auto overflow-y-auto text-sm border tableHOC h-96 rounded-2xl'>
												<table className='sticky top-0 z-[2] w-full bg-white shadow-[0_-1px_0_var(--tw-primary)_inset]'>
													<thead className='sticky top-0 z-[2] w-full bg-white shadow-[0_-1px_0_var(--tw-primary)_inset]'>
														<tr>
															{columns.map((column) => (
																<th
																	key={column.id}
																	scope='col'
																	className='py-2 font-medium tracking-wider text-center'
																>
																	{column.header}
																</th>
															))}
														</tr>
													</thead>
													<tbody className='bg-white divide-y divide-gray-200'>
														{dynamicData.map((row, rowIndex) => (
															<tr
																key={rowIndex}
																className={`cursor-pointer ${
																	row.periodMinDate ===
																		dateFormat(localFromDate, 'mm/dd/yyyy') &&
																	row.periodMaxDate ===
																		dateFormat(localToDate, 'mm/dd/yyyy')
																		? 'bg-[var(--tw-primary)] text-white hover:bg-[var(--tw-primary)]'
																		: 'hover:bg-gray-100 '
																}`}
																onClick={() => getDatesFromRows(row)}
															>
																{columns.map((column) => (
																	<td
																		key={column.id}
																		className='py-1 text-center whitespace-nowrap'
																	>
																		{row[column.id]}
																	</td>
																))}
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									)}
								</>
							)}
						</div>
						<Styled.ModalFooter>
							<Styled.FooterButton onClick={handleOkButtonClick}>Ok</Styled.FooterButton>
							<Styled.FooterButton onClick={handleCloseModal}>Cancel</Styled.FooterButton>
						</Styled.ModalFooter>
					</div>
				</div>
			)}
		</>
	);
};

CalendarModal.propTypes = {
	handleClose: PropTypes.func,
	selectedFromDate: PropTypes.instanceOf(Date),
	selectedToDate: PropTypes.instanceOf(Date),
	handleFromDateChange: PropTypes.func,
	handleToDateChange: PropTypes.func,
	modalOpen: PropTypes.bool,
	isDateRange: PropTypes.bool,
	handleDateSelection: PropTypes.func,
	periodDatesEndpoint: PropTypes.string,
};

export default CalendarModal;
