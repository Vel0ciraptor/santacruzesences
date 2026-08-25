import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { memoryStorage } from 'multer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('reportes')
export class ReportesController {
  constructor(private service: ReportesService) {}

  @Get('export/ventas')
  async exportVentas(@Res() res: Response) {
    const buffer = await this.service.exportarVentas();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ventas-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/stock')
  async exportStock(@Res() res: Response) {
    const buffer = await this.service.exportarStock();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=stock-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/productos')
  async exportProductos(@Res() res: Response) {
    const buffer = await this.service.exportarProductos();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=productos-catalogo-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('plantilla/productos')
  async exportPlantillaProductos(@Res() res: Response) {
    const buffer = await this.service.generarPlantillaExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=plantilla-productos.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/clientes')
  async exportClientes(@Res() res: Response) {
    const buffer = await this.service.exportarClientes();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=clientes-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Post('import/productos')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importPreview(
    @UploadedFile() file: Express.Multer.File,
    @Query('permitirActualizar') permitirActualizar?: string,
  ) {
    const allowUpdate = permitirActualizar !== 'false';
    return this.service.importarProductosPreview(file.buffer, allowUpdate);
  }

  @Post('import/productos/confirmar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importConfirmar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') adminId: string,
    @Query('permitirActualizar') permitirActualizar?: string,
  ) {
    const allowUpdate = permitirActualizar !== 'false';
    return this.service.importarProductosConfirmar(file.buffer, adminId, allowUpdate);
  }

  // ──────────────────────────────────────────
  // BACKUP COMPLETO JSON
  // ──────────────────────────────────────────

  @Get('backup/export')
  async exportBackup() {
    return this.service.exportarBackupCompleto();
  }

  @Post('backup/restore')
  async restoreBackup(
    @Body() backupJson: any,
    @CurrentUser('id') adminId: string,
  ) {
    return this.service.restaurarBackupCompleto(backupJson, adminId);
  }
}
