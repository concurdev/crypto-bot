import express from "express";
import { UserController } from "../controllers/UserController";

const router = express.Router();

// Create a new user
router.post("/users/create", UserController.createUser);

// New route to get all users
router.get("/users", UserController.getAllUsers);

export default router;
