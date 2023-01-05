import { v4 as uuidv4, validate } from "uuid";
import BasicOperationalError from "./basicOperationalError";
interface IPerson {
  id?: string;
  name: string;
  age: number;
  hobbies: string[];
}
interface IDatabase {
  cache: IPerson[];
}

class InMemoryDatabase implements IDatabase {
  cache: IPerson[];

  constructor() {
    this.cache = [];
  }
  set(value: IPerson): IPerson {
    const { id = uuidv4(), name, age, hobbies } = value;
    if (name && !isNaN(age) && Array.isArray(hobbies)) {
      const newUser = { id, ...value };
      this.cache.push(newUser);
      return newUser;
    } else {
      throw new BasicOperationalError(
        "request body does not contain required fields",
        400
      );
    }
  }
  get(userId: string): IPerson {
    if (!validate(userId))
      throw new BasicOperationalError("user Id is not valid uuid", 400);
    const person = this.cache.find(({ id }) => id === userId);
    if (!person) throw new BasicOperationalError("user Id doesn't exist", 404);
    return person;
  }
  getAllRecords(): IPerson[] {
    return this.cache;
  }
  delete(userId: string) {
    this.get(userId);
    this.cache = this.cache.filter(({ id }) => id !== userId);
  }
  update(userId: string, value: IPerson) {
    const updatedUser = { id: userId, ...value };
    this.delete(userId);
    this.set(updatedUser);
    return updatedUser;
  }
}
export default InMemoryDatabase;
