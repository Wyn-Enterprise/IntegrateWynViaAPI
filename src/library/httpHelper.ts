const makeRequestInit: RequestInit ={
	headers: {
		Accept: 'application/json',
		'content-type': 'application/json',
	},
	credentials: 'include',
};

const getErrorMessage = (response: any) => response.json().then((error: any) => {
	return {
		requestError: error || '',
		status: response.status
	}
});

const getJson = async (url: string) => 
	fetch(url, makeRequestInit).then(async (response) => await response.json()).catch(r => getErrorMessage(r));

const postJson = async (url: string, data: any = null) =>
	fetch(url, {
		...makeRequestInit,
		method: 'post',
		body: JSON.stringify(data),
	}).then(async (response) => await response.json()).catch(r => getErrorMessage(r));

export default {
	getJson,
	postJson
};
