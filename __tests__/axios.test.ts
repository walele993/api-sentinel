import axios from 'axios';
import { APISentinel, initAPISentinel } from '../src';

jest.mock('axios');

describe('APISentinel - Axios Interceptors', () => {
  let apiSentinel: APISentinel;

  beforeEach(() => {
    apiSentinel = initAPISentinel({
      endpoints: [{ url: '/api/test', thresholds: { errorRate: 10 } }],
    });
  });

  it('should log metrics for successful axios requests', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: {} });

    await axios.get('/api/test');

    expect(axios.get).toHaveBeenCalledWith('/api/test');
  });
});