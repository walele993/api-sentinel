// __mocks__/axios.ts
export default {
    get: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    post: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  };
  