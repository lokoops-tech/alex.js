import React, { useState, useEffect } from 'react';
import './EmployeDataSystem.css'
import Button from './Button';
// Reusable Button Component

// Employee Model/Interface
const createEmployee = (data = {}) => ({
  id: data.id || Date.now().toString(),
  fullName: data.fullName || '',
  phoneNumber: data.phoneNumber || '',
  idNumber: data.idNumber || '',
  employmentPosition: data.employmentPosition || '',
  bankAccount: data.bankAccount || '',
  kraPin: data.kraPin || '',
  salary: data.salary || 0,
  dateJoined: data.dateJoined || new Date().toISOString().split('T')[0],
  paymentHistory: data.paymentHistory || []
});

// Payment tracking
const createPayment = (employeeId, amount, date = new Date()) => ({
  id: Date.now().toString(),
  employeeId,
  amount,
  date: date.toISOString().split('T')[0],
  status: 'paid'
});

// CSV Export functionality
const exportToCSV = (employees) => {
  const headers = [
    'Full Name',
    'Phone Number',
    'ID Number',
    'Employment Position',
    'Bank Account',
    'KRA PIN',
    'Salary',
    'Date Joined',
    'Total Payments'
  ];

  const csvData = employees.map(emp => [
    emp.fullName,
    emp.phoneNumber,
    emp.idNumber,
    emp.employmentPosition,
    emp.bankAccount,
    emp.kraPin,
    emp.salary,
    emp.dateJoined,
    emp.paymentHistory.reduce((total, payment) => total + payment.amount, 0)
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Main Admin Component
const EmployeeAdminSystem = () => {
  const [employees, setEmployees] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit', 'payments'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState(createEmployee());
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Initialize with sample data
  useEffect(() => {
    const sampleEmployees = [
      createEmployee({
        id: '1',
        fullName: 'John Doe',
        phoneNumber: '+254700123456',
        idNumber: '12345678',
        employmentPosition: 'Software Developer',
        bankAccount: '1234567890',
        kraPin: 'A123456789B',
        salary: 80000,
        paymentHistory: [
          createPayment('1', 80000, new Date('2025-05-01')),
          createPayment('1', 80000, new Date('2025-06-01'))
        ]
      }),
      createEmployee({
        id: '2',
        fullName: 'Jane Smith',
        phoneNumber: '+254711234567',
        idNumber: '87654321',
        employmentPosition: 'Project Manager',
        bankAccount: '9876543210',
        kraPin: 'B987654321C',
        salary: 90000,
        paymentHistory: [
          createPayment('2', 90000, new Date('2025-05-01'))
        ]
      })
    ];
    setEmployees(sampleEmployees);
  }, []);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (currentView === 'add') {
      setEmployees(prev => [...prev, createEmployee(formData)]);
    } else if (currentView === 'edit') {
      setEmployees(prev => prev.map(emp => 
        emp.id === formData.id ? { ...formData } : emp
      ));
    }
    setFormData(createEmployee());
    setCurrentView('list');
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setCurrentView('edit');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const handleAddPayment = (employeeId) => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    
    const payment = createPayment(employeeId, parseFloat(paymentAmount));
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, paymentHistory: [...emp.paymentHistory, payment] }
        : emp
    ));
    setPaymentAmount('');
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employmentPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="admin-container">
 
      <div className="admin-header">
        <h1>Employee Management System</h1>
        <p>Manage your employees and track their payments efficiently</p>
      </div>

      <div className="nav-buttons">
        <Button onClick={() => setCurrentView('list')} variant={currentView === 'list' ? 'primary' : 'secondary'}>
          View Employees
        </Button>
        <Button onClick={() => { setCurrentView('add'); setFormData(createEmployee()); }} variant={currentView === 'add' ? 'primary' : 'secondary'}>
          Add Employee
        </Button>
        <Button onClick={() => exportToCSV(employees)} variant="success">
          Export to CSV
        </Button>
      </div>

      {currentView === 'list' && (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{employees.length}</div>
              <div className="stat-label">Total Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                KSh {employees.reduce((total, emp) => total + emp.salary, 0).toLocaleString()}
              </div>
              <div className="stat-label">Total Monthly Salary</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                KSh {employees.reduce((total, emp) => 
                  total + emp.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0), 0
                ).toLocaleString()}
              </div>
              <div className="stat-label">Total Payments Made</div>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search employees by name, position, or phone..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="employee-grid">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="employee-card">
                <h3>{employee.fullName}</h3>
                <div className="employee-details">
                  <p><strong>Position:</strong> {employee.employmentPosition}</p>
                  <p><strong>Phone:</strong> {employee.phoneNumber}</p>
                  <p><strong>ID Number:</strong> {employee.idNumber}</p>
                  <p><strong>Bank Account:</strong> {employee.bankAccount}</p>
                  <p><strong>KRA PIN:</strong> {employee.kraPin}</p>
                  <p><strong>Salary:</strong> KSh {employee.salary.toLocaleString()}</p>
                  <p><strong>Date Joined:</strong> {employee.dateJoined}</p>
                </div>

                <div className="payment-section">
                  <h4>Payment Tracking</h4>
                  <div className="payment-input-group">
                    <input
                      type="number"
                      placeholder="Payment amount"
                      className="payment-input"
                      value={selectedEmployee === employee.id ? paymentAmount : ''}
                      onChange={(e) => {
                        setSelectedEmployee(employee.id);
                        setPaymentAmount(e.target.value);
                      }}
                    />
                    <Button 
                      onClick={() => handleAddPayment(employee.id)}
                      variant="success"
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      Add Payment
                    </Button>
                  </div>
                  <div className="payment-history">
                    <strong>Payment History:</strong>
                    {employee.paymentHistory.length > 0 ? (
                      employee.paymentHistory.map(payment => (
                        <div key={payment.id} className="payment-item">
                          <span>{payment.date}</span>
                          <span>KSh {payment.amount.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p>No payments recorded</p>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <Button onClick={() => handleEdit(employee)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(employee.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

{(currentView === 'add' || currentView === 'edit') && (
  <div className="form-container">
    <h2>{currentView === 'add' ? 'Add New Employee' : 'Edit Employee'}</h2>
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="dateJoined">Date Joined *</label>
        <input
          type="date"
          id="dateJoined"
          name="dateJoined"
          value={formData.dateJoined}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number *</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="idNumber">ID Number *</label>
        <input
          type="text"
          id="idNumber"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="employmentPosition">Employment Position *</label>
        <select
          id="employmentPosition"
          name="employmentPosition"
          value={formData.employmentPosition}
          onChange={handleInputChange}
        >
          <option value="">Select Position</option>
          <option value="Software Developer">Software Developer</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Designer">Designer</option>
          <option value="Marketing Specialist">Marketing Specialist</option>
          <option value="Sales Representative">Sales Representative</option>
          <option value="HR Manager">HR Manager</option>
          <option value="Accountant">Accountant</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="bankAccount">Bank Account Number *</label>
        <input
          type="text"
          id="bankAccount"
          name="bankAccount"
          value={formData.bankAccount}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="kraPin">KRA PIN *</label>
        <input
          type="text"
          id="kraPin"
          name="kraPin"
          value={formData.kraPin}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="salary">Monthly Salary (KSh) *</label>
        <input
          type="number"
          id="salary"
          name="salary"
          value={formData.salary}
          onChange={handleInputChange}
          min="0"
        />
      </div>
    </div>
    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
      <Button onClick={handleSubmit} variant="primary">
        {currentView === 'add' ? 'Add Employee' : 'Update Employee'}
      </Button>
      <Button 
        variant="secondary" 
        onClick={() => {
          setCurrentView('list');
          setFormData(createEmployee());
        }}
      >
        Cancel
      </Button>
    </div>
  </div>
)}
    </div>
  );
};
export default EmployeeAdminSystem;
