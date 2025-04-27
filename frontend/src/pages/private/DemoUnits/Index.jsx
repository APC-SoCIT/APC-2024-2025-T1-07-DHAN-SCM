import { useEffect, useState } from "react";
import {
  Spin,
  Row,
  Col,
  Button,
  Drawer,
  Table,
  Modal,
  Dropdown,
  Typography,
  Card,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";
import FormDemoUnit from "./components/FormDemoUnit";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

const { Text } = Typography;

function DemoUnits() {
  const [demoUnits, setDemoUnits] = useState([]);
  const [selectedDemoUnit, setSelectedDemoUnit] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [isFormCreateDemoUnitOpen, setIsFormCreateDemoUnitOpen] =
    useState(false);
  const [isFormUpdateDemoUnitOpen, setIsFormUpdateDemoUnitOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getDemoUnits = async () => {
    const { data } = await http.get("/api/demoUnits");
    setDemoUnits(data);
  };

  useEffect(() => {
    const fetchDemoUnits = async () => {
      try {
        setIsContentLoading(true);
        const { data: companies } = await http.get("/api/companies");
        const { data: users } = await http.get("/api/users");
        const { data: suppliers } = await http.get("/api/suppliers");
        const { data: products } = await http.get("/api/getAllProducts");
        await getDemoUnits();

        setCompanies(companies);
        setUsers(users);
        setProducts(products);
        setSuppliers(suppliers);
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchDemoUnits();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateDemoUnitOpen = () => {
    setIsFormCreateDemoUnitOpen(!isFormCreateDemoUnitOpen);
  };

  const toggleFormUpdateDemoUnitOpen = () => {
    setIsFormUpdateDemoUnitOpen(!isFormUpdateDemoUnitOpen);
  };

  const handleFormCreateDemoUnitSubmit = async (formData) => {
    try {
      toggleFormCreateDemoUnitOpen();
      setIsContentLoading(true);
      await http.post("/api/demoUnits", { ...formData, status_id: 26 });
      await getDemoUnits();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateDemoUnitSubmit = async (formData) => {
    try {
      toggleFormUpdateDemoUnitOpen();
      setIsContentLoading(true);
      await http.put(`/api/demoUnits/${selectedDemoUnit.id}`, formData);
      await getDemoUnits();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteDemoUnit = async (demoUnit) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/demoUnits/${demoUnit.id}`);
      await getDemoUnits();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Demo #",
      dataIndex: "demo_number",
      width: 200,
    },
    {
      title: "Product",
      render: (_, record) => {
        return (
          <>
            <div>
              {record.incoming_stock.product.name} &ndash;{" "}
              {record.incoming_stock.product.model}
            </div>
            <div>
              <Text type="secondary">
                Serial: {record.incoming_stock.serial_number}
              </Text>
            </div>
          </>
        );
      },
    },
    {
      title: "Company",
      render: (_, record) => {
        return record.company.name;
      },
    },
    {
      title: "Date Start",
      render: (_, record) => {
        return dayjs(record.demo_start).format("MMMM DD, YYYY");
      },
    },
    {
      title: "Date End",
      render: (_, record) => {
        return dayjs(record.demo_end).format("MMMM DD, YYYY");
      },
    },
    {
      title: "Assigned Person",
      render: (_, record) => {
        return record.assigned_person.full_name;
      },
    },
    {
      title: "Overdue",
      render: (_, record) => {
        return record.is_overdue ? "Yes" : "No";
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
    },
    {
      title: "Status",
      render: (_, record) => {
        return record.status.name;
      },
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [
          { key: "Update", label: "Update" },
          {
            type: "divider",
          },
          { key: "Delete", label: "Delete", danger: true },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === "Update") {
            setSelectedDemoUnit(record);
            toggleFormUpdateDemoUnitOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete DemoUnit",
              content: "Are you sure you want to delete this demoUnit?",
              onOk: async () => {
                handleDeleteDemoUnit(record);
              },
            });
          }
        };

        return (
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button shape="circle" onClick={(e) => e.stopPropagation()}>
              <MoreOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const totalOverdue = demoUnits.filter(
    (demoUnit) => demoUnit.is_overdue
  ).length;

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Button type="primary" onClick={toggleFormCreateDemoUnitOpen}>
              Create Demo Unit
            </Button>
          </Col>
        </Row>
        <Card style={{ marginBottom: 16 }}>
          <span>
            <strong>Total Overdue</strong>: {totalOverdue}
          </span>
        </Card>
        <Table columns={tableColumns} dataSource={demoUnits} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Demo Unit"
        open={isFormCreateDemoUnitOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateDemoUnitOpen}
      >
        <FormDemoUnit
          onSubmit={handleFormCreateDemoUnitSubmit}
          supportingData={{ companies, users, suppliers, products }}
        />
      </Drawer>

      <Drawer
        title="Update Demo Unit"
        open={isFormUpdateDemoUnitOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateDemoUnitOpen}
      >
        <FormDemoUnit
          formData={selectedDemoUnit}
          onSubmit={handleFormUpdateDemoUnitSubmit}
          supportingData={{ companies, users, suppliers, products }}
        />
      </Drawer>
    </>
  );
}

export default DemoUnits;
