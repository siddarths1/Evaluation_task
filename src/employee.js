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
import Select from "react-select";
import "./style/employee.css";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filter, setFilter] = useState({
    Name: "",
    Position: null,
    Status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(8);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchPositions();
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
            Position: filter.Position?.value || undefined,
            Status: filter.Status !== "" ? filter.Status === "true" : undefined,
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

  const fetchPositions = async () => {
    try {
      const response = await axios.post("http://localhost:4000/graphql", {
        query: `
          query {
            getPositions {
              Position
              Status
            }
          }
        `,
      });

      const fetchedPositions = response.data.data.getPositions;
      setPositions(
        fetchedPositions.map((pos) => ({
          value: pos.Position,
          label: pos.Position,
          status: pos.Status,
        }))
      );
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilter((prevFilter) => {
      const newFilter = {
        ...prevFilter,
        [name]: value,
      };

      if (name === "Status") {
        newFilter.Position = null;
      }

      return newFilter;
    });
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "38px",
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
  };

  const getPositionOptions = () => {
    if (filter.Status === "") {
      // If no status is selected, return unique positions regardless of status
      const uniquePositions = positions.reduce((acc, pos) => {
        if (!acc.some((item) => item.value === pos.value)) {
          acc.push(pos);
        }
        return acc;
      }, []);
      return uniquePositions;
    }

    // Filter positions based on the selected status
    const isActive = filter.Status === "true";
    const filteredPositions = positions.filter(
      (pos) => pos.status === isActive
    );

    // Get unique positions based on the filtered status
    const uniqueFilteredPositions = filteredPositions.reduce((acc, pos) => {
      if (!acc.some((item) => item.value === pos.value)) {
        acc.push(pos);
      }
      return acc;
    }, []);

    return uniqueFilteredPositions;
  };

  return (
    <Container fluid className="py-4 bg-light">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">
            <i className="bi bi-people-fill me-2"></i>Employee Directory
          </h2>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by name"
                  name="Name"
                  value={filter.Name}
                  onChange={(e) => handleFilterChange("Name", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Select
                name="Status"
                value={filter.Status}
                onChange={(e) => handleFilterChange("Status", e.target.value)}
              >
                <option value="">All Employees</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Select
                value={filter.Position}
                onChange={(selectedOption) =>
                  handleFilterChange("Position", selectedOption)
                }
                options={getPositionOptions()}
                placeholder="Select Position"
                isClearable
                styles={customStyles}
              />
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
                    <td colSpan={8} className="text-center">
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
