export default function SuggestedOrderListIntro() {
  return [
    {
      intro: "<center>Welcome to QSROnline’s Food Management tool, Suggested Order! Let us show you around." +
        "<br><br>Press the enter or arrow keys to advance through the tutorial.</center>"
    },
    {
      element: '.unit-selector',
      intro: "-Your Unit or store is selected by default." + "<br> -You may select any Unit(s) or Area you have permissions to."

    },
    {
      element: '.vendor-selector',
      intro: "Select the Vendor(s) you want to display in the Suggested Order activity list."   +"<br> -Only Vendors with previous Suggested ORder activity will display data."
    
    },
    {
      element: '.date-selector',
      intro: "-Select the date, or date range, you wish to display Suggested Order activity" +"<br> -Orders with all Order Status types will display."
   
    },
    {
      element: '.export-options',
      intro: "You can export the Suggested Order activity list to either .CSV or .PDF format. The ? icon will launch this guided tour." 
    },
    {
      element: '.add-option',
      intro: "The + (plus) sign icon will create a NEW Suggested Order." 
        + "<br><br> This pop   up screen will prompt you for the unit #, the Vendor to create a new order and the Order Span dates for the new order."
        + "Typically, the Order Span Dates start with the next order delivery date and extend through either the day before or day of the following delivery date."
    },
    {
      element: '.paged-table',
      intro: "-All information is displayed for your selected criteria." +"<br><br> -Tooltips will explain the column element in more detail,  just hover your cursor over the tooltip.”+”<br><br> -The columns on this page are sortable for convenience."
    },
  ]
}