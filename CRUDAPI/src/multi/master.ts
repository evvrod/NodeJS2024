import cluster from 'cluster';
import os from 'os';
import { createLoadBalancer } from './loadBalancer';
import { createServer } from './workerServer';

const numWorkers = os.cpus().length - 1; // Количество доступных воркеров

if (cluster.isPrimary) {
  console.log(`Master process started. PID: ${process.pid}`);

  // Запуск балансировщика нагрузки
  createLoadBalancer(4000, numWorkers);

  // Создание worker процессов
  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();
    console.log(`Worker ${worker.process.pid} created`);
  }

  // Прослушивание событий выхода воркеров и замена упавших воркеров
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited`);
    console.log(`Starting a new worker...`);
    cluster.fork(); // Запуск нового воркера
  });
} else {
  // Код для воркера
  const port = 4000 + cluster.worker.id;
  createServer(port);
}
