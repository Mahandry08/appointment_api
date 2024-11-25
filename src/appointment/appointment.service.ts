import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(@InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    await this.checkForOverlappingAppointments(createAppointmentDto.userId, createAppointmentDto.startTime, createAppointmentDto.endTime);
    
    const appointment = new this.appointmentModel(createAppointmentDto);
    return appointment.save();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) {
        console.log("Ce rendez-vous est introuvable");
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const existingAppointment = await this.appointmentModel.findById(id).exec();
    if (!existingAppointment) {
      console.log("Ce rendez-vous est introuvable");
    }

    if (updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      await this.checkForOverlappingAppointments(existingAppointment.userId, 
        updateAppointmentDto.startTime || existingAppointment.startTime, 
        updateAppointmentDto.endTime || existingAppointment.endTime);
    }

    const updatedAppointment = await this.appointmentModel.findByIdAndUpdate(id, updateAppointmentDto, { new: true }).exec();
    return updatedAppointment;
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      console.log("Ce rendez-vous est introuvable !");
    }
  }

  private async checkForOverlappingAppointments(userId: string, startTime: Date, endTime: Date): Promise<void> {
    const overlappingAppointments = await this.appointmentModel.find({
      userId,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
      ],
    }).exec();

    if (overlappingAppointments.length > 0) {
      console.log("Heure déjà prise");
    }
  }
}