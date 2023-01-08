task: https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md

## Common setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/LiliyaSm/crud-api.git
cd crud-api
```

```bash
npm install
```

To run the app in development mode:

```bash
npm run start:dev
```

To run the app in production mode:

```bash
npm run start:prod
```

To run the app using multiple instances of application (Node.js Cluster API):

```bash
npm run start:multi
```
The database will be launched in a separate process and workers will access it using HTTP requests