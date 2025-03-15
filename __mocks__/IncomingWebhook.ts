// __mocks__/IncomingWebhook.ts
export class IncomingWebhook {
  constructor(private url: string) {}
  send = jest.fn().mockResolvedValue(undefined);
}
