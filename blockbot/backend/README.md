# BlockBot zaledje

## Postavitev

Za uspešno postavitev potrebujemo naložen `Docker`

Premenuj datoteko `.env.example` v `.env`.

Navigiramo v direktorij deploy in poženemo compose skripto:

```sh
cd ./deploy/
docker compose up -d
```

To nam požene node container in postgres podatkovno bazo ter nam izvede migracije.

## Shema projekta

V `src/` direktoriju so mapice za:
- `controllers` - v tej mapici so datoteke kjer je zapisana logika za končne točke
- `database` - upravljanje povezava s podatkovno bazo ter migracije in poizvedbe:
    - `migrate.ts` - zažene migracije,
    - `pool.ts` - skrbi za pooling povezav,
    - `queries.ts` - v tej datoteki so zapisane vse poizvedbe nad podatkovno bazo, ki se uporabljajo v kontrolerjih
    - `types.ts` - typescript tipi za tabele ter podatke pridobljene iz poizvedb v `queries.ts`.
- `errors` - Tipi napak vrnjeni v zahtevkih
- `middleware` - Express vmesni vtičniki
- `routes` - v tej mapi se definirajo končne točke zalednega sistema.

## Migracije

Za ustvarjanje novih migracij se uporablja ogrodje `node-pg-migrate`:

Za ustvarjanje migracij:

```sh
npx node-pg-migrate create [ime migracije]
```

Izvajanje migracij:

```sh
POSTGRES_URL=[postgresurl] npx node-pg-migrate up [n] -t [ime tabele kjer so migracije zapisane]
```

Razveljavitev migracij:

```sh
POSTGRES_URL=[postgresurl] npx node-pg-migrate up [n] -t [ime tabele kjer so migracije zapisane]
```

## Posting

Testiranje končnih točk se upravlja skozi [posting](https://posting.sh/) TUI:

```sh
posting --collection=./.posting
```

Če se ustvarjajo nove autenticirane končne točke pazi da se v `scripts` sekciji od odjemalca se doda `auth.py` skripta v pre-request sekcijo.
