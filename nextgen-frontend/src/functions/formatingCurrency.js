export const formattingData = (value) => {
    return value < 0
        ? `-$${Math.abs(parseFloat(value)).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
          })}`
        : `$${parseFloat(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
          })}`;
};

export const addDecimals = (value) => {
  return value < 0
      ? `-${Math.abs(parseFloat(value)).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
        })}`
      : `${parseFloat(value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
        })}`;
};