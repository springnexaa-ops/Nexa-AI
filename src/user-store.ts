// @ts-nocheck
import { DurableObject } from "cloudflare:workers";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "rejected";
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

type SessionRecord = { userId: string; expiresAt: number };

export class UserStoreDO extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    `);
  }

  private mapUser(row: any): UserRecord {
    return { id: String(row.id), name: String(row.name), email: String(row.email), role: String(row.role), status: row.status as UserRecord["status"], passwordHash: String(row.password_hash), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
  }
  async register(user: UserRecord): Promise<{ ok: true; user: UserRecord } | { ok: false; error: "duplicate" }> { const existing = this.ctx.storage.sql.exec("SELECT id FROM users WHERE email = ?", user.email).toArray(); if (existing.length) return { ok: false, error: "duplicate" }; this.ctx.storage.sql.exec("INSERT INTO users (id,name,email,role,status,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", user.id, user.name, user.email, user.role, user.status, user.passwordHash, user.createdAt, user.updatedAt); return { ok: true, user }; }
  async listUsers(): Promise<UserRecord[]> { return this.ctx.storage.sql.exec("SELECT * FROM users ORDER BY created_at DESC").toArray().map(row => this.mapUser(row)); }
  async getUser(id: string): Promise<UserRecord | null> { const rows = this.ctx.storage.sql.exec("SELECT * FROM users WHERE id = ?", id).toArray(); return rows.length ? this.mapUser(rows[0]) : null; }
  async getUserByEmail(email: string): Promise<UserRecord | null> { const rows = this.ctx.storage.sql.exec("SELECT * FROM users WHERE email = ?", email).toArray(); return rows.length ? this.mapUser(rows[0]) : null; }
  async updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord | null> { const current = await this.getUser(id); if (!current) return null; const next = { name: patch.name !== undefined ? patch.name : current.name, email: patch.email !== undefined ? patch.email : current.email, role: patch.role !== undefined ? patch.role : current.role, status: patch.status !== undefined ? patch.status : current.status, passwordHash: patch.passwordHash !== undefined ? patch.passwordHash : current.passwordHash, updatedAt: patch.updatedAt !== undefined ? patch.updatedAt : new Date().toISOString() }; const duplicate = this.ctx.storage.sql.exec("SELECT id FROM users WHERE email = ? AND id != ?", next.email, id).toArray(); if (duplicate.length) throw new Error("duplicate_email"); this.ctx.storage.sql.exec("UPDATE users SET name=?,email=?,role=?,status=?,password_hash=?,updated_at=? WHERE id=?", next.name, next.email, next.role, next.status, next.passwordHash, next.updatedAt, id); return { ...current, ...next, id }; }
  async deleteUser(id: string): Promise<boolean> { this.ctx.storage.sql.exec("DELETE FROM sessions WHERE user_id = ?", id); const result = this.ctx.storage.sql.exec("DELETE FROM users WHERE id = ?", id); return result.rowsWritten > 0; }
  async createSession(token: string, session: SessionRecord): Promise<void> { this.ctx.storage.sql.exec("INSERT OR REPLACE INTO sessions (token,user_id,expires_at) VALUES (?,?,?)", token, session.userId, session.expiresAt); }
  async getSession(token: string): Promise<SessionRecord | null> { const rows = this.ctx.storage.sql.exec("SELECT user_id,expires_at FROM sessions WHERE token = ?", token).toArray(); if (!rows.length) return null; const row = rows[0] as any; const session = { userId: String(row.user_id), expiresAt: Number(row.expires_at) }; if (session.expiresAt < Date.now()) { this.ctx.storage.sql.exec("DELETE FROM sessions WHERE token = ?", token); return null; } return session; }
  async deleteSession(token: string): Promise<void> { this.ctx.storage.sql.exec("DELETE FROM sessions WHERE token = ?", token); }
  async consumeRateLimit(key:string,limit:number,windowMs:number):Promise<{allowed:boolean;remaining:number;retryAfter:number}> {
    const now=Date.now();
    const rows=this.ctx.storage.sql.exec("SELECT count,reset_at FROM rate_limits WHERE key=?",key).toArray() as any[];
    let count=rows.length && Number(rows[0].reset_at)>now ? Number(rows[0].count) : 0;
    const reset=rows.length && Number(rows[0].reset_at)>now ? Number(rows[0].reset_at) : now+windowMs;
    if(count>=limit) return {allowed:false,remaining:0,retryAfter:Math.max(1,Math.ceil((reset-now)/1000))};
    count++;
    this.ctx.storage.sql.exec("INSERT OR REPLACE INTO rate_limits(key,count,reset_at) VALUES(?,?,?)",key,count,reset);
    if(Math.random()<0.01) this.ctx.storage.sql.exec("DELETE FROM rate_limits WHERE reset_at<?",now);
    return {allowed:true,remaining:Math.max(0,limit-count),retryAfter:0};
  }
  async deleteSessionsForUser(userId: string): Promise<void> { this.ctx.storage.sql.exec("DELETE FROM sessions WHERE user_id = ?", userId); }
}
