CREATE TABLE IF NOT EXISTS loans(
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  returned_at DATETIME NULL,
  due_date DATETIME NULL,
  status ENUM('active','returned') DEFAULT 'active',
  
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(book_id) REFERENCES books(id)
);

ALTER TABLE loans ADD INDEX idx_loans_user_id (user_id);
ALTER TABLE loans ADD INDEX idx_loans_book_id (book_id);