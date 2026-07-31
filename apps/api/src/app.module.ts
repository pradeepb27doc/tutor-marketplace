import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller.js";
import { AuthModule, ProfilesModule, CatalogModule, TutorsModule, VerificationModule, SearchModule, BookingsModule, PaymentsModule, NotificationsModule, ReviewsModule, AdminModule } from "./modules/index.js";

@Module({
  imports: [AuthModule, ProfilesModule, CatalogModule, TutorsModule, VerificationModule, SearchModule, BookingsModule, PaymentsModule, NotificationsModule, ReviewsModule, AdminModule],
  controllers: [HealthController],
})
export class AppModule {}

