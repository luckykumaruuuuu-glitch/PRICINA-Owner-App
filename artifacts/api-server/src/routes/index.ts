import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ownerRouter from "./owner";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ownerRouter);

export default router;
