import api from './configs/axiosConfig';
import { defineCancelApiObject } from './configs/axiosUtils';
import urlConfig from './urlConfig';

//Cache object to store API responses
const cache = {};

const getCacheKey = (url, params) => {
	if (!params) return url;
	return `${url}:${JSON.stringify(params)}`;
};

const setCache = (key, data, ttl = 300000) => {
	cache[key] = {
		data,
		expiry: Date.now() + ttl,
	};
};

const getCache = (key) => {
	const cacheData = cache[key];
	if (!cacheData) return null;
	if (cacheData.expiry < Date.now()) {
		delete cache[key];
		return null;
	}
	return cacheData.data;
};

// function to make post call
export const postCall = async (postData = {}) => {
	let url = '';
	let bodyData = {};

	if (postData.fullUrl) {
		url = postData.fullUrl;
	}

	if (postData.url) {
		url += urlConfig[postData.url];
	}

	if (postData.bodyData) {
		bodyData = postData.bodyData;
	}

	if (postData.urlParams && Object.entries(postData.urlParams).length) {
		for (const [key, value] of Object.entries(postData.urlParams)) {
			if (key) {
				if (url.indexOf('?') >= 0) {
					url += `&${key}=${value}`;
				} else {
					url += `?${key}=${value}`;
				}
			}
		}
	}

	const response = await api.request({
		method: 'POST',
		url: url,
		data: bodyData,
		signal: postData.cancel ? cancelApiObject[postData.url].handleRequestCancellation().signal : undefined,
	});

	return response.data;
};

// function to make get call
export const getCall = async (getData = {},isCache=true) => {
	let url = '';

	if (getData.fullUrl) {
		url = getData.fullUrl;
	}

	if (getData.url) {
		url += urlConfig[getData.url];
	}

	if (getData.urlParams && Object.entries(getData.urlParams).length) {
		for (const [key, value] of Object.entries(getData.urlParams)) {
			if (key) {
				if (url.indexOf('?') >= 0) {
					url += `&${key}=${value}`;
				} else {
					url += `?${key}=${value}`;
				}
			}
		}
	}

	//Check if the response is already cached
	const cacheKey = isCache && getCacheKey(url, getData.urlParams);
	const cachedResponse = isCache && getCache(cacheKey);
	if (cachedResponse && isCache) return cachedResponse;

	const response = await api.request({
		method: 'GET',
		url: url,
		signal: getData.cancel ? cancelApiObject[getData.url].handleRequestCancellation().signal : undefined,
	});

	// Cache the response
	setCache(cacheKey, response.data, 3600000);

	return response.data;
};

// function to make put call
export const putCall = async (putData = {}) => {
	let url = '';
	let bodyData = {};

	if (putData.fullUrl) {
		url = putData.fullUrl;
	}

	if (putData.url) {
		url += urlConfig[putData.url];
	}

	if (putData.bodyData) {
		bodyData = putData.bodyData;
	}

	if (putData.urlParams && Object.entries(putData.urlParams).length) {
		for (const [key, value] of Object.entries(putData.urlParams)) {
			if (key) {
				if (url.indexOf('?') >= 0) {
					url += `&${key}=${value}`;
				} else {
					url += `?${key}=${value}`;
				}
			}
		}
	}

	const response = await api.request({
		method: 'PUT',
		url: url,
		data: bodyData,
		signal: putData.cancel ? cancelApiObject[putData.url].handleRequestCancellation().signal : undefined,
	});

	return response.data;
};

// function to make delete call
export const deleteCall = async (deleteData = {}) => {
	let url = '';

	if (deleteData.fullUrl) {
		url = deleteData.fullUrl;
	}

	if (deleteData.url) {
		url += urlConfig[deleteData.url];
	}

	if (deleteData.urlParams && Object.entries(deleteData.urlParams).length) {
		for (const [key, value] of Object.entries(deleteData.urlParams)) {
			if (key) {
				if (url.indexOf('?') >= 0) {
					url += `&${key}=${value}`;
				} else {
					url += `?${key}=${value}`;
				}
			}
		}
	}

	const response = await api.request({
		method: 'DELETE',
		url: url,
		signal: deleteData.cancel ? cancelApiObject[deleteData.url].handleRequestCancellation().signal : undefined,
	});

	return response.data;
};

// function to cancel API calls
const cancelApiObject = defineCancelApiObject({ postCall, getCall, putCall, deleteCall });
