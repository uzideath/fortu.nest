export class ResponseDto<T> {
    /**
     * HTTP status code of the response.
     */
    statusCode: number;

    /**
     * ISO timestamp of when the response was generated.
     */
    timestamp: string;

    /**
     * A boolean indicating if the request succeeded.
     * Optional, since HTTP status code might suffice.
     */
    success: boolean;

    /**
     * Human-readable message. 
     * Often provided by the controller or via reflection metadata.
     */
    message: string;

    /**
     * The data payload returned by the controller.
     */
    data: T;

    constructor(data: T, statusCode: number, message: string) {
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
        this.success = statusCode >= 200 && statusCode < 300; // “true” if 2xx
        this.message = message;
        this.data = data;
    }
}
