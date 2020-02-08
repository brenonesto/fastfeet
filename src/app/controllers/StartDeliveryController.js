import * as Yup from 'yup';
import { Op } from 'sequelize';
import { endOfDay, getHours, startOfDay } from 'date-fns';

import Delivery from '../models/Delivery';
import Courier from '../models/Courier';

class StartDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
      delivery_id: Yup.number().required(),
    });

    const { id, delivery_id } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const courierExists = await Courier.findByPk(id);

    if (!courierExists) {
      return res.status(401).json({ error: 'Courier does not exists. ' });
    }

    const deliveryExists = await Delivery.findByPk(delivery_id);

    if (!deliveryExists) {
      return res.status(401).json({ error: 'Delivery does not exists. ' });
    }

    if (deliveryExists.canceled_at || deliveryExists.end_date) {
      return res.status(401).json({ error: 'Delivery has already ended' });
    }

    if (deliveryExists.start_date) {
      return res.status(401).json({ error: 'Delivery has already started' });
    }

    const start_date = new Date();

    if (getHours(start_date) < 8 || getHours(start_date) > 18) {
      return res.status(400).json({
        error: 'You can only withdraw deliveries from 8:00 to 18:00 ',
      });
    }

    const count = await Delivery.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
        courier_id: id,
        canceled_at: null,
        end_date: null,
      },
    });

    if (count >= 5) {
      return res
        .status(400)
        .json({ error: 'The courier can not withdraw more deliveries today.' });
    }

    const updatedDelivery = await deliveryExists.update({ start_date });

    return res.json(updatedDelivery);
  }
}

export default new StartDeliveryController();
