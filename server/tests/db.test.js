import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import argon2 from 'argon2';
import crypto from 'crypto';

test('Database & Auth Model - User creation and Argon2 verification', async () => {
  runMigrations();

  const testUser = `test_${Date.now()}`;
  const testEmail = `${testUser}@example.com`;
  const rawPassword = 'Password123!';
  const hash = await argon2.hash(rawPassword, { type: argon2.argon2id });

  const userId = crypto.randomUUID();
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, is_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'user', 1, ?, ?)
  `).run(userId, testUser, testEmail, hash, now, now);

  const fetched = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  assert.equal(fetched.username, testUser);
  assert.equal(fetched.email, testEmail);

  const isValid = await argon2.verify(fetched.password_hash, rawPassword);
  assert.equal(isValid, true);

  const isInvalid = await argon2.verify(fetched.password_hash, 'WrongPassword!');
  assert.equal(isInvalid, false);

  // Clean up
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
});

test('Problems Catalog - Seed integrity and query capabilities', () => {
  const problems = db.prepare('SELECT COUNT(*) as count FROM problems').get();
  assert.ok(problems.count >= 30, 'Should have at least 30 seeded problems');

  const twoSum = db.prepare('SELECT * FROM problems WHERE slug = ?').get('two-sum');
  assert.ok(twoSum, 'Two sum should exist');
  assert.equal(twoSum.difficulty, 'Easy');
  assert.equal(twoSum.function_name, 'twoSum');
});
