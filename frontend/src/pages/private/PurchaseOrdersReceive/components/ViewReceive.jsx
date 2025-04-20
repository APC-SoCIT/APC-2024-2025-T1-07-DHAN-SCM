import React, { useEffect, useRef } from "react";
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
  Table,
} from "antd";
import dayjs from "dayjs";

import Barcode from "react-barcode";

const { Title, Text } = Typography;

const ViewReceive = ({ supportingData, onSubmit }) => {
  const [formPOItemInstance] = Form.useForm();

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

  const tableColumn1 = [
    {
      title: "Received Date",
      dataIndex: "delivery_date",
    },
    {
      title: "Received Quantity",
      dataIndex: "delivered_quantity",
    },
    {
      title: "Lot Number",
      render: (_, record) => {
        return record.incoming_stocks[0].lot_number;
      },
    },
    {
      title: "Expiration Date",
      render: (_, record) => {
        return dayjs(record.incoming_stocks[0].expiration_date).format(
          "MMMM DD, YYYY"
        );
      },
    },
  ];

  if (poItem.product.is_machine) {
    tableColumn1.pop();
    tableColumn1.pop();
    tableColumn1.push({
      title: "Serial Number",
      render: (_, record) => {
        return record.incoming_stocks[0].serial_number;
      },
    });
  }

  const handlePrint = (id) => {
    const printContent = document.getElementById(id).innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      "</head><body style='margin: 0; padding: 30px 0 0 0'>"
    );
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

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
      <Table
        columns={tableColumn1}
        dataSource={poItem.deliveries}
        rowKey="id"
        pagination={false}
        defaultExpandAllRows
        expandable={{
          expandedRowRender: (record) => {
            const columns = [
              {
                title: "Barcode",
                dataIndex: "barcode",
                render: (text) => (
                  <div id={text}>
                    <Barcode
                      value={text}
                      height={30}
                      fontSize={10}
                      displayValue={true}
                      width={1.4}
                      margin={10}
                    />
                  </div>
                ),
              },
              {
                title: "Action",
                render: (_, record) => (
                  <Button
                    type="primary"
                    onClick={() => handlePrint(record.barcode)}
                  >
                    Print
                  </Button>
                ),
                width: 100,
              },
            ];

            return (
              <Card>
                <Table
                  columns={columns}
                  dataSource={record.incoming_stocks}
                  pagination={false} // To display all data without pagination
                  rowKey="id"
                />
              </Card>
            );
          },
        }}
      />
    </>
  );
};

export default ViewReceive;
