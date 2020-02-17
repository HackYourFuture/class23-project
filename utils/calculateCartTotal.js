function calculateCartTotal(products) {
  const total = products.reduce((acc, el) => {
    acc += el.product.price * el.quantity;
    if (el.discount && el.discountApplied) {
      acc -= el.discountAmount;
    }
    return acc;
  }, 0);
  const totalEuro = products.reduce((acc, el) => {
    acc += el.product.priceEuro ? el.product.priceEuro * el.quantity : el.product.price * el.quantity;
    return acc;
  }, 0);
  const cartTotal = ((total * 100) / 100).toFixed(2);
  const cartTotalEuro = ((totalEuro * 100) / 100).toFixed(2);

  const stripeTotal = Number((total * 100).toFixed(2));
  const stripeTotalEuro = Number((totalEuro * 100).toFixed(2));

  return { cartTotal, stripeTotal, cartTotalEuro, stripeTotalEuro };
}

export default calculateCartTotal;
