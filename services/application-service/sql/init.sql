-- Run in the Application Service database (DB_NAME in services/application-service/.env).
-- Initial schema: preserves the existing table definition; does not migrate existing tables.
BEGIN;

CREATE TABLE IF NOT EXISTS public.applications (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    offer_url TEXT,
    notes TEXT,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applications_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    application_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_application_notification UNIQUE (application_id, type)
);

COMMIT;
