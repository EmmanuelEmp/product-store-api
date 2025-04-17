import { Redis } from "ioredis";
import { Request } from "express";

declare module "express-serve-static-core" {
     interface Request {    
        user?: {
            userId: string;
            role: string; // Add role property here
          }; // Add user property to Request
      }
    
}
