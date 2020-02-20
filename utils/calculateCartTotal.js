function calculateCartTotal(products, voucherCode) {
  let discountAmount = 0, discountAmountEuro = 0;
  let total = products.reduce((acc, el) => {
    acc += el.product.price * el.quantity;
    if (el.discount && el.discountApplied) {
      acc -= el.discountAmount;
      discountAmount += el.discountAmount;
    }
    return acc;
  }, 0);
  let totalEuro = products.reduce((acc, el) => {
    acc += el.product.priceEuro * el.quantity;
    if (el.discount && el.discountApplied) {
      const discount = (el.product.priceEuro * el.discount.discountPercentage) / 100
      acc -= discount;
      discountAmountEuro += discount;
    }
    return acc;
  }, 0);

  if (voucherCode && voucherCode.amount) {
    if (voucherCode.amount >= total) {
      discountAmount += total;
      discountAmountEuro += totalEuro;
      total = 0;
      totalEuro = 0;
    } else {
      const discount = voucherCode.amount;
      const discountEuro = voucherCode.amountEuro;
      discountAmount += discount;
      total -= discount;
      discountAmountEuro += discountEuro;
      totalEuro -= discountEuro;
    }
  }

  const cartTotal = ((total * 100) / 100).toFixed(2);
  const cartTotalEuro = ((totalEuro * 100) / 100).toFixed(2);

  const stripeTotal = Number((total * 100).toFixed(2));
  const stripeTotalEuro = Number((totalEuro * 100).toFixed(2));

  discountAmount = discountAmount > 0 ? discountAmount.toFixed(2) : null;
  discountAmountEuro = discountAmountEuro > 0 ? discountAmountEuro.toFixed(2) : null;
  return { cartTotal, stripeTotal, cartTotalEuro, stripeTotalEuro, discountAmount, discountAmountEuro };
}

export default calculateCartTotal;
