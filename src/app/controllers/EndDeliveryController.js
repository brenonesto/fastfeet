import File from '../models/File';
import Courier from '../models/Courier';
import Delivery from '../models/Delivery';

class EndDeliveryController {
  async update(req, res) {
    const { id, delivery_id } = req.query;

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

    if (!req.file) {
      return res.status(401).json({ error: 'No signature found.' });
    }

    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    const end_date = new Date();
    const signature_id = file.id;

    const endedDelivery = await deliveryExists.update({
      end_date,
      signature_id,
    });

    return res.json(endedDelivery);
  }
}

export default new EndDeliveryController();
