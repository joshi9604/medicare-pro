const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = LEVELS[String(process.env.LOG_LEVEL || 'info').toLowerCase()] ?? LEVELS.info;

const shouldLog = (level) => LEVELS[level] <= currentLevel;

const timestamp = () => new Date().toISOString();

const write = (level, message, meta) => {
  if (!shouldLog(level)) return;

  const line = `[${timestamp()}] ${level.toUpperCase().padEnd(5)} ${message}`;
  const output = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  if (meta === undefined || meta === null || meta === '') {
    output(line);
    return;
  }

  output(line, meta);
};

const maskEmail = (email = '') => {
  const [name, domain] = String(email).split('@');
  if (!name || !domain) return 'unknown';

  const visible = name.length <= 2 ? name[0] : name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - visible.length, 2))}@${domain}`;
};

module.exports = {
  error: (message, meta) => write('error', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  info: (message, meta) => write('info', message, meta),
  debug: (message, meta) => write('debug', message, meta),
  maskEmail
};
