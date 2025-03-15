import { APISentinel, initAPISentinel } from './index';
import axios from 'axios';

jest.mock('axios');

describe('APISentinel con axios', () => {
  let apiSentinel: APISentinel;

  beforeEach(() => {
    apiSentinel = initAPISentinel({
      endpoints: [{ url: '/test', thresholds: { errorRate: 5, latency: 100 } }],
    });
  });

  it('dovrebbe gestire una risposta di successo', async () => {
    const mockResponse = { data: 'Successo' };
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const response = await apiSentinel.wrappedFetch('/test');
    expect(response.data).toBe('Successo');
    expect(axios.get).toHaveBeenCalledWith('/test');
  });

  it('dovrebbe gestire un errore nella risposta', async () => {
    const mockError = new Error('Errore di rete');
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(apiSentinel.wrappedFetch('/test')).rejects.toThrow('Errore di rete');
    expect(axios.get).toHaveBeenCalledWith('/test');
  });
});
