import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC2,
	Dropdown,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import laborByPayPeriod from '../../assets/introJSSteps/labourByPayPeriod';

const columnHelper = createColumnHelper();

const LaborByPayPeriod = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [laborByPayPeriodData, setLaborByPayPeriodData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);
	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Labor By Pay Period Report, please try again later.'
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

	//dropdown variables
	const [view, setView] = useState('Units');
	const dropdownOptions = [{ name: 'Units' }, { name: 'Employees' }, { name: 'Employee Details' }];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: laborByPayPeriod(),
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
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const value = row.subRows.map((subrow) => subrow.original.jobCode);
						return value[0];
					} else {
						return getValue();
					}
				},
			}),
			columnHelper.accessor('overHours', {
				id: 'overHours',
				header: 'Overtime Hours',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
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
							}, 0)
							.toFixed(2);
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
						const sum = row.subRows
							.reduce((acc, subrow) => {
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
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
			columnHelper.accessor('declaredTipsPct', {
				id: 'declaredTipsPct',
				header: 'Tips %',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
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
							}, 0)
							.toFixed(2);
						return sum;
					} else {
						return getValue();
					}
				},
				dataType: 'number',
			}),
			columnHelper.accessor('regPay', {
				id: 'regPay',
				header: 'Total Pay',
				cell: ({ row, getValue }) => {
					if (row.getCanExpand()) {
						const sum = row.subRows
							.reduce((acc, subrow) => {
								if (subrow.getCanExpand()) {
									return (
										acc +
										subrow.subRows.reduce(
											(subAcc, subSubrow) => subAcc + subSubrow.original.regPay,
											0
										)
									);
								} else {
									return acc + subrow.original.regPay;
								}
							}, 0)
							.toFixed(2);
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
	const handleLaborByPayPeriod = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);
			const getData = {
				url: 'labourByPayPeriod',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
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

			setLaborByPayPeriodData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Labor By Pay Period Report data: ', error);
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

	const handleViewChange = (option) => {
		setView(option);
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!laborByPayPeriodData || laborByPayPeriodData.length === 0) {
			console.error('Labour By Pay Period data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Labor By Pay Period Report',
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

		console.log('PDF Data:', pdfData);

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = laborByPayPeriodData.map((row) => {
			const unit = unitsAndAreasList?.units?.find((unit) => unit.unitName === row.unitName);
			const title = unit ? unit.unitName : '';
			return {
				type: 'table',
				title: title,
				widths: [
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
					'auto',
				],
				dataTypes: [
					'number',
					'string',
					'date',
					'number',
					'string',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
					'number',
				],
				data: formatPDFData(row.subRows),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: [
				'Employee ID',
				'Full Name',
				'Date',
				'Job Code',
				'Job Description',
				'Regular Hours',
				'Overtime Hours',
				'Rate',
				'Declared Tips',
				'Pre-Tax Ticket Sales',
				'Declared Tips %',
				'Regular Pay',
			],
			rows: data.flatMap((row) =>
				row.subRows.map((subRow) => [
					{ value: row.employeeId, cellType: 'number', columnName: 'Employee ID' },
					{ value: `${row.firstName} ${row.lastName}`, cellType: 'string', columnName: 'Full Name' },
					{ value: subRow.date, cellType: 'date', columnName: 'Date' },
					{ value: subRow.jobCode, cellType: 'number', columnName: 'Job Code' },
					{ value: subRow.jobDesc, cellType: 'string', columnName: 'Job Description' },
					{ value: subRow.regHours, cellType: 'number', columnName: 'Regular Hours' },
					{ value: subRow.overHours, cellType: 'number', columnName: 'Overtime Hours' },
					{ value: subRow.rate, cellType: 'number', columnName: 'Rate' },
					{ value: subRow.declaredTips, cellType: 'number', columnName: 'Declared Tips' },
					{ value: subRow.preTaxTicketSales, cellType: 'number', columnName: 'Pre-Tax Ticket Sales' },
					{ value: subRow.declaredTipsPct, cellType: 'number', columnName: 'Declared Tips %' },
					{ value: subRow.regPay, cellType: 'number', columnName: 'Regular Pay' },
				])
			),
		};
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = [
			'Unit Name',
			'Employee ID',
			'First Name',
			'Last Name',
			'Date',
			'Job Code',
			'Job Description',
			'Regular Hours',
			'Overtime Hours',
			'Rate',
			'Declared Tips',
			'Pre-Tax Ticket Sales',
			'Tips %',
			'Total Pay',
		];
		const csvData = laborByPayPeriodData.flatMap((unit) =>
			unit.subRows.flatMap((employee) =>
				employee.subRows.map((period) =>
					[
						unit.unitName, // Parent row data (unit)
						employee.employeeId,
						employee.firstName, // First level subrow data (employee)
						employee.lastName,
						period.date, // Second level subrow data (period)
						period.jobCode,
						period.jobDesc,
						period.regHours,
						period.overHours,
						period.rate,
						period.declaredTips,
						period.preTaxTicketSales,
						period.declaredTipsPct,
						period.regPay,
					].join(',')
				)
			)
		);

		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'labourByPayPeriod.csv');
		tempLink.click();
	};

	// // Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: 'Labor By Pay Period Report',
				columns: [
					{ name: 'Unit Name', filter: 'text' },
					{ name: 'First Name', filter: 'text' },
					{ name: 'Last Name', filter: 'text' },
					{ name: 'Employee ID', filter: 'text' },
					{ name: 'Date', filter: 'text' },
					{ name: 'Job Code', filter: 'text' },
					{ name: 'Job Description', filter: 'text' },
					{ name: 'Regular Hours', filter: 'text' },
					{ name: 'Overtime Hours', filter: 'text' },
					{ name: 'Rate', filter: 'text' },
					{ name: 'Declared Tips', filter: 'text' },
					{ name: 'Pre-Tax Ticket Sales', filter: 'text' },
					{ name: 'Declared Tips %', filter: 'text' },
					{ name: 'Regular Pay', filter: 'text' },
				],
				data: laborByPayPeriodData.flatMap((unit) =>
					unit.subRows.flatMap((employee) =>
						employee.subRows.map((period) => ({
							unitName: unit.unitName,
							firstName: employee.firstName,
							lastName: employee.lastName,
							employeeId: employee.employeeId,
							date: period.date,
							jobCode: period.jobCode,
							jobDesc: period.jobDesc,
							regHoursPeriod: period.regHours,
							overHours: period.overHours,
							rate: period.rate,
							declaredTips: period.declaredTips,
							preTaxTicketSales: period.preTaxTicketSales,
							declaredTipsPct: period.declaredTipsPct,
							regPay: period.regPay,
						}))
					)
				),
			},
		];

		const filename = 'laborByPayPeriodReport';
		const spreadSheetTitle = 'Labor By Pay Period Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC2
			columns={columns}
			data={laborByPayPeriodData}
			view={view}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
			expandCollapseButtons={true}
		/>
	);

	return (
		<>
			<Loader loading={isLoading} />
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Labor By Pay Period</h2>
				<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
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
						<div className='w-52'>
							<Dropdown
								title='Expand View'
								options={dropdownOptions}
								selectedOption={view}
								onOptionChange={handleViewChange}
							/>
						</div>
						<div className='run-button' onClick={handleLaborByPayPeriod}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
								Run
							</div>
						</div>
					</div>
					<div>
						<ExportOptions
							includePDF={true}
							handlePDFClick={handlePDFClick}
							includeCSV={true}
							handleCSVClick={handleCSVClick}
							includeExcel={true}
							handleExcelClick={handleExcelClick}
							includeHelp={true}
							handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
						/>
					</div>
				</header>

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					!isLoading &&
					(laborByPayPeriodData.length > 0 ? (
						<div className='paged-table'>{Table}</div>
					) : !selectedUnit ? (
						<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
					) : (
						<div className='mt-10 text-xl font-medium text-center'>No data available</div>
					))
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
		</>
	);
};

export default LaborByPayPeriod;
