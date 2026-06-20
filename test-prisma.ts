import 'dotenv/config';
import prisma from './lib/prisma';
console.log(Object.keys(prisma).filter(k => !k.startsWith('_')));
console.log("Has syncConfig:", !!prisma.syncConfig);

