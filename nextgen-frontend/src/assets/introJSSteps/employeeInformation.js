export default function employeeInformation() {
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
			element: '.dropdown-selector',
			intro: '-Select the view you like to display Employee Information: All, Active, Terminated, New Hires, or Birthdays.',
		},
		{
			element: '.export-options',
			intro: 'You can export the Inventory Transfer Report to either .XLSX or .PDF format. The ? icon will launch this guided tour.',
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
