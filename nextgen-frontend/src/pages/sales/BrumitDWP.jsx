import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import brumitDWP from '../../assets/introJSSteps/brumitDWP';
import { defineCancelApiObject } from '../../apis/configs/axiosUtils';
import {
	Dropdown,
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	ExcelExport as exportToExcel,
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const columnHelper = createColumnHelper();
const cancelApiObject = defineCancelApiObject({ brumitDWP: 'brumitDWP' });

const BrumitDWP = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
		groupOrUnitAccess,
		groupOrUnitAccessName,
	} = useSelector((state) => state.globalState);

	const [brumitDWPData, setBrumitDWPData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Brumit DWP Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false);
	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
	const [selectedToDate, setSelectedToDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [reportType, setReportType] = useState('Daily');
	const reportTypeOptions = [
		{ name: 'Daily', value: 'Day' },
		{ name: 'Weekly', value: 'Week' },
		{ name: 'Period', value: 'Period' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: brumitDWP(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const [columns, setColumns] = useState([]);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	const fetchBrumitDWP = async () => {
		const signal = cancelApiObject['brumitDWP'].handleRequestCancellation().signal;
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'brumitDWP',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					Options: reportTypeOptions.find((option) => option.name === reportType).value,
				},
				signal,
			};

			const result = await getCall(getData);
			if (result.data.length === 0) {
				setBrumitDWPData([]);
			} else {
				const newData = result.data.map((row) => {
					if (
						[
							'Net Sales',
							'Net Sales Comparison vs. LY',
							'Projected Sales Variance %',
							'Delivery Sales',
							'Check Count Comparison vs. LY',
							'Order Average',
							'Order Average Comparison +/- vs. LY',
						].includes(row.itemName)
					) {
						return {
							...Object.keys(row.unitGroups).reduce((acc, key) => {
								if (row.itemName === 'Net Sales') {
									acc[key] = `$${Number(row.unitGroups[key].toFixed(0)).toLocaleString('en-US')}`;
								} else if (
									row.itemName === 'Order Average' ||
									row.itemName === 'Order Average Comparison +/- vs. LY'
								) {
									acc[key] =
										row.unitGroups[key] < 0
											? `-($${Math.abs(row.unitGroups[key])})`
											: `$${row.unitGroups[key]}`;
								} else {
									acc[key] = `${(row.unitGroups[key] * 100).toFixed(2)}%`;
								}
								return acc;
							}, {}),
							[row.dateRange]: row.itemName,
						};
					} else if (
						[
							'Cash +/-',
							'Voids %',
							'Refunds %',
							'Make It Right %',
							'Employee Meals %',
							'Hero Discount %',
							'Corp Meal %',
							'Open Disc %',
							'Total Coupon /Disc %',
						].includes(row.itemName)
					) {
						return {
							rowName: 'Cash Exceptions',
							[row.dateRange]: row.itemName,
							...Object.keys(row.unitGroups).reduce((acc, key) => {
								if (row.itemName === 'Cash +/-') {
									acc[key] =
										row.unitGroups[key] < 0
											? `-($${Number(Math.abs(row.unitGroups[key]).toFixed(0)).toLocaleString(
													'en-US'
											  )})`
											: `$${Number(row.unitGroups[key].toFixed(0)).toLocaleString('en-US')}`;
								} else {
									acc[key] = `${(row.unitGroups[key] * 100).toFixed(2)}%`;
								}
								return acc;
							}, {}),
						};
					} else if (
						[
							'Matrix Variance Day +/-',
							'Weekly Training Hours',
							'Matrix Variance Week to Date +/-',
							'Period Training Hours',
							'Matrix Variance Period to Date +/-',
							'OT Hours Day',
							'OT Hours Week to Date',
							'OT Hours Period to Date',
						].includes(row.itemName)
					) {
						return {
							rowName: 'Labor',
							[row.dateRange]: row.itemName,
							...row.unitGroups,
						};
					} else if (['Beef Efficiency %'].includes(row.itemName)) {
						return {
							rowName: 'Food Cost',
							[row.dateRange]: row.itemName,
							...row.unitGroups,
						};
					} else if (['LY Sales', 'TY Trans', 'LY Trans'].includes(row.itemName)) {
						return {
							rowName: 'Sales Details',
							[row.dateRange]: row.itemName,
							...Object.keys(row.unitGroups).reduce((acc, key) => {
								if (row.itemName === 'LY Sales') {
									acc[key] =
										row.unitGroups[key] < 0
											? `-($${Math.abs(parseInt(row.unitGroups[key]).toLocaleString('en-US'))})`
											: `$${parseInt(row.unitGroups[key]).toLocaleString('en-US')}`;
								} else {
									acc[key] = row.unitGroups[key];
								}
								return acc;
							}, {}),
						};
					} else {
						return null;
					}
				});

				const dwpData = newData
					.reduce((acc, curr) => {
						if (curr.rowName) {
							const existingRow = acc.find((row) => row.rowName === curr.rowName);
							if (existingRow) {
								existingRow.subRows.push(curr);
							} else {
								acc.push({ rowName: curr.rowName, subRows: [curr] });
							}
						} else {
							acc.push(curr);
						}
						return acc;
					}, [])
					.sort((a, b) => {
						if (!a.rowName && b.rowName) return -1;
						if (a.rowName && !b.rowName) return 1;
						return 0;
					});

				const generatedColumns = [
					columnHelper.accessor(
						`${dateFormat(selectedFromDate, 'mm/dd/yyyy')}-${dateFormat(selectedToDate, 'mm/dd/yyyy')}`,
						{
							id: `${dateFormat(selectedFromDate, 'mm/dd/yyyy')}-${dateFormat(
								selectedToDate,
								'mm/dd/yyyy'
							)}`,
							header: (
								<div className='w-full pl-6 text-left'>
									{new Date(selectedFromDate).getTime() === new Date(selectedToDate).getTime()
										? dateFormat(selectedFromDate, 'mm/dd/yyyy')
										: `${dateFormat(selectedFromDate, 'mm/dd/yyyy')} - ${dateFormat(
												selectedToDate,
												'mm/dd/yyyy'
										  )}`}
								</div>
							),
							cell: ({ getValue, row }) =>
								row.getCanExpand() ? (
									<div className={`flex items-center gap-2 font-bold absolute inset-0 w-96] `}>
										{row.getIsExpanded() ? <IoIosArrowUp /> : <IoIosArrowDown />}
										{row.original.rowName}
									</div>
								) : (
									<div className='pl-6 text-left'>{getValue()}</div>
								),
						}
					),
					...Object.keys(dwpData[0] || {})
						.filter(
							(key) =>
								![
									`${dateFormat(selectedFromDate, 'mm/dd/yyyy')}-${dateFormat(
										selectedToDate,
										'mm/dd/yyyy'
									)}`,
									'rowName',
								].includes(key)
						)
						.sort((a, b) => {
							const aIsNumber = !isNaN(a.charAt(0));
							const bIsNumber = !isNaN(b.charAt(0));
							if (aIsNumber && !bIsNumber) return 1;
							if (!aIsNumber && bIsNumber) return -1;
						})
						.map((key) =>
							columnHelper.accessor(key, {
								id: key,
								header: key,
								cell: ({ getValue }) => (
									<div className={`${String(getValue())?.includes('-') ? 'text-[#D43F3A]' : ''}`}>
										{getValue()}
									</div>
								),
								size: 100,
							})
						),
				];

				setColumns(generatedColumns);

				setBrumitDWPData(dwpData);
			}
			setIsLoading(false);
		} catch (error) {
			if (error.name === 'CanceledError') {
				console.log('Request canceled');
			} else {
				setIsError(true);
				setErrorMessage('There was an issue loading your data, please try again later.');
				console.error('Error getting Brumit DWP report data: ', error);
				setIsLoading(false);
			}
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setShowUnitModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleReportTypeChange = (option) => {
		setReportType(option);
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: '',
				colored: true,
				columns: columns.map((column) => ({ name: column.id, filterButton: true })),
				data: brumitDWPData.flatMap((row) =>
					(row.subRows || [row]).map((subRow) =>
						columns.map((column) => ({
							value: subRow[column.id],
							fontColor: parseFloat(subRow[column.id]) < 0 ? 'rgba(212, 63, 58, 1)' : '',
						}))
					)
				),
			},
		];

		const filename = 'brumitDWP';
		const spreadSheetTitle = 'Brumit DWP';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={brumitDWPData} expandCollapseButtons={true} />;

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Brumit DWP</h2>
			<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center'>
					<UnitSelector
						companyId={companyID}
						alignmentId={alignmentID}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						includeAreas={true}
						setMemberName={setSelectedUnitName}
						onClick={() => setShowUnitModal(true)}
					/>
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
					/>
					<div className='w-36 reportType-selector'>
						<Dropdown
							title='Report Type'
							options={reportTypeOptions}
							selectedOption={reportType}
							onOptionChange={handleReportTypeChange}
						/>
					</div>
					<div className='run-button' onClick={fetchBrumitDWP}>
						<div className='py-3 ml-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includeExcel={true}
						handleExcelClick={handleExcelClick}
						includeHelp={true}
						handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
					/>
				</div>
			</header>

			{isError ? (
				<div>{errorMessage}</div>
			) : (
				<div className='relative w-full min-h-56'>
					<Loader loading={isLoading} />
					{!isLoading &&
						(brumitDWPData.length > 0 ? (
							<div className='paged-table'>{Table}</div>
						) : !selectedUnit ? (
							<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
						) : (
							<div className='mt-10 text-xl font-medium text-center'>No data available</div>
						))}
				</div>
			)}

			<div>
				<UnitModal
					unitData={unitsAndAreasList}
					memberID={selectedUnit}
					memberName={selectedUnitName}
					show={showUnitModal}
					includeAreas={true}
					handleClose={() => {
						setShowUnitModal(false);
					}}
					handleUnitSelection={handleUnitSelection}
				/>
				<CalendarModal
					handleClose={() => setShowDateModal(false)}
					modalOpen={showDateModal}
					isDateRange={true}
					handleDateSelection={handleDateSelection}
					handleFromDateChange={(fromDate) => setSelectedFromDate(fromDate)}
					handleToDateChange={(toDate) => setSelectedToDate(toDate)}
					selectedFromDate={selectedFromDate}
					selectedToDate={selectedToDate}
				/>
			</div>
		</div>
	);
};

export default BrumitDWP;
