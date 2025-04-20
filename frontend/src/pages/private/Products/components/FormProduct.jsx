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
  Checkbox,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FormProduct = ({ formData, supportingData, onSubmit }) => {
  const [formProductInstance] = Form.useForm();

  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (formData) {
      formProductInstance.setFieldsValue({
        ...formData,
        tag_id: formData.tags.map((tag) => tag.id),
      });

      if (formData.image_url) {
        setFileList([
          {
            uid: "1", // Unique identifier
            name: "product_image.png", // File name
            status: "done", // Upload status (e.g., 'done', 'uploading', 'error')
            url: formData.image_url, // File URL
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFormValuesChange = (changedValues) => {
    // const fieldName = Object.keys(changedValues)[0];
    // const fieldValue = changedValues[fieldName];
    // if (fieldName === "inventory_movement") {
    //   setInventoryMovement(fieldValue);
    // }
  };

  const handleFormFinish = (values) => {
    // Convert `undefined` to `null`
    for (let key in values) {
      if (values[key] === undefined) {
        values[key] = null;
      }
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("model", values.model);
    formData.append("description", values.description);
    formData.append("product_unit_id", values.product_unit_id);
    formData.append("minimum_quantity", values.minimum_quantity);
    formData.append("supplier_id", values.supplier_id);
    formData.append("supplier_price", values.supplier_price);
    formData.append("profit_margin", values.profit_margin);
    formData.append("tag_id", values.tag_id);
    formData.append("location_id", values.location_id);
    formData.append("warehouse_id", values.warehouse_id);
    formData.append("is_machine", values.is_machine);
    if (fileList.length == 0) {
      formData.append("image", null);
    } else {
      fileList.forEach((file) => {
        formData.append("image", file.originFileObj);
      });
    }

    console.log(formData);

    onSubmit(formData);
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { suppliers, productUnits, tags, locations, warehouses } =
    supportingData;

  return (
    <Form
      {...layout}
      form={formProductInstance}
      validateMessages={{
        required: "This is required.",
      }}
      initialValues={{
        minimum_quantity: 0,
        supplier_price: 0,
        profit_margin: 0,
        is_machine: false,
      }}
      onValuesChange={handleFormValuesChange}
      onFinish={handleFormFinish}
    >
      <Form.Item
        name="is_machine"
        valuePropName="checked"
        label={null}
        rules={[{ required: true }]}
        defaultValue=""
      >
        <Checkbox disabled={formData}>Product is a Machine</Checkbox>
      </Form.Item>
      <Form.Item label="Image Url" name="img_url">
        <Upload
          beforeUpload={() => false} // Prevent immediate upload
          fileList={fileList}
          // listType="picture-card"
          onChange={handleUploadChange}
          maxCount={1}
        >
          <Button>Click to Upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Model" name="model" rules={[{ required: true }]}>
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
        label="Product Unit"
        name="product_unit_id"
        rules={[{ required: true }]}
      >
        <Select
          options={productUnits.map((productUnit) => ({
            value: productUnit.id,
            label: productUnit.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Minimum Qty."
        name="minimum_quantity"
        rules={[{ required: true }]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        label="Supplier"
        name="supplier_id"
        rules={[{ required: true }]}
      >
        <Select
          options={suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Supplier Price"
        name="supplier_price"
        rules={[{ required: true }]}
      >
        <InputNumber
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>
      <Form.Item
        label="Profit Margin (%)"
        name="profit_margin"
        rules={[{ required: true }]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        label="Location"
        name="location_id"
        // rules={[{ required: true }]}
      >
        <Select
          options={locations.map((location) => ({
            value: location.id,
            label: location.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Warehouse"
        name="warehouse_id"
        // rules={[{ required: true }]}
      >
        <Select
          options={warehouses.map((warehouse) => ({
            value: warehouse.id,
            label: warehouse.name,
          }))}
        />
      </Form.Item>
      <Form.Item label="Tags" name="tag_id">
        <Select
          mode="multiple"
          options={tags.map((tag) => ({
            value: tag.id,
            label: tag.name,
          }))}
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

export default FormProduct;
