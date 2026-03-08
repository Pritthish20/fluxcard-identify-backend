import { Router } from "express";
import { validateSchema } from "../middleware/validateSchema";
import { identifyUserSchema } from "../schema/identify.schema";
import { identifyUser } from "../controller/identify.controller";

const router = Router();

router.post("/",validateSchema(identifyUserSchema), identifyUser)

export default router;