export const UNIT_TYPES = {
  product: "product",
  category: "category"
};

export function checkDiscountIsOK(discount) {
  // Main controllers
  const { multipleUnits, unitType } = discount;
  // Every discount has a percentage and dates
  const { discountPercentage, startDate, endDate } = discount;
  // Conditional variables
  const { requiredAmount, product, category, products, categories } = discount;
  // For time comparisons
  const now = new Date().getUTCMilliseconds(),
    start = new Date(startDate).getUTCMilliseconds(),
    end = new Date(endDate).getUTCMilliseconds(),
    oneDayMilliseconds = 24 * 60 * 60 * 100;
  const hasDiscountPercentage =
    discountPercentage &&
    !Number.isNaN(Number(discountPercentage)) &&
    discountPercentage > 0 &&
    discountPercentage <= 100,
    atLeastStartsToday = now - start < oneDayMilliseconds && now - start >= 0,
    startsAtFuture = start >= now,
    endsAfterStart = start <= end,
    atLeastEndsToday = now - end < oneDayMilliseconds && now - end >= 0,
    endsAtFuture = end >= now,
    isRequiredAmountProvided =
      requiredAmount &&
      !Number.isNaN(Number(requiredAmount)) &&
      requiredAmount > 0,
    isSingleUnitSpectrum = !multipleUnits,
    isProductUnitType = unitType === UNIT_TYPES.product,
    isProductSelected = Boolean(product),
    isCategoryUnitType = unitType === UNIT_TYPES.category,
    isCategorySelected = Boolean(category),
    isMultipleUnitSpectrum = multipleUnits,
    hasAnyProductsAdded = Boolean(products) && products.length > 0,
    hasAnyCategoriesAdded = Boolean(categories) && categories.length > 0;

  const isDiscountOK =
    hasDiscountPercentage &&
    (atLeastStartsToday || startsAtFuture) &&
    endsAfterStart &&
    (atLeastEndsToday || endsAtFuture) &&
    ((isSingleUnitSpectrum && isRequiredAmountProvided) ||
      isMultipleUnitSpectrum) &&
    ((isSingleUnitSpectrum &&
      ((isProductUnitType && isProductSelected) ||
        (isCategoryUnitType && isCategorySelected))) ||
      (isMultipleUnitSpectrum &&
        ((isProductUnitType && hasAnyProductsAdded) ||
          (isCategoryUnitType && hasAnyCategoriesAdded))));

  return isDiscountOK;
}

export function getRequiredPropsListForDiscount(discount) {
  // Main controllers
  const { multipleUnits, unitType } = discount;

  const requiredProps = [];

  // Main controllers are must
  requiredProps.push("multipleUnits", "unitType");
  // Every discounts common props
  requiredProps.push("discountPercentage", "startDate", "endDate");
  if (multipleUnits) {
    if (unitType === UNIT_TYPES.product) requiredProps.push("products");
    else requiredProps.push("categories");
  } else {
    requiredProps.push("requiredAmount");
    if (unitType === UNIT_TYPES.product) requiredProps.push("product");
    else requiredProps.push("category");
  }

  return requiredProps;
}

export function checkDiscountForRequiredProps(discount) {
  const requiredProps = getRequiredPropsListForDiscount(discount);
  const notFoundProps = requiredProps
    .reduce((notFoundOnes, prop) => {
      if (discount[prop] !== undefined || discount[prop] !== null) return notFoundOnes;
      else return [...notFoundOnes, prop];
    }, [])
    .join(",");
  if (notFoundProps)
    throw new Error(`Missing required field(s): ${notFoundProps}`);
  else return true;
}

export function isDiscountStarted(discount) {
  const now = new Date().getUTCMilliseconds(),
    start = new Date(discount.startDate).getUTCMilliseconds(),
    oneDayMilliseconds = 24 * 60 * 60 * 100,
    atLeastStartsToday = now - start < oneDayMilliseconds && now - start >= 0;
  return atLeastStartsToday;
}

export function isDiscountExpired(discount) {
  const now = new Date().getUTCMilliseconds(),
    start = new Date(discount.startDate).getUTCMilliseconds(),
    end = new Date(discount.endDate).getUTCMilliseconds(),
    oneDayMilliseconds = 24 * 60 * 60 * 100,
    endsAfterStart = start <= end,
    atLeastEndsToday = now - end < oneDayMilliseconds && now - end >= 0,
    endsAtFuture = end >= now;
  return !(endsAfterStart && (atLeastEndsToday || endsAtFuture));
}

export function productPhrase(product, productDiscount, productAmount = 1) {
  return `Buy at least ${productAmount} "${product.name}" for %${productDiscount} off!`;
}

export function productsPhrase(arr, productDiscount, productAmount = 1) {
  return arr.reduce(function (prev, current, index, array) {
    let string = `Buy at least ${productAmount} `;
    if (index === 0) {
      return (string += current.name);
    } else if (index === array.length - 1) {
      return (
        prev + " and " + current.name + " for %" + productDiscount + " off!"
      );
    } else {
      return prev + ", " + current.name;
    }
  }, "");
}

export function categoryPhrase(category, categoryDiscount, categoryAmount = 1) {
  return `Buy at least ${categoryAmount} product(s) from ${category} for %${categoryDiscount} off!`;
}

export function categoriesPhrase(arr, categoryDiscount, categoryAmount = 1) {
  return arr.reduce(function (prev, current, index, array) {
    let string = `Buy at least ${categoryAmount} product from `;
    if (index === 0) {
      return (string += current);
    } else if (index === array.length - 1) {
      return (
        prev +
        " and " +
        current +
        " categories for %" +
        categoryDiscount +
        " off!"
      );
    } else {
      return prev + ", " + current;
    }
  }, "");
}

export function calculateDiscount(price, discount) {
  const discountToCalculate = discount / 100;
  const diff = price * discountToCalculate;
  const newPrice = price - diff;
  return newPrice.toFixed();
}

export function calculateEndingTime(start, end) {
  const startingTime = new Date(start).toLocaleDateString("en-US");
  const endingTime = new Date(end).toLocaleDateString("en-US");
  const diffTime = Math.abs(endingTime - startingTime);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
