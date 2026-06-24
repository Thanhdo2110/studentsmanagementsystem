CREATE DATABASE IF NOT EXISTS student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) NOT NULL UNIQUE,
    class_name VARCHAR(50) NOT NULL,
    grade VARCHAR(20),
    teacher_name VARCHAR(100),
    capacity INT DEFAULT 40,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    class_name VARCHAR(50),
    address VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    detail VARCHAR(255),
    username VARCHAR(50),
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
