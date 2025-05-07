class TimeLogger {
  constructor(private logger: (message: string) => void) {}

  log(mess: string) {
    const now = new Date().toISOString();
    this.logger(`${now} ${mess}`);
  }
}

const logWarn = new TimeLogger(console.warn);
const logError = new TimeLogger(console.error);

logWarn.log("Warn");
logError.log("Error");
