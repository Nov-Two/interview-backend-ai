import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LogService } from '../../log/log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const referer = headers['referer'] || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logRequest(
            context,
            request,
            method,
            url,
            startTime,
            userAgent,
            referer,
            body,
            query,
            200, // Default success code (interceptor usually handles success)
          );
        },
        error: (error) => {
          const status = error.status || 500;
          this.logRequest(
            context,
            request,
            method,
            url,
            startTime,
            userAgent,
            referer,
            body,
            query,
            status,
          );
        },
      }),
    );
  }

  private logRequest(
    context: ExecutionContext,
    request: any,
    method: string,
    url: string,
    startTime: number,
    userAgent: string,
    referer: string,
    body: any,
    query: any,
    statusCode: number,
  ) {
    const duration = Date.now() - startTime;
    const response = context.switchToHttp().getResponse<Response>();
    
    // Get user from request (attached by AuthGuard)
    const user = request.user;

    // Mask sensitive data in body
    const safeBody = { ...body };
    if (safeBody.password) safeBody.password = '******';
    if (safeBody.confirmPassword) safeBody.confirmPassword = '******';

    const params = JSON.stringify({ query, body: safeBody });

    // Handle real status code if available from response object (though in interceptor it might be early)
    // The error case handles status, success case defaults to 200 or 201.
    // Ideally we can check response.statusCode but sometimes it's not set yet in observable tap.
    // However, for error case we passed it. For success, let's assume 200/201 or read from response if possible.
    const finalStatus = response.statusCode || statusCode;

    this.logService.createLog({
      userId: user?.userId || null,
      username: user?.username || null,
      method,
      path: url,
      params: params.length > 2000 ? params.substring(0, 2000) + '...' : params, // Truncate if too long
      statusCode: finalStatus,
      duration,
      userAgent,
      referer,
    });
  }
}
