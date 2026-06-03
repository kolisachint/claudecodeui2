# Run / restart the dev server

`npm run dev` runs the backend (`tsx server/index.js`) and the Vite client under `concurrently`. Because `tsx` runs without `--watch`, server-side changes need a process restart.

## One-shot restart

Kills any leftover processes, then relaunches `npm run dev` in the background:

```bash
PIDS=$(ps aux | grep -E "hoocowork/node_modules/.bin/(concurrently|tsx|vite)" | grep -v grep | awk '{print $2}'); [ -n "$PIDS" ] && kill -9 $PIDS 2>/dev/null; sleep 2; (nohup npm run dev > /tmp/hoocowork-dev.log 2>&1 &)
```

Tail the log:

```bash
tail -f /tmp/hoocowork-dev.log
```

You should see:
- `VITE v… ready` at <http://localhost:5173>
- `Server URL: http://localhost:3001`

## When to restart

- After editing any file under `server/`
- After upgrading deps or changing TS config
- When session caches need refreshing

Frontend-only changes under `src/` reload via Vite HMR — no restart needed.

## Manual foreground start

```bash
npm run dev
```
