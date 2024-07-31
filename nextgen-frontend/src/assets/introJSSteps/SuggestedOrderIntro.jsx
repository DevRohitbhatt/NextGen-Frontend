export default function SuggestedOrderIntro() {
  return [
    {
      intro: "<center>Welcome to QSROnline's Food Management tool, Suggested Order! Let us show you around." 
        + "<br><br>Press the enter or arrow keys to advance through the tutorial.</center>"
    },
    {
      element: '.sales-forecast',
      intro: "-This section displays the Sales Forecast dates selected on the Create Order screen, along with the forecasted values for each date from the main Sales Forecast module." 
        + "<br> -You may change the values here to better reflect your expectation of Sales Forecast for each day, if you chose. These values will also update if you change, and SAVE,"
        + " the values in the main Sales Forecast module."
        + "<br><br> - Forecasted Sales adjustments on this page will apply to Suggested Order ONLY and will not impact other modules."

    },
    {
      element: '.default-safety-factor',
      intro: "Set a default safety factor OR individual item safety factor below. The Safety Factor adds a buffer,  or cushion,  to the base SUGGESTED QTY amount." 
        + "<br><br> Forecasted sales are typically not 100% predictable therefore a buffer will allow for sales fluctuations. Often, items with a short shelf life " 
        + "may require a lesser safety factor i.e. 5% to control product quality & freshness and minimize waste whereas items with a longer shelf life may use a 10% " 
        + "to 20% Safety Factor buffer to avoid stock-outs. The QSROnline default Safety Factor will apply to all items however the user can adjust individual item Safety "
        + "Factor values to better control quality and avoid stockouts.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.tree-table',
      intro: "-This section displays all pertinent information about inventory and vendor items such as descriptions, vendor reference #, order unit, and packaging as well "
      + "as the Current/Last Price of an item, line item Safety Factor values, the Suggested Order Quantity, provision for user on-hand quantity input, your actual order "
      + "amount and extended price of your actual order amount."
    },
    {
      element: '.item-description',
      intro: "-The Item Description reflects the name your vendor has assigned to each item and lines up with the Item Reference #."  
        + "<br><br> The Item Description column has a dropdown capability and will show all previously mapped items to the Inventory item for ordering convenience." 
    },
    {
      element: '.current-last-price',
      intro: "-If your vendor is integrated with QSROnline Suggested Order, the vendor's current catalog price is captured. If your vendor is not QSROnline Suggested Order integrated, "
        + "the item price is collected as the last price from the most recent invoice.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
   
    },
    {
      element: '.suggested-qty',
      intro: "- The Suggested Quantity is calculated using Forecasted Sales, item inventory, item dollar yields, and the item Safety Factor. "
        + "The calculation is (Forecasted Sales Order Span / 4 week item dollar yield) * item safety factor. The item dollar yield is calculated as Net Sales / 4-week rolling item usage. "
        + "Note: At least one instance of item usage (inventory to inventory) is required to calculate the item dollar yield.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.on-hand',
      intro: "- The On Hand values are input from the person creating the order. The Suggested Qty amounts assume there is no usable inventory which, in reality, "
        + "there typically is usable inventory on hand. The person completing the Suggested Order will perform a physical count of usable inventory units on hand. "
        + "The Suggested Order application will subtract this amount from the Suggested Order amount to populate the Order Amount.” +”<br><br> - The On Hand amount "
        + "can be collected using the QSROnline mobile app Order count sheet. This provides a very convenient, familiar, easy-to-use method of counting the On Hand quantities "
        + "and prep populating the On Hand amounts from your mobile count.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.order-amount',
      intro: "-The Order Amount quantity is equivalent to Suggested Qty - On Hand count. The Order Amount reflects the number, or quantity of an item to actually order from your vendor." 
        + "<br><br> If your vendor is integrated with QSROnline Suggested Order, the Order Amount is the amount of product that will be electronically sent to your vendor when submitted "
        + "as your order. If your vendor does not have a Suggested Order integration with QSROnline, the Order Amount will need to be called in, or sent in via your submit file, to your vendor.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.extended-price',
      intro: "-The Extended Price is equivalent to the Order Amount * the Current or last price, whichever applies depending on your vendor's "
        + "integration to QSROnline Suggested Order or your last received invoice price.",
      position: 'bottom',
      tooltipClass: 'wide-tooltip'
    },
    {
      element: '.tree-table',
      intro: "-All information is displayed for your selected criteria." 
        + "<br><br> -Tooltips will explain the column element in more detail, "
        + "just hover your cursor over the tooltip.<br><br> -The columns on this page are sortable for convenience."
    },
  ];
}