export default function hourlySales() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Hourly Sales Report tool! Let us show you around.' +
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
			intro: '-Select the date, or date range, you wish to display Hourly Sales Report',
		},
		{
			element: '.reportType-selector',
			intro: '-Select the Hourly Sales Report based on the following options: "Hour And Day", "Units", or "Unit, Hour and Day".',
		},
		{
			element: '.salesType-selector',
			intro: '-Select the Hourly Sales Report based on the following options: "Net Sales", "Gross Sales", or "Transaction".',
		},
		{
			element: '.DOWType-selector',
			intro: '-Select the Hourly Sales Report based on the Week Days.',
		},
		{
			element: '.viewType-selector',
			intro:
				'-Select the Hourly Sales Report based on the following options:' +
				' <br> For Report Type:Hour and Day => "Hour", "half-hour", or "Qtr-hour".' +
				' <br> For Report Type:Units => "Sum" or "Avg"',
		},
		{
			element: '.export-options',
			intro: 'You can export the Voids Report to either .XLSX or .PDF format. The ? icon will launch this guided tour.',
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
