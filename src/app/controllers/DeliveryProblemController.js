import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Recipient from '../models/Recipient';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { description } = req.body;
    const delivery_id = req.params.id;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist. ' });
    }

    const problem = await DeliveryProblem.create({ delivery_id, description });

    return res.json(problem);
  }

  async index(req, res) {
    const problems = await DeliveryProblem.findAll({
      order: ['id'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'courier_id'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'street', 'number', 'state', 'city'],
            },
          ],
        },
      ],
    });

    if (!problems) {
      return res.status(400).json({ error: 'There are no delivery problems.' });
    }

    return res.json(problems);
  }

  async show(req, res) {
    const { id } = req.params;

    const problemExist = await DeliveryProblem.findOne({
      where: { delivery_id: id },
    });

    const problems = await DeliveryProblem.findAll({
      where: { delivery_id: id },
      order: ['id'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'courier_id'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'street', 'number', 'state', 'city'],
            },
          ],
        },
      ],
    });

    if (!problemExist) {
      return res
        .status(400)
        .json({ error: 'There is no problem registered for this delivery.' });
    }

    return res.json(problems);
  }

  async delete(req, res) {
    const { id } = req.params;

    const problemExist = await DeliveryProblem.findByPk(id);

    if (!problemExist) {
      return res
        .status(400)
        .json({ error: 'There is no problem registered for this delivery' });
    }

    const { delivery_id } = problemExist;

    const delivery = await Delivery.findByPk(delivery_id);

    delivery.canceled_at = new Date();

    await delivery.save();

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
