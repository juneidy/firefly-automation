import crypto from 'crypto';

export class WebhookHandler {
	expectedSignatureVersion = 'v1=';

	// Initialised by the implementation
	secret; 
	path;

	checkSignature(req) {
		const signature = req.header('signature');
		if (!signature) return false;

		const [t, v] = signature.split(',');

		const timestamp = t.startsWith('t=') ? t.slice(2) : void 0;
		const signatureHash = v.startsWith(this.expectedSignatureVersion)
			? v.slice(this.expectedSignatureVersion.length)
			: void 0

		if (!timestamp || !signatureHash) return false;

		const payload = `${timestamp}.${req.body}`;

		const calculated = crypto.createHmac('sha3-256', this.secret)
			.update(payload)
			.digest('hex');

		return calculated == signatureHash;
	}

	async handle (req, res) {
		const valid = this.checkSignature(req);
		if (!valid) return res.sendStatus(400);

		req.body = JSON.parse(req.body);
		await this.execute(req);
		return res.sendStatus(200);
	}
}
