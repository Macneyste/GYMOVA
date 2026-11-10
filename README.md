# GYMOVA

Personal fitness MVP built as a TypeScript monorepo. It provides secure account access, fitness assessment and targets, exercises and workout logging, Somali/international food search, meal tracking, hydration and nutrition totals.

## Start locally

1. Copy `.env.example` to `apps/api/.env` and replace both JWT secrets.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install: `npm install`.
4. Create tables: `npm run db:migrate -- --name init`.
5. Add verified development foods/exercises: `npm run db:seed`.
6. Run API: `npm run dev:api`.
7. In another terminal run `npm run dev:mobile`, then open in Expo Go.

The mobile API URL defaults to `http://10.0.2.2:3000/api/v1` for the Android emulator. Set `EXPO_PUBLIC_API_URL` for a physical device (using the computer's LAN IP).

## Checks

`npm test` validates calorie/macro safety calculations. `npm run build` compiles the API and shared packages.

## Scope / safety

Targets are estimates, not medical advice. The API does not prescribe targets when a user reports pregnancy, an eating disorder, or a relevant medical condition; it returns a professional-guidance flag instead.
