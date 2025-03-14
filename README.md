# API Sentinel

A lightweight Node.js package for monitoring, analyzing, and alerting on API calls. API Sentinel intercepts HTTP requests made with Axios and Fetch, records detailed metrics, and uses a circuit breaker mechanism to help prevent cascading failures. It also supports automatic retries and Slack notifications when issues occur.

---

## Features

- **API Interception:**  
  Automatically intercepts API calls made via Axios and Fetch.

- **Metrics Collection:**  
  Records key metrics such as URL, HTTP method, status code, response time, and timestamp. Metrics are organized by endpoint.

- **Circuit Breaker:**  
  Uses the Opossum library to implement a circuit breaker, preventing the system from being overwhelmed by repeated failures.

- **Automatic Retries:**  
  Integrates with pRetry to automatically retry failed API calls up to a specified number of attempts.

- **Analytics and Alerts:**  
  Periodically analyzes collected metrics (error rates and average latency) and sends alerts via Slack if thresholds are exceeded.

- **Endpoint-Specific Monitoring:**  
  Supports configuration of multiple endpoints, each with its own monitoring thresholds and settings.

---

## Installation

Install API Sentinel via npm:

```bash
npm install api-sentinel
```

---

## Usage

Initialize API Sentinel in your application by passing a configuration object:

```javascript
import { initAPISentinel } from 'api-sentinel';

const config = {
  endpoints: [
    {
      url: /https:\/\/api\.example\.com\/.*/, // monitor endpoints matching this pattern
      thresholds: {
        errorRate: 5,   // Alert if error rate exceeds 5%
        latency: 300,   // Alert if average latency exceeds 300ms
      },
    },
  ],
  alert: {
    slackWebhook: 'https://hooks.slack.com/services/your/slack/webhook',
  },
  circuitBreaker: {
    threshold: 3,       // Circuit trips after 3 consecutive failures
    cooldown: 10000,    // Circuit breaker cooldown period in milliseconds (10 seconds)
  },
};

initAPISentinel(config);
```

With this configuration, API Sentinel intercepts requests made with Axios or Fetch, records their metrics, and triggers a Slack alert if the defined error rate or latency thresholds are exceeded.

---

## Configuration

### Endpoints

- **url:**  
  A string or RegExp that identifies the endpoint(s) to monitor.

- **thresholds:**  
  Optional thresholds for:
  - **errorRate:** Maximum acceptable error percentage.
  - **latency:** Maximum acceptable average response time in milliseconds.

### Alerts

- **slackWebhook:**  
  Provide your Slack webhook URL to enable alert notifications via Slack.

### Circuit Breaker

- **threshold:**  
  Number of consecutive failures before the circuit breaker trips.

- **cooldown:**  
  Duration (in milliseconds) the circuit breaker remains open before attempting to reset.

---

## Requirements

- **Node.js:** >= 16.0  
- **npm:** >= 7.0

---

## Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/yourusername/api-sentinel.git
   ```
3. **Create a new branch:**
   ```bash
   git checkout -b feature-your-feature
   ```
4. **Make your changes** and commit them.
5. **Push** your changes:
   ```bash
   git push origin feature-your-feature
   ```
6. **Submit a pull request.**

---

## License

This project is licensed under the MIT License.

---

## Credits

API Sentinel was created by Gabriele Meucci.  
For any questions or issues, please open an issue in the repository or contact the maintainer.
