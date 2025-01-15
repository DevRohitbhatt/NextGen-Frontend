export default function laborAudit() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Labor Audit Report tool! Let us show you around.' +
				'<br><br>Press the enter or arrow keys to advance through the tutorial.</center>',
		},
		{
			element: '.unit-selector',
			intro:
				'-Your Unit or store is selected by default.' +
				'<br> -You may select any Unit(s) or Area you have permissions to.',
		},
		{
			element: '.schedule-selector',
			intro: '-Select the date, or date range, you wish to display Labor Audit Report',
		},
		{
			element: '.run-button',
			intro: 'Click the Run button to generate the report based on the selected criteria.',
		},
		{
			element: '.export-options',
			intro: 'You can export the Labor Audit Report to either .XLSX or .PDF format. The ? icon will launch this guided tour.',
		},
		{
			element: '.paged-table',
			intro:
				'-All information is displayed for your selected criteria.' +
				'<br><br> -Tooltips will explain the column element in more detail,  ' 
				
		}
	];
}