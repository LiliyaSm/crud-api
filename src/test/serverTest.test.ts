var assert = require("assert");
var http = require("http");
import { IncomingMessage, ServerResponse } from "http";
import { handler } from "../handlers";

jest.mock("uuid", () => ({ v4: () => "testId" }));

const mockUserData = {
  name: "testName",
  age: "22",
  hobbies: ["ddd"],
};

const wrongMockUserData = {
  wrongFieldName: "testName",
  age: "22",
  hobbies: ["ddd"],
};

const getOptions = {
  path: "/api/users",
  host: "localhost",
  port: 8000,
  protocol: "http:",
  method: "get",
};

const postOptions = {
  path: "/api/users",
  host: "localhost",
  port: 8000,
  protocol: "http:",
  headers: {
    "Content-Type": "application/json",
  },
  method: "post",
  body: JSON.stringify(mockUserData),
};

const invalidPostOptions = {
  ...postOptions,
  body: JSON.stringify(wrongMockUserData)
};

const server = http.createServer(handler);

function doRequest(options: any) : Promise<IncomingMessage> {
  return new Promise ((resolve, reject) => {
    let req = http.request(options);

    if(options.body){
      req.write(options.body);
    }

    req.on('response', (res: IncomingMessage) => {
      resolve(res);
    });

    req.on('error', (err: IncomingMessage) => {
      reject(err);
    });

    req.end();
  }); 
}

describe("server", function () {
  beforeEach(function () {
    console.log("OPEN");
    server.listen(8000);
  });

  afterEach(function () {
    console.log("CLOSE");
    server.close();
  });

  it("should return all records", async function() {
    await doRequest(getOptions);
  });

  it("should add new user", async function () {
    
    const res = await doRequest(postOptions);
    const resultObject = JSON.parse(await res.read());

    assert.deepEqual({ ...mockUserData, id: "testId" }, resultObject);
  });

  it("should fail if new user fields are invalid", async function () {
    const res = await doRequest(invalidPostOptions);

    assert.equal(res.statusCode, 400);
  });
});
