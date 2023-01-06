import { IncomingMessage, ServerResponse } from "http";
import {cpus} from "os";
import InMemoryDatabase from "./inMemoryDatabase";
import { IDatabase } from "./types";
import { validate } from "uuid";
import http from "http";

const db: IDatabase = new InMemoryDatabase();

const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};

// export class BasicOperationalError extends Error {
//   statusCode: number;
//   constructor(message: string, statusCode: number) {
//     super();
//     Object.setPrototypeOf(this, new.target.prototype);
//     this.message = message;
//     this.statusCode = statusCode;
//     Error.captureStackTrace(this);
//   }
// }

export const endResponse = (
  response: ServerResponse,
  statusCode: number = 500,
  message: string = `Error on the server side`
) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(message);
};

const PORT = 4000;

const firstWorkerPort = PORT + 1;
const totalWorkers = cpus().length;
let currWorker = 0;


export const loadBalancerHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => {
  try {
    const host = `localhost`;
    const connector = http
      .request(
        {
          host: host,
          port: firstWorkerPort + currWorker,
          path: request.url,
          protocol: "http:",
          method: request.method,
          headers: request.headers,
        },
        (res) => res.pipe(response)
      )
      .on("error", () => {
        endResponse(response);
      });
    request.pipe(connector);
    currWorker = (currWorker + 1) % totalWorkers;
  } catch {
    endResponse(response);
  }
};

export const handler = (
  request: IncomingMessage,
  response: ServerResponse
): void => {
  try {
    console.log(`worker on ${process.env.port} got request`);

    const { url: requestUrl = "", method } = request;
    const tokens = requestUrl.split("/");
    const [_, param1, param2, param3] = tokens;
    if (param1 !== "api" || param2 !== "users") {
      endResponse(response, 404, "Request to non-existing endpoint!");
      return;
    }
    if (tokens.length === 4 && !validate(param3)) {
      endResponse(response, 400, "User Id is not valid uuid");
      return;
    }
    switch (tokens.length) {
      case 3:
        switch (method) {
          case "GET":
            const allRecords = db.getAllRecords();
            endResponse(response, 200, JSON.stringify(allRecords));
            break;
          case "POST":
            if (method === "POST") {
              let body: string = "";
              request.on("data", (chunk) => {
                body += chunk;
              });
              request.on("end", function () {
                const value = JSON.parse(body);
                const { name, age, hobbies } = value;
                let newUser;
                if (name && !isNaN(age) && Array.isArray(hobbies)) {
                  newUser = db.set(value);
                  endResponse(response, 201, JSON.stringify(newUser));
                } else {
                  endResponse(
                    response,
                    400,
                    "Request body does not contain required fields"
                  );
                }
              });
            }
            break;
          default:
            endResponse(response, 404, "Request to non-existing endpoint!");
            break;
        }
        break;
      case 4:
        switch (method) {
          case "GET":
            const user = db.get(param3);
            if (user) {
              endResponse(response, 200, JSON.stringify(user));
            } else {
              console.log("teest");
              endResponse(response, 404, "user Id doesn't exist");
            }
            break;
          case "PUT":
            let body: string = "";
            request.on("data", (chunk) => {
              body += chunk;
            });
            request.on("end", function () {
              const newBody = JSON.parse(body);
              const user = db.get(param3);
              if (user) {
                db.delete(param3);
                const updatedUser = { id: param3, ...newBody };
                db.set(updatedUser);
                endResponse(response, 200, JSON.stringify(updatedUser));
              } else {
                endResponse(response, 404, "User Id doesn't exist");
              }
            });
            break;
          case "DELETE": {
            const user = db.get(param3);
            if (user) {
              db.delete(param3);
              endResponse(response, 200, "Deleted");
            } else {
              endResponse(response, 404, "User Id doesn't exist");
            }
            break;
          }
          default:
            endResponse(response, 404, "Request to non-existing endpoint!");
            break;
        }
        break;
      default:
        endResponse(response, 404, "Request to non-existing endpoint!");
        break;
    }
  } catch {
    endResponse(response);
  }
};
