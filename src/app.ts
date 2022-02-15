import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import { router } from './routes';
import swaggerFile from './swagger.json';

const app = express();

app.use(express.json());

app.use(router);

app.use(
  (err: Error, request: Request, response: Response, next: NextFunction) => {
    return response.status(500).json({
      status: 'error',
      message: `Internal server error - ${err.message}`,
    });
  }
);

app.use('/api_docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(3333, () => console.info('Server is running'))