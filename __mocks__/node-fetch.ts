module.exports = jest.fn().mockImplementation((url, init) => ({
  status: 200,
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
}));