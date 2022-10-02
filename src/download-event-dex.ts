import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const SEREBII_EVENT_URL_TEMPLATE = 'https://www.serebii.net/events/dex/{pokedexID}.shtml';
const PLACEHOLDER = '{pokedexID}';
export const EVENT_HTML_PATH = './html';
export const MAX_POKEDEX_ID = 898;

(async () => {
	if (!fs.existsSync(EVENT_HTML_PATH)) {
		fs.mkdirSync(EVENT_HTML_PATH);
	}

	for (let i = 1; i <= MAX_POKEDEX_ID; i++) {
		const pokedexID = String(i).padStart(3, '0');
		const serebiiUrl = SEREBII_EVENT_URL_TEMPLATE.replace(PLACEHOLDER, pokedexID);
		console.log(`${pokedexID}: Fetching ${serebiiUrl}`);
		const res = await fetch(serebiiUrl);
		const serebiiDom = await res.text();

		const eventDexFilePath = path.join(EVENT_HTML_PATH, `${pokedexID}.shtml`);
		fs.writeFileSync(eventDexFilePath, serebiiDom);
		console.log(`${pokedexID}: saved in ${eventDexFilePath}\n`);
	}
})();
