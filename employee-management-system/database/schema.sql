-- Employee Management System - MySQL 8 schema and sample data
-- Run:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS employee_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    employee_id     VARCHAR(30)   NOT NULL,
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    phone_number    VARCHAR(15)   NOT NULL,
    department      VARCHAR(80)   NOT NULL,
    designation     VARCHAR(80)   NOT NULL,
    date_of_joining DATE          NOT NULL,
    salary          DECIMAL(12,2) NOT NULL,
    status          VARCHAR(10)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_employees_employee_id UNIQUE (employee_id),
    CONSTRAINT uk_employees_email UNIQUE (email),
    CONSTRAINT chk_employees_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT chk_employees_salary CHECK (salary > 0),
    INDEX idx_employees_department (department),
    INDEX idx_employees_status (status),
    INDEX idx_employees_full_name (full_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS departments (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(80)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_departments_name UNIQUE (name)
) ENGINE=InnoDB;

INSERT IGNORE INTO departments (name) VALUES
    ('Engineering'), ('HR'), ('Sales'), ('Finance'), ('Marketing');

INSERT INTO employees
    (employee_id, full_name, email, phone_number, department, designation, date_of_joining, salary, status)
VALUES
    ('EMP001', 'Asha Rao',        'asha.rao@example.com',        '9876543210', 'Engineering', 'Senior Developer',   '2021-03-15', 95000.00, 'ACTIVE'),
    ('EMP002', 'Rahul Verma',     'rahul.verma@example.com',     '9876543211', 'Engineering', 'Developer',          '2023-07-01', 60000.00, 'ACTIVE'),
    ('EMP003', 'Priya Nair',      'priya.nair@example.com',      '9876543212', 'HR',          'HR Manager',         '2020-01-10', 75000.00, 'ACTIVE'),
    ('EMP004', 'Karan Mehta',     'karan.mehta@example.com',     '9876543213', 'Sales',       'Sales Executive',    '2022-09-05', 45000.00, 'ACTIVE'),
    ('EMP005', 'Sneha Iyer',      'sneha.iyer@example.com',      '9876543214', 'Finance',     'Accountant',         '2019-11-20', 55000.00, 'INACTIVE'),
    ('EMP006', 'Vikram Singh',    'vikram.singh@example.com',    '9876543215', 'Engineering', 'QA Engineer',        '2022-02-14', 52000.00, 'ACTIVE'),
    ('EMP007', 'Neha Gupta',      'neha.gupta@example.com',      '9876543216', 'Marketing',   'Marketing Lead',     '2021-06-30', 70000.00, 'ACTIVE'),
    ('EMP008', 'Arjun Reddy',     'arjun.reddy@example.com',     '9876543217', 'Sales',       'Sales Manager',      '2018-04-02', 85000.00, 'ACTIVE'),
    ('EMP009', 'Divya Menon',     'divya.menon@example.com',     '9876543218', 'HR',          'Recruiter',          '2023-01-23', 40000.00, 'INACTIVE'),
    ('EMP010', 'Rohit Sharma',    'rohit.sharma@example.com',    '9876543219', 'Finance',     'Finance Manager',    '2017-08-18', 90000.00, 'ACTIVE'),
    ('EMP011', 'Ananya Das',      'ananya.das@example.com',      '9876543220', 'Engineering', 'DevOps Engineer',    '2022-12-12', 78000.00, 'ACTIVE'),
    ('EMP012', 'Manish Kulkarni', 'manish.kulkarni@example.com', '9876543221', 'Marketing',   'Content Strategist', '2024-02-05', 48000.00, 'ACTIVE');

INSERT IGNORE INTO departments (name)
SELECT DISTINCT department FROM employees;
