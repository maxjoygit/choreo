import express from 'express';

import cors from 'cors';

import * as dotenv from 'dotenv';

dotenv.config();

import apiRouter from './routes/apiRouter.js';

console.log(process.env)

const PORT = process.env.PORT || 8080;

const app = express();

app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(cors());

app.use(express.json({ limit: '512mb' }));

app.use(express.urlencoded({ limit: '512mb', extended: true }));

app.use(function (req, res, next) {
  for (let key in req.query) {
    if ((key.toLowerCase() === key) == false) {
      req.query[key.toLowerCase()] = req.query[key];
      delete req.query[key];
    }
  }
  next();
});

app.get('/', (req, res) => res.json({ error: false, data: 'home!' }));

app.get('/api', (req, res) => res.json({ error: false, data: 'Api home!' }));

app.get('/api/v1', (req, res) =>
  res.json({ error: false, data: 'Api v1 home!' }),
);

app.use('/api/v1/', apiRouter);

app.all('*', (req, res) =>
  res.json({ error: true, status: 404, data: 'Api route not found!' }),
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
