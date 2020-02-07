import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductList from "../components/Index/ProductList";
import ProductPagination from "../components/Index/ProductPagination";
import baseUrl from "../utils/baseUrl";
import { useRouter } from "next/router";
import { Select } from "semantic-ui-react";

const currencyOptions = [
  { key: "usd", value: "usd", text: "USD" },
  { key: "euro", value: "euro", text: "Euro" }
];

function Home({ products, totalPages, currency }) {
  // const [isCurrency, setIsCurrency] = useState("");
  console.log({ currency });
  const router = useRouter();
  const [category, setCategory] = useState("");
  function selectCategory(e, data) {
    setCategory(data.value);
    router.push(`/?category=${data.value}`);
  }

  const handleChange = async (e, { value }) => {
    window.localStorage.setItem("currency", value);
    // await router.push("/cart");
    await router.push("/");
  };

  return (
    <>
      <Select
        placeholder="Currency"
        options={currencyOptions}
        onChange={handleChange}
      />

      <ProductList
        products={products}
        selectCategory={selectCategory}
        currency={currency}
      />

      <ProductPagination totalPages={totalPages} category={category} />
    </>
  );
}

Home.getInitialProps = async ctx => {
  const page = ctx.query.page ? ctx.query.page : "1";
  const category = ctx.query.category;
  const size = 6;
  const url = `${baseUrl}/api/products`;
  const payload = { params: { page, size, category } };
  // fetch data on server
  const response = await axios.get(url, payload);
  // return response data as an object
  return response.data;
  // note: this object will be merged with existing props
};

export default Home;
