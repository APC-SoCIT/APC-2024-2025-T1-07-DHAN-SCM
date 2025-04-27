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

const ViewAllocation = ({ order, orderItem }) => {
  const tableColumn1 = [
    {
      title: "Lot Number",
      render: (_, record) => {
        return record.incoming_stock.lot_number;
      },
    },
    {
      title: "Expiration Date",
      render: (_, record) => {
        return dayjs(record.incoming_stock.expiration_date).format(
          "MMMM DD, YYYY"
        );
      },
    },
  ];

  const tableColumn2 = [
    {
      title: "Serial Number",
      render: (_, record) => {
        return record.incoming_stock.serial_number;
      },
    },
  ];

  let tableColumn = [
    {
      title: "Barcode",
      render: (_, record) => {
        return record.incoming_stock.barcode;
      },
    },
  ];

  if (orderItem.product.is_machine) {
    tableColumn = [...tableColumn, ...tableColumn2];
  } else {
    tableColumn = [...tableColumn, ...tableColumn1];
  }

  let tableData = orderItem.outgoing_stocks;
  if (order.status.name === "Approved") {
    tableData = orderItem.order_temporary_allocations;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div id="printArea">
        <Card style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            {orderItem.product.name}
          </Title>
          <Text type="secondary">Model: {orderItem.product.model}</Text>
        </Card>
        <Table
          columns={tableColumn}
          dataSource={tableData}
          rowKey="id"
          pagination={false}
        />
      </div>
      <div>
        <Button
          color="primary"
          size="large"
          variant="dashed"
          onClick={handlePrint}
          style={{ marginTop: 16 }}
        >
          Print Pick List
        </Button>
      </div>
    </>
  );
};

export default ViewAllocation;
