CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  target_id INT,
  target_type VARCHAR(50),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(admin_user_id) REFERENCES users(id),
  INDEX idx_audit_admin_id (admin_user_id),
  INDEX idx_audit_created_at (created_at),
  INDEX idx_audit_action (action_type)
);
