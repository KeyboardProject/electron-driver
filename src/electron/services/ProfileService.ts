import { dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { grpcClients } from '../../services/grpc';
import * as inputService from '../../../generated/input_service';

export default class ProfileService {
  private mainWindow: Electron.BrowserWindow | null;

  constructor(mainWindow: Electron.BrowserWindow | null) {
    this.mainWindow = mainWindow;
  }

  async importProfile(event: Electron.IpcMainEvent): Promise<void> {
    if (!this.mainWindow) {
      throw new Error("Main window is not initialized");
    }

    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Sav Files', extensions: ['sav'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const data = fs.readFileSync(filePath);

      const importRequest = {
        filename: path.basename(filePath),
        savfile: data
      };

      try {
        const response = await grpcClients.macro.importProfile(
          inputService.ImportProfileRequest.create(importRequest)
        );
        event.sender.send('import-profile-success', response);
      } catch (error) {
        event.sender.send('import-profile-error', error.message);
      }
    }
  }

  async exportProfile(event: Electron.IpcMainEvent, filename: string): Promise<void> {
    if (!this.mainWindow) {
      throw new Error("Main window is not initialized");
    }

    const result = await dialog.showSaveDialog(this.mainWindow, {
      defaultPath: filename,
      filters: [{ name: 'Sav Files', extensions: ['sav'] }]
    });

    if (!result.canceled && result.filePath) {
      const exportRequest = { filename };

      try {
        const response = await grpcClients.macro.exportProfile(
          inputService.ExportProfileRequest.create({ filename })
        );
        fs.writeFileSync(result.filePath, Buffer.from(response.savfile));
        event.sender.send('export-profile-success', `File saved as ${result.filePath}`);
      } catch (error) {
        event.sender.send('export-profile-error', error.message);
      }
    }
  }
} 