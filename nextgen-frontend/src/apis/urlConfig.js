const urlConfig = {
	//Company apis
	getCompanySetting: '/api/company/settings/getsetting',
	getAllCompanySettings: '/api/company/settings/getallsettings',

	unitsAndArea: '/api/unitsandareas/getbyid',
	vendors: '/api/vendor/getvendorsbycompanyid',

	//suggested order apis
	orderList: '/api/order/GetOrderList',
	getOrderItem: '/api/suggestedorder/getvendorinventoryitems',
	getPurchaseOrderDetails: '/api/order/getpurchaseorderdetails',
	saveSuggestedOrder: '/api/suggestedorder/savesuggestedorder',
	submitSuggestedOrder: '/api/suggestedorder/submitsuggestedorderheader',

	//inventory items apis
	getInventoryItemsOrderLimits: '/api/inventoryitems/getinventoryitemsorderlimits',
	updateInventoryItemOrderLimits: '/api/inventoryitems/updateinventoryitemsorderlimit',
	deleteInventoryItemOrderLimits: '/api/inventoryitems/deleteinventoryitemsorderlimit',

	//prep chart apis
	getPrepChartDetail: '/api/prepchartdetail',
	savePrepChartDetail: '/api/prepchartdetail/save',

	//prep chart template apis
	getPrepChartTemplate: '/api/prepcharttemplate',
	savePrepChartTemplate: '/api/prepcharttemplate/save',
	getPrepChartTemplateInventoryList: '/api/prepcharttemplate/getinventorylist',

	//food cost apis
	inventoryTransferReportData: 'api/foodcost/getInventoryTransferReportData',
	InventoryWeeksOnHand: 'api/foodcost/getInventoryWeeksOnHandReportData',
	ActualFoodCost: 'api/foodcost/getActualFoodCostReportData',
	varianceFoodCost: 'api/foodcost/getVarianceFoodCostReportData',
	invoiceReport: '/api/foodcost/getInvoiceReportData',
	invoiceSearchReport: 'api/foodcost/GetInvoiceSearchReportData',
	getCountsheets: 'api/foodcost/GetCountSheets',
	countsheetDetails: 'api/foodcost/GetCountsheetDetails',
	Countsheet_PricingInfo: 'api/foodcost/getCountSheetsPriceInfo',
	countsheetPossibleError: 'api/foodcost/getCountSheetsPossibleError',
	PurchaseAnalysis: 'api/foodcost/getPurchaseAnalysisData',
	//Sales apis
	hourlySales: 'api/sales/GetSalesHourlyReportData',
	voids: 'api/sales/getVoidsReportData',

	//labor apis
	employeeInformation: 'api/labor/getEmployeeInformation',
	labourByPayPeriod: 'api/labor/getLaborByPayPeriodReportData',
	laborAnalysis: 'api/labor/getLaborAnalysisData',
};
export default urlConfig;
