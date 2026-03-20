export class NotFoundError extends Error {
  statusCode: number = 404;

  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  statusCode: number = 400;

  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

export class BadRequestError extends Error {
  statusCode: number = 400;

  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class ForbiddenError extends Error {
  statusCode: number = 403;

  constructor(message = "Access forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
