# API Specification

## Overview
RESTful JSON API for core backend functionality.

## Authentication
- Bearer token (JWT) or API keys

## Common Responses
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

## Endpoints
- `GET /health` — service health
- `POST /auth/login` — obtain token
- `GET /flights` — list flights (query params)
- `GET /flights/{id}` — flight detail
- `POST /alerts` — create alert
- `GET /alerts` — list alerts

## Example Request

POST /alerts

{
  "flight_id": "123",
  "type": "delay",
  "message": "Expected 30min delay"
}

## Versioning
- Use `/v1/` prefix or header versioning

## Rate Limits
- Recommended rate limits per endpoint or user role

## Errors
Standard error envelope with `code`, `message`, `details`.
