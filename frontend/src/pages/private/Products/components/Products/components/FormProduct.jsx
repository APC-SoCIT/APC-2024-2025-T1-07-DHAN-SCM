import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Divider,
  Alert,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FormProduct = ({ formData, supportingData, onSubmit }) => {
  const [inventoryMovement, setInventoryMovement] = useState(null);

  const [formProductInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formProductInstance.setFieldsValue(formData);
      setInventoryMovement(formData.inventory_movement);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFormValuesChange = (changedValues) => {
    const fieldName = Object.keys(changedValues)[0];
    const fieldValue = changedValues[fieldName];
    if (fieldName === "inventory_movement") {
      setInventoryMovement(fieldValue);
    }
  };

  const handleFormFinish = (values) => {
    // Convert `undefined` to `null`
    for (let key in values) {
      if (values[key] === undefined) {
        values[key] = null;
      }
    }

    const defaultValues = {
      name: null,
      description: null,
      product_category_id: null,
      product_group_id: null,
      available_qty: null,
      minimum_qty: null,
      purchase_order_id: null,
      product_id: null,
      inventory_movement: null,
      selling_price: null,
    };

    onSubmit({ ...defaultValues, ...values });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { productCategories, productGroups, products, purchaseOrders } =
    supportingData;

  const inventoryMovementDescriptions = {
    None: "None inventory movement means no inventory activity will occur. This is useful when you are about to create a new product.",
    "Initial Balance":
      "Initial balance means that the product will have an initial quantity of stocks. This is useful when you are about to create a new product and you want to have an initial quantity of stocks.",
    "Purchase Order":
      "Reference to purchase order means that the product will create a product item and it will reference to a purchase order. This is useful when you need to split the same items quantity, for example, due to expiration dates.",
  };

  return (
    <Form
      {...layout}
      form={formProductInstance}
      validateMessages={{
        required: "This is required.",
      }}
      initialValues={{
        available_qty: 0,
      }}
      onValuesChange={handleFormValuesChange}
      onFinish={handleFormFinish}
    >
      <Form.Item
        label="Inventory Movement"
        name="inventory_movement"
        rules={[{ required: true }]}
      >
        <Select
          options={[
            { value: "None", label: "None" },
            { value: "Initial Balance", label: "Initial Balance" },
            {
              value: "Purchase Order",
              label: "Reference to Purchase Order",
            },
          ]}
        />
      </Form.Item>
      {inventoryMovement && (
        <Form.Item
          wrapperCol={{
            offset: layout.labelCol.span,
            span: layout.wrapperCol.span,
          }}
        >
          <Alert
            message={`${inventoryMovement} Inventory Movement`}
            description={inventoryMovementDescriptions[inventoryMovement]}
            showIcon
          />
        </Form.Item>
      )}
      {inventoryMovement !== "Purchase Order" && (
        <>
          <Form.Item
            label="Image Url"
            name="img_url"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Group"
            name="product_group_id"
            rules={[{ required: true }]}
          >
            <Select
              options={productGroups.map((pC) => ({
                value: pC.id,
                label: pC.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Category"
            name="product_category_id"
            rules={[{ required: true }]}
          >
            <Select
              options={productCategories.map((pC) => ({
                value: pC.id,
                label: pC.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Available Qty."
            name="available_qty"
            rules={[{ required: true }]}
          >
            <InputNumber
              disabled={
                inventoryMovement === "None" ||
                inventoryMovement === "Purchase Order"
              }
            />
          </Form.Item>
          <Form.Item
            label="Minimum Qty."
            name="minimum_qty"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Selling Price"
            name="selling_price"
            rules={[{ required: true }]}
          >
            <InputNumber
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </>
      )}
      {inventoryMovement === "Purchase Order" && (
        <>
          <Form.Item
            label="Purchase Order Number"
            name="purchase_order_id"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={purchaseOrders.map((pO) => ({
                value: pO.id,
                label: pO.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Product"
            name="product_id"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={products.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>
        </>
      )}
      <Divider />
      <Form.Item noStyle>
        <div style={{ textAlign: "right" }}>
          <Button type="primary" htmlType="submit">
            OK
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default FormProduct;
