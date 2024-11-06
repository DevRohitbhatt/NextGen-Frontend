export default function discounts() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Discounts tool! Let us show you around.' +
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
			intro: '-Select the date, or date range, you wish to display Discounts.',
		},
		{
			element: '.viewBy-selector',
			intro: '-Select the Discounts Report based on the following views.',
		},
		{
			element: '.discount-selector',
			intro: '-Select the Discounts Report based on the following discounts options.',
		},
		{
			element: '.group-by',
			intro: '-Select how you would like to group the data.',
		},
		{
			element: '.run-button',
			intro: 'Click the Run button to generate the report based on the selected criteria.',
		},
		{
			element: '.export-options',
			intro: 'You can export the Discounts to either .CSV, .XLSX or .PDF format. The ? icon will launch this guided tour.',
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
