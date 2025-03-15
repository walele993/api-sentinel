import axios, { isAxiosError } from 'axios';
import fetch from 'node-fetch';
import CircuitBreaker from 'opossum'; // Usa la sintassi di import per opossum
import { IncomingWebhook } from '@slack/webhook';
import { subMinutes } from 'date-fns';
import pkg from 'lodash';
const { throttle } = pkg;
// Logger con livelli configurabili
class Logger {
    static log(message) {
        if (process.env.LOG_LEVEL !== 'silent') {
            console.log(`[api-sentinel] ${message}`);
        }
    }
    static error(message) {
        console.error(`[api-sentinel] ERROR: ${message}`);
    }
}
// Implementazione principale
class APISentinel {
    config;
    metrics = new Map();
    circuitBreakers = new Map();
    slackWebhook;
    throttledSendAlert;
    constructor(config) {
        this.config = config;
        if (config.alert?.slackWebhook) {
            this.slackWebhook = new IncomingWebhook(config.alert.slackWebhook);
        }
        this.throttledSendAlert = throttle((message) => {
            if (this.slackWebhook) {
                this.slackWebhook.send({ text: `🚨 [api-sentinel] ${message}` }).catch(err => {
                    Logger.error(`Failed to send Slack alert: ${err.message}`);
                });
            }
        }, 5000);
        this.setupInterceptors();
        this.startAnalyticsLoop();
        Logger.log('API Sentinel initialized');
    }
    setupInterceptors() {
        // Intercetta TUTTE le richieste Axios
        axios.interceptors.request.use(config => {
            config._startTime = Date.now();
            return config;
        });
        axios.interceptors.response.use(response => {
            this.recordMetric(response.config.url, {
                url: response.config.url,
                method: response.config.method?.toUpperCase() || 'GET',
                status: response.status,
                responseTime: Date.now() - response.config._startTime,
            });
            return response;
        }, error => {
            if (isAxiosError(error) && error.config) {
                this.recordMetric(error.config.url, {
                    url: error.config.url,
                    method: error.config.method?.toUpperCase() || 'GET',
                    status: error.response?.status || 500,
                    responseTime: Date.now() - error.config._startTime,
                });
            }
            return Promise.reject(error);
        });
    }
    wrappedFetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        const start = Date.now();
        try {
            const response = await this.handleRequest(url, () => fetch(input, init));
            this.recordMetric(url, {
                url,
                method: init?.method?.toUpperCase() || 'GET',
                status: response.status,
                responseTime: Date.now() - start,
            });
            return response;
        }
        catch (error) {
            this.recordMetric(url, {
                url,
                method: init?.method?.toUpperCase() || 'GET',
                status: 500,
                responseTime: Date.now() - start,
            });
            throw error;
        }
    };
    // Modifica di 'handleRequest'
    async handleRequest(url, fn) {
        const circuit = this.getCircuitBreaker(url);
        return circuit.fire(fn); // Forza il tipo come Promise<T>
    }
    // Modifica di 'getCircuitBreaker'
    getCircuitBreaker(url) {
        const key = this.getEndpointKey(url);
        if (!this.circuitBreakers.has(key)) {
            const { threshold = 50, cooldown = 10000 } = this.config.circuitBreaker || {};
            // La funzione `fn` è di tipo `(fn: () => Promise<any>)` per generare una Promise di tipo T
            const breaker = new CircuitBreaker(async (fn) => await fn(), {
                errorThresholdPercentage: threshold,
                resetTimeout: cooldown,
            });
            this.circuitBreakers.set(key, breaker);
        }
        return this.circuitBreakers.get(key);
    }
    getEndpointKey(url) {
        const endpoint = this.config.endpoints.find(e => typeof e.url === 'string' ? url === e.url : e.url.test(url));
        return endpoint?.url.toString() || 'global';
    }
    recordMetric(url, metric) {
        const key = this.getEndpointKey(url);
        const metrics = this.metrics.get(key) || [];
        metrics.push({ ...metric, timestamp: new Date() });
        if (metrics.length > 1000)
            metrics.shift();
        this.metrics.set(key, metrics);
    }
    startAnalyticsLoop() {
        setInterval(() => this.analyzeMetrics(), 60_000);
    }
    analyzeMetrics() {
        this.config.endpoints.forEach(endpoint => {
            const key = endpoint.url.toString();
            const recentMetrics = (this.metrics.get(key) || []).filter(m => m.timestamp > subMinutes(new Date(), 5));
            if (recentMetrics.length === 0)
                return;
            const errorRate = (recentMetrics.filter(m => m.status >= 400).length / recentMetrics.length) * 100;
            const avgLatency = recentMetrics.reduce((acc, m) => acc + m.responseTime, 0) / recentMetrics.length;
            this.checkThresholds(endpoint, errorRate, avgLatency);
        });
    }
    checkThresholds(endpoint, errorRate, avgLatency) {
        const { errorRate: maxErrorRate, latency: maxLatency } = endpoint.thresholds || {};
        if (maxErrorRate && errorRate > maxErrorRate) {
            this.throttledSendAlert(`High error rate detected for ${endpoint.url}: ${errorRate}%`);
        }
        if (maxLatency && avgLatency > maxLatency) {
            this.throttledSendAlert(`High latency detected for ${endpoint.url}: ${avgLatency}ms`);
        }
    }
}
export function initAPISentinel(config) {
    return new APISentinel(config);
}
