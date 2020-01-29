import Product from '../../models/Product';
import connectDb from '../../utils/connectDb';

connectDb();

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      await handlePostRequest(req, res);
      break;
    case 'GET':
      await handleGetRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} is not allowed`);
      break;
  }
};

async function handlePostRequest(req, res) {
  const { productId } = req.body;
  try {
    await Product.findOneAndUpdate({ _id: productId }, { $inc: { numberOfViews: 1 } });
    res.status(200).send('incremented product view');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error incrementing number of product views');
  }
}

async function handleGetRequest(req, res) {
  try {
    // group products by their categories and create an array of products for each category.
    const groupedProducts = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          products: { $push: '$$ROOT' },
        },
      },
    ]);

    const results = groupedProducts.map(group => {
      const sortedProducts = group.products.sort((a, b) => b.numberOfViews - a.numberOfViews);
      const products = sortedProducts.slice(0, 3);
      return {
        _id: group._id,
        products,
      };
    });

    // results.map(result => console.log(result._id + '   ' + `${result.products}`));
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}
