import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ClientContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  clientName: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(32)
  whatsappPhone?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(500)
  @Matches(/^https:\/\/m\.me\/[A-Za-z0-9._-]+(?:\?[^\s]*)?$/i, {
    message: 'Messenger link must use the secure https://m.me/ format',
  })
  messengerUrl?: string;
}
