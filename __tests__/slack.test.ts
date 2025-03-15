import { IncomingWebhook } from '@slack/webhook';
import fetch from 'node-fetch';
import { APISentinel, initAPISentinel } from '../src';

jest.mock('@slack/webhook');
jest.mock('node-fetch');

describe('APISentinel - Slack Alerts', () => {
  let apiSentinel: APISentinel;

  beforeEach(() => {
    apiSentinel = initAPISentinel({
      endpoints: [{ url: '/api/critical' }],
      alert: { slackWebhook: 'https://hooks.slack.com/test' },
    });
  });

  it('should send a Slack alert when thresholds are exceeded', async () => {
    // Simula 10 richieste fallite
    (fetch as jest.Mock).mockRejectedValue(new Error('Failed'));

    const mockSend = IncomingWebhook.prototype.send as jest.Mock;

    for (let i = 0; i < 10; i++) {
      try {
        await apiSentinel.wrappedFetch('/api/critical');
      } catch (error) {}
    }

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('threshold') })
    );
  });
});