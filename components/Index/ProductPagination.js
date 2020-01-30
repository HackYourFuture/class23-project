import { useRouter } from "next/router";
import { Container, Pagination } from "semantic-ui-react";

function ProductPagination({ totalPages, category }) {
  const router = useRouter();

  return (
    <Container textAlign="center" style={{ margin: "2em" }}>
      <Pagination
        defaultActivePage={1}
        totalPages={totalPages}
        onPageChange={(event, data) => {
          if (category) {
            data.activePage === 1
              ? router.push(`/?category=${category}`)
              : router.push(`/?page=${data.activePage}&category=${category}`);
          } else {
            data.activePage === 1
              ? router.push("/")
              : router.push(`/?page=${data.activePage}`);
          }
        }}
      />
    </Container>
  );
}

export default ProductPagination;
