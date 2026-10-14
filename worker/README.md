# driftware-api (Cloudflare Worker + D1)

Ersetzt das Supabase-Projekt "driftware-analytics". Endpunkte siehe Kopf von `src/index.js`.

    npm install
    npx wrangler d1 execute driftware --local --file schema.sql   # lokale DB
    npx wrangler dev --local --port 8787                          # lokaler Server
    npm test                                                      # API-Tests gegen den lokalen Server

Einrichten (einmalig, Cloudflare-Konto noetig):

    npx wrangler login
    npx wrangler d1 create driftware        # ID in wrangler.toml bei database_id eintragen
    npx wrangler d1 execute driftware --remote --file schema.sql
    npx wrangler deploy
