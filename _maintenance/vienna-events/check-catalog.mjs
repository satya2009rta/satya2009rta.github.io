import fs from 'node:fs';
import {validateCatalog} from './catalog-validation.mjs';
import {viennaDay} from '../../vienna-events/filters.mjs';
const file=process.argv[2]||new URL('../../vienna-events/events.json',import.meta.url);
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
validateCatalog(catalog,viennaDay());
console.log(`Valid catalogue: ${catalog.events.length} events, revision ${catalog.revision}`);
