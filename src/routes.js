import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import CourierController from './app/controllers/CourierController';
import DeliveryController from './app/controllers/DeliveryController';
import StartDeliveryController from './app/controllers/StartDeliveryController';
import EndDeliveryController from './app/controllers/EndDeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/couriers', CourierController.store);
routes.get('/couriers', CourierController.index);
routes.get('/couriers/:id/deliveries', CourierController.show);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/start', StartDeliveryController.update);
routes.put(
  '/deliveries/end',
  upload.single('file'),
  EndDeliveryController.update
);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.post('/deliveries/:id/problems', DeliveryProblemController.store);
routes.get('/deliveries/problems', DeliveryProblemController.index);
routes.get('/deliveries/:id/problems', DeliveryProblemController.show);
routes.delete('/problem/:id/cancel-delivery', DeliveryProblemController.delete);

export default routes;
