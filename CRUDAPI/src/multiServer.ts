import cluster from 'node:cluster';
import os from 'node:os';

import { createLoadBalancer } from './loadBalancer';
import createServer from './server';

const numCPUs = os.cpus().length;
const PORT = 4000;

try {
  if (cluster.isPrimary) {
    console.log(`Master process started. PID: ${process.pid} on port: ${PORT}`);

    for (let i = 1; i < numCPUs; i++) {
      cluster.fork({ WORKER_PORT: PORT + i });
    }

    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died, creating a new one...`);
      const workerEnv = worker.process as unknown as { env: NodeJS.ProcessEnv };
      const workerPort = workerEnv.env.WORKER_PORT;
      cluster.fork({ WORKER_PORT: workerPort });
    });

    let workerCount = 0;
    cluster.on('listening', () => {
      workerCount++;
      if (workerCount === numCPUs - 1) {
        console.log(
          'All servers are up and running. Load balancer starting...',
        );
        createLoadBalancer(PORT, numCPUs);
      }
    });
  } else {
    const workerPort = process.env.WORKER_PORT;
    if (!workerPort) {
      throw new Error('WORKER_PORT is not defined');
    }
    createServer(parseInt(workerPort));
  }
} catch (error) {
  console.log(`Error: ${error}`);
}
