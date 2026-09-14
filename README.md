Flowstate is the Excelora learning workspace built with Next.js, React, and Supabase.

## Development

The project uses Node.js 24 LTS and npm 11. Install the pinned runtime before installing dependencies:

```bash
nvm install
nvm use
node --version
```

The expected version is recorded in both `.nvmrc` and `.node-version`. Deployment platforms should honour the `engines` declaration in `package.json` and use Node 24.x.

```bash
npm ci
npm run dev
```

## Deployment

Configure required environment variables in your deployment platform and keep API keys out of the repository.
