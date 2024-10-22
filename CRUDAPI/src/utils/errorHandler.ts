import http from 'http';

export class CustomError extends Error {
  statusCode: number;
  userMessage: string;

  constructor(statusCode: number, userMessage: string) {
    super(userMessage);
    this.statusCode = statusCode;
    this.userMessage = userMessage;

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  ...args: string[]
) => Promise<void>;

export function withErrorHandling(handler: RouteHandler) {
  return async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ...args: string[]
  ) => {
    try {
      await handler(req, res, ...args);
    } catch (error) {
      if (error instanceof CustomError) {
        errorHandler(res, error);
      } else {
        errorHandler(res, new CustomError(500, 'Internal Server Error'));
      }
    }
  };
}

// Функция для отправки ответов об ошибках
export const sendErrorResponse = (
  res: http.ServerResponse,
  statusCode: number,
  message: string,
) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
};

// Централизованный обработчик ошибок
const errorHandler = (res: http.ServerResponse, error: Error) => {
  const statusCode = error instanceof CustomError ? error.statusCode : 500;
  const message =
    error instanceof CustomError ? error.userMessage : 'Internal Server Error';

  console.log(`Error(${statusCode}): ${message}`);

  sendErrorResponse(res, statusCode, message);
};
