const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    role: {
      type: 'varchar',
      default: 'user',
      nullable: false
    },
    is_active: {
      type: 'boolean',
      default: true,
      nullable: false
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false
    }
  },
  relations: {
    loans: {
      type: 'one-to-many',
      target: 'Loan',
      inverseSide: 'user'
    },
    auditLogs: {
      type: 'one-to-many',
      target: 'AdminAuditLog',
      inverseSide: 'adminUser'
    }
  }
});
