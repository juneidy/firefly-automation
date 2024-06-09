import Config from 'config';
import {
	listLinksByJournal,
	getTransactionByJournal,
	updateTransaction,
} from '../firefly-api.js';
import { WebhookHandler } from './handler.js';

const path = '/webhook/update-hsbc-withdrawal';

const config = Config.get(path.split('/').slice(1).join('.'));

const hsbcId = Config.get('hsbcId');
const cashbackCategoryId = Config.get('cashbackCategoryId');

export class UpdateHSBCWithdrawalWebhook extends WebhookHandler {
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

				const links = await listLinksByJournal(transaction.transaction_journal_id);

				for (const { attributes } of links.data) {
					if (
						attributes.link_type_id == '4'
						&& attributes.outward_id == transaction.transaction_journal_id
					) {
						const cashbackTx = await getTransactionByJournal(attributes.inward_id);
						const { transactions } = cashbackTx.data.attributes;
						if (
							transactions.length === 1
							&& transactions[0].category_id == cashbackCategoryId
						) {
							transactions[0].amount = cashback;

							await updateTransaction(
								cashbackTx.data.id,
								{
									error_if_duplicate_hash: false,
									apply_rules: false,
									fire_webhooks: false,
									transactions,
								}
							);
						}
					}
				}
			}
		}
	}
}

export default new UpdateHSBCWithdrawalWebhook();
