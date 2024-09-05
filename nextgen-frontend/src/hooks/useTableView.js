import { useEffect } from 'react';

function useTableView(table, view, isTableRendered) {
	useEffect(() => {
		if (isTableRendered) {
			// Use a timeout or check if the data is available
			const rows = table.getRowModel().rows;
			if (rows.length > 0) {
				console.log('Rows:', rows); // Debugging the rows data
				rows.forEach((row) => {
					console.log(`Row ID: ${row.id}, Depth: ${row.depth}`);
				});
				switch (view) {
					case 'Employees':
						expandParentRowsOnly(table);
						break;
					case 'Employee Details':
					case 'Inventory Item':
						table.toggleAllRowsExpanded(true);
						break;
					case 'Units':
					case 'Department':
						table.toggleAllRowsExpanded(false);
						break;
					default:
						break;
				}
			}
		}
	}, [isTableRendered, view]);

	const expandParentRowsOnly = (table, depth) => {
		const expandedState = {};
		table.getRowModel().rows.forEach((row) => {
			console.log(`Row ID: ${row.id}, Depth: ${row.depth}`);
			if (row.depth === 0) {
				expandedState[row.id] = true;
			}
		});
		table.setExpanded(expandedState);
	};
}

export default useTableView;
