// Defaults for end-to-end tests; CI and developers can override through the environment.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-test-access-secret-test-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-test-refresh-secret-test-refresh-secret';
process.env.QR_TOKEN_SECRET ??= 'test-qr-secret-test-qr-secret-test-qr';
process.env.AI_PROVIDER ??= 'mock';
process.env.STORAGE_DRIVER ??= 'local';
process.env.STORAGE_LOCAL_DIR ??= './storage-test';
process.env.LOG_LEVEL ??= 'fatal';
process.env.BOOTSTRAP_SUPER_ADMIN_EMAILS ??= 'admin@gymova.local';
