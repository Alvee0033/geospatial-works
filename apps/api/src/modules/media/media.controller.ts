import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Media & Uploads')
@Controller('media')
export class MediaController {
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Upload image or document asset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `asset-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for media/videos
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml|pdf|mp4|webm|quicktime)$/)) {
          return cb(new BadRequestException('Only image files (PNG, JPG, WEBP, SVG), PDFs or Videos (MP4, WEBM) are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
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

  @Get('library')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'List all available uploaded images' })
  async listMedia() {
    try {
      const files = fs.readdirSync(uploadDir);
      const items = files
        .filter((f) => f.match(/\.(png|jpg|jpeg|webp|svg)$/i))
        .map((f) => {
          const stats = fs.statSync(join(uploadDir, f));
          return {
            url: `/uploads/${f}`,
            filename: f,
            size: stats.size,
            updatedAt: stats.mtime,
          };
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      // Also include high-res stock banner images from public
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
    } catch (e) {
      return { uploaded: [], stock: [] };
    }
  }
}

