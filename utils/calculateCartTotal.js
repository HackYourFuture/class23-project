function calculateCartTotal(products, voucherCode) {
  let discountedAmount = 0, discountAmountEuro = 0;
  const total = products.reduce((acc, el) => {
    acc += el.product.price * el.quantity;
    if (el.discount && el.discountApplied) {
      acc -= el.discountAmount;
      discountedAmount += el.discountAmount;
    }
    return acc;
  }, 0);
  const totalEuro = products.reduce((acc, el) => {
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
      discountedAmount += total;
      discountAmountEuro += totalEuro;
      total = 0;
      totalEuro = 0;
    } else {
      const discount = total - voucherCode.amount;
      const discountEuro = totalEuro - voucherCode.amountEuro;
      discountedAmount += discount;
      total -= discount;
      discountAmountEuro += discountEuro;
      totalEuro -= discountEuro;
    }
  }

  const cartTotal = ((total * 100) / 100).toFixed(2);
  const cartTotalEuro = ((totalEuro * 100) / 100).toFixed(2);

  const stripeTotal = Number((total * 100).toFixed(2));
  const stripeTotalEuro = Number((totalEuro * 100).toFixed(2));

  discountedAmount = discountedAmount > 0 ? discountedAmount.toFixed(2) : null;
  discountAmountEuro = discountAmountEuro > 0 ? discountAmountEuro.toFixed(2) : null;
  return { cartTotal, stripeTotal, cartTotalEuro, stripeTotalEuro, discountAmount, discountAmountEuro };
}

export default calculateCartTotal;
