import e from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = e.Router();

router.get("/",protectRoute , getNotifications);
router.delete("/delete",protectRoute , deleteNotifications);
router.delete("/delete/:id",protectRoute , deleteNotification);


export default router;