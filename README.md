# 🛡️ Blue Watchdog 

*Robust API monitoring and circuit breaker for Node.js, with real-time alerts and analytics*  

---

## 🚀 Introduction  

**Blue Watchdog** is a powerful monitoring tool designed to protect your Node.js applications from unreliable API dependencies. It tracks endpoints for **error rates** and **latency**, automatically triggers **circuit breakers**, and sends alerts to Slack when thresholds are breached. Ideal for microservices and distributed systems.  

### Key Features:  
- 📊 **Real-time Metrics**: Track error rates & response times for critical endpoints  
- ⚡ **Circuit Breaking**: Automatically block failing endpoints to prevent cascading failures  
- 🚨 **Slack Alerts**: Get notified instantly when thresholds are exceeded  
- 🔌 **Universal Support**: Works with Axios, fetch, and any HTTP client  
- 🛠️ **Custom Thresholds**: Define per-endpoint error/latency limits  
- 📈 **Smart Analytics**: Rolling 5-minute window for accurate health checks  

---

## 📦 Installation  

```bash
npm install blue-watchdog
```

---

## 🛠️ Configuration  

Create a sentinel instance with your monitoring rules:  

```typescript
import { initAPISentinel } from 'api-sentinel';

const sentinel = initAPISentinel({
  endpoints: [
    {
      url: '/api/payments',  // String or RegExp
      thresholds: {
        errorRate: 10,    // Max 10% errors (optional)
        latency: 1000     // Max 1s response time (optional)
      }
    }
  ],
  alert: {
    slackWebhook: 'https://hooks.slack.com/services/...'  // Optional
  },
  circuitBreaker: {
    threshold: 50,  // 50% errors to open circuit (default)
    cooldown: 30000 // 30s cooldown (default)
  }
});
```

---

## 💻 Usage  

### Axios (Automatic Monitoring)  
```typescript
import axios from 'axios';

// All Axios requests are automatically instrumented!
axios.get('/api/payments');
```

### Fetch Wrapper  
```typescript
// Replace native fetch with monitored version
const response = await sentinel.wrappedFetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ user: 'new' })
});
```

### Manual Request Handling  
```typescript
// Use the circuit breaker directly
const result = await sentinel.handleRequest('/api/orders', async () => {
  return await makeOrderRequest();
});
```

---

## 🔧 How It Works  

1. **Metrics Collection**:  
   - Tracks all HTTP requests (success/failure)  
   - Records response times and status codes  
   - Maintains 5-minute rolling window  

2. **Circuit Breaking**:  
   - Opens circuit when error threshold exceeded  
   - Blocks requests during cooldown period  
   - Automatically retries after recovery  

3. **Alerting**:  
   - Throttled Slack notifications  
   - Instant visibility into degraded endpoints  

---

## ⚙️ Configuration Details  

### `EndpointConfig`  
| Property     | Type           | Description                          |
|--------------|----------------|--------------------------------------|
| `url`        | string/RegExp  | Endpoint to monitor (exact or regex) |
| `thresholds` | object         | Error/latency limits (optional)      |

### `thresholds`  
| Property     | Type    | Default | Description                     |
|--------------|---------|---------|---------------------------------|
| `errorRate`  | number  | -       | Maximum allowed error % (0-100) |
| `latency`    | number  | -       | Maximum avg response time (ms)  |

### `circuitBreaker`  
| Property    | Type    | Default | Description                     |
|-------------|---------|---------|---------------------------------|
| `threshold` | number  | 50      | Error % to trigger circuit open |
| `cooldown`  | number  | 10000   | Cooldown duration in ms         |

---

## 📈 Analytics  

Blue Watchdog continuously analyzes:  
- **Error Rate**: `(errors / total_requests) * 100`  
- **Latency**: Rolling average of response times  
- **Circuit State**: Tracks open/closed/half-open status  

Metrics are checked every 60 seconds against your thresholds.  

---

## 🔌 Supported Libraries  

| Library      | Support          | Notes                          |
|--------------|------------------|--------------------------------|
| **Axios**    | ✅ Automatic     | Uses interceptors              |
| **fetch**    | ✅ Wrapper       | Use `wrappedFetch` method      |
| **HTTP**     | 🔜 Coming Soon   |                                |
| **Express**  | 🔜 Coming Soon   | Middleware support             |

---

## 🛡️ Requirements  

- Node.js `>=16.0`  
- TypeScript `>=4.0` (recommended)  

---

## 🤝 Contributing  

Contributions welcome!  

1. **Fork** the repository  
2. **Clone** your fork:  
   ```bash
   git clone https://github.com/yourusername/api-sentinel.git  
   ```  
3. Create a **feature branch**:  
   ```bash
   git checkout -b feature-enhancement  
   ```  
4. Commit changes and **push**  
5. Open a **pull request**  

---

## 📄 License  

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.  

---

## 🌟 Credits  

This project was created by Gabriele Meucci.

---

*Keep your APIs healthy and your systems resilient! 🛡️*
