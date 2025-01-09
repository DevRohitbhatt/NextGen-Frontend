export default function itemSoldTotals() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Menu Item Sold - Item Sold Totals Report tool! Let us show you around.' +
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
			intro: '-Select the date, or date range, you wish to display Item Sold Totals Report',
		},
		{
			element: '.dropdown-selector',
			intro: 'You can select the Item Sold Totals Report based on specific days of the week or all days.',
		},
		{
			element: '.run-button',
			intro: 'Click the Run button to generate the report based on the selected criteria.',
		},
		{
			element: '.export-options',
			intro: 'You can export the Item Sold Totals Report to either .XLSX, .CSV or .PDF format. The ? icon will launch this guided tour.',
		},
		{
			element: '.view-selector',
			intro: '-Select the view you like to display for the Item Sold Totals Report',
		},
		{
			element: '.sale-selector',
			intro: '-Select the sale type - Net or Gross, you wish to display fot the Item Sold Totals Report Report',
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
