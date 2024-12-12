import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';
import employeeInformation from '../../assets/introJSSteps/employeeInformation';
import {
	Loader,
	Dropdown,
	UnitSelector,
	UnitModal,
	ExportOptions,
	ExcelExport as exportToExcel,
	SimpleTable as Table,
	PdfBuilder,
} from '../../components';

const EmployeeInformation = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
	} = useSelector((state) => state.globalState);
	const [employeeInformationData, setEmployeeInformationData] = useState([]);
	const [filteredEmployeeInformationData, setFilteredEmployeeInformationData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Employee Information, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

	//dropdown variables
	const [view, setView] = useState('All');
	const dropdownOptions = [
		{ name: 'All' },
		{ name: 'Active' },
		{ name: 'Terminated' },
		{ name: 'New Hires' },
		{ name: 'Birth Days' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: employeeInformation(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const headers = [
		{
			key: 'unitName',
			label: 'Unit Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px', // Minimum width of the column
			maxWidth: '250px', // Maximum width of the column
			width: '265px', // fix width
		},
		{
			key: 'employeeId',
			label: 'Employee ID',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
			width: '120px',
		},
		{
			key: 'ssn',
			label: 'Unique ID',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '130px',
			maxWidth: '200px',
			width: '130px',
		},
		{
			key: 'lastName',
			label: 'Last Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'firstName',
			label: 'First Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'middleName',
			label: 'Middle Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'payRate',
			label: 'Pay Rate',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
			width: '100px',
		},
		{
			key: 'address',
			label: 'Address',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
			width: '200px',
		},
		{
			key: 'address2',
			label: 'Address 2',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
			width: '200px',
		},
		{
			key: 'city',
			label: 'City',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
			width: '120px',
		},
		{
			key: 'state',
			label: 'State',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
			width: '140px',
		},
		{
			key: 'zip',
			label: 'Zip',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '120px',
			width: '100px',
		},
		{
			key: 'phone',
			label: 'Phone',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '120px',
		},
		{
			key: 'maritalStatus',
			label: 'Marital Status',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'dependants',
			label: 'Dependants',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'phantomEmployee',
			label: 'Phantom Employee',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'cellPhone',
			label: 'Cell Phone',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
			width: '150px',
		},
		{
			key: 'email',
			label: 'Email',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
			width: '270px',
		},
		{
			key: 'payrollID',
			label: 'Payroll ID',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
			width: '120px',
		},
		{
			key: 'birthDate',
			label: 'Birth Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
			width: '120px',
		},
		{
			key: 'startDate',
			label: 'Start Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
			width: '120px',
		},
		{
			key: 'termDate',
			label: 'Term Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
			width: '120px',
		},
	];

	useEffect(() => {
		if (defaultUnitID) {
			setSelectedUnit(defaultUnitID);
		}
		if (defaultUnitName) {
			setSelectedUnitName(defaultUnitName);
		}
	}, [defaultUnitID, defaultUnitName]);

	useEffect(() => {
		if (selectedUnit) {
			fetchEmployeeInformation(companyID, alignmentID, selectedUnit);
		}
	}, [selectedUnit]);

	// Fetching Employee Information
	const fetchEmployeeInformation = async (companyId, alignmentId, selectedUnit) => {
		try {
			setIsError(false);
			setIsLoading(true);
			const getData = {
				url: 'employeeInformation',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
				},
			};

			const result = await getCall(getData);
			result?.data?.map((data) => {
				data.birthDate = formatDate(data.birthDate);
				data.startDate = formatDate(data.startDate);
				data.termDate = formatDate(data.termDate);

				function formatDate(date) {
					if (date === '01/01/1900') {
						return '';
					}
					if (date) {
						if (date.includes('/')) {
							const [month, day, year] = date.split('/');
							return `${month}/${day}/${year}`;
						} else {
							return date;
						}
					}
					return '';
				}
			});
			setEmployeeInformationData(result);
			setFilteredEmployeeInformationData(result);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your employee information, please try again later.');
			console.error('Error getting employee information report data: ', error);
		}
	};

	const handleUnitSelection = async (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setShowUnitModal(false);
	};

	// function	to handle the view change
	const handleViewChange = async (option) => {
		setView(option);
		switch (option) {
			case 'All':
				setFilteredEmployeeInformationData(employeeInformationData);
				break;
			case 'Active':
				{
					const filteredData = employeeInformationData.data.filter((data) => data.termDate === '');

					setFilteredEmployeeInformationData({ data: filteredData });
				}
				break;
			case 'New Hires':
				{
					const currentDate = new Date();
					const currentMonth = currentDate.getMonth() + 1;
					const currentYear = currentDate.getFullYear();
					const filteredData = employeeInformationData.data.filter((data) => {
						const startDate = new Date(data.startDate);
						const startMonth = startDate.getMonth() + 1;
						const startYear = startDate.getFullYear();
						const isWithinOneMonth =
							(currentYear === startYear && currentMonth === startMonth) ||
							(currentYear === startYear && currentMonth - 1 === startMonth);
						return isWithinOneMonth;
					});

					setFilteredEmployeeInformationData({ data: filteredData });
				}
				break;
			case 'Terminated':
				{
					const filteredData = employeeInformationData.data.filter((data) => data.termDate !== '');

					setFilteredEmployeeInformationData({ data: filteredData });
				}
				break;
			case 'Birth Days':
				{
					const currentDate = new Date();
					const currentMonth = currentDate.getMonth();
					console.log(employeeInformationData.data);
					const birthDaysData = employeeInformationData.data.filter((data) => {
						const birthDate = new Date(data.birthDate);
						const birthMonth = birthDate.getMonth();
						return birthMonth === currentMonth;
					});

					console.log(birthDaysData);

					setFilteredEmployeeInformationData({ data: birthDaysData });
				}
				break;
			default:
				setFilteredEmployeeInformationData(employeeInformationData);
				break;
		}
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!filteredEmployeeInformationData?.data) return;

		const pdfData = {
			title: `Employee Information Report | ${view}`,
			subHeaders: [dateFormat(new Date(), 'mm/dd/yyyy')],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: generateBody(),
		};

		PdfBuilder(pdfData);
	};

	const generateBody = () => {
		const rowsPerTable = 28; // Define how many rows you want per table
		const totalRows = filteredEmployeeInformationData.data.length; // Get total number of rows
		const body = []; // Initialize the body array

		// Loop through the data and create tables
		for (let i = 0; i < totalRows; i += rowsPerTable) {
			const chunkedColumns = [];
			for (let j = 0; j < headers.length; j += 13) {
				chunkedColumns.push(headers.slice(j, j + 13));
			}
			chunkedColumns.forEach((columnChunk) => {
				body.push({
					type: 'table/SeperatePage',
					widths: columnChunk.map(() => 'auto'),
					dataTypes: columnChunk.map((column) => column.dataType),
					data: {
						columnHeaders: columnChunk.map((column) => column.label),
						rows: filteredEmployeeInformationData.data.slice(i, i + rowsPerTable).map((row) =>
							columnChunk.map((column) => ({
								value: row[column.key] || '0 ',
								cellType: '',
								columnName: column.label,
							}))
						),
					},
				});
			});
		}

		// Now the `body` array contains all the tables for the report
		return body;
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (!filteredEmployeeInformationData?.data) return;

		const data = [
			{
				name: '',
				columns: headers.map((header) => ({ name: header.label, filterButton: true })),
				data: filteredEmployeeInformationData.data.map((row) => headers.map((header) => row[header.key])),
			},
		];

		const filename = `Employee_Information_${selectedUnitName}_${dateFormat(new Date(), 'mm-dd-yyyy')}`;
		const spreadSheetTitle = 'Employee Information Report';
		const date = dateFormat(new Date(), 'mm/dd/yyyy');

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Employee Information</h2>
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

					<div className='w-[155px]'>
						<Dropdown
							options={dropdownOptions}
							title='View'
							selectedOption={view}
							onOptionChange={handleViewChange}
						/>
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
					{!isLoading && (
						<>
							{filteredEmployeeInformationData?.data ? (
								<div>
									<Table
										data={filteredEmployeeInformationData.data}
										headers={headers}
										onRowClick={() => {}}
										itemsPerPageOptions={[10, 25, 50, 100]}
									/>
								</div>
							) : !selectedUnit ? (
								<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
							) : (
								<div className='mt-10 text-xl font-medium text-center'>No data available</div>
							)}
						</>
					)}
				</div>
			)}

			<div>
				<UnitModal
					unitData={unitsAndAreasList}
					memberID={selectedUnit}
					memberName={selectedUnitName}
					show={showUnitModal}
					handleClose={() => {
						setShowUnitModal(false);
					}}
					handleUnitSelection={handleUnitSelection}
				/>
			</div>
		</div>
	);
};

export default EmployeeInformation;
