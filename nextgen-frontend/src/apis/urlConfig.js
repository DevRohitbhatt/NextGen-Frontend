const urlConfig = {
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

	//Sales apis
	hourlySales: 'api/sales/GetSalesHourlyReportData',
	voids: 'api/sales/getVoidsReportData',

	//labor apis
	employeeInformation: 'api/labor/getEmployeeInformation',
};
export default urlConfig;
