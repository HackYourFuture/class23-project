import { useRouter } from "next/router";
import { Container, Pagination } from "semantic-ui-react";
import { redirectUser } from '../../utils/auth'

function CommentPagination({ productId, totalPages }, ctx) {
  const router = useRouter();
  return (
    <Container textAlign="center" style={{ margin: "2em" }}>
      <Pagination
        defaultActivePage={1}
        totalPages={totalPages}
        onPageChange={(event, data) => {
          data.activePage === 1
            ? redirectUser(ctx, `/product?_id=${productId}`)
            : redirectUser(ctx, `/product?_id=${productId}&page=${data.activePage}`)
        }}
      />
    </Container>
  );
}

export default CommentPagination;