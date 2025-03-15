// __mocks__/fetch.ts
export default jest.fn().mockResolvedValue({
    status: 200,
    json: jest.fn().mockResolvedValue({}),
  });
  