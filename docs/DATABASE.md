# Database Design

## Overview
Short summary of the database purpose and requirements (consistency, retention, size).

## Schema (Example)
- `users` (id, email, name, created_at)
- `flights` (id, flight_number, origin, destination, scheduled_at)
- `alerts` (id, flight_id, type, message, created_at)

## Relationships
- One-to-many: `flights` -> `alerts`

## Migrations
- Tool: (e.g., Alembic, Flyway)
- Migration strategy

## Backups & Retention
- Backup cadence and retention policy

## Indexing & Performance
- Important indexes
- Partitioning recommendations

## ER Diagram
- Add ER diagram image or link

## Table Definitions
This project starts with four core tables: `users`, `watchlists`, `price_history`, and `notifications`.

### `users`
- `id` — integer, primary key
- `name` — text
- `email` — text, unique, not null
- `password` — text, store a hashed password (do not store plaintext)
- `created_at` — timestamptz, default now()

### `watchlists`
- `id` — integer, primary key
- `user_id` — integer, foreign key -> `users(id)`
- `source_airport` — text (IATA code preferred)
- `destination_airport` — text (IATA code preferred)
- `trip_start_date` — date
- `trip_end_date` — date
- `flight_type` — text (e.g., one-way, round-trip)
- `budget` — numeric
- `monitoring_frequency` — integer (minutes between checks)
- `status` — text (e.g., active, paused, cancelled)

### `price_history`
- `id` — integer, primary key
- `watchlist_id` — integer, foreign key -> `watchlists(id)`
- `airline` — text
- `flight_number` — text
- `departure_time` — timestamptz
- `arrival_time` — timestamptz
- `price` — numeric(10,2)
- `currency` — text
- `stops` — integer
- `checked_at` — timestamptz (when this price was observed)

### `notifications`
- `id` — integer, primary key
- `user_id` — integer, foreign key -> `users(id)`
- `watchlist_id` — integer, foreign key -> `watchlists(id)` (nullable)
- `type` — text (e.g., price-drop, price-rise, alert)
- `message` — text
- `sent_at` — timestamptz

For a runnable SQL schema, see `infrastructure/db/schema.sql`.
