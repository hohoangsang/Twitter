import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv: { [key: string]: any } = yargs(hideBin(process.argv)).argv;

export const isDevelopment = Boolean(argv.development);
export const isProduction = Boolean(argv.production);
