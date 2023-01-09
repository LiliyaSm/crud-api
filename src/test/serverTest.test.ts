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

const postOptions = {
  path: "/api/users",
  host: "localhost",
  port: 8000,
  protocol: "http:",
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
};

const deleteOptions = {
  ...postOptions,
  method: "delete",
  path: "/api/users/testId",
};

const server = http.createServer(handler);

describe("server", function () {
  beforeEach(function () {
    server.listen(8000);
  });

  afterEach(function () {
    server.close();
  });
  it("should return all records", function (done) {
    http.get(
      "http://localhost:8000/api/users",
      function (res: IncomingMessage) {
        assert.equal(200, res.statusCode);
        var data = "";

        res.on("data", function (chunk) {
          data += chunk;
        });

        res.on("end", function () {
          assert.equal("[]", data);
        });
        done();
      }
    );
  });
  it("should add new user", function (done) {
    const jsonObject = JSON.stringify(mockUserData);
    const req = http.request(postOptions, (res: ServerResponse) => {
      res.on("data", (chunk: any) => {
        assert.deepEqual({ ...mockUserData, id: "testId" }, JSON.parse(chunk));
        done();
      });
    });
    req.write(jsonObject);
    req.end();
  });
  it("should fail if new user fields are invalid", function (done) {
    const jsonObject = JSON.stringify(wrongMockUserData);
    const postReq = http.request(postOptions, (res: ServerResponse) => {
      console.log(res.statusCode);
      done();
      res.on("end", () => {
        assert.equal(200, res.statusCode);
        done();
      });
    });
    postReq.write(jsonObject);
    postReq.end();
  });
});
