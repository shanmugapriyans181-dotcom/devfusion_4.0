import app from './app';
import { config } from './config/env.config';
import { logger } from './utils/logger.util';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 HireAI ATS Backend Server running on port ${PORT} [${config.nodeEnv}]`);
});
