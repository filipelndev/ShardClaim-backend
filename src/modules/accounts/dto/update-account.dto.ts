import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  inQueue?: boolean;
}