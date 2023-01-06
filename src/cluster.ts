import { cpus, EOL } from "os";
import cluster from "cluster";
import { createServer } from "http";
import { handler, loadBalancerHandler } from "./handlers";

const numberOfCores = cpus().length;
const PORT = 4000;

if (cluster.isPrimary) {
  for (let i = 0; i < numberOfCores; i += 1) {
    const workerPort = PORT + i + 1;
    const worker = cluster.fork({ port: workerPort, role: "worker" });
    // worker.on('message', function(msg) {
    //     // we only want to intercept messages that have a chat property
    //     if (msg.chat) {
    //       console.log('Worker to master: ', msg.chat);
    //       worker.send({ chat: 'Ok worker, Master got the message! Over and out!' });
    //     }
    //   });
  }
  //lb
  createServer(loadBalancerHandler).listen(PORT, () => {
    const message = `load balancer on http://localhost:${PORT}${EOL}`;
    process.stdout.write(message);
  });
  cluster.fork({ port: PORT + 1 + numberOfCores, role: "db" });
} else {
  //   let PORT: number;
  //   if (process.env.port) {
  //     PORT = parseInt(process.env.port);
  //   }
  //   process.on("message", function (msg) {
  //     // workerPort = msg.workerPort;
  //     console.log(msg);
  //   });
  if (process.env.role === "worker") {
    createServer(handler).listen(process.env.port, () => {
      const message = `worker on http://localhost:${process.env.port}${EOL}`;
      process.stdout.write(message);
    });
  } else {
    createServer(handler).listen(process.env.port, () => {
      const message = `db on http://localhost:${process.env.port}${EOL}`;
      process.stdout.write(message);
    });
  }
}
