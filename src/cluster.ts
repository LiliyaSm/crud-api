import { cpus, EOL } from "os";
import cluster from "cluster";
import { createServer } from "http";
import { handler } from "./basicOperationalError";

const numberOfCores = cpus().length;
const PORT = 4000;

if (cluster.isPrimary) {
  for (let i = 0; i < numberOfCores; i += 1) {
    cluster.fork({ PORT: PORT + i + 1 });
  }
} else {
  createServer(handler).listen(PORT, () => {
    const message = `http://localhost:${PORT}${EOL}`;
    process.stdout.write(message);
  });
}
