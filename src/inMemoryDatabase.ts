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
  get(userId: string): IPerson | undefined {
    const person = this.cache.find(({ id }) => id === userId);
    return person;
  }
  async getAllRecords(): Promise<IPerson[]> {
    return this.cache;
  }
  delete(userId: string) {
    this.cache = this.cache.filter(({ id }) => id !== userId);
  }
}
export default InMemoryDatabase;
