import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseError } from 'src/classes/response.class';
import { CONSTANT_ENV } from 'src/constants';
import { IStackTrace } from 'src/interfaces/common.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const errorException = exception.getResponse() as ResponseError; // {"statusCode": 401,"message": "fail"}, nếu throw ra exception chuẩn của nestjs

    //
    const statusCode =
      errorException?.statusCode || // throw new HttpException("Something went wrong", 500); => "Something went wrong"
      exception.getStatus() ||
      HttpStatus.INTERNAL_SERVER_ERROR;

    //
    const message =
      typeof errorException === 'string' ? errorException : (errorException as any).message || 'Unknown error';

    //
    const stack: IStackTrace | undefined =
      process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.DEV && exception instanceof HttpException
        ? {
            stack: exception.stack,
            method: request.method,
            headers: request.headers,
            query: request.query, // query, params
            body: request.body,
          }
        : undefined;

    //
    const responseError: ResponseError = {
      statusCode: statusCode,
      method: request.method,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
      stack: stack,
    };

    this.logger.error(responseError);

    response.status(statusCode).json(responseError);
  }
}
