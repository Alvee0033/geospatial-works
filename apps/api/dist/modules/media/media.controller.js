"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = exports.uploadDir = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../entities/user.entity");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
exports.uploadDir = process.env.UPLOAD_DIR || (0, path_1.join)(process.cwd(), 'uploads');
if (!fs.existsSync(exports.uploadDir)) {
    fs.mkdirSync(exports.uploadDir, { recursive: true });
}
let MediaController = class MediaController {
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const publicUrl = `/uploads/${file.filename}`;
        return {
            url: publicUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
        };
    }
    async listMedia() {
        try {
            const files = fs.readdirSync(exports.uploadDir);
            const items = files
                .filter((f) => f.match(/\.(png|jpg|jpeg|webp|svg)$/i))
                .map((f) => {
                const stats = fs.statSync((0, path_1.join)(exports.uploadDir, f));
                return {
                    url: `/uploads/${f}`,
                    filename: f,
                    size: stats.size,
                    updatedAt: stats.mtime,
                };
            })
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
            const stockImages = [
                { url: '/delta-hero-v2.webp', filename: 'delta-hero-v2.webp' },
                { url: '/geospatial-river-hero.webp', filename: 'geospatial-river-hero.webp' },
                { url: '/hero-poster.jpg', filename: 'hero-poster.jpg' },
                { url: '/field-surveyor-v2.webp', filename: 'field-surveyor-v2.webp' },
                { url: '/inner/drone-fields.webp', filename: 'drone-fields.webp' },
                { url: '/inner/field-team.webp', filename: 'field-team.webp' },
                { url: '/inner/river-aerial.webp', filename: 'river-aerial.webp' },
                { url: '/inner/bridge-aerial.webp', filename: 'bridge-aerial.webp' },
                { url: '/inner/gis-analyst.webp', filename: 'gis-analyst.webp' },
                { url: '/inner/wetland-aerial.webp', filename: 'wetland-aerial.webp' },
            ];
            return {
                uploaded: items,
                stock: stockImages,
            };
        }
        catch (e) {
            return { uploaded: [], stock: [] };
        }
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Upload image or document asset' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: exports.uploadDir,
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                cb(null, `asset-${uniqueSuffix}${ext}`);
            },
        }),
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml|pdf|mp4|webm|quicktime)$/)) {
                return cb(new common_1.BadRequestException('Only image files (PNG, JPG, WEBP, SVG), PDFs or Videos (MP4, WEBM) are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('library'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'List all available uploaded images' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "listMedia", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media & Uploads'),
    (0, common_1.Controller)('media')
], MediaController);
//# sourceMappingURL=media.controller.js.map