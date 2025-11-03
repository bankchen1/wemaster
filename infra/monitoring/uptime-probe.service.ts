import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UptimeProbeService implements OnModuleInit, OnModuleDestroy {
  private readonly logDir = 'logs/uptime';
  private readonly probeResults: Map<string, ProbeResult[]> = new Map();
  private isRunning = false;

  onModuleInit() {
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    console.log('Uptime Probe Service initialized');
  }

  onModuleDestroy() {
    this.saveProbeResults();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async runUptimeProbes() {
    if (this.isRunning) {
      console.log('Uptime probe already running, skipping this cycle');
      return;
    }

    this.isRunning = true;
    console.log(`Running uptime probes at ${new Date().toISOString()}`);

    const probes = [
      {
        name: 'api-health',
        url: process.env.API_BASE_URL || 'http://localhost:3001/healthz',
        method: 'GET',
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        name: 'api-docs',
        url: process.env.API_BASE_URL + '/docs' || 'http://localhost:3001/docs',
        method: 'GET',
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        name: 'admin-dashboard',
        url: process.env.ADMIN_BASE_URL || 'http://localhost:5173',
        method: 'GET',
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        name: 'database-connection',
        url: process.env.API_BASE_URL + '/health/db' || 'http://localhost:3001/health/db',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000,
      },
      {
        name: 'redis-connection',
        url: process.env.API_BASE_URL + '/health/redis' || 'http://localhost:3001/health/redis',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000,
      },
    ];

    const results = await Promise.allSettled(
      probes.map(probe => this.executeProbe(probe))
    );

    this.logProbeResults(results);
    this.saveProbeResults();
    this.isRunning = false;
  }

  private async executeProbe(probe: ProbeConfig): Promise<ProbeResult> {
    const startTime = Date.now();
    
    try {
      const response: AxiosResponse = await axios({
        method: probe.method,
        url: probe.url,
        timeout: probe.timeout,
        validateStatus: () => true, // Don't throw on any status code
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        name: probe.name,
        url: probe.url,
        status: response.status === probe.expectedStatus ? 'UP' : 'DOWN',
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        error: response.status !== probe.expectedStatus 
          ? `Expected status ${probe.expectedStatus}, got ${response.status}`
          : undefined,
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        name: probe.name,
        url: probe.url,
        status: 'DOWN',
        responseTime,
        statusCode: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private logProbeResults(results: PromiseSettledResult<ProbeResult>[]) {
    const timestamp = new Date().toISOString();
    const logFile = path.join(this.logDir, `uptime-${timestamp.split('T')[0]}.log`);
    
    let logContent = `\n=== Uptime Probe Results - ${timestamp} ===\n`;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const probeResult = result.value;
        logContent += `[${probeResult.status}] ${probeResult.name}: ${probeResult.responseTime}ms (${probeResult.statusCode})`;
        
        if (probeResult.error) {
          logContent += ` - ERROR: ${probeResult.error}`;
        }
        
        logContent += '\n';
        
        // 存储到内存中用于后续分析
        if (!this.probeResults.has(probeResult.name)) {
          this.probeResults.set(probeResult.name, []);
        }
        this.probeResults.get(probeResult.name)!.push(probeResult);
        
        // 保持最近1000条记录
        const probeHistory = this.probeResults.get(probeResult.name)!;
        if (probeHistory.length > 1000) {
          probeHistory.shift();
        }
      } else {
        logContent += `[ERROR] Probe ${index} failed: ${result.reason}\n`;
      }
    });

    fs.appendFileSync(logFile, logContent);
    console.log('Uptime probe results logged');
  }

  private saveProbeResults() {
    const timestamp = new Date().toISOString();
    const resultsFile = path.join(this.logDir, 'probe-results.json');
    
    const results: Record<string, ProbeResult[]> = {};
    this.probeResults.forEach((value, key) => {
      results[key] = value;
    });

    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp,
      results,
    }, null, 2));
  }

  getProbeStatus(probeName: string): ProbeStatus {
    const history = this.probeResults.get(probeName) || [];
    if (history.length === 0) {
      return { status: 'UNKNOWN', uptime: 0, avgResponseTime: 0 };
    }

    const recentResults = history.slice(-10); // 最近10次检查
    const upCount = recentResults.filter(r => r.status === 'UP').length;
    const uptime = (upCount / recentResults.length) * 100;
    const avgResponseTime = recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length;
    const currentStatus = recentResults[recentResults.length - 1]?.status || 'UNKNOWN';

    return {
      status: currentStatus,
      uptime,
      avgResponseTime,
    };
  }

  getAllProbeStatuses(): Record<string, ProbeStatus> {
    const statuses: Record<string, ProbeStatus> = {};
    this.probeResults.forEach((_, name) => {
      statuses[name] = this.getProbeStatus(name);
    });
    return statuses;
  }
}

interface ProbeConfig {
  name: string;
  url: string;
  method: string;
  expectedStatus: number;
  timeout: number;
}

interface ProbeResult {
  name: string;
  url: string;
  status: 'UP' | 'DOWN';
  responseTime: number;
  statusCode: number;
  timestamp: string;
  error?: string;
}

interface ProbeStatus {
  status: string;
  uptime: number;
  avgResponseTime: number;
}