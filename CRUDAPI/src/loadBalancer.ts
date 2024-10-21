import http from 'node:http';

export function createLoadBalancer(port: number, numCPUs: number) {
  let currentWorker = 1;

  const loadBalancer = http.createServer((req, res) => {
    const workerPort = port + currentWorker;
    console.log(workerPort);
    const options = {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxy = http.request(options, (workerRes) => {
      res.writeHead(workerRes.statusCode!, workerRes.headers);
      workerRes.pipe(res, { end: true });
    });

    req.pipe(proxy, { end: true });

    currentWorker = currentWorker === numCPUs - 1 ? 1 : currentWorker + 1;
  });

  loadBalancer.listen(port, () => {
    console.log(`Load balancer listening on port ${port}`);
  });

  return loadBalancer;
}
