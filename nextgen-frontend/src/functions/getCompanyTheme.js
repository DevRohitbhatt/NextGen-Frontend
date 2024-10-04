import { getCall } from "../apis/network";

export const getCompanyTheme = async (companyID) => {
  try {
    const response = await getCall({
      url: 'getAllCompanySettings',
      urlParams: {
        companyID: companyID,
      },
    });
    console.log(response);
    const theme = response.data.find((setting) => setting.name === 'App3ThemeEditorColors');
    if (theme) {
      const firstColor = theme.value.split(',')[0];
      const secondColor = theme.value.split(',')[1];
      const thirdColor = theme.value.split(',')[2];
      let primaryColor = firstColor;
      let secondaryColor = secondColor;
      if (firstColor === '#fff') {
        primaryColor = secondColor;
        secondaryColor = thirdColor;
      }
      console.log(primaryColor, secondaryColor);
      return { primary: primaryColor, secondary: secondaryColor };
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}