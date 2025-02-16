import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './common/response.dto';
import { GlobalAppEnums } from './common/enums';

/**
 * A global (or controller-scoped) interceptor for transforming
 * the outgoing response into a standardized structure.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T>> {
        const http = context.switchToHttp();
        const response = http.getResponse();
        const statusCode = response.statusCode;

        // Use reflection to retrieve a message if set via metadata (optional)
        const message =
            this.reflector.get<string>(GlobalAppEnums.INTERCEPTOR, context.getHandler()) || 'OK';

        return next.handle().pipe(
            map((result: T) => {
                // If you need to skip transformation for file downloads or streams, you can check:
                // if (response.getHeader('Content-Type') !== 'application/json') return result as any;
                //
                // For a purely JSON-based API, you can transform everything:

                return new ResponseDto<T>(result, statusCode, message);
            }),
        );
    }
}
