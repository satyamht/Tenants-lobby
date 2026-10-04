# Production Architecture

## Domains
Auth, Users, Properties, Location, Verification, Media, Search, Roommates, Chat, Payments, Subscriptions, Wallet, Contracts, Brokerage, Advertising, Marketplace, Notifications, Moderation, Admin and Analytics are separate domain modules.

## Security boundary
The public property surface contains city, locality, listing attributes and approximate distance only. Exact coordinates and exact address live in property_locations, a restricted table with RLS denying browser reads. The exact-location server endpoint is fail-closed until all authorization checks are implemented.

## Unlock authorization
1. Authenticate user.
2. Resolve entitlement: subscription or available credit.
3. Verify payment state when entitlement was purchased.
4. Verify property is eligible for unlock.
5. Atomically create or reuse location_unlock.
6. Consume credit in the same transaction when applicable.
7. Append an audit event.
8. Only then read the private location record.
9. Return exact location with Cache-Control: private, no-store.

## Financial integrity
Wallet/credit changes are ledger entries, not mutable balance-only operations. Payment callbacks must be idempotent and independently verified by the payment provider.

## Deployment
Next.js App Router is the web layer. PostgreSQL/PostGIS is the data layer. Private object storage holds verification media and identity documents. Background workers process media, notifications, fraud analysis, lifecycle checks and analytics.

## Production gates
No production launch until authentication, RLS review, payment verification, location-unlock transaction tests, upload scanning, audit logging, monitoring, backups and security tests pass.
