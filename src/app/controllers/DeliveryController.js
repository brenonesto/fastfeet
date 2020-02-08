import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';

import Mail from '../../lib/Mail';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { product, recipient_id, courier_id } = req.body;

    const recipientExist = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipientExist) {
      return res.status(400).json({ error: 'Recipient does not exist ' });
    }

    const courierExist = await Courier.findOne({ where: { id: courier_id } });

    if (!courierExist) {
      return res.status(400).json({ error: 'Courier does not exist ' });
    }

    const delivery = await Delivery.create(req.body);

    await Mail.sendMail({
      to: `${courierExist.name} <${courierExist.email}>`,
      subject: 'Nova entrega',
      template: 'newdelivery',
      context: {
        courier: courierExist.name,
        name: product,
      },
    });

    return res.json(delivery);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryExists = await Delivery.findByPk(id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery does not exist.' });
    }

    if (deliveryExists.canceled_at) {
      return res
        .status(401)
        .json({ error: 'Delivery has already been canceled.' });
    }

    if (deliveryExists.end_date) {
      return res
        .status(401)
        .json({ error: 'Delivery has already been delivered.' });
    }

    deliveryExists.canceled_at = new Date();

    await deliveryExists.save();

    return res.json(deliveryExists);
  }
}

export default new DeliveryController();
