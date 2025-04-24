CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    priority VARCHAR(10) CHECK (priority IN ('High', 'Middle', 'Low')),
    status VARCHAR(20) CHECK (status IN ('NotStarted', 'InProgress', 'Completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);