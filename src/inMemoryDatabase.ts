import { v4 as uuidv4 } from "uuid";
import { IDatabase, IPerson } from "./types";

class InMemoryDatabase implements IDatabase {
  cache: IPerson[];

  constructor() {
    this.cache = [];
  }
  async set(value: IPerson): Promise<Required<IPerson>> {
    const id = value.id || uuidv4();
    const newUser = { id, ...value };
    this.cache.push(newUser);
    return newUser;
  }
  async get(userId: string): Promise<IPerson | null> {
    const person = this.cache.find(({ id }) => id === userId);
    const res = person ? person : null;
    return res;
  }
  async getAllRecords(): Promise<IPerson[]> {
    return this.cache;
  }
  
  delete(userId: string): Promise<void> {
    this.cache = this.cache.filter(({ id }) => id !== userId);
    return new Promise(res => res());
  }
}
export default InMemoryDatabase;
