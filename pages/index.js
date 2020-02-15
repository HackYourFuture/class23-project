import React, { useState } from 'react';
import axios from 'axios';
import ProductList from '../components/Index/ProductList';
import ProductPagination from '../components/Index/ProductPagination';
import baseUrl from '../utils/baseUrl';
import { useRouter } from 'next/router';

function Home({ products, totalPages, user }) {
  console.log('user', user);
  const router = useRouter();
  const [category, setcategory] = useState('');

  function selectCategory(e, data) {
    setcategory(data.value);
    router.push(`/?category=${data.value}`);
  }

  return (
    <>
      <ProductList
        products={products}
        user={user}
        selectCategory={selectCategory}
      />
      <ProductPagination totalPages={totalPages} category={category} />
    </>
  );
}

Home.getInitialProps = async ctx => {
  const page = ctx.query.page ? ctx.query.page : '1';
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