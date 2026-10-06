process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/money_tracker_test?schema=public";
process.env.LOG_LEVEL ??= "silent";
process.env.JWT_SECRET ??= "test-secret-that-is-at-least-32-characters-long";
