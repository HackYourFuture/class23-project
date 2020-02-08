import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductList from "../components/Index/ProductList";
import ProductPagination from "../components/Index/ProductPagination";
import baseUrl from "../utils/baseUrl";
import { useRouter } from "next/router";
import {
  Select,
  Flag,
  Container,
  Checkbox,
  Button,
  Icon
} from "semantic-ui-react";

function Home({ products, totalPages, currency }) {
  const [newCurrency, setNewCurrency] = useState(false);
  const router = useRouter();
  const [category, setCategory] = useState("");

  function selectCategory(e, data) {
    setCategory(data.value);
    router.push(`/?category=${data.value}`);
  }

  const handleChange = async () => {
    setNewCurrency(prevState => !prevState);
    await router.push("/");
  };
  useEffect(() => {
    newCurrency
      ? window.localStorage.setItem("currency", "euro")
      : window.localStorage.setItem("currency", "usd");
  }, [newCurrency]);

  return (
    <>
      <Container style={{ marginBottom: "1.5em" }}>
        <Flag name="us" style={{ marginRight: "1em" }} />
        <Checkbox
          checked={currency === "usd" ? false : true}
          onChange={handleChange}
          toggle
        />
        <Flag name="eu" style={{ marginLeft: "1em" }} />
        <Button
          circular
          icon={currency === "usd" ? "dollar" : "euro"}
          color={currency === "usd" ? "green" : "blue"}
          onClick={handleChange}
          style={{ marginLeft: "1em", padding: "0.5em" }}
        />
      </Container>

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
