import { Ev } from "../types/ev.class";

export class EmspRequestError extends Error {
  /**
   * Constructs a new error thrown when requesting an eMSP list from an EV failed.
   * @param ev EV instance.
   * @param innerError Optional inner error that caused this error.
   */
  constructor(
    public readonly ev: Ev,
    public readonly innerError?: any
  ) {
    super(`Failed to request  to EV named "${ev.name}"${innerError ? `: ${innerError}`: '!'}`);
  }
}
