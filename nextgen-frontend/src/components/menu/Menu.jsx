import { useEffect } from 'react';
import { getCall } from '../../apis/network';

export default function Menu({ onClick, companyId, menuName, setMenuName, menuId }) {
	useEffect(() => {
		const fetchMenuItems = async () => {
			try {
				const getData = {
					url: 'MenuItemsByCompanyID',
					urlParams: {
						companyId: companyId,
					},
				};

				const result = await getCall(getData);

				if (result.data.units.length > 0) {
					const unitName = result.data.units.find((unit) => unit.unitID === menuId).unitName;
					if (unitName) {
						setMenuName(unitName);
						return;
					}
				}
			} catch (error) {
				setMenuName('No Menu selected');
			}
		};
		if (companyId && menuId) fetchMenuItems();
	}, [menuId]);

	return (
		<>
			<div onClick={onClick} className='flex flex-col justify-center rounded-3xl'>
				<div
					className={`px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl  hover:border-[var(--tw-primary)] truncate`}
				>
					{menuName}
				</div>
			</div>
		</>
	);
}
