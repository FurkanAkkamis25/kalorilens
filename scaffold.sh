set -euo pipefail

echo "➡️  Klasör ağacı oluşturuluyor..."
mkdir -p apps/api/src/{config,modules/{auth,users,goals,meals,ocr,labs,exercises,recipes,reminders,badges},db/{postgres,mongo},common,jobs} \
         apps/api/{test,prisma-or-typeorm} \
         apps/mobile/{app/{tabs,auth,meals,labs,exercises,reminders,components},assets,lib} \
         packages/{shared-types,shared-config} \
         infra/{env,seeds} \
         docs \
         .github/workflows

find . -type d -empty -exec touch {}/.gitkeep \;

echo "➡️  Temel dosyalar yazılıyor..."
cat > README.md <<'MD'
# KaloriLens
Monorepo: API (NestJS/Express) + Mobile (React Native/Expo) + shared packages + infra.
MD

cat > infra/docker-compose.yml <<'YML'
version: "3.9"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: kalorilens
      POSTGRES_PASSWORD: kalorilens
      POSTGRES_DB: kalorilens
    ports: [ "5432:5432" ]
  mongodb:
    image: mongo:7
    ports: [ "27017:27017" ]
YML

cat > .gitignore <<'IGN'
node_modules
dist
.env
.DS_Store
IGN

cat > .github/workflows/ci.yml <<'CI'
name: CI
on: [push, pull_request]
jobs:
  noop:
    runs-on: ubuntu-latest
    steps:
      - run: echo "add lint/test later"
CI

echo "➡️  Commit & push..."
git add .
git commit -m "chore: scaffold monorepo (apps/, infra/, docs/, ci)"
git push -u origin main

echo "✅ Bitti. Repo iskeleti GitHub'a gönderildi."
