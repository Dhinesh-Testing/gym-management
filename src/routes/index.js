import express from "express";
const router = express.Router();
import authMiddleware from "../middlewares/auth.js";
import { uploadProfilePhoto, processProfilePhoto, uploadPaymentScreenshot, processPaymentScreenshot } from "../middlewares/uploadMiddleware.js";

import * as authController from "../controllers/authController.js";
import * as memberController from "../controllers/memberController.js";
import * as trainerController from "../controllers/trainerController.js";
import * as attendanceController from "../controllers/attendanceController.js";
import * as trainerAttendanceController from "../controllers/trainerAttendanceController.js";
import * as paymentController from "../controllers/paymentController.js";
import * as workoutController from "../controllers/workoutController.js";
import * as dietController from "../controllers/dietController.js";
import * as membershipController from "../controllers/membershipController.js";
import * as dashboardController from "../controllers/dashboardController.js";
import * as progressController from "../controllers/progressController.js";
import * as reportController from "../controllers/reportController.js";
import * as workoutAssignmentController from "../controllers/workoutAssignmentController.js";
import * as dietAssignmentController from "../controllers/dietAssignmentController.js";

// Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/profile/get", authMiddleware, authController.getProfile);
router.post("/auth/profile/update", authMiddleware, authController.updateProfile);

router.post("/members/login", memberController.loginMember);
router.post("/trainers/login", trainerController.loginTrainer);

// Member routes
router.post("/members/get", authMiddleware, memberController.getAllMembers);
router.post("/members/add", uploadProfilePhoto, processProfilePhoto, memberController.createMember);
router.post("/members/get/:id", authMiddleware, memberController.getMemberById);
router.post("/members/edit/:id", authMiddleware, uploadProfilePhoto, processProfilePhoto, memberController.updateMember);
router.post("/members/status/:id", authMiddleware, memberController.updateMemberStatus);
router.post("/members/delete/:id", authMiddleware, memberController.deleteMember);
router.post("/members/search", authMiddleware, memberController.searchMember);
router.post("/members/assign/:id", authMiddleware, memberController.assignTrainerAndPlan);

// Trainer routes
router.post("/trainers/get", trainerController.getAllTrainers);
router.post("/trainers/add", uploadProfilePhoto, processProfilePhoto, trainerController.createTrainer);
router.post("/trainers/get/:id", authMiddleware, trainerController.getTrainerById);
router.post("/trainers/edit/:id", authMiddleware, uploadProfilePhoto, processProfilePhoto, trainerController.updateTrainer);
router.post("/trainers/status/:id", authMiddleware, trainerController.updateTrainerStatus);
router.post("/trainers/delete/:id", authMiddleware, trainerController.deleteTrainer);
router.post("/trainers/dashboard-stats/:id", authMiddleware, trainerController.getTrainerDashboardStats);
router.post("/trainers/members/:id", authMiddleware, trainerController.getTrainerMembers);

// Attendance routes
router.post(
    "/attendance/get",
    authMiddleware,
    attendanceController.getAllAttendance,
);
router.post(
    "/attendance/check-in/add",
    authMiddleware,
    attendanceController.markAttendance,
);
router.post(
    "/attendance/member/:memberId",
    authMiddleware,
    attendanceController.getMemberAttendance,
);

// Trainer Attendance routes
router.post(
    "/trainer-attendance/get",
    authMiddleware,
    trainerAttendanceController.getAllTrainerAttendance,
);
router.post(
    "/trainer-attendance/check-in/add",
    authMiddleware,
    trainerAttendanceController.markTrainerAttendance,
);
router.post(
    "/trainer-attendance/trainer/:trainerId",
    authMiddleware,
    trainerAttendanceController.getTrainerAttendance,
);

