import { Router, type IRouter } from "express";
import healthRouter from "./health";
import symptomsRouter from "./symptoms";
import bangladeshRouter from "./bangladesh";

const router: IRouter = Router();

router.use(healthRouter);
router.use(symptomsRouter);
router.use(bangladeshRouter);

export default router;
