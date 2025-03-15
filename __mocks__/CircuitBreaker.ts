// __mocks__/CircuitBreaker.ts
export default jest.fn().mockImplementation(() => ({
    fire: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  }));
  