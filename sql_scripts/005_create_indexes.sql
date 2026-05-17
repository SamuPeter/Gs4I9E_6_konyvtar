ALTER TABLE users ADD INDEX  idx_users_email (email);
ALTER TABLE users ADD INDEX  idx_users_role (role);

-- Loans/Borrows table
ALTER TABLE loans ADD INDEX  idx_loans_status (status);
ALTER TABLE loans ADD INDEX  idx_loans_borrowed_at (borrowed_at);
ALTER TABLE loans ADD INDEX  idx_loans_due_date (due_date);

-- Books table (if not already indexed)
ALTER TABLE books ADD INDEX  idx_books_title (title);
