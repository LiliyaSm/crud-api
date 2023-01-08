export interface IPerson {
  id?: string;
  name: string;
  age: number;
  hobbies: string[];
}
export interface IDatabase {
  [key: string]: any;
  set(value: IPerson): Promise<IPerson>;
  get(userId: string): Promise<IPerson | null>;
  getAllRecords(): Promise<IPerson[]>;
  delete(userId: string): void;
}
