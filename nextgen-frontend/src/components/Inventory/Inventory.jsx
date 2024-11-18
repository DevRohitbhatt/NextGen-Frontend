import { useEffect } from 'react';
import { getCall } from '../../apis/network';

export default function Inventory({ onClick, companyId, InventoryName, setInventoryName, menuId }) {
	useEffect(() => {
		const fetchInventoryItemList = async () => {
			try {
				const getData = {
					url: 'InventoryByCompanyID',
					urlParams: {
						companyId: companyId,
					},
				};

				const result = await getCall(getData);

				if (result.data.units.length > 0) {
					const unitName = result.data.units.find((unit) => unit.unitID === menuId).unitName;
					if (unitName) {
						setInventoryName(unitName);
						return;
					}
				}
			} catch (error) {
				setInventoryName('No Inventory selected');
			}
		};
		if (companyId && menuId) fetchInventoryItemList();
	}, [menuId]);

	return (
		<>
			<div onClick={onClick} className='flex flex-col justify-center rounded-3xl'>
				<div
					className={`px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)]`}
				>
					{InventoryName}
				</div>
			</div>
		</>
	);
}
