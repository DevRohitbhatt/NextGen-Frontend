import { useEffect } from 'react';

function useTableView(table, view, isTableRendered) {
	useEffect(() => {
		if (isTableRendered) {
			switch (view) {
				case 'Employees':
					expandParentRowsOnly(table);
					break;
				case 'Employee Details':
				case 'department':
				case 'sub-department':
					table.toggleAllRowsExpanded(true);
					break;
				case 'Units':
				case 'inventoryItems':
					table.toggleAllRowsExpanded(false);
					break;
				default:
					break;
			}
		}
	}, [isTableRendered]);

	const expandParentRowsOnly = (table) => {
		const expandedState = {};
		table.getRowModel().rows.forEach((row) => {
			if (row.depth === 0 && row.subRows.length > 0) {
				expandedState[row.id] = true;
			}
		});
		table.setExpanded(expandedState);
	};
}

export default useTableView;
