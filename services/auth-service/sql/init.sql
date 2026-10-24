-- Run in the Auth Service database (DB_NAME in services/auth-service/.env).
-- Initial schema: preserves the existing table definition; does not migrate existing tables.
BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

COMMIT;
