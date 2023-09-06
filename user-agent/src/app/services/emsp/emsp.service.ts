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
   * Updates the eMSP registry asynchronously.
   * @param ev The EV to request the available eMSPs from.
   * @throws {EmspRequestError} if requesting the eMSPs from the EV failed.
   */
  public async updateEmsps(ev: Ev): Promise<void> {
    // Request the eMSPs from the EV.
    const emspList = await ev.requestEmsps();

    // Clear the current dictionary of eMSPs.
    this.availableEmsps = {};

    // Register received eMSPs by their ID.
    for (const emsp of emspList) {
      this.availableEmsps[emsp.id] = emsp;
    }
  }
}
