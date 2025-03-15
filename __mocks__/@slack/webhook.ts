export const IncomingWebhook = jest.fn().mockImplementation(() => {
    return {
      send: jest.fn().mockResolvedValue({}),
    };
  });