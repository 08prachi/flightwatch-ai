-- Initial schema for FlightWatch AI

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- store hashed passwords only
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_airport TEXT,
  destination_airport TEXT,
  trip_start_date DATE,
  trip_end_date DATE,
  flight_type TEXT,
  budget NUMERIC,
  monitoring_frequency INTEGER, -- minutes
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  airline TEXT,
  flight_number TEXT,
  departure_time TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ,
  price NUMERIC(10,2),
  currency TEXT,
  stops INTEGER,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE SET NULL,
  type TEXT,
  message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_price_history_watchlist_id ON price_history(watchlist_id);
CREATE INDEX idx_price_history_checked_at ON price_history(checked_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
