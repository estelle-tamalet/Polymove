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

export class ConflictError extends Error {
  statusCode: number = 409;

  constructor(message = "Resource already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends Error {
  statusCode: number = 500;

  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }
}
