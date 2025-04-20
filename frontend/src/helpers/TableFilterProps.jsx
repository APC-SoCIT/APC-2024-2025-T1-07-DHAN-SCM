import React from "react";

import { Typography, Row, Col, Space, Button, Input } from "antd";
import { TagsOutlined, SearchOutlined } from "@ant-design/icons";

let inputRef = React.createRef();

const getColumnSearchProps = (dataIndex, placeholder) => {
  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            inputRef = node;
          }}
          placeholder={placeholder || "Search here"}
          value={selectedKeys[0]}
          style={{
            width: 188,
            marginBottom: 8,
            display: "block",
          }}
          onPressEnter={() => confirm()}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes(value.toLowerCase())
        : "";
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => inputRef.focus(), 100);
        }
      },
    },
  };
};

export { getColumnSearchProps };
