import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Divider,
  DatePicker,
  Select,
  Radio,
  Spin,
} from "antd";
import dayjs from "dayjs";
import http from "../../../../services/httpService";

const { RangePicker } = DatePicker;

const FormDemoUnit = ({ formData, supportingData, onSubmit }) => {
  const [formDemoUnitInstance] = Form.useForm();

  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [incomingStocks, setIncomingStocks] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formData) {
      formDemoUnitInstance.setFieldsValue({
        ...formData,
        demo_time: [dayjs(formData.date_start), dayjs(formData.date_end)],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const { companies, users, suppliers, products } = supportingData;

  const handleFormValuesChange = async (changedValues) => {
    const fieldName = Object.keys(changedValues)[0];
    const fieldValue = changedValues[fieldName];
    if (fieldName === "supplier_id") {
      setSelectedSupplierId(fieldValue);
      formDemoUnitInstance.setFieldsValue({ product_id: null });
      setIncomingStocks([]);
    } else if (fieldName === "product_id") {
      try {
        setIsLoading(true);
        const { data } = await http.get(
          `/api/availableIncomingStocks/${fieldValue}`
        );
        setIncomingStocks(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormFinish = (values) => {
    const {
      incoming_stock_id,
      company_id,
      assigned_person_id,
      demo_time,
      notes,
    } = values;
    const demo_start = dayjs(demo_time[0]).format("YYYY-MM-DD");
    const demo_end = dayjs(demo_time[1]).format("YYYY-MM-DD");
    onSubmit({
      incoming_stock_id,
      company_id,
      demo_start,
      demo_end,
      assigned_person_id,
      notes,
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const filteredProducts = products
    .filter((product) => product.is_machine)
    .filter(({ supplier_id }) => supplier_id === selectedSupplierId);

  const radioStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  return (
    <Spin spinning={isLoading}>
      <Form
        {...layout}
        form={formDemoUnitInstance}
        validateMessages={{
          required: "This is required.",
        }}
        onFinish={handleFormFinish}
        onValuesChange={handleFormValuesChange}
      >
        {!formData && (
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
        )}
        {!formData && (
          <Form.Item
            label="Product"
            name="product_id"
            rules={[{ required: true }]}
          >
            <Select
              options={filteredProducts.map((product) => ({
                value: product.id,
                label: `${product.name} - ${product.model}`,
              }))}
            />
          </Form.Item>
        )}
        {!formData && incomingStocks.length !== 0 && (
          <Form.Item
            label="Serials"
            name="incoming_stock_id"
            rules={[{ required: true }]}
          >
            <Radio.Group
              style={radioStyle}
              options={incomingStocks.map((item) => ({
                value: item.id,
                label: item.serial_number,
              }))}
            />
          </Form.Item>
        )}
        {!formData && (
          <Form.Item
            label="Company"
            name="company_id"
            rules={[{ required: true }]}
          >
            <Select
              options={companies.map((company) => ({
                value: company.id,
                label: company.name,
              }))}
            />
          </Form.Item>
        )}
        <Form.Item
          label="Demo Time"
          name="demo_time"
          rules={[{ required: true }]}
        >
          <RangePicker />
        </Form.Item>
        <Form.Item
          label="Assigned Person"
          name="assigned_person_id"
          rules={[{ required: true }]}
        >
          <Select
            options={users.map((user) => ({
              value: user.id,
              label: user.full_name,
            }))}
          />
        </Form.Item>
        <Form.Item label="Notes" name="notes" rules={[{ required: true }]}>
          <Input />
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
    </Spin>
  );
};

export default FormDemoUnit;
