const fnlog = (fn: (message) => void) => (message) => {
  const now = new Date().toISOString();
  fn(`${now} - ${message}`);
};

const fnWarn = fnlog(console.log);
const fnError = fnlog(console.error);

fnWarn('Warn');
fnError('Error');
