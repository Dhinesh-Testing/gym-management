import sequelize from '../config/database.js';

import User from './User.js';
import Member from './Member.js';
import Trainer from './Trainer.js';
import MembershipPlan from './MembershipPlan.js';
import MemberSubscription from './MemberSubscription.js';
import Attendance from './Attendance.js';
import Payment from './Payment.js';
import Workout from './Workout.js';
import Diet from './Diet.js';
import ProgressLog from './ProgressLog.js';
import WorkoutAssignment from './WorkoutAssignment.js';
import DietAssignment from './DietAssignment.js';
import TrainerAttendance from './TrainerAttendance.js';
// Force all table names to lowercase to prevent duplicates on case-sensitive databases (Linux/Railway)
Object.values(sequelize.models).forEach((model) => {
  if (model.tableName) {
    model.tableName = model.tableName.toLowerCase();
  }
});

// Define Associations

// Trainer and Member
Trainer.hasMany(Member, { foreignKey: 'assignedtrainer' });
Member.belongsTo(Trainer, { foreignKey: 'assignedtrainer' });

// Member and Subscription
Member.hasOne(MemberSubscription, { foreignKey: 'memberId' });
MemberSubscription.belongsTo(Member, { foreignKey: 'memberId' });

// Plan and Subscription
MembershipPlan.hasMany(MemberSubscription, { foreignKey: 'planId' });
MemberSubscription.belongsTo(MembershipPlan, { foreignKey: 'planId' });

// Plan and Member directly
MembershipPlan.hasMany(Member, { foreignKey: 'membershipplanid' });
Member.belongsTo(MembershipPlan, { foreignKey: 'membershipplanid' });

// Member and Attendance
Member.hasMany(Attendance, { foreignKey: 'memberId' });
Attendance.belongsTo(Member, { foreignKey: 'memberId' });

// Member and Payment
Member.hasMany(Payment, { foreignKey: 'memberId' });
Payment.belongsTo(Member, { foreignKey: 'memberId' });

// Trainer and Attendance
Trainer.hasMany(TrainerAttendance, { foreignKey: 'trainerId' });
TrainerAttendance.belongsTo(Trainer, { foreignKey: 'trainerId' });

// Member and ProgressLog
Member.hasMany(ProgressLog, { foreignKey: 'memberId' });
ProgressLog.belongsTo(Member, { foreignKey: 'memberId' });

// Trainer and Workout/Diet
Trainer.hasMany(Workout, { foreignKey: 'trainerId' });
Workout.belongsTo(Trainer, { foreignKey: 'trainerId' });

Trainer.hasMany(Diet, { foreignKey: 'trainerId' });
Diet.belongsTo(Trainer, { foreignKey: 'trainerId' });

// WorkoutAssignment Associations
Member.hasMany(WorkoutAssignment, { foreignKey: 'memberId' });
WorkoutAssignment.belongsTo(Member, { foreignKey: 'memberId' });

Trainer.hasMany(WorkoutAssignment, { foreignKey: 'trainerId' });
WorkoutAssignment.belongsTo(Trainer, { foreignKey: 'trainerId' });

Workout.hasMany(WorkoutAssignment, { foreignKey: 'workoutId' });
WorkoutAssignment.belongsTo(Workout, { foreignKey: 'workoutId' });

// DietAssignment Associations
Member.hasMany(DietAssignment, { foreignKey: 'memberId' });
DietAssignment.belongsTo(Member, { foreignKey: 'memberId' });

Trainer.hasMany(DietAssignment, { foreignKey: 'trainerId' });
DietAssignment.belongsTo(Trainer, { foreignKey: 'trainerId' });

Diet.hasMany(DietAssignment, { foreignKey: 'dietId' });
DietAssignment.belongsTo(Diet, { foreignKey: 'dietId' });

export default {
  sequelize,
  User,
  Member,
  Trainer,
  MembershipPlan,
  MemberSubscription,
  Attendance,
  Payment,
  Workout,
  Diet,
  ProgressLog,
  WorkoutAssignment,
  DietAssignment,
  TrainerAttendance,
};
