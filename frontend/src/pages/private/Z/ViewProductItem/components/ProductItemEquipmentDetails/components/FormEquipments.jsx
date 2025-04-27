import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Divider,
  DatePicker,
  Select,
} from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;

const FormEquipment = ({ formData, supportingDetails, onSubmit }) => {
  const [formEquipmentInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formEquipmentInstance.setFieldsValue({
        ...formData,
        //expiry_date: formData.expiry_date ? dayjs(formData.expiry_date) : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleFormFinish = (values) => {
    // Convert `undefined` to `null`
    for (let key in values) {
      if (values[key] === undefined) {
        values[key] = null;
      }
    }

    onSubmit({
      ...values,
      //expiry_date: dayjs(values.expiry_date).format("YYYY-MM-DD"),
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { locations, warehouses } = supportingDetails;

  return (
    <Form
      {...layout}
      form={formEquipmentInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onKeyDown={handleKeyDown}
      onFinish={handleFormFinish}
    >
      <Form.Item
        label="Serial Number"
        name="serial_number"
        rules={[{ required: true }]}
      >
        <Input placeholder="Unique" />
      </Form.Item>
      <Form.Item
        label="Model Number"
        name="model_number"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Maintenance Inverval "
        name="maintenance_interval_in_month"
        rules={[{ required: true }]}
      >
        <InputNumber placeholder="Months" />
      </Form.Item>
      <Form.Item label="Barcode" name="barcode" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Location"
        name="location_id"
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          options={locations.map((l) => ({
            value: l.id,
            label: l.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Warehouse"
        name="warehouse_id"
        rules={[{ required: true }]}
      >
        <Select
          options={warehouses.map((w) => ({
            value: w.id,
            label: w.name,
          }))}
        />
      </Form.Item>
      <Form.Item label="Other Details" name="other_details">
        <TextArea rows={6} />
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

export default FormEquipment;
