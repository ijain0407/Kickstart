import { createApp } from './app.js';

// 4100 by default so this can run next to Person D's quiz API on 4000 during the demo.
const port = Number(process.env.PORT ?? 4100);

createApp().listen(port, () => {
  console.log(`League/culture API listening on http://localhost:${port}`);
});
