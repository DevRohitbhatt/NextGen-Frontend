import { useState } from 'react';
import ItemsSoldTotals from './ItemsSoldTotals';
import ItemsSoldByEmployee from './ItemsSoldByEmployee';
import ItemsSoldByHour from './ItemsSoldByHour';
import ItemsSoldWithModifiers from './ItemsSoldWithModifiers';

const MenuItemsSold = () => {
	const [activeTab, setActiveTab] = useState('ItemsSoldTotals');

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

	return (
		<div className='w-[85%] mx-auto'>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'> Menu Items Sold </h2>
			<div className='flex gap-4'>
				{['ItemsSoldTotals', 'ItemsSoldByEmployee', 'ItemsSoldByHour', 'ItemsSoldWithModifiers'].map((tab) => (
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
