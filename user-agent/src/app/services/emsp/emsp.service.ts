import { Injectable } from '@angular/core';

import { EmspRequestError } from '../../errors/emsp-request-error.error';
import { EMSP } from '../../types/emsp.interface';
import { Ev } from '../../types/ev.class';

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
  public getEmspById(emspId: string): EMSP | undefined {
    return this.availableEmsps[emspId] ?? undefined;
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
   * Gets an iterable of all found eMSPs.
   */
  public *getEmsps(): Iterable<EMSP> {
    for (const emspId in this.availableEmsps) {
      yield this.availableEmsps[emspId];
    }
  }

  /**
   * Requests an array of available eMSPs from the EV.
   * @param ev EV to request eMSPs from.
   * @returns Array of available eMSPs.
   * @throws {EmspRequestError} if request failed.
   */
  private async requestEmsps(ev: Ev): Promise<EMSP[]> {
    try {
      // TODO: Perform a real request of available eMSPs from the EV.
      return [
        {
          base_url: 'http://localhost:8080',
          image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ionity_logo_cmyk.svg',
          name: 'Ionity',
          client_id: 'ionity_ev',
          id: 'ionity',
        }
      ];
    } catch (e) {
      throw new EmspRequestError(ev, e);
    }
  }

  /**
   * Updates the eMSP registry asynchronously.
   * @param ev The EV to request the available eMSPs from.
   * @throws {EmspRequestError} if requesting the eMSPs from the EV failed.
   */
  public async updateEmsps(ev: Ev): Promise<void> {
    // Request the eMSPs from the EV.
    const emspList = await this.requestEmsps(ev);

    // Clear the current dictionary of eMSPs.
    this.availableEmsps = {};

    // Register received eMSPs by their ID.
    for (const emsp of emspList) {
      this.availableEmsps[emsp.id] = emsp;
    }
  }
}
