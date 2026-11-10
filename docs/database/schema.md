# Database schema

Source of truth: `apps/api/prisma/schema.prisma`. Migrations live in `apps/api/prisma/migrations`.

## Conventions

- UUID primary keys (`@db.Uuid`), `createdAt`/`updatedAt` on mutable entities.
- All timestamps UTC. Calendar-day data (food diary, water, sleep, planner) uses `@db.Date` columns and `YYYY-MM-DD` strings on the API.
- Money: `Decimal(12,2)` + ISO currency code. Body metrics: `Decimal(5,1)`. Nutrition: `Decimal` per 100 g.
- `gymId`/`branchId` exist only on gym-business tables. Personal fitness tables reference `userId` only.
- Cascading deletes follow ownership (`User` → personal data; `Gym` → tenant data). Catalogue rows (foods, exercises) are never cascaded from users; log items keep `foodId` with snapshotted values.

## Domains

| Domain | Models |
| --- | --- |
| Identity | User, Role, Permission, UserRole, RolePermission, RefreshToken, VerificationToken, UserDevice |
| Profile | UserProfile, FitnessAssessment (immutable snapshots), HealthLimitation, DietaryPreference, FoodAllergy, FitnessTargetSnapshot, FitnessGoal |
| Workout | ExerciseCategory, MuscleGroup, Equipment, Exercise, ExerciseMuscle, ExerciseEquipment, ExerciseAlternative, WorkoutPlan, WorkoutPlanDay, WorkoutPlanExercise, WorkoutSession, WorkoutSessionExercise, WorkoutSet, WorkoutRecord |
| Nutrition | Food, FoodTranslation, FoodNutrition, ServingUnit, Ingredient, FoodIngredient, MealPlan, MealPlanDay, Meal, MealItem, FoodLog, FoodLogItem, WaterLog |
| AI | AIConversation, AIMessage, AIRecommendation, AIUsageRecord, AIConfig, FoodScan, FoodScanItem |
| Progress & lifestyle | WeightLog, BodyMeasurement, ProgressPhoto, SleepLog, RecoveryLog, Habit, HabitLog, PlannerItem |
| Engagement | Challenge, ChallengeParticipation, Achievement, UserAchievement |
| Gym | Gym, GymBranch, GymStaff, TrainerProfile, TrainerClient, TrainerAvailability, GymMember, MembershipPlan, MembershipSubscription, Attendance, TrainingBooking, GymClass, GymClassBooking |
| Finance | PaymentMethod, Payment, Invoice, InvoiceLine, Transaction (append-only ledger), IdempotencyKey |
| Platform | Notification, NotificationPreference, AuditLog, PlatformSetting |

## Retention and deletion

- Account deletion: `User.deletedAt` is set immediately (login disabled, data hidden) and a scheduled job hard-deletes after 30 days, cascading personal data. Financial records are retained under the gym tenant with the user reference nulled where legally required.
- Refresh tokens expire after `JWT_REFRESH_TTL_DAYS`; expired rows are pruned nightly.
- Verification codes expire in 10 minutes; consumed/expired rows are pruned nightly.
- Progress photos are deleted from object storage when the row is deleted.
- Audit logs are retained 2 years.

## Working with migrations

```bash
# create a migration from schema changes (development)
npm run db:migrate -- --name <change>
# apply committed migrations (CI/production)
npm run db:deploy
# regenerate the client after schema edits
npm run db:generate
```

## Backups

`infrastructure/deployment/backup.md` documents `pg_dump` scheduling and restore drills.
