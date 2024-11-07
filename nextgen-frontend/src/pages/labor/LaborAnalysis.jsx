import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import {
	Dropdown,
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
	Modal,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import labourAnalysis from '../../assets/introJSSteps/labourAnalysis';

const columnHelper = createColumnHelper();

const LabourAnalysis = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
	} = useSelector((state) => state.globalState);
	const [laborAnalysisReportData, setLaborAnalysisReportData] = useState([]);
	const [laborAnalysisModalData, setLaborAnalysisModalData] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState([]);
	const [modalColumns, setModalColumns] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Labor Analysis Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown state variables
	const [jobDescription, setJobDescription] = useState('All');
	const jobDescriptionOptions = [
		{ name: 'All' },
		{ name: 'Hourly Manager' },
		{ name: 'Salary Manager' },
		{ name: 'Shift Supervisor' },
		{ name: 'Test User' },
		{ name: 'Request Off' },
		{ name: 'None' },
	];

	const modalNames = {
		'Projected Sales': 'actlySales',
		'Actual Sales': 'actSales',
		'Allowed Labor Hours': 'bohAllowedEarnedHours',
		'Scheduled Labor Hours': 'scheduledHours',
		'Actual Labor Hours': 'actLaborHours',
		'Ideal Labor Hours': 'ideal_AllowedEarnedHours',
		'Scheduled Labor Dollars': 'scheduledDollars',
		'Actual Labor Dollars': 'actLabor',
	};

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: labourAnalysis(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const [columns, setColumns] = useState([]);

	useEffect(() => {
		if (defaultUnitID) {
			setSelectedUnit(defaultUnitID);
		}
		if (defaultUnitName) {
			setSelectedUnitName(defaultUnitName);
		}
	}, [defaultUnitID, defaultUnitName]);

	const fetchLaborAnalysisReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);

			const getData = {
				url: 'laborAnalysis',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					weekStartDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					forecastType: 'SALES',
					intervalType: 'QH',
					userID: 31439,
					options: ' ',
					jobIdFilter: ' ',
				},
			};

			const result = await getCall(getData);

			const newData = result.data.laborAnalysisModels.map((item) => ({
				sectionName: item.sectionName,
				subRows: item.laborAnalysisDetaislModels.map((subItem) => ({
					name: subItem.name,
					...subItem.laborAnalysisDateDataModels.reduce((acc, subSubItem) => {
						acc[subSubItem.date] = subSubItem.value.includes('¤')
							? `$${subSubItem.value.replace('¤', '')}`
							: subSubItem.value;
						return acc;
					}, {}),
				})),
			}));

			const generatedColumns = [
				columnHelper.accessor('name', {
					id: 'name',
					header: 'Name',
					cell: ({ getValue, row }) =>
						row.getCanExpand() ? (
							<div className={`flex items-center gap-2 font-bold absolute inset-0 w-96] `}>
								{row.getIsExpanded() ? <IoIosArrowUp /> : <IoIosArrowDown />}
								{row.original.sectionName}
							</div>
						) : (
							getValue()
						),
					dataType: 'string',
				}),

				...Object.keys(newData[0].subRows[0])
					.filter((key) => !['name'].includes(key))
					.map((item) =>
						columnHelper.accessor(item, {
							id: item,
							header: item,
							cell: ({ getValue, row }) => (
								<div
									onClick={() => {
										if (
											modalNames[
												Object.keys(modalNames).find((key) => row.original.name.includes(key))
											]
										) {
											handleModal(row, item, result.data.scheduleSalesLaborHoursModels);
										}
									}}
								>
									{getValue()}
								</div>
							),
							dataType: 'string',
						})
					),
			];

			setLaborAnalysisReportData(newData);

			setColumns(generatedColumns);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Labour Analysis  data: ', error);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleModal = (row, item, data) => {
		const hours = Array.from({ length: 24 }, (_, i) => {
			const hour = i % 12 === 0 ? 12 : i % 12;
			const period = i < 12 ? 'AM' : 'PM';
			return `${hour}${period}`;
		});
		const getFilteredHours = (name) => {
			if (name.includes('Breakfast')) {
				return ['4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM'];
			} else if (name.includes('Lunch')) {
				return ['11AM', '12PM', '1PM'];
			} else if (name.includes('Afernoon Snack')) {
				return ['2PM', '3PM', '4PM'];
			} else if (name.includes('Late Dinner')) {
				return ['8PM', '9PM', '10PM', '11PM', '12AM', '1AM', '2AM', '3AM'];
			} else if (name.includes('Dinner')) {
				return ['5PM', '6PM', '7PM'];
			} else {
				return hours;
			}
		};

		const filteredHours = getFilteredHours(row.original.name);

		const modalColumns = filteredHours.map((hour) => columnHelper.accessor(hour, { header: hour, size: 60 }));
		modalColumns.unshift(columnHelper.accessor('name', { header: 'Name', size: 150 }));

		const modalData = [
			filteredHours.reduce(
				(acc, hour) => {
					const hour24 = (parseInt(hour) % 12) + (hour.includes('PM') ? 12 : 0);
					acc[hour] = data.find((item) => item.hour === hour24)?.[
						`${modalNames[Object.keys(modalNames).find((key) => row.original.name.includes(key))]}${
							item.split(' ')[0]
						}`
					];
					return acc;
				},
				{ name: row.original.name }
			),
		];

		setLaborAnalysisModalData(modalData);
		setModalColumns(modalColumns);
		setIsModalOpen((prev) => !prev);
		setModalData({
			row: row,
			title: item,
		});
	};

	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!laborAnalysisReportData || laborAnalysisReportData.length === 0) {
			console.error('Labor Analysis report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Labor Analysis',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		console.log('PDF Data: ', pdfData);

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = laborAnalysisReportData.map((row) => {
			const title = row.sectionName;
			return {
				type: 'table',
				title: title,
				widths: new Array(columns.length).fill('auto'),
				dataTypes: columns.map((column) => column.dataType),
				data: formatPDFData(row.subRows),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: columns.map((column) => column.header),
			rows: data.map((row) =>
				columns.map((column) => ({
					value: row[column.id] || '0 ',
					cellType: '',
					columnName: column.id,
				}))
			),
		};
	};

	const handleExcelClick = () => {
		const data = [
			{
				name: 'Labor Analysis',
				columns: columns.map((column) => column.header),
				data: laborAnalysisReportData.flatMap((row) => row.subRows.map((subRow) => Object.values(subRow))),
			},
		];

		console.log('Excel Data: ', data);

		const filename = 'LaborAnalysis';
		const spreadSheetTitle = 'Labor Analysis';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={laborAnalysisReportData} expandCollapseButtons={true} />;
	const modalTable = <TableHOC columns={modalColumns} data={laborAnalysisModalData} />;

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Labor Analysis</h2>
			<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
				<div className='flex items-center'>
					<UnitSelector
						companyId={companyID}
						alignmentId={alignmentID}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						includeAreas={true}
						setMemberName={setSelectedUnitName}
						onClick={() => setUnitShowModal(true)}
					/>
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
					/>
					<div className='w-48'>
						<Dropdown
							title='Job Description'
							options={jobDescriptionOptions}
							onOptionChange={(option) => setJobDescription(option)}
							selectedOption={jobDescription}
						/>
					</div>
					<div className='run-button' onClick={fetchLaborAnalysisReport}>
						<div className='py-3 ml-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includePDF={true}
						handlePDFClick={handlePDFClick}
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
						(laborAnalysisReportData.length > 0 ? (
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
					show={showModal}
					handleClose={() => {
						setUnitShowModal(false);
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
				<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(!isModalOpen)} title={modalData?.title}>
					<div className='p-6'>{modalTable}</div>
				</Modal>
			</div>
		</div>
	);
};

export default LabourAnalysis;
