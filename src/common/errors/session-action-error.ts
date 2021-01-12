export class SessionActionError extends Error {
  public sessionId: string;

  constructor(message: string, sessionId: string) {
    super();
    this.message = message;
    this.sessionId = sessionId;

    // set prototype to enable instanceof checks
    Object.setPrototypeOf(this, SessionActionError.prototype);
  }
}
