import { useEffect } from 'react';

function useTableView(table, view, isTableRendered) {
	useEffect(() => {
		if (isTableRendered) {
			// Use a timeout or check if the data is available
			if (typeof view === 'number') {
				expandParentRowsOnly(table, view);
			}

			switch (view) {
				case 'Employees':
				case 'Department':
					expandParentRowsOnly(table, 1);
					break;
				case 'Sub Department':
					expandParentRowsOnly(table, 2);
					break;
				case 'Employee Details':
				case 'Inventory Item':
					table.toggleAllRowsExpanded(true);
					break;
				case 'Units':
					table.toggleAllRowsExpanded(false);
					break;
				default:
					break;
			}
		}
	}, [isTableRendered, view]);

	const expandParentRowsOnly = (table, depth) => {
		const expandedState = {};
		table.getRowModel().rows.forEach((row) => {
			if (depth === 1) {
				if (row.depth === 0) {
					expandedState[row.id] = true;
				}
			} else if (depth === 2) {
				row.subRows.forEach((subRow) => {
					if (subRow.depth === 1) {
						expandedState[subRow.id] = true;
						expandedState[row.id] = true;
					}
				});
			} else if (depth === 3) {
				row.subRows.forEach((subRow) => {
					if (subRow.depth === 1) {
						subRow.subRows.forEach((subSubRow) => {
							if (subSubRow.depth === 2) {
								expandedState[subSubRow.id] = true;
								expandedState[subRow.id] = true;
								expandedState[row.id] = true;
							}
						});
					}
				});
			}
		});
		table.setExpanded(expandedState);
	};
}

export default useTableView;
