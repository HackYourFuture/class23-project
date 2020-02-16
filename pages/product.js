import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductSummary from "../components/Product/ProductSummary";
import ProductAttributes from "../components/Product/ProductAttributes";
import AddCommentToProduct from "../components/Product/AddCommentToProduct";
import CommentPagination from "../components/Product/CommentPagination";
import baseUrl from "../utils/baseUrl";
import AddProductSuggestions from "../components/Product/AddProductSuggestions";

function Product({ product, user, totalComments, topSuggestedProducts, currency }) {
  const [displayedProduct, setDisplayedProduct] = useState(product);
  const [displayedTotalComments, setDisplayedTotalComments] = useState(
    totalComments
  );

  function handleNewComment({
    totalComments: newTotalComments,
    product: newProduct
  }) {
    setDisplayedProduct(newProduct);
    setDisplayedTotalComments(newTotalComments);
  }

  useEffect(() => {
    async function incrementProductView() {
      const url = `${baseUrl}/api/view`;
      const payload = { productId: product._id };
      await axios.post(url, payload);
    }
    incrementProductView();

    setDisplayedProduct(product);
    setDisplayedTotalComments(totalComments);
  }, [product, totalComments]);

  return (
    <>
      <ProductSummary user={user} {...displayedProduct} currency={currency} />
      <ProductAttributes user={user} {...displayedProduct} />
      <AddProductSuggestions
        topSuggestedProducts={topSuggestedProducts}
        {...displayedProduct}
      />
      <AddCommentToProduct
        user={user}
        product={displayedProduct}
        handleNewComment={handleNewComment}
      />
      {displayedTotalComments > 0 && (
        <CommentPagination
          productId={product._id}
          totalPages={displayedTotalComments}
        />
      )}
    </>
  );
}

Product.getInitialProps = async ({ query: { _id, page } }) => {
  const url = `${baseUrl}/api/product`;
  const payload = { params: { _id, page } };
  const response = await axios.get(url, payload);
  return response.data;
};

export default Product;
