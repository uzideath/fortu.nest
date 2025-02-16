import {
    Catch,
    ArgumentsHost,
    HttpException,
    ExceptionFilter,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * The AllExceptionsFilter captures all thrown exceptions.
 * It either extracts useful information from known exceptions (like HttpException),
 * or it constructs a fallback Internal Server Error response for other/unexpected errors.
 */
@Catch() // Catch ALL exceptions
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Determine status code
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Create a standardized response body
        const responseBody = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            // Attempt to extract a message from the exception
            message: this.getExceptionMessage(exception),
            // Optionally, include stacktrace in non-production environments
            // stack: process.env.NODE_ENV !== 'production' ? exception?.stack : undefined,
        };

        // Log the exception (or integrate with logging/monitoring service)
        this.logger.error(
            `HTTP Status: ${status} Error Message: ${responseBody.message
            }`,
            (exception as Error)?.stack,
        );

        // Send response
        response.status(status).json(responseBody);
    }

    /**
     * A helper method to extract a user-facing message from various exception types.
     */
    private getExceptionMessage(exception: unknown): string {
        if (exception instanceof HttpException) {
            // If it's a NestJS HttpException, try to get its response message
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                return exceptionResponse;
            }
            if (
                typeof exceptionResponse === 'object' &&
                (exceptionResponse as Record<string, any>).message
            ) {
                return (exceptionResponse as Record<string, any>).message;
            }
        }
        // Fallback message for unrecognized exceptions
        return 'Internal server error';
    }
}
