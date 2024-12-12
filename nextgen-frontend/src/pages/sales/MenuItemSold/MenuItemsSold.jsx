import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ItemsSoldTotals from './ItemsSoldTotals';
import ItemsSoldByEmployee from './ItemsSoldByEmployee';
import ItemsSoldByHour from './ItemsSoldByHour';
import ItemsSoldWithModifiers from './ItemsSoldWithModifiers';
import { getCall } from '../../../apis/network';

const MenuItemsSold = () => {
	const { companyID, userID } = useSelector((state) => state.globalState);
	const [activeTab, setActiveTab] = useState('ItemsSoldTotals');
	const [showItemsWithModifiers, setShowItemsWithModifiers] = useState(false);

	const renderComponent = () => {
		switch (activeTab) {
			case 'ItemsSoldTotals':
				return <ItemsSoldTotals />;
			case 'ItemsSoldByEmployee':
				return <ItemsSoldByEmployee />;
			case 'ItemsSoldByHour':
				return <ItemsSoldByHour />;
			case 'ItemsSoldWithModifiers':
				return <ItemsSoldWithModifiers />;
			default:
				return null;
		}
	};

	const getUserRoleSettings = async () => {
		try {
			const getData = {
				url: 'getUserRoleSettings',
				urlParams: {
					companyId: companyID,
					userId: userID,
				},
			};

			const result = await getCall(getData);
			console.log('user role settings', result);
			const value = result.data.find((item) => item.name === '$_SHOW_MODIFIERS_IN_REPORTS')?.value;
			if (value === 'Y') {
				setShowItemsWithModifiers(true);
			} else {
				setShowItemsWithModifiers(false);
			}
		} catch (error) {
			console.log('error loading user role settings', error);
		}
	};

	useEffect(() => {
		getUserRoleSettings();
	}, []);

	return (
		<div className='w-[85%] mx-auto'>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'> Menu Items Sold </h2>
			<div className='flex gap-4'>
				{[
					'ItemsSoldTotals',
					'ItemsSoldByEmployee',
					'ItemsSoldByHour',
					showItemsWithModifiers && 'ItemsSoldWithModifiers',
				]
					.filter(Boolean)
					.map((tab) => (
						<button
							key={tab}
							className={`flex items-center gap-2 px-4 py-3 border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button ${
								activeTab === tab ? 'bg-[var(--tw-primary)]  text-white' : 'text-[var(--tw-primary)]'
							}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab.replace(/([A-Z])/g, ' $1').trim()}
						</button>
					))}
			</div>

			<div className='mt-4'>{renderComponent()}</div>
		</div>
	);
};

export default MenuItemsSold;
