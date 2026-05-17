const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Book',
  tableName: 'books',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    title: {
      type: 'varchar',
      nullable: false
    },
    author: {
      type: 'varchar',
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    available: {
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
      inverseSide: 'book'
    }
  }
});
