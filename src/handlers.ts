import { IncomingMessage, ServerResponse } from "http";
import { cpus } from "os";
import InMemoryDatabase from "./inMemoryDatabase";
import { IDatabase } from "./types";
import { validate } from "uuid";
import RemoteDataBase from "./RemoteDataBase";
import http from "http";

const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};

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
    const connector = http
      .request(
        {
          host: "localhost",
          port: firstWorkerPort + currWorker, //PORT + totalWorkers
          path: request.url,
          protocol: "http:",
          method: request.method,
          headers: request.headers,
        },
        (res) => {
          response.writeHead(Number(res.statusCode), res.headers);
          res.pipe(response);
        }
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

export const workerHandler = (
  request: IncomingMessage,
  response: ServerResponse
): void => {
  console.log(`worker on ${process.env.port} got request`);
  const db: IDatabase = new RemoteDataBase();
  basicHandler(request, response, db);
};

const db: IDatabase = new InMemoryDatabase();
export const handler = (
  request: IncomingMessage,
  response: ServerResponse
): void => {
  basicHandler(request, response, db);
};

export const dbHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => {
  let body: string = "";
  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", async function () {
    const bodyValue = JSON.parse(body);
    const { method, value } = bodyValue;
    let result = await db[method](value);
    if (result) response.write(JSON.stringify(result));
  });
};

export const basicHandler = async (
  request: IncomingMessage,
  response: ServerResponse,
  db: IDatabase = new InMemoryDatabase()
): Promise<void> => {
  try {
    const { url: requestUrl = "", method } = request;
    const tokens = requestUrl.split("/");
    const [_, param1, param2, param3] = tokens;
    if (param1 !== "api" || param2 !== "users") {
      endResponse(
        response,
        httpStatusCodes.NOT_FOUND,
        "Request to non-existing endpoint!"
      );
      return;
    }
    if (tokens.length === 4 && !validate(param3)) {
      endResponse(
        response,
        httpStatusCodes.BAD_REQUEST,
        "User Id is not valid uuid"
      );
      return;
    }
    switch (tokens.length) {
      case 3:
        switch (method) {
          case "GET":
            const allRecords = await db.getAllRecords();
            endResponse(
              response,
              httpStatusCodes.OK,
              JSON.stringify(allRecords)
            );
            break;
          case "POST":
            let body: string = "";
            request.on("data", (chunk) => {
              body += chunk;
            });
            request.on("end", async function () {
              const value = JSON.parse(body);
              const { name, age, hobbies } = value;
              let newUser;
              if (name && !isNaN(age) && Array.isArray(hobbies)) {
                newUser = await db.set(value);
                endResponse(response, 201, JSON.stringify(newUser));
              } else {
                endResponse(
                  response,
                  httpStatusCodes.BAD_REQUEST,
                  "Request body does not contain required fields"
                );
              }
            });
            break;
          default:
            endResponse(
              response,
              httpStatusCodes.NOT_FOUND,
              "Request to non-existing endpoint!"
            );
            break;
        }
        break;
      case 4:
        switch (method) {
          case "GET":
            const user = await db.get(param3);
            if (user) {
              endResponse(response, httpStatusCodes.OK, JSON.stringify(user));
            } else {
              endResponse(
                response,
                httpStatusCodes.NOT_FOUND,
                "user Id doesn't exist"
              );
            }
            break;
          case "PUT":
            let body: string = "";
            request.on("data", (chunk) => {
              body += chunk;
            });
            request.on("end", async function () {
              const newBody = JSON.parse(body);
              const user = await db.get(param3);
              if (user) {
                db.delete(param3);
                const updatedUser = { id: param3, ...newBody };
                db.set(updatedUser);
                endResponse(
                  response,
                  httpStatusCodes.OK,
                  JSON.stringify(updatedUser)
                );
              } else {
                endResponse(
                  response,
                  httpStatusCodes.NOT_FOUND,
                  "User Id doesn't exist"
                );
              }
            });
            break;
          case "DELETE": {
            const user = await db.get(param3);
            if (user) {
              db.delete(param3);
              endResponse(response, httpStatusCodes.OK, "Deleted");
            } else {
              endResponse(
                response,
                httpStatusCodes.NOT_FOUND,
                "User Id doesn't exist"
              );
            }
            break;
          }
          default:
            endResponse(
              response,
              httpStatusCodes.NOT_FOUND,
              "Request to non-existing endpoint!"
            );
            break;
        }
        break;
      default:
        endResponse(
          response,
          httpStatusCodes.NOT_FOUND,
          "Request to non-existing endpoint!"
        );
        break;
    }
  } catch {
    endResponse(response);
  }
};
