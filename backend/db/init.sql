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

CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_labels (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

-- サンプルラベルの作成
INSERT INTO labels (name, color) VALUES 
    ('重要', '#FF5252'), 
    ('仕事', '#4CAF50'), 
    ('個人', '#2196F3'), 
    ('勉強', '#9C27B0'),
    ('家庭', '#FF9800');