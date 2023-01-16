import dotenv from "dotenv";
import http from "http";
import { handler } from "./handlers";

dotenv.config();
const port = process.env["PORT"];

const server = http.createServer(handler);

server.listen(port);
console.log(`Server is running at port ${port}`);
