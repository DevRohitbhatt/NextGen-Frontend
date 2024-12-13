const urlConfig = {
  //Company apis
  getCompanySetting: "/api/company/settings/getsetting",
  getAllCompanySettings: "/api/company/settings/getallsettings",
  getUserRoleSettings: "/api/company/settings/getUserRoleSettings",
  getAllWeekStartAndEndDates: "api/company/settings/GetAllWeekStartAndEndDates",
  getCurrentPeriodDates: "/api/company/settings/getCurrentPeriodDates",
  unitsAndArea: "/api/unitsandareas/getbyid",
  vendors: "/api/vendor/getvendorsbycompanyID",
  getAllPeriodDates: "/api/company/settings/getAllPeriodDates",
  getAllPayPeriodDates: "/api/company/settings/getAllPayPeriodDates",
  //suggested order apis
  orderList: "/api/order/GetOrderList",
  getOrderItem: "/api/suggestedorder/getvendorinventoryitems",
  getPurchaseOrderDetails: "/api/order/getpurchaseorderdetails",
  saveSuggestedOrder: "/api/suggestedorder/savesuggestedorder",
  submitSuggestedOrder: "/api/suggestedorder/submitsuggestedorderheader",

  //invoices details
  getInvoiceDetailsData: "/api/foodcost/getInvoiceDetailsData",
  getVendorInvoiceItems: "/api/foodcost/getVendorInvoiceItems",
  //inventory items apis
  getInventoryItemsOrderLimits:
    "/api/inventoryitems/getinventoryitemsorderlimits",
  updateInventoryItemOrderLimits:
    "/api/inventoryitems/updateinventoryitemsorderlimit",
  deleteInventoryItemOrderLimits:
    "/api/inventoryitems/deleteinventoryitemsorderlimit",

  //prep chart apis
  getPrepChartDetail: "/api/prepchartdetail",
  savePrepChartDetail: "/api/prepchartdetail/save",

  //prep chart template apis
  getPrepChartTemplate: "/api/prepcharttemplate",
  savePrepChartTemplate: "/api/prepcharttemplate/save",
  getPrepChartTemplateInventoryList: "/api/prepcharttemplate/getinventorylist",

  //food cost apis
  inventoryTransferReportData: "api/foodcost/getInventoryTransferReportData",
  InventoryWeeksOnHand: "api/foodcost/getInventoryWeeksOnHandReportData",
  ActualFoodCost: "api/foodcost/getActualFoodCostReportData",
  varianceFoodCost: "api/foodcost/getVarianceFoodCostReportData",
  invoiceReport: "/api/foodcost/getInvoiceReportData",
  invoiceSearchReport: "api/foodcost/GetInvoiceSearchReportData",
  getCountsheetDates: "api/foodcost/getCountSheetDates",
  getCountsheets: "api/foodcost/GetCountSheets",
  countsheetDetails: "api/foodcost/GetCountsheetDetails",
  Countsheet_PricingInfo: "api/foodcost/getCountSheetsPriceInfo",
  countsheetPossibleError: "api/foodcost/getCountSheetsPossibleError",
  PurchaseAnalysis: "api/foodcost/getPurchaseAnalysisData",

  //Sales apis
  hourlySales: "api/sales/GetSalesHourlyReportData",
  voids: "api/sales/getVoidsReportData",
  MenuItemSoldSummaryReport: "api/sales/getMenuItemSoldSummaryReportData",
  MenuItemSoldUnitReport: "api/sales/getMenuItemSoldUnitReportData",
  MenuItemSoldSellersReport: "api/sales/getMenuItemSoldTopSellersReportData",
  MenuItemSoldEmployeeData: "api/sales/getMenuItemSoldEmployeeData",
  MenuItemSoldHourData: "api/sales/getMenuItemSoldHourData",
  MenuItemSoldModifiersData: "api/sales/getMenuItemSoldModifiersData",
  salesVsLabor: "api/sales/SalesVsLaborReport",
  businessSummary: "api/sales/GetBusinessSummaryReportData",
  discounts: "api/sales/GetDiscountReportData",
  discountTypes: "api/sales/GetDiscountTypesReportData",
  menuGrossProfit: "api/sales/getMenuGrossProfitReport",
  menuGrossProfitRecipeInfo: "api/sales/GetMenuGrossProfitRecipePopupReport",

  //labor apis
  employeeInformation: "api/labor/getEmployeeInformation",
  laborByPayPeriod: "api/labor/getLaborByPayPeriodReportData",
  laborCICOExceptions: "api/labor/getLaborCICOExceptionReportData",
  laborCICO: "api/labor/getLaborCICOReportData",
  laborAnalysis: "api/labor/getLaborAnalysisData",
  getJobDetails: "api/labor/getJobDetails",

  //Menu item
  MenuItemsByCompanyID: "api/menus/getMenuItemsByCompanyID",
  InventoryByCompanyID: "api/prepcharttemplate/getinventorylist",
};
export default urlConfig;
