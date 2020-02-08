import * as Yup from 'yup';
import { Op } from 'sequelize';
import Courier from '../models/Courier';
import Delivery from '../models/Delivery';

class CourierController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    const { email } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const courierExists = await Courier.findOne({ where: { email } });

    if (courierExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const courier = await Courier.create(req.body);

    return res.json(courier);
  }

  async index(req, res) {
    const couriers = await Courier.findAll();

    return res.json(couriers);
  }

  async show(req, res) {
    const { id } = req.params;

    const { delivered } = req.query;

    const courier = await Courier.findByPk(id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier does not exist.' });
    }

    const deliveries = await Delivery.findAll({
      where: { courier_id: id, end_date: null, canceled_at: null },
    });

    if (delivered) {
      const endedDeliveries = await Delivery.findAll({
        where: { courier_id: id, end_date: { [Op.ne]: null } },
      });

      return res.json(endedDeliveries);
    }

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const courierExists = await Courier.findByPk(id);

    if (!courierExists) {
      return res.status(400).json({ error: 'Courier does not exist.' });
    }

    const courier = await courierExists.update(req.body);

    return res.json(courier);
  }

  async delete(req, res) {
    const { id } = req.params;

    const existCourier = await Courier.findByPk(id);

    if (!existCourier) {
      return res.status(400).json({ error: 'The courier does not exist' });
    }

    existCourier.destroy();

    return res.json({
      message: `You have deleted the courier with the id ${id}`,
    });
  }
}

export default new CourierController();
