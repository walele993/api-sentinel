const axios = {
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  get: jest.fn(() => Promise.resolve({
    config: { url: 'https://api.example.com/data', method: 'GET' },
    status: 200,
  })),
  post: jest.fn(),
};

export default axios;
