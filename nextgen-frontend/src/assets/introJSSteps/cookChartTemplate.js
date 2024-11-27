export default function cookChartTemplates() {
	return [
		{
			intro:
				'<center>Welcome to QSROnline’s Cook Chart Templates tool! Let us show you around.' +
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
			intro: 'You can select the Cook Chart based on the Unit',
		},
		{
			element: '.export-options',
			intro: 'You can  save the Cook template',
		},
        {
			element: '.create-New-CookItem',
			intro: 'You can create new cook item using this button',
		},
        {
			element: '.cook-template',
			intro: 'You can see your cook template here',
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
