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
			element: '.export-options',
			intro: 'You can  save the Cook template',
		},
        {
			element: '.create-New-CookItem',
			intro: 'You can create new cook item using this button',
		},
		{
			element: '.cooktemplate',
			intro: 'You can Drag the Item from left column and drop the item to right column to create a Template.',
		},
        {
			element: '.cook-template',
			intro: 'You can see your cook template here',
		},
	];
}
