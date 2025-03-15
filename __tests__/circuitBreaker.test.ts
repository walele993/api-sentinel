import { mockFire } from '../__mocks__/opossum';
import { APISentinel, initAPISentinel } from '../src';

jest.mock('opossum', () => {
  const mockFire = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      fire: mockFire,
      fallback: jest.fn(),
      on: jest.fn(),
    })),
    mockFire,
  };
});

describe('APISentinel - Circuit Breaker', () => {
  let apiSentinel: APISentinel;

  beforeEach(() => {
    apiSentinel = initAPISentinel({
      endpoints: [{ url: '/api/unstable' }],
      circuitBreaker: { threshold: 50 },
    });
  });

  it('dovrebbe attivare il Circuit Breaker dopo ripetuti fallimenti', async () => {
    mockFire.mockRejectedValue(new Error('Failed'));

    // Simula 10 richieste fallite
    for (let i = 0; i < 10; i++) {
      try {
        await apiSentinel.wrappedFetch('/api/unstable');
      } catch (error) {
        // Ignora l'errore per continuare il loop
      }
    }

    expect(mockFire).toHaveBeenCalledTimes(10);
  });
});
