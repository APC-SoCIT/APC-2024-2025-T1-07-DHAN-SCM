import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  InputNumber,
  Button,
  Divider,
  Card,
  Col,
  Row,
  DatePicker,
  Statistic,
  Typography,
  Input,
} from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const FormReceive = ({ supportingData, onSubmit }) => {
  const [machineSerialsCount, setMachineSerialsCount] = useState(1);

  const [formPOItemInstance] = Form.useForm();
  const inputRef = useRef(null); // Create a ref for the InputNumber component

  const handleFormValuesChange = (changedValues) => {
    const fieldName = Object.keys(changedValues)[0];
    const fieldValue = changedValues[fieldName];
    if (fieldName === "delivered_quantity") {
      setMachineSerialsCount(fieldValue);
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
      delivery_date: dayjs(values.delivery_date).format("YYYY-MM-DD"),
      expiration_date: values.expiration_date
        ? dayjs(values.expiration_date).format("YYYY-MM-DD")
        : null,
    });
  };

  const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  const { poItem } = supportingData;

  const quantity = poItem.quantity;
  const deliveredQuantity = poItem.deliveries.reduce((acc, item) => {
    acc += item.delivered_quantity;
    return acc;
  }, 0);
  const maxCountToReceive = quantity - deliveredQuantity;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the InputNumber field when the component mounts
    }
  }, []);

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {poItem.product.name}
        </Title>
        <Text type="secondary">Model: {poItem.product.model}</Text>
      </Card>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <Statistic title="Order Quantity" value={quantity} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="Total Received" value={deliveredQuantity} />
          </Card>
        </Col>
      </Row>
      <Form
        {...layout}
        form={formPOItemInstance}
        validateMessages={{
          required: "This is required.",
        }}
        onValuesChange={handleFormValuesChange}
        onFinish={handleFormFinish}
        size="large"
        initialValues={{
          delivered_quantity: 1,
        }}
      >
        <Form.Item
          label="Enter Total Item Received"
          name="delivered_quantity"
          rules={[{ required: true }]}
        >
          <InputNumber
            ref={inputRef} // Attach the ref to the InputNumber component
            min={1}
            max={maxCountToReceive}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label="Delivery Date"
          name="delivery_date"
          rules={[{ required: true }]}
        >
          <DatePicker
            disabledDate={(current) =>
              current && current > dayjs().endOf("day")
            }
          />
        </Form.Item>
        {poItem.product.is_machine ? (
          Array.from({ length: machineSerialsCount }).map((_, index) => (
            <Form.Item
              key={`serial_number_${index}`}
              label={`Serial ${index + 1}`}
              name={`serial_number_${index + 1}`}
              rules={[
                { required: true, message: `Serial ${index + 1} is required.` },
              ]}
            >
              <Input />
            </Form.Item>
          ))
        ) : (
          <>
            <Form.Item
              label="Lot Number"
              name="lot_number"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Expiration Date"
              name="expiration_date"
              rules={[{ required: true }]}
            >
              <DatePicker />
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
    </>
  );
};

export default FormReceive;
