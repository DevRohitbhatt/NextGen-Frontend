export default function cookChart() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Cook Drop Chart tool! Let us show you around.' +
				'<br><br>Press the enter or arrow keys to advance through the tutorial.</center>',
		},
		{
			element: '.unit-selector',
			intro:
				'-Your Unit or store is selected by default.' +
				'<br> -You may select any Unit(s) or Area you have permissions to.',
		},
		{
			element: '.date-selector',
			intro: '-Select the date, you wish to display  Cook Drop Chart Report',
		},
		{
			element: '.dropdown-selector',
			intro: 'You can select the Cook Drop Chart based on the Unit and Date ',
		},
		{
			element: '.export-options',
			intro: 'You can export the Actual Cook Drop Chart to either .XLSX or .PDF format. The ? icon will launch this guided tour.',
		},
		{
			element: '.paged-table',
			intro:
				'-All information is displayed for your selected criteria.' +
				'<br><br> -Tooltips will explain the column element in more detail,  ' +
				'just hover your cursor over the tooltip.<br><br> -The columns on this page are sortable for convenience. Just click on the column header to sort.',
		},
	];
}
