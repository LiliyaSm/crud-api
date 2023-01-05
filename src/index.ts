import dotenv from "dotenv";
import InMemoryDatabase from "./inMemoryDatabase";
import { IncomingMessage, ServerResponse } from "http";
import http from "http";
import BasicOperationalError from "./basicOperationalError";
const db = new InMemoryDatabase();

const handleError = (error: Error, response: ServerResponse) => {
  if (error instanceof BasicOperationalError) {
    response.writeHead(error.statusCode, {
      "Content-Type": "application/json",
    });
    response.end(error.message);
  } else {
    console.log(error);

    response.writeHead(500, {
      "Content-Type": "application/json",
    });
    response.end(`Error on the server side`);
  }
};
dotenv.config();
const port = process.env["PORT"];
const server = http.createServer(function (
  request: IncomingMessage,
  response: ServerResponse
) {
  try {
    const { url: requestUrl = "", method } = request;
    const userId = requestUrl.split("/")[3];
    if (request.url === "/api/users" || request.url === "/api/users/") {
      if (method === "POST") {
        let body: string = "";
        request.on("data", (chunk) => {
          body += chunk;
        });
        request.on("end", function () {
          try {
            const post = JSON.parse(body);
            const newUser = db.set(post);
            response.writeHead(201, { "Content-Type": "application/json" });
            response.end(JSON.stringify(newUser));
            return;
          } catch (error) {
            handleError(error as Error, response);
          }
        });
      } else if (method === "GET") {
        const allRecords = db.getAllRecords();
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(allRecords));
      }
    } else if (method === "GET" && userId) {
      try {
        const user = db.get(userId);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(user));
      } catch (error) {
        handleError(error as Error, response);
      }
    } else if (method === "DELETE" && userId) {
      try {
        db.delete(userId);
        response.writeHead(204, { "Content-Type": "application/json" });
        response.end("deleted");
      } catch (error) {
        handleError(error as Error, response);
      }
    } else if (method === "PUT" && userId) {
      try {
        let body: string = "";
        request.on("data", (chunk) => {
          body += chunk;
        });
        request.on("end", function () {
          try {
            const newBody = JSON.parse(body);
            const updatedUser = db.update(userId, newBody);
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(updatedUser));
            return;
          } catch (error) {
            handleError(error as Error, response);
          }
        });
      } catch (error) {
        handleError(error as Error, response);
      }
    } else {
      response.writeHead(404, {
        "Content-Type": "application/json",
      });
      response.end("Requests to non-existing endpoint!");
    }
  } catch (err) {
    console.log(err);
    response.writeHead(500, {
      "Content-Type": "application/json",
    });
    response.end("Error on the server side");
  }
});

server.listen(port);

console.log(`Server is running at port ${port}`);
