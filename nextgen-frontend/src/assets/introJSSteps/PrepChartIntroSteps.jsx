export default function PrepChartIntroSteps() {
    return [
        {
            intro: "<center>Welcome to QSROnline’s Newest Food Management tool, Prep & Thaw! Let us show you around." +
                "<br><br>Press the enter or arrow keys to advance through the tutorial.</center>"
        },
        {
            element: '.unit-selector',
            intro: "-Your unit or store is selected by default." + "<br> -You may select any unit you have permissions to."
        },
        {
            element: '.date-selector',
            intro: "-Defaults to TODAY’s computer date." +"<br> -Use the calendar date selection tool to choose a different day date."
        },
        {
            element: '.export-options',
            intro: "You can print your prep & thaw chart directly to your printer and/or export the information as well."
        },
        {
            element: '.sales-forecast',
            intro: "-Your prep & thaw chart pulls the selected date plus Tomorrow and Next Day sales projections forward." +"<br><br> -The Tomorrow and Next Day forecast values are typically used for 2-day prep or frozen product thaw time i.e. 24-hour thaw = “Tomorrow”, 48-hour thaw = Next Day."
        },
        {
            element: '.default-safety-factor',
            intro: "-The Default Safety Factor is an additional amount, in percentage, to add as a cushion to the NEEDED values below." +"<br><br> -Safety Factor is to ensure ample product on hand to serve your customers if actual sales happen to be higher than the forecasted sales amount."
        },
        {
            element: '.today-table',
            intro: "The forecasted sales used to calculate the NEEDED qualities for Today."
        },
        {
            element: '.inventory-item-name',
            intro: "Your inventory item name. Your system administrator can easily add or remove items to the Prep & Thaw chart"
        },
        {
            element: '.prep-type',
            intro: "Select the desired Prep Type in the dropdown box to determine the quantity NEEDED, calculated by each selected Prep Type."
        },
        {
            element: '.yield-type',
            intro: "-This figure represents a 4-week moving average dollar yield based on your actual inventory counts." + "<br><br> -The Yield/Type dollar amount is calculated by the Prep Type selected." +"<br><br> -It is IMPORTANT to ensure inventory counts are accurate for your dollar yields to be accurate."
        },
        {
            element: '.safety-factor',
            intro: '-Some items require more or less safety factor versus the overall Default safety factor above." +"<br><br> -For example, a highly perishable item like prepped tomatoes, considering the prepped quality and shelf life, may use a lower safety factor i.e. 5%." +"<br"<br> -Items that carry over for a day or more may use a higher safety factor such as 10% or 20%." +"<br><br> -Line item safety factor changes will ignore the Default safety factor number above.'
        },
        {
            element: '.needed',
            intro: "-The needed amount is calculated using actual inventory dollar yields, or NET SALES / ACTUAL product usage, for the last four weeks (+) plus the safety factor selected." +"<br><br> -Note: the average dollar yield is a 4-week moving average to consider product usage trends."
        },
        {
            element: '.on-hand',
            intro: "-The On Hand amount is determined by physical inventory to determine how much PREPPED / THAWED product is available." + "<br><br> -The On Hand amount will be deducted from the NEEDED quantity."
        },
        {
            element: '.prep-pull',
            intro: "The Prep/ Pull amount is determined by the NEEDED amount (-) minus the On Hand quantity. This is the amount of product to Prep or to Pull for thawing."
        },
        {
            element: '.tomorrow-table',
            intro: "-Items in the Tomorrow section will use both TODAY forecast + TOMORROW forecasted sales to calculate the NEEDED amount." +"<br><br> -This allows for items with a 24-hour thaw time."
        },
        {
            element: '.nextday-table',
            intro: "-Items in the NEXT DAY section will use TODAY forecast + TOMORROW forecast + NEXT DAY forecast to calculate the NEEDED amount." +"<br><br> -This allows for items with 48-hour thaw time."
        },
        {
            element: '.help-option',
            intro: "Use the HELP button and select View Tutorial to watch this guided tour any time!"
        }
    ]
}