import { IsNotEmpty, IsNumber } from 'class-validator';

export class ClaimShardDto {
  @IsNotEmpty()
  @IsNumber()
  accountId: number;
}