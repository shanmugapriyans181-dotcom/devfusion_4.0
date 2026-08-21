import express, { Application } from 'express';
import { cors, helmet, cookieParser } from './middleware/expressMiddleware';
import { config } from './config/env.config';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api', routes);

app.use(errorHandler);

export default app;
