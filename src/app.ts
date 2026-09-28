import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { logger } from "./config/logger.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
          };
        },
      },
    }),
  );

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
