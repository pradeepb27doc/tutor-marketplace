import { Controller, Get } from "@nestjs/common";
import { createHealthPayload } from "@tutor-marketplace/config";
import { Public } from "../modules/auth/public.decorator.js";

@Controller("health")
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return createHealthPayload("api");
  }
}

