export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class ValidationError extends Error {
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

export class BadRequestError extends Error {
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Access forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}
