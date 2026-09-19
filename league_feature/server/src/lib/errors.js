export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message, code = 'BAD_REQUEST') => new AppError(400, code, message);
export const notFound = (message, code = 'NOT_FOUND') => new AppError(404, code, message);
