import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class MetaCodeDto {
  @IsString() @MaxLength(2000) code: string;
}

export class MetaPageDto {
  @IsString() @MaxLength(20000) selectionToken: string;
  @Matches(/^[0-9]+$/) pageId: string;
}

export class MetaWhatsAppDto extends MetaCodeDto {
  @Matches(/^[0-9]+$/) wabaId: string;
  @IsOptional() @Matches(/^[0-9]+$/) phoneNumberId?: string;
  @IsOptional() @Matches(/^[0-9]{6}$/) pin?: string;
  @IsOptional() @IsBoolean() isOnBizApp?: boolean;
}
