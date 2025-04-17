import { sign, JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model";

type Role = 'admin' | 'user'; 

interface TokenUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const generateToken = async (user: TokenUser): Promise<Tokens> => {
  if (!user || !user._id || !user.name || !user.email) {
    throw new Error("Invalid user data for token generation");
  }

  const payload: JwtPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "10m",
  });

  const refreshToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};
