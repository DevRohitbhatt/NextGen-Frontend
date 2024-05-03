export default function PrepChartIntroSteps() {
    return [
        {
            intro: "<center>Welcome to QSROnline’s Newest Food Management tool, Prep & Thaw! Let us show you around." +
                "<br><br>Press the enter or arrow keys to advance through the tutorial.</center>"
        },
        {
            element: '.unit-selector',
            intro: "Your unit or store is selected by default. You may select any unit you have access to here."
        },
        {
            element: '.date-selector',
            intro: "Defaults to TODAY’s computer date. Use the calendar date selection tool to choose a different day date."
        },
        {
            element: '.export-options',
            intro: "You can print your prep & thaw chart directly to your printer and/or export the information as well."
        },
        {
            element: '.sales-forecast',
            intro: "Your prep & thaw chart pulls the Selected Date plus Tomorrow and Next Day sales projections forward. The Tomorrow and Next Day forecast values are typically used for 2 day prep or frozen product thaw time i.e. 24 hour thaw = “Tomorrow”, 48 hour thaw = Next Day."
        },
        {
            element: '.default-safety-factor',
            intro: "The Default Safety Factor is an additional amount , in percentage, to add as a cushion to the NEEDED values below. Safety Factor is to ensure ample product on hand to serve your customers if actual sales happen to be higher than the forecasted sales amount."
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
            intro: "Select the desired Prep Type to determine the quantity NEEDED, calculated by the selected Prep Type."
        },
        {
            element: '.yield-type',
            intro: "This figure represents a 4 week moving average dollar yield based on your actual inventory counts. It is IMPORTANT to ensure inventory counts are accurate for dollar yields to be accurate."
        },
        {
            element: '.safety-factor',
            intro: "Some items require more or less safety factor versus the overall Default safety factor above. For example, a perishable item like prepped tomatoes, where quality and shelf life are considered, may use a lower safety factor i.e. 5% where items that will carry over for a day or more may use a higher safety factor such as 10% or 20%. Line item safety factor changes will ignore the Default safety factor number above."
        },
        {
            element: '.needed',
            intro: "The needed amount is calculated using actual inventory dollar yields, or NET SALES / ACTUAL product usage, for the last four weeks PLUS the safety factor selected. Note: the average dollar yield is a 4 week moving average to consider product usage trends."
        },
        {
            element: '.on-hand',
            intro: "The On Hand amount is collected by physical inventory to determine how much PREPPED / THAWED product is available. The On Hand amount will be deducted from the NEEDED quantity"
        },
        {
            element: '.prep-pull',
            intro: "The Prep/ Pull amount is defined by the NEEDED amount - the On Hand quantity. This is the amount of product to Prep or Pull for thawing."
        },
        {
            element: '.tomorrow-table',
            intro: "Items in Tomorrow section will use both TODAY forecast + TOMORROW forecasted sales to calculate the NEEDED amount. This allows for items with 24 hour thaw time."
        },
        {
            element: '.nextday-table',
            intro: "Items in NEXT DAY section will use TODAY forecast + TOMORROW forecast + NEXT DAY forecast to calculate the NEEDED amount. This allows for items with 48 hour thaw time."
        },
        {
            element: '.help-option',
            intro: "Use the HELP button and select View Tutorial to watch this guided tour any time!"
        }
    ]
}