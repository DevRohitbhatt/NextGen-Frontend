export default function prepChartTemplate() {
  return [
    {
      element: '.unit-selector',
      intro: 'Select a unit to create a Prep & Thaw template. The SAVE icon will allow the administrator to quickly SAVE and assign this particular prep & thaw template to any other unit or group of units. Friendly TIP: Remember to SAVE your template periodically while you build it.',
    },
    {
      element: '.save-option',
      intro: 'SAVES the current template to this unit with the option to also SAVE (assign) to any other unit or area. Friendly TIP: To save considerable time, construct a temple for a large number of similar units and SAVE to all the like AND somewhat like units. Access the other unit/areas and simply modify and SAVE again. ',
    },
    {
      element: '.search-bar',
      intro: 'Search inventory items to drag and drop to the Prep & Thaw section(s) desired. Items can be added to any number of sections i.e. TODAY, TOMORROW, NEXT DAY. Items can be placed in any order desired within each section. Friendly TIP: A search for item “chicken” will produce ALL items with “chicken” anywhere in the item description therefore making it easy to drag ALL “chicken” items produced by the search',
    },
    {
      element: '.Today',
      intro: 'Items in the TODAY section will use the TODAY forecast to calculate the NEEDED prep and/or thaw amount of product to process. Friendly TIP: Items in this section are typical prep items for TODAY’s business. This could include product quantities to prepare OR thaw for use TODAY.',
    },
    {
      element: '.Tomorrow',
      intro: 'Items in the TOMORROW section will use the TODAY + TOMORROW forecasts to calculate the NEEDED prep and/or thaw amount of product to process. Friendly TIP: Items in this section are typically items requiring a 24-hour thaw period to be ready for use.  This could also include product quantities to prep for a two day period having an adequate  prepared quality shelf life. ',
    },
    {
      element: '.Next',
      intro: 'Items in the NEXT DAY section will use the TODAY + TOMORROW + NEXT DAY forecasts to calculate the NEEDED prep and/or thaw amount of product to process. Friendly TIP: Items in this section are typical items requiring a 48-hour thaw period to be ready for use. This could also include product quantities to prep for a three day period having an adequate prepared quality shelf life. ',
    },
    {
      element: '.help-option',
      intro: 'Use the HELP button and select View Tutorial to watch this guided tour any time!',
    },
  ];
} 