function calculateCartTotal(products, code) {
  let total = 0;
  console.log(code);
  if (code.length > 1) {
    total = products.reduce((acc, el) => {
      acc += el.product.discountedPrice * el.quantity;
      return acc;
    }, 0);
  } else {
    total = products.reduce((acc, el) => {
      acc += el.product.price * el.quantity;
      return acc;
    }, 0);
  }
  const cartTotal = ((total * 100) / 100).toFixed(2);
  const stripeTotal = Number((total * 100).toFixed(2));
  return { cartTotal, stripeTotal };
}

export default calculateCartTotal;
