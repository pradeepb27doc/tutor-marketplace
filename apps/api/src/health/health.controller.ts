import { Controller, Get } from "@nestjs/common";
import { createHealthPayload } from "@tutor-marketplace/config";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return createHealthPayload("api");
  }
}

