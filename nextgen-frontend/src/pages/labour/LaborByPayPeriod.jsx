import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import inventoryTransferReport from '../../assets/introJSSteps/inventoryTransferReport';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	Dropdown,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import exportToExcel from '../../components/exportOptions/ExcelExport';
import TableHOC2 from '../../components/table/TableHOC2';

const columnHelper = createColumnHelper();

const LaborByPayPeriod = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [laborByPayPeriodData, setLaborByPayPeriodData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Inventory Transfer Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: inventoryTransferReport(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) =>
					row.getCanExpand() ? (
						<div
							{...{
								onClick: row.getToggleExpandedHandler(),
								style: { cursor: 'pointer', paddingLeft: `${row.depth * 2}rem` },
								className: 'inline-block',
							}}
						>
							{row.getIsExpanded() ? (
								<CiSquareMinus className='text-[20px]' />
							) : (
								<CiSquarePlus className='text-[20px]' />
							)}
						</div>
					) : null,
				size: '80',
			}),
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit Name',
				dataType: 'string',
				size: '250',
			}),
			columnHelper.accessor('employeeId', {
				id: 'employeeId',
				header: 'Employee ID',
				dataType: 'number',
			}),
			columnHelper.accessor((row) => (row.firstName && row.lastName ? `${row.firstName} ${row.lastName}` : ''), {
				id: 'fullName',
				header: 'Full Name',
				dataType: 'string',
			}),
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				cell: ({ getValue }) => {
					if (!getValue()) return '';
					const date = new Date(getValue());
					const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
					return formattedDate;
				},
				dataType: 'date',
			}),
			columnHelper.accessor('jobCode', {
				id: 'jobCode',
				header: 'Job Code',
				dataType: 'number',
			}),
			columnHelper.accessor('jobDesc', {
				id: 'jobDesc',
				header: 'Job Description',
				dataType: 'string',
			}),
			columnHelper.accessor('regHours', {
				id: 'regHours',
				header: 'Regular Hours',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows.reduce((acc, subrow) => {
							if (subrow.getCanExpand()) {
								return (
									acc +
									subrow.subRows.reduce(
										(subAcc, subSubrow) => subAcc + subSubrow.original.regHours,
										0
									)
								);
							} else {
								return acc + subrow.original.regHours;
							}
						}, 0);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
			columnHelper.accessor('overHours', {
				id: 'overHours',
				header: 'Overtime Hours',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows.reduce((acc, subrow) => {
							if (subrow.getCanExpand()) {
								return (
									acc +
									subrow.subRows.reduce(
										(subAcc, subSubrow) => subAcc + subSubrow.original.overHours,
										0
									)
								);
							} else {
								return acc + subrow.original.overHours;
							}
						}, 0);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
			columnHelper.accessor('rate', {
				id: 'rate',
				header: 'Rate',
				dataType: 'number',
			}),
			columnHelper.accessor('declaredTips', {
				id: 'declaredTips',
				header: 'Declared Tips',
				dataType: 'number',
			}),
			columnHelper.accessor('preTaxTicketSales', {
				id: 'preTaxTicketSales',
				header: 'Pre-Tax Ticket Sales',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows.reduce((acc, subrow) => {
							if (subrow.getCanExpand()) {
								return (
									acc +
									subrow.subRows.reduce(
										(subAcc, subSubrow) => subAcc + subSubrow.original.preTaxTicketSales,
										0
									)
								);
							} else {
								return acc + subrow.original.preTaxTicketSales;
							}
						}, 0);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
			columnHelper.accessor('declaredTipsPct', {
				id: 'declaredTipsPct',
				header: 'Declared Tips %',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows.reduce((acc, subrow) => {
							if (subrow.getCanExpand()) {
								return (
									acc +
									subrow.subRows.reduce(
										(subAcc, subSubrow) => subAcc + subSubrow.original.declaredTipsPct,
										0
									)
								);
							} else {
								return acc + subrow.original.declaredTipsPct;
							}
						}, 0);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
			columnHelper.accessor('regPay', {
				id: 'regPay',
				header: 'Regular Pay',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows.reduce((acc, subrow) => {
							if (subrow.getCanExpand()) {
								return (
									acc +
									subrow.subRows.reduce((subAcc, subSubrow) => subAcc + subSubrow.original.regPay, 0)
								);
							} else {
								return acc + subrow.original.regPay;
							}
						}, 0);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
		],
		[]
	);

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

	// Fetching Units and Areas
	const fetchUnits = async (companyId, alignmentId, memberId) => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'unitsAndArea',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: memberId,
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

	// Function to get the voids report
	const handleVoidsReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'labourByPayPeriod',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toISOString().split('T')[0],
					toDate: selectedToDate.toISOString().split('T')[0],
				},
			};

			const result = await getCall(getData);
			const newData = result.data.map((unit) => ({
				unitName: unit.unitName, // Keep unitName only at this level
				subRows: unit.employeeLaborModels.map((employee) => ({
					firstName: employee.firstName,
					lastName: employee.lastName,
					employeeId: employee.laborByPayPeriods[0]?.employeeId || null, // Employee ID at this level,
					subRows: employee.laborByPayPeriods.map((period) => ({
						date: period.date,
						jobCode: period.jobCode,
						jobDesc: period.jobDesc,
						regHours: period.regHours,
						overHours: period.overHours,
						rate: period.rate,
						declaredTips: period.declaredTips,
						preTaxTicketSales: period.preTaxTicketSales,
						declaredTipsPct: period.declaredTipsPct,
						regPay: period.regPay,
					})),
				})),
			}));

			// // Removing the old keys
			// newData.forEach((unit) => {
			// 	delete unit.employeeLaborModels;
			// 	unit.subRows.forEach((employee) => {
			// 		delete employee.laborByPayPeriods;
			// 	});
			// });

			setLaborByPayPeriodData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting voids report data: ', error);
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

	// Function to handle the PDF export
	// const handlePDFClick = () => {
	// 	if (!columns || columns.length === 0) {
	// 		console.error('Columns are not defined or empty');
	// 		return;
	// 	}

	// 	if (!voidsReportData || voidsReportData.length === 0) {
	// 		console.error('Voids report data is not defined or empty');
	// 		return;
	// 	}

	// 	const pdfData = {
	// 		title: 'Voids Report',
	// 		subHeaders: [
	// 			`${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
	// 		],
	// 		exportType: 'pdf',
	// 		pageOrientation: 'landscape',
	// 		body: buildPDFBody(),
	// 	};

	// 	PdfBuilder(pdfData);
	// };

	// const buildPDFBody = () => {
	// 	const body = voidsReportData.map((row) => {
	// 		const unit = unitsAndAreasList?.units?.find((unit) => unit.unitID === row.unitId);
	// 		const title = unit ? unit.unitName : '';
	// 		return {
	// 			type: 'table',
	// 			title: title,
	// 			widths: new Array(columns.length).fill('auto'),
	// 			dataTypes: columns.map((column) => column.dataType),
	// 			data: formatPDFData(row.voids),
	// 		};
	// 	});

	// 	return body;
	// };

	// const formatPDFData = (data) => {
	// 	return {
	// 		columnHeaders: columns.map((column) => column.header),
	// 		rows: data.map((row) =>
	// 			columns.map((column) => ({
	// 				value: row[column.id],
	// 				cellType: '',
	// 				columnName: column.id,
	// 			}))
	// 		),
	// 	};
	// };

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = columns.map((column) => column.header);
		const csvData = laborByPayPeriodData.flatMap((unit) =>
			unit.subRows.flatMap((employee) =>
				employee.subRows.map((period) =>
					[
						unit.unitName, // Parent row data (unit)
						employee.firstName, // First level subrow data (employee)
						employee.lastName,
						employee.employeeId,
						employee.regHours, // Sum of regHours for the employee
						period.date, // Second level subrow data (period)
						period.jobCode,
						period.jobDesc,
						period.regHours, // regHours for the specific period
						period.overHours,
						period.rate,
						period.declaredTips,
						period.preTaxTicketSales,
						period.declaredTipsPct,
						period.regPay,
						period.employeeId, // Retained employeeId for each period
					].join(',')
				)
			)
		);

		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'voids.csv');
		tempLink.click();
	};

	// // Function to handle the Excel export
	// const handleExcelClick = () => {
	// 	const data = [
	// 		{
	// 			name: 'Voids Report',
	// 			columns: columns.map((column) => ({ name: column.header, filterButton: true })),
	// 			data: voidsReportData.flatMap((row) => row.voids.map((voidRow) => Object.values(voidRow))),
	// 		},
	// 	];

	// 	const filename = 'voidsReport';
	// 	const spreadSheetTitle = 'Voids Report';
	// 	const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

	// 	exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	// };

	const Table = TableHOC2(columns, laborByPayPeriodData, false);

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Labor By Pay Period</h2>
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
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
					/>

					<div className='run-button' onClick={handleVoidsReport}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includePDF={true}
						//handlePDFClick={handlePDFClick}
						includeCSV={true}
						handleCSVClick={handleCSVClick}
						includeExcel={true}
						//handleExcelClick={handleExcelClick}
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
				laborByPayPeriodData.length > 0 && <div className='paged-table'>{Table}</div>
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

export default LaborByPayPeriod;
