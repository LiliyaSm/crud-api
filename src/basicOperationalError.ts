const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};

export default class BasicOperationalError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = message;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}
