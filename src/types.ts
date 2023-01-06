export interface IPerson {
  id?: string;
  name: string;
  age: number;
  hobbies: string[];
}
export interface IDatabase {
  set(value: IPerson): IPerson;
  get(userId: string): IPerson | undefined;
  getAllRecords(): IPerson[];
  delete(userId: string): void;
}
