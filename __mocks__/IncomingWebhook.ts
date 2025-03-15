class IncomingWebhook {
  constructor(private url: string) {}
  send = jest.fn().mockResolvedValue(undefined);
}

module.exports = IncomingWebhook;