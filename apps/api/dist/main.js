"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const express = require("express");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.json({ limit: '25mb' }));
    app.use(express.urlencoded({ limit: '25mb', extended: true }));
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }));
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            /^http:\/\/localhost:\d+$/,
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Geospatial Works API')
        .setDescription('Enterprise Backend API for Geospatial Works Platform, CMS & Fleet Management')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 Geospatial Works Backend API running at http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger API Docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map