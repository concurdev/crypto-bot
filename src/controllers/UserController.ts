import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import logger from "../utils/logger";

export class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      if (!name) {
        logger.warn("Missing required field: name");
        res.status(400).json({ error: "Missing required field: name" });
        return;
      }

      const user = await UserService.createUser(name);

      logger.info(`User created successfully with ID: ${user.id}`);
      res.status(201).json({
        message: `User created successfully with ID: ${user.id}`,
        user: user,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error creating user: ${error.message}`);
        res.status(500).json({ error: "Failed to create user" });
      } else {
        logger.error("Unknown error occurred while creating user");
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();

      logger.info("Fetched all users successfully.");
      res.status(200).json({
        users: users,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error fetching all users: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch users" });
      } else {
        logger.error("Unknown error occurred while fetching users");
        res.status(500).json({ error: "Failed to fetch users" });
      }
    }
  }
}
