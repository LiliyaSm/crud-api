import { cpus } from "os";
import cluster from "cluster";
import { createServer } from "http";
import { workerHandler, loadBalancerHandler, dbHandler } from "./handlers";

const numberOfCores = cpus().length;
const PORT = 4000;
export const DATABASE_PORT = PORT + 1 + numberOfCores;

if (cluster.isPrimary) {
  for (let i = 0; i < numberOfCores; i += 1) {
    const workerPort = PORT + i + 1;
    cluster.fork({ port: workerPort, role: "worker" });
  }
  createServer(loadBalancerHandler).listen(PORT, () => {
    console.log(`load balancer on http://localhost:${PORT}`);
  });
  cluster.fork({ port: DATABASE_PORT, role: "db" });
} else {
  if (process.env.role === "worker") {
    createServer(workerHandler).listen(process.env.port, () => {
      console.log(`worker on http://localhost:${process.env.port}`);
    });
  } else {
    createServer(dbHandler).listen(process.env.port, () => {
      console.log(`dataBase on http://localhost:${process.env.port}`);
    });
  }
}
