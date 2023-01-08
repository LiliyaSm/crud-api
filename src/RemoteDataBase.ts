import { IDatabase, IPerson } from "./types";
import http from "http";
import { v4 as uuidv4 } from "uuid";

const makeRequest = (method: string, value?: IPerson) => {
  const jsonObject = JSON.stringify({
    method,
    value,
  });

  function httprequest() {
    return new Promise((resolve) => {
      const req = http.request(
        {
          host: "localhost",
          port: 4009, //PORT + totalWorkers
          protocol: "http:",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            // "Content-Length": Buffer.byteLength(jsonObject, "utf8"),
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
  return httprequest().then((data) => {
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
  get(userId: string): IPerson | undefined {
    const person = this.cache.find(({ id }) => id === userId);
    return person;
  }

  async getAllRecords(): Promise<IPerson[]> {
    const dbResult = await makeRequest("getAllRecords");
    return dbResult as IPerson[];
  }
  delete(userId: string) {
    this.cache = this.cache.filter(({ id }) => id !== userId);
  }
}
export default RemoteDataBase;
