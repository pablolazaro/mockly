import { MocklyCli } from './index';

async function start() {
  const mockly = new MocklyCli([], undefined);
  mockly
    .run()
    .then(() => {})
    .catch(error => console.log(error));
}

start();
