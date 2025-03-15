// __tests__/fetch.test.ts
import { APISentinel, initAPISentinel } from '../src';
import fetch from 'node-fetch';

jest.mock('node-fetch');

describe('APISentinel - Fetch Wrapper', () => {
  let apiSentinel: APISentinel;

  beforeEach(() => {
    apiSentinel = initAPISentinel({
      endpoints: [{ url: '/api/data' }],
    });
  });

  it('should handle JSON responses correctly', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const response = await apiSentinel.wrappedFetch('/api/data');
    const data = await response.json();
    expect(data).toEqual({ data: 'test' });
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

    await expect(apiSentinel.wrappedFetch('/api/data')).rejects.toThrow(
      'Network Error'
    );
  });
});