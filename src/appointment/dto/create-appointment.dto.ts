// src/appointment/dto/create-appointment.dto.ts
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  endTime: Date;

  //@IsNotEmpty()
  @IsString()
  userId: string; 
}