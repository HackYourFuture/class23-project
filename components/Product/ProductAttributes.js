import React from "react";
import { Header, Button, Modal, Icon, Form, Message } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "../../utils/baseUrl";
import { useRouter } from "next/router";
import catchErrors from "../../utils/catchErrors";

function ProductAttributes({ description, _id, user }) {
  const [modal, setModal] = React.useState(false);
  const [productDescription, setProductDescription] = React.useState(
    description
  );
  const [newDescription, setNewDescription] = React.useState({});
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const router = useRouter();
  const isRoot = user && user.role === "root";
  const isAdmin = user && user.role === "admin";
  const isRootOrAdmin = isRoot || isAdmin;

  async function handleDelete() {
    const url = `${baseUrl}/api/product`;
    const payload = { params: { _id } };
    await axios.delete(url, payload);
    router.push("/");
  }

  const setUpdateFields = (updateField, updatedProduct) => {
    if ("description" in updateField) {
      setProductDescription(updatedProduct.description);
    }
  };

  const handleUpdate = async updatedField => {
    try {
      if (Object.keys(updatedField).length === 0) {
        throw new Error("Please enter new/valid value");
      } else {
        const url = `${baseUrl}/api/product`;
        const payload = { updateField: updatedField, productId: _id };
        const token = cookie.get("token");
        const headers = { Authorization: token };
        const response = await axios.put(url, payload, { headers });
        const { updatedProduct } = response.data;
        setError("");
        setSuccess(true);
        setUpdateFields(updatedField, updatedProduct);
      }
    } catch (error) {
      setSuccess(false);
      catchErrors(error, setError);
    }
  };

  return (
    <>
      <Header as="h3">
        About this product
        {/* Update Description */}
        {isRootOrAdmin && (
          <>
            <Modal
              trigger={
                <Button style={{ background: "white" }}>
                  <Icon name="pencil" size="medium" color="black" />
                </Button>
              }
              closeOnDimmerClick={false}
              closeIcon
              dimmer="blurring"
              size="small"
              stackable
              closeOnEscape
              style={{ transform: "translateY(-50%)" }}
              onClose={() => {
                setSuccess(false);
                setError("");
                setNewDescription({});
              }}
            >
              <Modal.Header>Description</Modal.Header>
              <Modal.Content scrolling>
                {!success && (
                  <Form size="big">
                    <Form.TextArea
                      name="name"
                      defaultValue={productDescription}
                      style={{ height: 200 }}
                      onChange={e => {
                        if (productDescription !== e.target.value)
                          setNewDescription({
                            description: `${e.target.value.trim()}`
                          });
                      }}
                    />
                  </Form>
                )}
                {error && (
                  <Label basic color="red" pointing="left">
                    {error}
                  </Label>
                )}
                {success && (
                  <Message color="green">
                    Product description updated successfully
                  </Message>
                )}
              </Modal.Content>
              <Modal.Actions>
                {!success && (
                  <Button
                    color="orange"
                    icon="check"
                    content="Update"
                    onClick={() => handleUpdate(newDescription)}
                  />
                )}
              </Modal.Actions>
            </Modal>
          </>
        )}
      </Header>
      <p>{productDescription}</p>

      {/* Delete Product */}
      {isRootOrAdmin && (
        <>
          <Button
            icon="trash alternate outline"
            color="red"
            content="Delete Product"
            onClick={() => setModal(true)}
          />
          <Modal open={modal} dimmer="blurring">
            <Modal.Header>Confirm Delete</Modal.Header>
            <Modal.Content>
              <p>Are you sure you want to delete this product?</p>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => setModal(false)} content="Cancel" />
              <Button
                negative
                icon="trash"
                labelPosition="right"
                content="Delete"
                onClick={handleDelete}
              />
            </Modal.Actions>
          </Modal>
        </>
      )}
    </>
  );
}

export default ProductAttributes;
