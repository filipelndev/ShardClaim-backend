import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShardDto {
  @IsNotEmpty()
  @IsString()
  cardName: string;

  @IsOptional()
  @IsString()
  cardPhoto?: string;
}