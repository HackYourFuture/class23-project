import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Comment,
  Form,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import formatDate from "../../utils/formatDate";
import catchErrors from "../../utils/catchErrors";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import { useRouter } from "next/router";
import { redirectUser } from "../../utils/auth";

export default function AddCommentToProduct({
  user,
  product,
  handleNewComment
}, ctx) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = React.useState("");
  const [commentCol, setCommentCol] = React.useState(product.comments);

  const router = useRouter();

  function handleChange(event) {
    const { value } = event.target;
    setComment(value);
  }

  async function handleDelete(id) {
    const filteredComments = product.comments.filter(c => id !== c._id);
    setCommentCol(filteredComments);
    try {
      setLoading(true);
      setError("");
      setSuccess('');
      const token = cookie.get("token");
      const url = `${baseUrl}/api/product`;
      const headers = { Authorization: token };
      const params = { _id: product._id, commentId: id };
      const response = await axios.delete(url, { params, headers });
      setSuccess(response.data);
      console.log(response.data);
    } catch (error) {
      catchErrors(error, setError);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      redirectUser(ctx, "/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess('');
      const url = `${baseUrl}/api/product`;
      const token = cookie.get("token");
      const payload = { comment, productId: product._id };
      const headers = { Authorization: token };
      const response = await axios.put(url, payload, { headers });
      // { totalComments, product }
      setComment("");
      handleNewComment(response.data);
      setCommentCol(response.data.product.comments);
      setSuccess('Thank you for comment!');
    } catch (error) {
      catchErrors(error, setError);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Comment.Group minimal>
        <Form
          reply
          onSubmit={handleSubmit}
          loading={loading}
          error={Boolean(error)}
          success={Boolean(success)}
        >
          <Message error header="Oops!" content={error} />
          <Message
            success
            header="Success"
            content={success}
          />
          <Form.TextArea
            name="content"
            onChange={handleChange}
            value={comment}
          />
          {user ? (
            <Button
              type="submit"
              content="Add Comment"
              labelPosition="left"
              icon="edit"
              primary
              disabled={loading || !comment.trim()}
            />
          ) : (
              <Button
                color="orange"
                content="Login to Add Comments"
                icon="sign in"
                onClick={() => redirectUser(ctx, "/login")}
              />
            )}
        </Form>
        {product.comments && product.comments.length > 0 && (
          <>
            <Header as="h3" dividing>
              Comments
            </Header>
            {commentCol
              .filter(c => c.user !== null)
              .map(comment => (
                <Comment key={`comment_id ${comment._id}`}>
                  <Comment.Content>
                    <Comment.Author as="span">
                      {comment.user.name}
                    </Comment.Author>
                    <Comment.Metadata>
                      <span>{formatDate(comment.updated_at)}</span>
                    </Comment.Metadata>
                    {user && comment.user._id === user._id ? (
                      <Comment.Actions>
                        <Comment.Action
                          onClick={() => handleDelete(comment._id)}
                        >
                          <Icon name="delete" />
                          Delete
                        </Comment.Action>
                      </Comment.Actions>
                    ) : (
                        ""
                      )}

                    <Comment.Text>{comment.content}</Comment.Text>
                  </Comment.Content>
                </Comment>
              ))}
          </>
        )}
      </Comment.Group>
    </>
  );
}