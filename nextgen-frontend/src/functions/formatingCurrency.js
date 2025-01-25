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

export const formattingDataWithoutDollr = (value) => {
	return value < 0
		? `-${Math.abs(parseFloat(value)).toLocaleString('en-US', {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
		  })}`
		: `${parseFloat(value).toLocaleString('en-US', {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
		  })}`;
};

export const valueFormatewithoutDecimal = (value) => {
	let returnValue =
		value < 0
			? `-${Math.abs(parseInt(value)).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })}`
			: `${parseInt(value).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })}`;
	returnValue = returnValue.split('.')[0];
	return returnValue;
};
