export default function inventoryTransferReport() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Inventory Transfer Report tool! Let us show you around.' +
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
			intro:
				'-Select the date, or date range, you wish to display Suggested Order activity' +
				'<br> -Orders with all Order Status types will display.',
		},
		{
			element: '.reportType-selector',
			intro: 'You can select the type of report you want to view. Whether it is a summary or detailed report.',
		},
		{
			element: '.run-button',
			intro: 'Click the Run button to generate the report based on the selected criteria.',
		},
		{
			element: '.export-options',
			intro: 'You can export the Inventory Transfer Report to either .CSV or .PDF format. The ? icon will launch this guided tour.',
		},
	];
}
