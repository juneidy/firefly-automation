import Config from 'config';

const config = Config.get('fireflyApi');

const mime = 'application/json';

const headers = {
	Authorization: `Bearer ${config.token}`,
	'content-type': mime,
	accept: mime,
};

export const storeTransactionLink = async (body) => {
	const res = await fetch(
		`${config.url}/transaction-links`,
		{
			method: 'post',
			headers,
			body: JSON.stringify(body)
		}
	);
	return res.json();
};

export const listLinksByJournal = async (journalId) => {
	const res = await fetch(
		`${config.url}/transaction-journals/${journalId}/links`,
		{
			headers,
		}
	);
	return res.json();
};

export const getTransactionByJournal = async (journalId) => {
	const res = await fetch(
		`${config.url}/transaction-journals/${journalId}`,
		{
			headers,
		}
	);
	return res.json();
};

export const storeTransaction = async (body) => {
	const res = await fetch(
		`${config.url}/transactions`,
		{
			method: 'post',
			headers,
			body: JSON.stringify(body)
		}
	);
	return res.json();
};

export const updateTransaction = async (transactionId, body) => {
	await fetch(
		`${config.url}/transactions/${transactionId}`,
		{
			method: 'put',
			headers,
			body: JSON.stringify(body),
		}
	);
};
