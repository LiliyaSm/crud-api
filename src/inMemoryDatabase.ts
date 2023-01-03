import { v4 as uuidv4 } from "uuid";

interface IPerson {
  id?: string;
  name: string;
  age: number;
  hobbies: string[];
}
interface IDatabase {
  cache: IPerson[];
}

// function parseJson(value: string) {
//   try {
//     return JSON.parse(value);
//   } catch (err) {
//     throw new SyntaxError(
//       `Failed to parse`
//     );
//   }
// }

class InMemoryDatabase implements IDatabase {
  cache: IPerson[];

  constructor() {
    this.cache = [];
  }
  set(value: any): IPerson {
    const id = uuidv4();
    const newUser = { id, ...value };
    this.cache.push(newUser);
    console.log(this.cache);
    return newUser;
  }
  get(key: string): IPerson {
    const person = this.cache.find(({ id }) => id === key);
    if (!person) throw new SyntaxError(`Failed to find`);
    return person;
  }
  getAllRecords(): IPerson[] {
    return this.cache;
  }
}
export default InMemoryDatabase;
