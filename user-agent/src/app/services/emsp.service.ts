import { Injectable } from '@angular/core';

import { EMSP } from '../types/emsp.interface';

@Injectable({
  providedIn: 'root',
})
export class EmspService {
  /**
   * A mapping from an ID to an eMSP with this ID.
   */
  private availableEmsps: { [id: string]: EMSP } = {};

  /**
   * Gets an eMSP by its ID.
   * @param emspId ID of the eMSP.
   * @returns Found eMSP or undefined if not found.
   */
  public emspById(emspId: string): EMSP | undefined {
    return this.availableEmsps[emspId] ?? undefined;
  }

  /**
   * Gets an iterable of all found eMSPs.
   */
  public *getEmsps(): Iterable<EMSP> {
    for (const emspId in this.availableEmsps) {
      yield this.availableEmsps[emspId];
    }
  }

  /**
   * Gets an iterable of all found eMSP IDs.
   */
  public *getEmspIds(): Iterable<string> {
    for (const emspId in this.availableEmsps) {
      yield emspId;
    }
  }

  /**
   * Requests an array of available eMSPs from the EV.
   * @returns Array of available eMSPs.
   */
  private async requestEmsps(): Promise<EMSP[]> {
    // TODO: Perform a real request.
    return [
      {
        base_url: 'http://localhost:8080',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ionity_logo_cmyk.svg',
        name: 'Ionity',
        client_id: 'ionity_ev',
        id: 'ionity',
      }
    ];
  }

  /**
   * Updates the eMSP registry asynchronously.
   */
  public async updateEmsps(): Promise<void> {
    // Request the eMSPs from the EV.
    const emspList = await this.requestEmsps();

    // Clear the current dictionary of eMSPs.
    this.availableEmsps = {};

    // Register received eMSPs by their ID.
    for (const emsp of emspList) {
      this.availableEmsps[emsp.id] = emsp;
    }
  }
}
