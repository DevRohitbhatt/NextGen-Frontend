export default function SuggestedOrderIntro() {
  return [
    {
      intro: "<center>Welcome to QSROnline's Suggested Order tool! Let us show you around." 
        + "<br><br>Press the enter or arrow keys to advance through the tutorial.</center>"
    },
    {
      element: '.sales-forecast',
      intro: "-This section displays the Sales Forecast dates selected on the Create Order screen, along with the forecasted values for each date from the main Sales Forecast module." 
        + "<br> -You may change the values here to better reflect your expectation of Suggested Order sales forecast for each day, if you chose. The forecasted sales values will also update if you change, and SAVE,"
        + " the values in the main Sales Forecast module."
        + "<br><br> - Forecasted Sales adjustments on this page will apply to Suggested Order ONLY and will not impact other modules."

    },
    {
      element: '.default-safety-factor',
      intro: "Set a default Safety Factor OR individual item safety factor below. The Safety Factor adds a buffer,  or cushion,  to the base SUGGESTED QTY amount." 
        + "<br><br> Forecasted sales are typically not 100% predictable therefore a buffer will allow for sales fluctuations. Often, items with a short shelf life " 
        + "may require a lesser Safety Factor i.e. 5% to control product quality & freshness and minimize waste whereas items with a longer shelf life may require a 10% " 
        + "to 20% Safety Factor buffer to avoid stock-outs. The QSROnline default Safety Factor will apply to all items however you can adjust individual item Safety "
        + "Factor values to better control quality and avoid stockouts.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.tree-table',
      intro: "-This section displays all pertinent information about inventory and vendor items such as descriptions, vendor reference #, item order unit, and packaging as well "
      + "as the Current/Last Price of an item, line item Safety Factor values, Suggested Order Quantity, provision for user on-hand quantity input, your actual order "
      + "amount and extended price of your actual order amount." 
      + "<br><br> You can set item level Order Limits here by clicking on the Order Limit values displayed. The Order Limit values will be stored by item and brought forward in future Suggested Orders created. "
    },
    {
      element: '.item-description',
      intro: "-The Item Description reflects the name your vendor has assigned to each item and lines up with the Item Reference #."  
        + "<br><br> The Item Description column includes dropdown capability to show all previously mapped items to the Inventory item for ordering convenience." 
    },
    {
      element: '.current-last-price',
      intro: "-If your vendor is Suggested Order integrated with QSROnline, the vendor's current catalog price is captured. If your vendor is not Suggested Order integrated, "
        + "the item price displayed is the last price from the most recent invoice.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
   
    },
    {
      element: '.suggested-qty',
      intro: "- The Suggested Quantity is calculated using forecasted sales, item inventory, item dollar yields, and the item safety factor. "
        + "The calculation is (Forecasted Sales Order Span / 4 week item dollar yield) * item safety factor. The item dollar yield is calculated as Net Sales / 4-week rolling item usage. "
        + "Note: At least one instance of item usage (inventory to inventory) is required to calculate the item dollar yield.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
    
      element: '.on-hand',
      intro: "- The On Hand values are input from the person creating the order. The Suggested Qty amounts assume there is no usable inventory which, in reality, "
        + "there typically is usable inventory on hand. The person completing the Suggested Order will perform a physical count of usable inventory units on hand. "
        + "The Suggested Order application will subtract this amount from the Suggested Order amount to populate the Order Amount."
        + "<br><br> - The On Hand amount "
        + "can be collected using the QSROnline mobile app Order count sheet. This provides a very convenient, familiar, easy-to-use method of counting the On Hand quantities "
        + "and prep populating the On Hand amounts from your mobile count.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
    element: '.order-limits',
     intro: "- Order Limits allow you to set a minimum and maximum order value as a reminder when creating your order." 
      + "You may want to set a minimum order limit as a reminder to always order at least 'x' amount of product. " 
      + "You may want to set a MAXIMUM order number as a reminder to not order more than 'x' amount of product taking into consideration storage space, etc.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.order-amount',
      intro: "-The Order Amount quantity is equivalent to Suggested Qty - On Hand count. The Order Amount reflects the number, or quantity of an item actually to order from your vendor." + "<br><br> The Order Amount will be rounded to avoid nearest whole value to avoid fractional order amounts submitted to your vendor."
        + "<br><br> If your vendor is integrated with QSROnline Suggested Order, the Order Amount is the amount of product that will be electronically sent to your vendor when submitted "
        + "as your order. If your vendor does not have a Suggested Order integration with QSROnline, the Order Amount will need to be provided to your vendor. You will be prompted for your desired format when you select the SUBMIT option.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.extended-price',
      intro: "-The Extended Price is equivalent to the Order Amount * the current or last price, whichever applies depending on your vendor's "
        + "integration to QSROnline Suggested Order or your last received invoice price.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.tree-table',
      intro: "-All information is displayed for your selected criteria. QSROnline captures 90 days of previous invoice history when selecting items to display." 
        + "<br><br> -Tooltips will explain the column element in more detail, "
        + "just hover your cursor over the tooltip.<br><br> -The columns on this page are sortable for convenience."
    },
  ];
}