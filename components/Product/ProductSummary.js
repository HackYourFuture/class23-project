import React from "react";
import {
  Item,
  Label,
  Rating,
  Icon,
  Button,
  Modal,
  Input,
  Message,
  Image,
  Segment
} from "semantic-ui-react";
import calculateRatingMedian from "../../utils/calculateRatingMedian";
import AddProductToCart from "./AddProductToCart";
import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "../../utils/baseUrl";
import { useRouter } from "next/router";
import catchErrors from "../../utils/catchErrors";
import { isDiscountStarted, isDiscountExpired } from "../../utils/discount";
import { redirectUser } from '../../utils/auth';


function ProductSummary({
  name,
  mediaUrl,
  _id,
  price,
  priceEuro,
  sku,
  user,
  ratings,
  currency,
  discount
}, ctx) {
  console.log(currency);
  const [ratingAmount, setRatingAmount] = React.useState(0);
  const [productName, setProductName] = React.useState(name);
  const [productPrice, setProductPrice] = React.useState(price);
  const [productMediaUrl, setProductMediaUrl] = React.useState(mediaUrl);
  const [newName, setNewName] = React.useState({});
  const [newPrice, setNewPrice] = React.useState({});
  const [newMediaUrl, setNewMediaUrl] = React.useState({});
  const [mediaPreview, setMediaPreview] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const avrRating = calculateRatingMedian(ratings);
    setRatingAmount(avrRating);
  }, [ratings]);

  const setUpdateFields = (updateField, updatedProduct) => {
    if ("name" in updateField) {
      setProductName(updatedProduct.name);
    } else if ("price" in updateField) {
      setProductPrice(updatedProduct.price);
    } else {
      setProductMediaUrl(updatedProduct.mediaUrl);
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

  async function handleImageUpload(imageFile) {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", process.env.CLOUDINARY_CLOUD_NAME);
    const response = await axios.post(process.env.CLOUDINARY_URL, data);
    const mediaUrl = response.data.url;
    return mediaUrl;
  }

  async function handleChange(event) {
    setError("");
    const { files } = event.target;
    const mediaUrl = await handleImageUpload(files[0]);
    setNewMediaUrl({ mediaUrl });
    setMediaPreview(window.URL.createObjectURL(files[0]));
  }

  console.log({ discount });

  return (
    <>
      <Item.Group>
        <Item>
          <div>
            {user && (user.role === "admin" || user.role === "root") && (
              <Modal
                size="tiny"
                trigger={
                  <Button icon="image" circular color="teal" floated="left" />
                }
                closeOnDimmerClick={false}
                closeIcon
                onClose={() => {
                  setSuccess(false);
                  setError("");
                  setMediaPreview("");
                  setNewMediaUrl({});
                }}
              >
                <Modal.Content>
                  {!success && (
                    <>
                      <Label
                        as="label"
                        basic
                        htmlFor="upload"
                        style={{ padding: "0" }}
                      >
                        <Button
                          color="teal"
                          icon="upload"
                          label={{
                            basic: true,
                            content: "Upload image"
                          }}
                          labelPosition="right"
                          style={{ margin: "0" }}
                        />
                        <input
                          hidden
                          id="upload"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                        />
                      </Label>
                      {error && (
                        <Label basic color="red" pointing="left">
                          {error}
                        </Label>
                      )}
                      <Image src={mediaPreview} rounded centered size="tiny" />
                    </>
                  )}
                  {success && (
                    <Message color="green">
                      Product picture updated successfully
                    </Message>
                  )}
                </Modal.Content>
                <Modal.Actions>
                  {!success && (
                    <Button
                      color="orange"
                      icon="check"
                      content="Update"
                      onClick={() => handleUpdate(newMediaUrl)}
                    />
                  )}
                </Modal.Actions>
              </Modal>
            )}
            <Item.Image size="medium" src={productMediaUrl} />
          </div>
          <Item.Content>
            <Item.Header>
              {productName}
              {user && (user.role === "admin" || user.role === "root") && (
                <Modal
                  trigger={
                    <Button style={{ background: "white" }}>
                      <Icon name="pencil" />
                    </Button>
                  }
                  closeOnDimmerClick={false}
                  closeIcon
                  onClose={() => {
                    setSuccess(false);
                    setError("");
                    setNewName({});
                  }}
                >
                  <Modal.Content>
                    {!success && (
                      <Input
                        defaultValue={productName}
                        onChange={e => {
                          if (productName !== e.target.value)
                            setNewName({ name: `${e.target.value}` });
                        }}
                      />
                    )}
                    {error && (
                      <Label basic color="red" pointing="left">
                        {error}
                      </Label>
                    )}
                    {success && (
                      <Message color="green">
                        Product name updated successfully
                      </Message>
                    )}
                  </Modal.Content>
                  <Modal.Actions>
                    {!success && (
                      <Button
                        color="orange"
                        icon="check"
                        content="Update"
                        onClick={() => handleUpdate(newName)}
                      />
                    )}
                  </Modal.Actions>
                </Modal>
              )}
            </Item.Header>
            <Item.Description>
              <div>
                {!currency || currency === "usd" ? (
                  <p>${price.toFixed(2)}</p>
                ) : (
                    <p>&euro;{priceEuro.toFixed(2)}</p>
                  )}
                {user && (user.role === "admin" || user.role === "root") && (
                  <Modal
                    size="tiny"
                    trigger={
                      <Button style={{ background: "white" }}>
                        <Icon name="pencil" />
                      </Button>
                    }
                    closeOnDimmerClick={false}
                    closeIcon
                    onClose={() => {
                      setSuccess(false);
                      setError("");
                      setNewPrice({});
                    }}
                  >
                    <Modal.Content>
                      {!success && (
                        <Input
                          defaultValue={productPrice}
                          min="0.00"
                          step="0.01"
                          type="number"
                          onChange={e => {
                            if (productPrice !== e.target.value)
                              setNewPrice({ price: `${e.target.value}` });
                          }}
                        />
                      )}
                      {error && (
                        <Label basic color="red" pointing="left">
                          {error}
                        </Label>
                      )}
                      {success && (
                        <Message color="green">
                          Product price updated successfully
                        </Message>
                      )}
                    </Modal.Content>
                    <Modal.Actions>
                      {!success && (
                        <Button
                          color="orange"
                          icon="check"
                          content="Update"
                          onClick={() => handleUpdate(newPrice)}
                        />
                      )}
                    </Modal.Actions>
                  </Modal>
                )}
              </div>
              <Label>SKU: {sku}</Label>
            </Item.Description>
            <Item.Extra>
              <AddProductToCart user={user} productId={_id} name={name} />
            </Item.Extra>
            {(discount && discount.isActive &&
              isDiscountStarted(discount) && !isDiscountExpired(discount)) &&
              (
                <>
                  <Label tag icon='gift' color='red' content={`%${discount.discountPercentage}`} />
                  <Button
                    color="red"
                    size='mini'
                    onClick={() => redirectUser(ctx, `/offer?discountId=${discount._id}`)}
                  >
                    See Offer Details!
                </Button>
                </>
              )
            }
          </Item.Content>
        </Item>
      </Item.Group>
      <Rating
        maxRating="5"
        disabled
        icon="star"
        size="large"
        rating={ratingAmount}
      />
      <Label>
        {`${ratings.length} users rated this!`}{" "}
        <Icon name="star" color="yellow" />
      </Label>
    </>
  );
}

export default ProductSummary;
