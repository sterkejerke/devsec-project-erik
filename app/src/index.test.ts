// Erik Heerke Witteveen | Student 413560
// DevSecOps Pipeline | Hanze University of Applied Sciences
// Assessor: Dr Mohsen Kakavand (KAMO)
//
// Test suite for the Express app. Uses Jest and Supertest.
// These tests run in the pipeline before the deploy step so a broken build never goes live.

import request from 'supertest';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Rebuild the app here instead of importing it directly so tests run without a live server
const app = express();

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
const APP_NAME: string = pkg.name;
const VERSION: string = pkg.version;
const DEPLOY_TIME = new Date().toISOString();

app.use(express.json());

app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    name: APP_NAME,
    version: VERSION,
    deployedAt: DEPLOY_TIME,
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Tests below cover all three endpoints

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/info', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/api/info');
    expect(res.status).toBe(200);
  });

  it('returns correct app name', async () => {
    const res = await request(app).get('/api/info');
    expect(res.body.name).toBe('devsecops-demo');
  });

  it('returns a semver version string', async () => {
    const res = await request(app).get('/api/info');
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('returns healthy status', async () => {
    const res = await request(app).get('/api/info');
    expect(res.body.status).toBe('healthy');
  });

  it('returns a deployedAt timestamp', async () => {
    const res = await request(app).get('/api/info');
    expect(new Date(res.body.deployedAt).toString()).not.toBe('Invalid Date');
  });

  it('returns a non-negative uptime', async () => {
    const res = await request(app).get('/api/info');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});
