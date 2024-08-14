import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import inventoryTransferReport from '../../assets/introJSSteps/inventoryTransferReport';
import { Dropdown, UnitSelector, CalendarModal, UnitModal, ExportOptions, DateSelector } from '../../components';

const InventoryTransferReport = () => {
	const [companyID, setCompanyID] = useState(1021);
	const [alignmentID, setAlignmentID] = useState(1110);
	const [memberID, setMemberID] = useState(5199);
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Suggested Order, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [reportType, setReportType] = useState('Detail');
	const dropdownOptions = [{ name: 'Detail' }, { name: 'Unit Summary' }];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: inventoryTransferReport(),
		initialStep: 0,
		stepsEnabled: false,
	});

	useEffect(() => {
		// Fetch initial data
		if (!selectedUnit) {
			let parameters = decodeURIComponent(window.location.search.replace('?data=', ''));
			if (parameters) {
				parameters = JSON.parse(parameters);
				setCompanyID(parameters.CompanyID);
				setAlignmentID(parameters.AlignmentId);
				localStorage.setItem('companyID', parameters.CompanyID);
				localStorage.setItem('alignmentID', parameters.AlignmentId);
				fetchData(parameters.CompanyID, parameters.AlignmentId);
			} else if (localStorage.getItem('groupOrUnitAccess')) {
				setCompanyID(parseInt(localStorage.getItem('companyID')));
				setAlignmentID(parseInt(localStorage.getItem('alignmentID')));
				fetchData(localStorage.getItem('companyID'), localStorage.getItem('alignmentID'));
			} else {
				console.log('testing mode');
				setCompanyID(1021);
				setAlignmentID(1110);
				setMemberID(5199);
				setSelectedUnit(0);
				fetchData(1021, 1110, 5199);
			}
		} else {
			setErrorMessage('There was an issue loading your orders, please try again later.');
		}
	}, []);

	// Fetching Units and Areas
	const fetchData = async (companyID, alignmentID, memberID) => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'unitsAndArea',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: memberID,
				},
			};

			const result = await getCall(getData);
			setUnitsAndAreasList(result.data);

			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your units, please try again later.');
			console.error('Error getting units: ', error);
		}
	};

	const handleUnitSelection = (unitName, unitID) => {
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Inventory Transfer Report</h2>

			<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
				<div className='flex items-center space-x-3 '>
					<UnitSelector
						companyID={companyID}
						alignmentID={alignmentID}
						memberID={memberID}
						memberName={selectedUnitName}
						includeAreas={true}
						setMemberName={setselectedUnitName}
						onClick={() => setUnitShowModal(true)}
					/>
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
					/>

					<Dropdown
						options={dropdownOptions}
						title='Report Type'
						selectedOption={reportType}
						onOptionChange={(optionValue) => setReportType(optionValue)}
					/>
					<div className='run-button'>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includePDF={true}
						includeCSV={true}
						includeHelp={true}
						handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
					/>
				</div>
			</header>

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

export default InventoryTransferReport;
