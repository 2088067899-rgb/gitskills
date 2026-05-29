import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['lottery', 'red_packet', 'coupon', 'game', 'task'])
  type: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsString()
  @IsOptional()
  cover_image?: string;

  @IsOptional()
  settings?: any;

  @IsOptional()
  share_config?: any;
}
