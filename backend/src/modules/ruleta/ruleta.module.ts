import { Module } from '@nestjs/common';
import { RuletaService } from './ruleta.service';
import { RuletaController } from './ruleta.controller';

@Module({ controllers: [RuletaController], providers: [RuletaService] })
export class RuletaModule {}
