import http from "http";
import dotenv from'dotenv';

dotenv.config();
const port = process.env.PORT;
const server = http.createServer(function (request, result) {
  //create web server
  if (request.url == "api/users") {
    //check the URL of the current request

    // set response header
    result.writeHead(200, { "Content-Type": "text/html" });
    result.write([]);

    // set response content
    result.write([]);
    result.end();
  } else if (request.url == "/student") {
    result.writeHead(200, { "Content-Type": "text/html" });
    result.write([]);
    result.end();
  } else if (request.url == "/admin") {
    result.writeHead(200, { "Content-Type": "text/html" });
    result.write([]);
    result.end();
  } else result.end("Invalid Request!");
});

server.listen(port);

console.log(`Server is running at port ${port}`);
