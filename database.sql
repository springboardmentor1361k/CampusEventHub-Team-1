-- 1. Users Table
CREATE TABLE Users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student', -- e.g., 'student', 'admin', 'superadmin'
    department VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events Table
CREATE TABLE Events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATETIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    capacity INT,
    registeredCount INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming', -- e.g., 'upcoming', 'ongoing', 'completed'
    createdBy VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id)
);

-- 3. Registrations Table
CREATE TABLE Registrations (
    id VARCHAR(255) PRIMARY KEY,
    eventId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'registered', -- e.g., 'registered', 'attended', 'cancelled'
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES Events(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- 4. Feedback Table
CREATE TABLE Feedbacks (
    id VARCHAR(255) PRIMARY KEY,
    eventId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES Events(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- 5. AdminLogs Table
CREATE TABLE AdminLogs (
    id VARCHAR(255) PRIMARY KEY,
    adminId VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL, -- e.g., 'CREATE_EVENT', 'DELETE_USER'
    details TEXT,
    ipAddress VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES Users(id)
);