// Payment routes
router.post("/payments/get", authMiddleware, paymentController.getAllPayments);
router.post("/payments/get/:id", authMiddleware, paymentController.getPaymentById);
router.post("/payments/add", authMiddleware, uploadPaymentScreenshot, processPaymentScreenshot, paymentController.createPayment);
router.post("/payments/edit/:id", authMiddleware, uploadPaymentScreenshot, processPaymentScreenshot, paymentController.updatePayment);
router.post("/payments/delete/:id", authMiddleware, paymentController.deletePayment);
router.post("/payments/member-yearly/:memberId", authMiddleware, paymentController.getMemberPaymentsByYear);

// Workout routes
router.post("/workouts/get", authMiddleware, workoutController.getAllWorkouts);
router.post("/workouts/add", authMiddleware, workoutController.createWorkout);
router.post("/workouts/edit/:id", authMiddleware, workoutController.updateWorkout);
router.post("/workouts/delete/:id", authMiddleware, workoutController.deleteWorkout);
router.post("/workouts/search", authMiddleware, workoutController.searchWorkout);

// Workout Assignment routes
router.post("/workout-assignments/assign", authMiddleware, workoutAssignmentController.assignWorkouts);
router.post("/workout-assignments/trainer/:trainerId", authMiddleware, workoutAssignmentController.getTrainerAssignments);
router.post("/workout-assignments/member/:memberId", authMiddleware, workoutAssignmentController.getMemberAssignments);
router.post("/workout-assignments/reschedule/:id", authMiddleware, workoutAssignmentController.rescheduleAssignment);
router.post("/workout-assignments/status/:id", authMiddleware, workoutAssignmentController.updateStatus);
router.post("/workout-assignments/edit/:id", authMiddleware, workoutAssignmentController.editAssignment);
router.post("/workout-assignments/delete/:id", authMiddleware, workoutAssignmentController.deleteAssignment);

// Diet routes
router.post("/diets/get", authMiddleware, dietController.getAllDiets);
router.post("/diets/add", authMiddleware, dietController.createDiet);
router.post("/diets/edit/:id", authMiddleware, dietController.updateDiet);
router.post("/diets/delete/:id", authMiddleware, dietController.deleteDiet);

// Diet Assignment routes
router.post("/diet-assignments/assign", authMiddleware, dietAssignmentController.assignDiets);
router.post("/diet-assignments/trainer/:trainerId", authMiddleware, dietAssignmentController.getTrainerDiets);
router.post("/diet-assignments/member/:memberId", authMiddleware, dietAssignmentController.getMemberDiets);
router.post("/diet-assignments/reschedule/:id", authMiddleware, dietAssignmentController.rescheduleDiet);
router.post("/diet-assignments/status/:id", authMiddleware, dietAssignmentController.updateStatus);
router.post("/diet-assignments/edit/:id", authMiddleware, dietAssignmentController.editAssignment);
router.post("/diet-assignments/delete/:id", authMiddleware, dietAssignmentController.removeAssignedDiet);

// Membership routes
router.post("/plans/get", membershipController.getAllPlans);
router.post("/plans/add", authMiddleware, membershipController.createPlan);
router.post("/plans/edit/:id", authMiddleware, membershipController.updatePlan);
router.post("/plans/delete/:id", authMiddleware, membershipController.deletePlan);
router.post(
    "/subscriptions/get",
    authMiddleware,
    membershipController.getAllSubscriptions,
);
router.post(
    "/subscriptions/add",
    authMiddleware,
    membershipController.assignSubscription,
);
router.post(
    "/subscriptions/member/:memberId",
    authMiddleware,
    membershipController.getMemberSubscriptionDetails,
);

// Dashboard routes
router.post("/dashboard/stats/get", authMiddleware, dashboardController.getStats);

// Reports route
router.post("/reports/analytics", authMiddleware, reportController.getReports);

// Progress routes
router.post("/progress/add", authMiddleware, progressController.addProgressLog);
router.post("/progress/overview/:memberId", authMiddleware, progressController.getProgressOverview);
router.post("/progress/history/:memberId", authMiddleware, progressController.getProgressHistory);

export default router;
