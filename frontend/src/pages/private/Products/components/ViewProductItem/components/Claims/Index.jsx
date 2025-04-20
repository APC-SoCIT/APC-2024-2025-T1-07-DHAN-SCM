import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../../../../../components/common/ErrorContent";
import FormClaim from "./components/FormClaim";

import http from "../../../../../../../services/httpService";

import { getColumnSearchProps } from "../../../../../../../helpers/TableFilterProps";

function Claims({ productItemId }) {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [isFormCreateClaimOpen, setIsFormCreateClaimOpen] = useState(false);
  const [isFormUpdateClaimOpen, setIsFormUpdateClaimOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const getClaims = async () => {
    const { data } = await http.get(
      `/api/productWarrantyClaims/search/${productItemId}`
    );
    setClaims(data);
  };

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setIsContentLoading(true);
        await getClaims();
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchClaims();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  const toggleFormCreateClaimOpen = () => {
    setIsFormCreateClaimOpen(!isFormCreateClaimOpen);
  };

  const toggleFormUpdateClaimOpen = () => {
    setIsFormUpdateClaimOpen(!isFormUpdateClaimOpen);
  };

  const handleFormCreateClaimSubmit = async (formData) => {
    try {
      toggleFormCreateClaimOpen();
      setIsContentLoading(true);
      await http.post("/api/productWarrantyClaims", {
        ...formData,
        product_item_equipment_id: productItemId,
        user_id: 1,
        status_id: 1,
      });
      await getClaims();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateClaimSubmit = async (formData) => {
    try {
      toggleFormUpdateClaimOpen();
      setIsContentLoading(true);
      await http.put(
        `/api/productWarrantyClaims/${selectedClaim.id}`,
        formData
      );
      await getClaims();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteClaim = async (claim) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/productWarrantyClaims/${claim.id}`);
      await getClaims();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Process By",
      dataIndex: "process_by",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Claim Date",
      dataIndex: "claim_date",
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [{ key: "Update", label: "Update" }];

        const handleMenuClick = ({ key }) => {
          if (key === "Update") {
            setSelectedClaim(record);
            toggleFormUpdateClaimOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Claim",
              content: "Are you sure you want to delete this claim?",
              onOk: async () => {
                handleDeleteClaim(record);
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

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Button type="primary" onClick={toggleFormCreateClaimOpen}>
              Create Claim
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={claims} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Claim"
        open={isFormCreateClaimOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateClaimOpen}
      >
        <FormClaim onSubmit={handleFormCreateClaimSubmit} />
      </Drawer>

      <Drawer
        title="Update Claim"
        open={isFormUpdateClaimOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateClaimOpen}
      >
        <FormClaim
          formData={selectedClaim}
          onSubmit={handleFormUpdateClaimSubmit}
        />
      </Drawer>
    </>
  );
}

export default Claims;
