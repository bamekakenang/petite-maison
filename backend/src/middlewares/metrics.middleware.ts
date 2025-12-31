import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// In-memory metrics storage (in production, use Redis or a proper metrics service)
export const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [] as number[],
  requestsByEndpoint: new Map<string, number>(),
  errorsByType: new Map<number, number>(),
};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Increment total requests
  metrics.totalRequests++;

  // Track requests by endpoint
  const endpoint = `${req.method} ${req.path}`;
  metrics.requestsByEndpoint.set(
    endpoint,
    (metrics.requestsByEndpoint.get(endpoint) || 0) + 1
  );

  // Capture response
  const originalSend = res.send;
  res.send = function (data): Response {
    const responseTime = Date.now() - startTime;
    
    // Store response time
    metrics.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times to avoid memory leak
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }

    // Track success/failure
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      metrics.errorsByType.set(
        res.statusCode,
        (metrics.errorsByType.get(res.statusCode) || 0) + 1
      );
    }

    // Log slow requests (> 1000ms)
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
      });
    }

    logger.debug('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });

    return originalSend.call(this, data);
  };

  next();
};

export const getMetrics = () => {
  const avgResponseTime =
    metrics.responseTimes.length > 0
      ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
      : 0;

  return {
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    averageResponseTime: Math.round(avgResponseTime),
    requestsByEndpoint: Object.fromEntries(metrics.requestsByEndpoint),
    errorsByType: Object.fromEntries(metrics.errorsByType),
  };
};

export const resetMetrics = (): void => {
  metrics.totalRequests = 0;
  metrics.successfulRequests = 0;
  metrics.failedRequests = 0;
  metrics.responseTimes = [];
  metrics.requestsByEndpoint.clear();
  metrics.errorsByType.clear();
};
