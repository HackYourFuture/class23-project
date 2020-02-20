import React from "react";
import ProductCreation from "../components/Create/ProductCreation";
import CreateDiscount from "../components/Create/CreateDiscount";
import baseUrl from "../utils/baseUrl";
import axios from "axios";
import CreateCoupon from "../components/Create/CreteCoupon";

function CreateProduct({ products }) {
  console.log(products);
  return (
    <>
      <ProductCreation />
      <CreateDiscount products={products} />
      <CreateCoupon />
    </>
  );
}

CreateProduct.getInitialProps = async ctx => {
  const url = `${baseUrl}/api/products`;

  const response = await axios.get(url);

  return response.data;
};

export default CreateProduct;
