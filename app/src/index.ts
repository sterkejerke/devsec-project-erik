// Erik Heerke Witteveen | Student 413560
// DevSecOps Pipeline | Hanze University of Applied Sciences
// Assessor: Dr Mohsen Kakavand (KAMO)
//
// Main app file. Express server running on port 3000 inside the container.
// Gets built by the pipeline and deployed automatically on every push to main.

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Pull name and version from package.json so the dashboard always shows the right info
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
const APP_NAME: string = pkg.name;
const VERSION: string = pkg.version;
const DEPLOY_TIME = new Date().toISOString();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Returns app info as JSON, the frontend dashboard calls this to show version and uptime
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    name: APP_NAME,
    version: VERSION,
    deployedAt: DEPLOY_TIME,
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
  });
});

// Simple health check, Docker polls this to know if the container is still alive
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${APP_NAME}] v${VERSION} listening on port ${PORT}`);
  console.log(`[${APP_NAME}] Deployed at: ${DEPLOY_TIME}`);
});
