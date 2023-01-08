import { IDatabase, IPerson } from "./types";
import http from "http";
import { cpus } from "os";


const numberOfCores = cpus().length;
const PORT = 4000;
export const DATABASE_PORT = PORT + 1 + numberOfCores;

const makeRequest = (method: string, value?: any) => {
  const jsonObject = JSON.stringify({
    method,
    value,
  });

  function httpRequest() {
    return new Promise((resolve) => {
      const req = http.request(
        {
          host: "localhost",
          port: DATABASE_PORT,
          protocol: "http:",
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (res: any) => {
          res.on("data", (chunk: any) => {
            resolve(JSON.parse(chunk));
          });
        }
      );
      req.write(jsonObject);
      req.end();
    });
  }
  return httpRequest().then((data) => {
    return data;
  });
};

class RemoteDataBase implements IDatabase {
  cache: IPerson[];

  constructor() {
    this.cache = [];
  }
  async set(value: IPerson): Promise<Required<IPerson>> {
    const dbResult = await makeRequest("set", value);
    return dbResult as Required<IPerson>;
  }
  async get(userId: string): Promise<Required<IPerson> | null> {
    const dbResult = await makeRequest("get", userId);
    return dbResult as Required<IPerson>;
  }

  async getAllRecords(): Promise<IPerson[]> {
    const dbResult = await makeRequest("getAllRecords");
    return dbResult as IPerson[];
  }
  delete(userId: string): void {
    makeRequest("delete", userId);
  }
}
export default RemoteDataBase;
