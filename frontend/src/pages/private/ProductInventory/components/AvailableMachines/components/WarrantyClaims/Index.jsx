import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../../../../../components/common/ErrorContent";
import FormWarrantyClaim from "./components/FormWarrantyClaim";

import http from "../../../../../../../services/httpService";

import { getColumnSearchProps } from "../../../../../../../helpers/TableFilterProps";

function WarrantyClaims({ serialNumber, onChange, enable }) {
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [selectedWarrantyClaim, setSelectedWarrantyClaim] = useState(null);

  const [isFormCreateWarrantyClaimOpen, setIsFormCreateWarrantyClaimOpen] =
    useState(false);
  const [isFormUpdateWarrantyClaimOpen, setIsFormUpdateWarrantyClaimOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getWarrantyClaims = async () => {
    const { data } = await http.get(`/api/warrantyClaims/${serialNumber}`);
    setWarrantyClaims(data);
  };

  useEffect(() => {
    const fetchWarrantyClaims = async () => {
      try {
        setIsContentLoading(true);
        await getWarrantyClaims();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchWarrantyClaims();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateWarrantyClaimOpen = () => {
    setIsFormCreateWarrantyClaimOpen(!isFormCreateWarrantyClaimOpen);
  };

  const toggleFormUpdateWarrantyClaimOpen = () => {
    setIsFormUpdateWarrantyClaimOpen(!isFormUpdateWarrantyClaimOpen);
  };

  const handleFormCreateWarrantyClaimSubmit = async (formData) => {
    try {
      toggleFormCreateWarrantyClaimOpen();
      setIsContentLoading(true);
      await http.post("/api/warrantyClaims", {
        ...formData,
        serial_number: serialNumber,
      });
      await getWarrantyClaims();
      onChange();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateWarrantyClaimSubmit = async (formData) => {
    try {
      toggleFormUpdateWarrantyClaimOpen();
      setIsContentLoading(true);
      await http.put(`/api/warrantyClaims/${selectedWarrantyClaim.id}`, {
        ...formData,
        serial_number: serialNumber,
      });
      await getWarrantyClaims();
      onChange();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteWarrantyClaim = async (warrantyClaim) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/warrantyClaims/${warrantyClaim.id}`);
      await getWarrantyClaims();
      onChange();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Claim Date",
      dataIndex: "claim_date",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Performed By",
      dataIndex: "performed_by",
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
            setSelectedWarrantyClaim(record);
            toggleFormUpdateWarrantyClaimOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Warranty Claim",
              content: "Are you sure you want to delete this warranty claim?",
              onOk: async () => {
                handleDeleteWarrantyClaim(record);
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

  if (!enable) {
    tableColumns.pop();
  }

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            {enable && (
              <Button
                type="primary"
                onClick={toggleFormCreateWarrantyClaimOpen}
              >
                Create Warranty Claim
              </Button>
            )}
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={warrantyClaims} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Warranty Claim"
        open={isFormCreateWarrantyClaimOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateWarrantyClaimOpen}
      >
        <FormWarrantyClaim onSubmit={handleFormCreateWarrantyClaimSubmit} />
      </Drawer>

      <Drawer
        title="Update Warranty Claim"
        open={isFormUpdateWarrantyClaimOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateWarrantyClaimOpen}
      >
        <FormWarrantyClaim
          formData={selectedWarrantyClaim}
          onSubmit={handleFormUpdateWarrantyClaimSubmit}
        />
      </Drawer>
    </>
  );
}

export default WarrantyClaims;
