import { useEffect } from 'react';

function useTableView(table, view, isTableRendered) {
	useEffect(() => {
		if (isTableRendered) {
			expandParentRowsOnly(table, view);
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
