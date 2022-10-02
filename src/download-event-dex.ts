import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TARGET_HTML_PATH = './html';
const SEREBII_EVENT_URL_TEMPLATE = 'https://www.serebii.net/events/dex/{pokedexId}.shtml';
const PLACEHOLDER = '{pokedexId}';
const MAX_POKEDEX_ID = 898;

(async () => {
	if (!fs.existsSync(TARGET_HTML_PATH)) {
		fs.mkdirSync(TARGET_HTML_PATH);
	}

	for (let i = 1; i <= MAX_POKEDEX_ID; i++) {
		const pokedexId = String(i).padStart(3, '0');
		const serebiiUrl = SEREBII_EVENT_URL_TEMPLATE.replace(PLACEHOLDER, '150');
		console.log(`${pokedexId}: Fetching ${serebiiUrl}`);
		const res = await fetch(serebiiUrl);
		const serebiiDom = await res.text();

		const eventDexFilePath = path.join(TARGET_HTML_PATH, `${pokedexId}.shtml`);
		fs.writeFileSync(eventDexFilePath, serebiiDom);
		console.log(`${pokedexId}: saved in ${eventDexFilePath}\n`);
	}
})();
