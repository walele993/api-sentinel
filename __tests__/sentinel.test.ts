import axios from 'axios';
import fetch from 'node-fetch';
import { IncomingWebhook } from '@slack/webhook';
import { APISentinel, initAPISentinel } from '../src'; // Adjust the import path as needed
import { subMinutes } from 'date-fns';

jest.mock('axios');
jest.mock('node-fetch');
jest.mock('@slack/webhook');

describe('APISentinel', () => {
  let apiSentinel: APISentinel;
  const mockConfig = {
    endpoints: [
      {
        url: 'https://api.example.com/data',
        thresholds: {
          errorRate: 5,
          latency: 500,
        },
      },
    ],
    alert: {
      slackWebhook: 'https://hooks.slack.com/services/your/webhook/url',
    },
    circuitBreaker: {
      threshold: 50,
      cooldown: 10000,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers to control time-related functions
    apiSentinel = initAPISentinel(mockConfig);
  });

  afterEach(() => {
    jest.clearAllTimers(); // Clear all timers after each test
  });

  it('should initialize with the given configuration', () => {
    expect(apiSentinel).toBeInstanceOf(APISentinel);
  });

  it('should intercept Axios requests and responses', async () => {
    (axios.interceptors.request.use as jest.Mock).mockImplementationOnce((config) => {
      config._startTime = Date.now();
      return config;
    });

    (axios.interceptors.response.use as jest.Mock).mockImplementationOnce((response) => {
      // Ensure the response has the correct structure
      if (response.config && response.config.url) {
        apiSentinel['recordMetric'](response.config.url, {
          url: response.config.url,
          method: response.config.method?.toUpperCase() || 'GET',
          status: response.status,
          responseTime: Date.now() - (response.config as any)._startTime,
        });
      }
      return response;
    });

    // Mock the Axios response
    (axios.get as jest.Mock).mockResolvedValueOnce({
      config: { url: 'https://api.example.com/data', method: 'GET' },
      status: 200,
    });

    await axios.get('https://api.example.com/data');
    expect(axios.interceptors.request.use).toHaveBeenCalled();
    expect(axios.interceptors.response.use).toHaveBeenCalled();
  });

  it('should record metrics for Fetch requests', async () => {
    const mockResponse = { status: 200 };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await apiSentinel.wrappedFetch('https://api.example.com/data');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', undefined);
  });

  it('should send an alert if error rate threshold is exceeded', () => {
    const mockMetrics = [
      { url: 'https://api.example.com/data', method: 'GET', status: 500, responseTime: 200, timestamp: subMinutes(new Date(), 1) },
      { url: 'https://api.example.com/data', method: 'GET', status: 200, responseTime: 100, timestamp: subMinutes(new Date(), 1) },
    ];

    apiSentinel['metrics'].set('https://api.example.com/data', mockMetrics);

    // Spy on the original sendAlert method
    const sendAlertSpy = jest.spyOn(apiSentinel, 'throttledSendAlert' as any);

    apiSentinel['analyzeMetrics']();

    expect(IncomingWebhook).toHaveBeenCalled();
    expect(sendAlertSpy).toHaveBeenCalledWith(
      'High error rate detected for https://api.example.com/data: 50%'
    );

    // Clean up the spy
    sendAlertSpy.mockRestore();
  });

  it('should send an alert if latency threshold is exceeded', () => {
    const mockMetrics = [
      { url: 'https://api.example.com/data', method: 'GET', status: 200, responseTime: 600, timestamp: subMinutes(new Date(), 1) },
      { url: 'https://api.example.com/data', method: 'GET', status: 200, responseTime: 700, timestamp: subMinutes(new Date(), 1) },
    ];

    apiSentinel['metrics'].set('https://api.example.com/data', mockMetrics);

    // Spy on the original sendAlert method
    const sendAlertSpy = jest.spyOn(apiSentinel, 'throttledSendAlert' as any);

    apiSentinel['analyzeMetrics']();

    expect(IncomingWebhook).toHaveBeenCalled();
    expect(sendAlertSpy).toHaveBeenCalledWith(
      'High latency detected for https://api.example.com/data: 650ms'
    );

    // Clean up the spy
    sendAlertSpy.mockRestore();
  });
});
