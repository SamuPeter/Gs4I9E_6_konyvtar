const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Loan',
  tableName: 'loans',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    user_id: {
      type: 'int',
      nullable: false
    },
    book_id: {
      type: 'int',
      nullable: false
    },
    borrowed_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false
    },
    due_date: {
      type: 'datetime',
      nullable: true
    },
    returned_at: {
      type: 'datetime',
      nullable: true
    },
    status: {
      type: 'varchar',
      default: 'active',
      nullable: false
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      inverseSide: 'loans'
    },
    book: {
      type: 'many-to-one',
      target: 'Book',
      joinColumn: { name: 'book_id' },
      inverseSide: 'loans'
    }
  }
});
