import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Button,
  Card,
} from "react-bootstrap";
import "./style/employee.css";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({
    Name: "",
    Status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(8);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, filter]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.post("http://localhost:4000/graphql", {
        query: `
          query GetEmployees($filter: EmployeeFilterInput, $skip: Int, $take: Int) {
            employees(filter: $filter, skip: $skip, take: $take) {
              employees {
                employeeId
                Name
                FirstName
                LastName
                Position
                Status
                createdAt
                updatedAt
              }
              total_count
            }
          }
        `,
        variables: {
          filter: {
            Name: filter.Name || undefined,
            Status: filter.Status !== "" ? filter.Status : undefined,
          },
          skip: (currentPage - 1) * employeesPerPage,
          take: employeesPerPage,
        },
      });

      const { employees, total_count } = response.data.data.employees;
      setEmployees(employees || []);
      setTotalCount(total_count);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]:
        name === "Status" ? (value === "" ? "" : value === "true") : value,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="py-4 bg-light">
      <Card className="shadow-sm">
        <Card.Body>
          <h1 className="mb-4">
            <i className="bi bi-people-fill me-2"></i>Employee Directory
          </h1>

          <Row className="mb-4">
            <Col md={8}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by name"
                  name="Name"
                  value={filter.Name}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Select
                  name="Status"
                  value={filter.Status === "" ? "" : filter.Status.toString()}
                  onChange={handleFilterChange}
                >
                  <option value="">All Employees</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Created On</th>
                  <th>Updated On</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(employees) && employees.length > 0 ? (
                  employees.map((employee) => (
                    <tr key={employee.employeeId}>
                      <td>{employee.employeeId}</td>
                      <td>{employee.Name}</td>
                      <td>{employee.FirstName}</td>
                      <td>{employee.LastName}</td>
                      <td>{employee.Position}</td>
                      <td>
                        <span
                          className={`badge ${
                            employee.Status ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {employee.Status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(employee.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ backgroundColor: "#1E2A5E", textAlign: "center" }}
            >
              <i className="bi bi-chevron-left me-2"></i>Previous
            </Button>
            <span>
              Page {currentPage} of {Math.ceil(totalCount / employeesPerPage)}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage === Math.ceil(totalCount / employeesPerPage)
              }
              style={{ backgroundColor: "#1E2A5E", textAlign: "center" }}
            >
              Next<i className="bi bi-chevron-right ms-2"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeList;
