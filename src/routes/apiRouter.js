import { Router } from 'express';

import mw from '../middlewares/mw.js';

import ApiController from '../controllers/ApiController.js';

const apiController = new ApiController();

const apiRouter = new Router();

apiRouter.post('/crons', mw?.authApp, apiController?.addCron);

apiRouter.get('/crons/:cron_id', mw?.authApp, apiController?.getCron);

apiRouter.get('/crons', mw?.authApp, apiController?.getCrons);

apiRouter.put('/crons/:cron_id', mw?.authApp, apiController?.updateCron);

apiRouter.put('/crons', mw?.authApp, apiController?.updateCrons);

apiRouter.delete('/crons/:cron_id', mw?.authApp, apiController?.deleteCron);

apiRouter.delete('/crons', mw?.authApp, apiController?.deleteCrons);

apiRouter.get('/supabase', apiController?.supabase);

apiRouter.get('/cf', apiController?.cf);

apiRouter.get('/run', apiController?.run);

apiRouter.get('/createtable', apiController?.createTable);

apiRouter.get('/createtabletoken', apiController?.createTableToken);

apiRouter.get('/app', apiController?.app);

apiRouter.get('/test', apiController?.test);

export default apiRouter;
