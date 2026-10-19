import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'wordpress-super-secret-jwt-key-2026';
export const TOKEN_COOKIE_NAME = 'wp_admin_token';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getAuthUser(req: NextRequest): AuthUser | null {
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Role Capabilities Matrix (same as WordPress)
export const ROLE_CAPABILITIES: Record<string, string[]> = {
  ADMINISTRATOR: [
    'manage_options',
    'edit_posts',
    'publish_posts',
    'delete_posts',
    'edit_others_posts',
    'manage_categories',
    'upload_files',
    'edit_pages',
    'manage_comments',
    'switch_themes',
    'manage_plugins',
    'manage_users',
    'export_tools',
  ],
  EDITOR: [
    'edit_posts',
    'publish_posts',
    'delete_posts',
    'edit_others_posts',
    'manage_categories',
    'upload_files',
    'edit_pages',
    'manage_comments',
  ],
  AUTHOR: ['edit_posts', 'publish_posts', 'delete_posts', 'upload_files'],
  CONTRIBUTOR: ['edit_posts', 'delete_posts'],
  SUBSCRIBER: ['read'],
};

export function hasCapability(role: string, capability: string): boolean {
  const caps = ROLE_CAPABILITIES[role.toUpperCase()] || [];
  return caps.includes(capability);
}
