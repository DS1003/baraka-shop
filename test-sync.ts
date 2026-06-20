import 'dotenv/config';
import { runFtpSync } from './lib/ftp-sync';

async function main() {
    console.log("Starting test...");
    const start = Date.now();
    try {
        const res = await runFtpSync();
        console.log("Success:", res);
    } catch (e) {
        console.error("Error:", e);
    }
    console.log(`Took ${Date.now() - start}ms`);
    process.exit(0);
}

main();
