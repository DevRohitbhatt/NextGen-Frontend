import { lazy } from 'react';

// Food-Cost Pages
const PrepChart = lazy(() => import('./food-cost/PrepChart/PrepChart'));
const PrepChartTemplate = lazy(() => import('./food-cost/PrepChart/PrepChartTemplate'));
const SuggestedOrder = lazy(() => import('./food-cost/SuggestedOrder/SuggestedOrder'));
const SuggestedOrderList = lazy(() => import('./food-cost/SuggestedOrder/SuggestedOrderList'));
const InventoryTransfer = lazy(() => import('./food-cost/InventoryTransfer'));
const InventoryWeeksOnHand = lazy(() => import('./food-cost/InventoryWeeksOnHand'));
const ActualFoodCost = lazy(() => import('./food-cost/ActualFoodCost'));

// Sales Pages
const Voids = lazy(() => import('./sales/Voids'));

// Labor Pages
const EmployeeInformation = lazy(() => import('./labor/EmployeeInformation'));
const LaborByPayPeriod = lazy(() => import('./labor/LaborByPayPeriod'));

export {
	PrepChart,
	PrepChartTemplate,
	SuggestedOrder,
	SuggestedOrderList,
	InventoryTransfer,
	InventoryWeeksOnHand,
	EmployeeInformation,
	LaborByPayPeriod,
	Voids,
	ActualFoodCost
};
