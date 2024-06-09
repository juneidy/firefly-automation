import Config from 'config';
import { storeTransaction, storeTransactionLink } from '../firefly-api.js';
import { WebhookHandler } from './handler.js';

const path = '/webhook/create-hsbc-withdrawal';

const config = Config.get(path.split('/').slice(1).join('.'));

const hsbcId = Config.get('hsbcId');
const cashbackCategoryId = Config.get('cashbackCategoryId');

export class CreateHSBCWithdrawalWebhook extends WebhookHandler {
	path = path;
	secret = config.secret;

	async execute(req) {
		const { body } = req;
		for (const transaction of body.content.transactions) {
			if (
				transaction.type == 'withdrawal'
				&& transaction.source_id == hsbcId
			) {
				const amount = parseFloat(transaction.amount);
				const cashback = (amount * 0.02).toFixed(2);
				// Create cashback
				const cashbackTx = await storeTransaction({
					error_if_duplicate_hash: false,
					apply_rules: false,
					fire_webhooks: false,
					transactions: [{
						type: 'deposit',
						amount: cashback + '',
						date: transaction.date,
						description: '2% Cashback',
						category_id: cashbackCategoryId,
						destination_id: hsbcId + '',
					}],
				});

				// Link the transactions
				await storeTransactionLink({
					link_type_id: "4", // partially reimburses
					inward_id: cashbackTx.data.attributes.transactions[0].transaction_journal_id,
					outward_id: transaction.transaction_journal_id + '',
				});
			}
		}
	}
}

export default new CreateHSBCWithdrawalWebhook();
