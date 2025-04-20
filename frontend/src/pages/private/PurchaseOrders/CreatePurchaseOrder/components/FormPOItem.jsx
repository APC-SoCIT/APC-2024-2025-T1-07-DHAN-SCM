import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, Divider } from "antd";

import useDataStore from "../../../../../store/DataStore";

const FormPOItem = ({ formData, supportingData, onSubmit }) => {
  const [formPOItemInstance] = Form.useForm();

  const { productUnits } = useDataStore();

  useEffect(() => {
    if (formData) {
      formPOItemInstance.setFieldsValue(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFormValuesChange = (changedValues) => {
    const fieldName = Object.keys(changedValues)[0];
    if (fieldName === "quantity" || fieldName === "price") {
      const values = formPOItemInstance.getFieldsValue();
      const { quantity, price } = values;
      const amount = quantity * price;
      formPOItemInstance.setFieldsValue({ amount });
    }
  };

  const handleFormFinish = (values) => {
    // Convert `undefined` to `null`
    for (let key in values) {
      if (values[key] === undefined) {
        values[key] = null;
      }
    }

    onSubmit(values);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { products } = supportingData;

  return (
    <Form
      {...layout}
      form={formPOItemInstance}
      validateMessages={{
        required: "This is required.",
      }}
      initialValues={{
        quantity: 0,
        price: 0,
        amount: 0,
      }}
      onValuesChange={handleFormValuesChange}
      onFinish={handleFormFinish}
    >
      <Form.Item label="Product" name="product_id" rules={[{ required: true }]}>
        <Select
          showSearch
          options={products.map((product) => ({
            value: product.id,
            label: product.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Unit"
        name="product_unit_id"
        rules={[{ required: true }]}
      >
        <Select
          options={Object.entries(productUnits).map(([key, value]) => ({
            value: Number(key),
            label: value,
          }))}
        />
      </Form.Item>
      <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
        <InputNumber
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>
      <Form.Item label="Price" name="price" rules={[{ required: true }]}>
        <InputNumber
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>
      <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
        <InputNumber
          readOnly
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>
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

export default FormPOItem;
