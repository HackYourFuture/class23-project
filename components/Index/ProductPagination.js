import { useRouter } from "next/router";
import { Container, Pagination } from "semantic-ui-react";
import { redirectUser } from "../../utils/auth";

function ProductPagination({ totalPages, category }, ctx) {
  const router = useRouter();

  return (
    <Container textAlign="center" style={{ margin: "2em" }}>
      <Pagination
        defaultActivePage={1}
        totalPages={totalPages}
        onPageChange={(event, data) => {
          if (category) {
            data.activePage === 1
              ? redirectUser(ctx, `/?category=${category}`)
              : redirectUser(ctx, `/?page=${data.activePage}&category=${category}`);
          } else {
            data.activePage === 1
              ? redirectUser(ctx, "/")
              : redirectUser(ctx, `/?page=${data.activePage}`);
          }
        }}
      />
    </Container>
  );
}

export default ProductPagination;
