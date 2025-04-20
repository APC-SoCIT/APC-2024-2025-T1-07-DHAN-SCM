import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormTag from "./components/FormTag";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function Tags() {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const [isFormCreateTagOpen, setIsFormCreateTagOpen] = useState(false);
  const [isFormUpdateTagOpen, setIsFormUpdateTagOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getTags = async () => {
    const { data } = await http.get("/api/tags");
    setTags(data);
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsContentLoading(true);
        await getTags();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateTagOpen = () => {
    setIsFormCreateTagOpen(!isFormCreateTagOpen);
  };

  const toggleFormUpdateTagOpen = () => {
    setIsFormUpdateTagOpen(!isFormUpdateTagOpen);
  };

  const handleFormCreateTagSubmit = async (formData) => {
    try {
      toggleFormCreateTagOpen();
      setIsContentLoading(true);
      await http.post("/api/tags", { ...formData, status_id: 1 });
      await getTags();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateTagSubmit = async (formData) => {
    try {
      toggleFormUpdateTagOpen();
      setIsContentLoading(true);
      await http.put(`/api/tags/${selectedTag.id}`, formData);
      await getTags();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteTag = async (tag) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/tags/${tag.id}`);
      await getTags();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      ...getColumnSearchProps("name"),
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
            setSelectedTag(record);
            toggleFormUpdateTagOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Tag",
              content: "Are you sure you want to delete this tag?",
              onOk: async () => {
                handleDeleteTag(record);
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
            <Button type="primary" onClick={toggleFormCreateTagOpen}>
              Create Tag
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={tags} rowKey="id" />
      </Spin>
      <Drawer
        title="Create Tag"
        open={isFormCreateTagOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateTagOpen}
      >
        <FormTag onSubmit={handleFormCreateTagSubmit} />
      </Drawer>
      <Drawer
        title="Update Tag"
        open={isFormUpdateTagOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateTagOpen}
      >
        <FormTag formData={selectedTag} onSubmit={handleFormUpdateTagSubmit} />
      </Drawer>
    </>
  );
}

export default Tags;
