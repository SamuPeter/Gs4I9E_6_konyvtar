const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'AdminAuditLog',
  tableName: 'admin_audit_logs',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    admin_user_id: {
      type: 'int',
      nullable: false
    },
    action_type: {
      type: 'varchar',
      nullable: false
    },
    target_id: {
      type: 'int',
      nullable: true
    },
    target_type: {
      type: 'varchar',
      nullable: true
    },
    metadata: {
      type: 'json',
      nullable: true
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false
    }
  },
  relations: {
    adminUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'admin_user_id' },
      inverseSide: 'auditLogs'
    }
  }
});
