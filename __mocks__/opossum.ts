// __mocks__/opossum.ts
const mockFire = jest.fn();

const CircuitBreaker = jest.fn().mockImplementation(() => ({
  fire: mockFire,
  fallback: jest.fn(),
  on: jest.fn(),
}));

export default CircuitBreaker; // Esporta il mock di CircuitBreaker
export { mockFire }; // Esporta mockFire per usarlo nei test