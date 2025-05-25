import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    this.logger.log('Before...');

    const start = Date.now();
    this.logger.debug('Run 3');
    return next.handle().pipe(
      catchError((error) => {
        //

        // Nếu lỗi không phải HttpException, tạo mới HttpException chuẩn
        if (!(error instanceof HttpException)) {
          error = new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Throw lỗi để Exception Filter xử lý tiếp
        return throwError(() => error);
      }),

      tap(() => this.logger.log(`After request... ${Date.now() - start}ms`)),
      // map()
    );
  }
}
