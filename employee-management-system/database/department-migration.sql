-- Run once for an existing database created before department management was added.
USE employee_db;

CREATE TABLE IF NOT EXISTS departments (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(80)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_departments_name UNIQUE (name)
) ENGINE=InnoDB;

INSERT IGNORE INTO departments (name)
SELECT DISTINCT department FROM employees;
