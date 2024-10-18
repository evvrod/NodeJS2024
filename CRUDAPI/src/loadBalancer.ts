import http from 'node:http';
import cluster from 'node:cluster';

export function createLoadBalancer(port: number, numWorkers: number): void {
  const loadBalancer = http.createServer((req, res) => {
    const workerId = (cluster.worker?.id || 0) % numWorkers;
    const workerPort = 4000 + workerId;
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode!, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
  });

  loadBalancer.listen(port, () => {
    console.log(
      `Балансировщик нагрузки запущен на http://localhost:${port}/api`,
    );
  });
}
