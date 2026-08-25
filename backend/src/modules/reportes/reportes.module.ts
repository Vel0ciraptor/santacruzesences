import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

@Module({
  imports: [MulterModule.register()],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
