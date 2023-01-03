import dotenv from "dotenv";
import InMemoryDatabase from "./inMemoryDatabase";
import http from "http";
const db = new InMemoryDatabase();

dotenv.config();
const port = process.env["PORT"];
const server = http.createServer(function (request, response) {
  if (request.url === "/api/users") {
    if (request.method === "POST") {
      let body: string = "";
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", function () {
        try {
          const post = JSON.parse(body);
          const newUser = db.set(post);
          console.log(JSON.stringify(newUser));
          response.writeHead(201, { "Content-Type": "application/json" });
          response.end(JSON.stringify(newUser));
          return;
        } catch (err) {
          response.writeHead(500, { "Content-Type": "application/json" });
          response.write("Bad Post Data.  Is your data a proper JSON?\n");
          response.end();
          return;
        }
      });
    } else if (request.method === "GET") {
      const allRecords = db.getAllRecords();
      response.writeHead(200, { "Content-Type": "application/json" });
      console.log(allRecords);
      response.end(JSON.stringify(allRecords));
    }
  } else response.end("Invalid Request!");
});

server.listen(port);

console.log(`Server is running at port ${port}`);
