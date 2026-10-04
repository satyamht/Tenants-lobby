# Property Platform

Production foundation for a verified Indian property, rental, roommate and local marketplace platform.

Exact property coordinates and addresses are private data. Public APIs must return locality and approximate distance only. Exact location can only be returned after server-side authentication, authorization, entitlement/payment verification, listing eligibility and audit logging.

## Stack
Next.js App Router + TypeScript; PostgreSQL + PostGIS; private object storage; payment-provider abstraction; modular domain services; background jobs.

## Current foundation
Application shell plus a fail-closed exact-location API boundary. Database/auth/payment integrations are intentionally not faked.
