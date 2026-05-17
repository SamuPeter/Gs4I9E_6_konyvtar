const AppDataSource = require('../config/data-source');
const AdminAuditLogEntity = require('../entities/AdminAuditLog');

const getLogRepo = () => AppDataSource.getRepository(AdminAuditLogEntity);

exports.logAction = async (adminUserId, actionType, targetId, targetType, metadata = {}) => {
  try {
    const repo = getLogRepo();
    const log = repo.create({
      admin_user_id: adminUserId,
      action_type: actionType,
      target_id: targetId,
      target_type: targetType,
      metadata
    });
    await repo.save(log);
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

exports.getLogs = async (adminId = null, actionType = null, limit = 100, offset = 0) => {
  const query = getLogRepo().createQueryBuilder('l');

  if (adminId) {
    query.andWhere('l.admin_user_id = :adminId', { adminId });
  }
  if (actionType) {
    query.andWhere('l.action_type = :actionType', { actionType });
  }

  return await query
    .orderBy('l.created_at', 'DESC')
    .take(limit)
    .skip(offset)
    .getMany();
};

exports.getLogCount = async (adminId = null, actionType = null) => {
  const query = getLogRepo().createQueryBuilder('l');

  if (adminId) {
    query.andWhere('l.admin_user_id = :adminId', { adminId });
  }
  if (actionType) {
    query.andWhere('l.action_type = :actionType', { actionType });
  }

  return await query.getCount();
};
