import { lazy } from 'react';

// Food-Cost Pages
const PrepChart = lazy(() => import('./food-cost/PrepChart/PrepChart'));
const PrepChartTemplate = lazy(() => import('./food-cost/PrepChart/PrepChartTemplate'));
const SuggestedOrder = lazy(() => import('./food-cost/SuggestedOrder/SuggestedOrder'));
const SuggestedOrderList = lazy(() => import('./food-cost/SuggestedOrder/SuggestedOrderList'));
const InventoryTransfer = lazy(() => import('./food-cost/InventoryTransfer'));
const InventoryWeeksOnHand = lazy(() => import('./food-cost/InventoryWeeksOnHand'));
const ActualFoodCost = lazy(() => import('./food-cost/ActualFoodCost'));
const VarianceFoodCost = lazy(() => import('./food-cost/VarianceFoodCost'));
const Invoices = lazy(() => import('./food-cost/Invoices'));
const Countsheets = lazy(() => import('./food-cost/Countsheets'));
const CountsheetDesigner = lazy(() => import('./food-cost/CountsheetDesigner'));
const PurchaseAnalysis = lazy(() => import('./food-cost/PurchaseAnalysis'));

// Sales Pages
const Voids = lazy(() => import('./sales/Voids'));
const HourlySales = lazy(() => import('./sales/HourlySales'));
const BrumitDWP = lazy(() => import('./sales/BrumitDWP'));

// Labor Pages
const EmployeeInformation = lazy(() => import('./labor/EmployeeInformation'));
const LaborByPayPeriod = lazy(() => import('./labor/LaborByPayPeriod'));
const LaborCICO = lazy(() => import('./labor/LaborCICO'));
const LaborCICOExceptions = lazy(() => import('./labor/LaborCICOExceptions'));

export {
	PrepChart,
	PrepChartTemplate,
	SuggestedOrder,
	SuggestedOrderList,
	InventoryTransfer,
	InventoryWeeksOnHand,
	EmployeeInformation,
	LaborByPayPeriod,
	LaborCICO,
	LaborCICOExceptions,
	Voids,
	HourlySales,
	BrumitDWP,
	ActualFoodCost,
	VarianceFoodCost,
	Invoices,
	Countsheets,
	CountsheetDesigner,
	PurchaseAnalysis,
};
