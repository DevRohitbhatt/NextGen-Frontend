// storageHelpers.js

export const getParametersFromUrl = () => {
  let parameters = decodeURIComponent(
    window.location.search.replace("?data=", "")
  );
  if (parameters) {
    return JSON.parse(parameters);
  }
  return null;
};
