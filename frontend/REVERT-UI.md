# Revert “Invest With Flair” UI

The reference UI lives on branch `ui/invest-with-flair`. The last commit **before** this skin is tagged `pre-flair-ui`.

## Quick revert (recommended)

```bash
cd /var/www/tradenix-venture
bash scripts/revert-ui.sh
```

This restores the `frontend/` tree from `pre-flair-ui` and runs `deploy/rebuild-production.sh`.

## Git-only revert

```bash
git checkout pre-flair-ui -- frontend/
bash deploy/rebuild-production.sh
```

## Return to the new UI later

```bash
git checkout ui/invest-with-flair -- frontend/
bash deploy/rebuild-production.sh
```

Legacy CSS backup (not used when flair is active): `frontend/src/index.legacy.css`.
