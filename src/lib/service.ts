import { Logger } from '@nestjs/common';

export class Service {
    public readonly logger: Logger;
    constructor(name: string) {
        this.logger = new Logger(name);
    }
}