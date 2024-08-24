import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import employeeInformation from '../../assets/introJSSteps/employeeInformation';
import { Dropdown, UnitSelector, UnitModal, ExportOptions, SimpleTable as Table, PdfBuilder } from '../../components';
import exportToExcel from '../../components/exportOptions/ExcelExport';

const EmployeeInformation = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [employeeInformationData, setEmployeeInformationData] = useState([]);
	const [filteredEmployeeInformationData, setFilteredEmployeeInformationData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Employee Information, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

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
		},
		{
			key: 'employeeId',
			label: 'Employee ID',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
		{
			key: 'uniqueId',
			label: 'Unique ID',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '130px',
			maxWidth: '200px',
		},
		{
			key: 'lastName',
			label: 'Last Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'firstName',
			label: 'First Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'middleName',
			label: 'Middle Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'payRate',
			label: 'Pay Rate',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
		},
		{
			key: 'address',
			label: 'Address',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
		},
		{
			key: 'address2',
			label: 'Address 2',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
		},
		{
			key: 'city',
			label: 'City',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
		{
			key: 'state',
			label: 'State',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
		},
		{
			key: 'zip',
			label: 'Zip',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '120px',
		},
		{
			key: 'phone',
			label: 'Phone',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'maritalStatus',
			label: 'Marital Status',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'dependants',
			label: 'Dependants',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'gender',
			label: 'Gender',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
		},
		{
			key: 'phantomEmployee',
			label: 'Phantom Employee',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'cellPhone',
			label: 'Cell Phone',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'email',
			label: 'Email',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
		},
		{
			key: 'payrollID',
			label: 'Payroll ID',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
		{
			key: 'birthDate',
			label: 'Birth Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
		{
			key: 'startDate',
			label: 'Start Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
		{
			key: 'termDate',
			label: 'Term Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
	];

	useEffect(() => {
		// Fetch initial data
		if (!selectedUnit) {
			let parameters = decodeURIComponent(window.location.search.replace('?data=', ''));
			if (parameters) {
				parameters = JSON.parse(parameters);
				setCompanyId(parameters.CompanyId);
				setAlignmentId(parameters.AlignmentId);
				localStorage.setItem('companyId', parameters.CompanyId);
				localStorage.setItem('alignmentId', parameters.AlignmentId);
				fetchData(parameters.CompanyID, parameters.AlignmentId);
			} else if (localStorage.getItem('groupOrUnitAccess')) {
				setCompanyId(parseInt(localStorage.getItem('companyId')));
				setAlignmentId(parseInt(localStorage.getItem('alignmentId')));
				fetchData(localStorage.getItem('companyId'), localStorage.getItem('alignmentId'));
			} else {
				console.log('testing mode');
				setCompanyId(1021);
				setAlignmentId(1110);
				setMemberId(5199);
				setSelectedUnit(0);
				fetchData(1021, 1110, 5199);
			}
		} else {
			setErrorMessage('There was an issue loading your orders, please try again later.');
		}
	}, []);

	const fetchData = async (companyId, alignmentId, selectedUnit) => {
		setIsLoading(true);
		await Promise.all([fetchUnits(companyId, alignmentId, selectedUnit)]);
		setIsLoading(false);
	};

	// This function fetches the units and areas.
	const fetchUnits = async (companyId, alignmentId, memberId) => {
		try {
			setIsError(false);
			const getData = {
				url: 'unitsAndArea',
				urlParams: {
					companyID: companyId,
					alignmentID: alignmentId,
					memberID: memberId,
				},
			};

			const result = await getCall(getData);
			setUnitsAndAreasList(result.data);
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your units, please try again later.');
			console.error('Error getting units: ', error);
		}
	};

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
							return `${month}-${day}-${year.substring(2)}`;
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
			console.error('Error getting employee information: ', error);
		}
	};

	const handleUnitSelection = async (unitName, unitID) => {
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
		setIsLoading(true);
		await fetchEmployeeInformation(companyId, alignmentId, unitID);
		setIsLoading(false);
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
					console.log(filteredData);

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
					const currentMonth = currentDate.getMonth() + 1;
					const currentDay = currentDate.getDate();

					const birthDaysData = employeeInformationData.data.filter((data) => {
						const birthDate = new Date(data.birthDate);
						const birthMonth = birthDate.getMonth() + 1;
						const birthDay = birthDate.getDate();
						return birthMonth === currentMonth && birthDay === currentDay;
					});

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
			subHeaders: [new Date().toLocaleDateString()],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: headers.map(() => 'auto'),
					dataTypes: headers.map((header) => header.cellType),
					data: {
						columnHeaders: headers.map((header) => header.label),
						rows: filteredEmployeeInformationData.data.map((row) =>
							headers.map((header) => ({
								value: row[header.key],
								cellType: header.cellType,
								columnName: header.label,
							}))
						),
					},
				},
			],
		};

		PdfBuilder(pdfData);
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (!filteredEmployeeInformationData?.data) return;

		const data = [
			{
				name: `Employee Information Report | ${view}`,
				columns: headers.map((header) => ({ name: header.label, filterButton: true })),
				data: filteredEmployeeInformationData.data.map((row) => headers.map((header) => row[header.key])),
			},
		];

		const filename = 'Employee Information Report';
		const spreadSheetTitle = 'Employee Information Report';
		const date = new Date().toLocaleDateString();

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
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Employee Information</h2>
			<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
				<div className='flex items-center space-x-3 '>
					<UnitSelector
						companyId={companyId}
						alignmentId={alignmentId}
						memberId={selectedUnit}
						memberName={selectedUnitName}
						includeAreas={true}
						setMemberName={setselectedUnitName}
						onClick={() => setUnitShowModal(true)}
					/>

					<Dropdown
						options={dropdownOptions}
						title='View'
						selectedOption={view}
						onOptionChange={handleViewChange}
					/>
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

			{isLoading ? (
				<div>Loading...</div>
			) : isError ? (
				<div>{errorMessage}</div>
			) : (
				filteredEmployeeInformationData?.data && (
					<div>
						<Table data={filteredEmployeeInformationData?.data} headers={headers} onRowClick={() => {}} />
					</div>
				)
			)}

			<div>
				<UnitModal
					unitData={unitsAndAreasList}
					memberID={selectedUnit}
					memberName={selectedUnitName}
					show={showModal}
					includeAreas={true}
					handleClose={() => {
						setUnitShowModal(false);
					}}
					handleUnitSelection={handleUnitSelection}
				/>
			</div>
		</div>
	);
};

export default EmployeeInformation;
