# BlockBot Enhanced Backend

## Postavitev

Za uspešno postavitev potrebujemo naložen `Docker`

Premenuj datoteko `.env.example` v `.env`.

Navigiramo v direktorij deploy in poženemo compose skripto:

```sh
cd ./deploy/
docker compose up -d
```

To nam požene node container in postgres podatkovno bazo ter nam izvede migracije.

# BlockBot Enhanced Frontend

## Development Scripts
```bash
npm run dev     # Start development server
npm run build   # Build for production (TypeScript + Vite)
npm run lint    # Run ESLint
```
