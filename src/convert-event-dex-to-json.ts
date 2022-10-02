import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

export const EVENT_HTML_PATH = './html';
export const EVENT_JSON_PATH = './json';
export const MAX_POKEDEX_ID = 898;

const extractPokemonDetails = (row: Element) => {
	const [nameBlock, metaBlock, descBlock, movesBlock] = Array.from(
		row.querySelectorAll(':scope > td.column'),
	);

	// name block
	const [nameRow, imageRow, levelRow] = Array.from(nameBlock.querySelectorAll(':scope tr'));
	const name = nameRow.querySelector('.label').textContent;
	const pokeball = nameRow
		.querySelector('.label > img')
		?.getAttribute('src')
		.split('/')
		.reverse()[0]
		.split('.')[0];
	const shiny = imageRow.querySelector('img').getAttribute('src').includes('Shiny');
	const level = Number(levelRow.querySelector('.label').textContent.replace('Level ', ''));

	// OT/ID/Ability/Item block
	let OT;
	let ID;
	let ability;
	let item;
	metaBlock.querySelectorAll('.detailhead').forEach(headDom => {
		switch (headDom.textContent) {
			case 'OT:':
				OT = headDom.nextSibling.textContent;
				break;
			case 'ID:':
				ID = headDom.nextSibling.textContent;
				break;
			case 'Ability:':
				ability = headDom.nextSibling.textContent;
				break;
			case 'Hold Item:':
				item = headDom.parentElement.nextSibling.firstChild.textContent;
				break;
		}
	});

	// description block
	const pokemonDescription = descBlock.textContent;

	// moves block
	const moves = Array.from(movesBlock.querySelectorAll('tr')).map(tr => tr.textContent);

	return {
		name,
		pokeball,
		shiny,
		level,
		OT,
		ID,
		ability,
		item,
		pokemonDescription,
		moves,
	};
};

const extractEventDetails = (row: Element) => {
	const [description, type, location] = Array.from(
		row.querySelectorAll(':scope table td:not(.detailhead)'),
	).map(tr => tr.textContent);
	return {
		description,
		type,
		location,
	};
};

const extractEventDatesAndGames = (row: Element) => {
	const [startDate, endDate, gamesAvailable] = Array.from(
		row.querySelectorAll(':scope table td:not(.detailhead)'),
	).map(tr => tr.textContent);
	return {
		startDate,
		endDate,
		gamesAvailable,
	};
};

if (!fs.existsSync(EVENT_JSON_PATH)) {
	fs.mkdirSync(EVENT_JSON_PATH);
}

for (let i = 444; i <= MAX_POKEDEX_ID; i++) {
	// parse html file
	const pokedexID = String(i).padStart(3, '0');
	const htmlPath = path.join(EVENT_HTML_PATH, `${pokedexID}.shtml`);
	const serebiiDom = fs.readFileSync(htmlPath);
	const window = new JSDOM(serebiiDom).window;
	const { document } = window;

	// extract pokemon species
	const titleDom = document.querySelector('.dextab tr').querySelector('td').textContent.trim();
	const species = titleDom.replace(`#${pokedexID} `, '');

	// extract events
	const events = Array.from(document.querySelectorAll('.eventpoke')).map(eventDom => {
		const rows = Array.from(eventDom.querySelectorAll(':scope > tbody > tr'));

		const pokemon = extractPokemonDetails(rows[0]);
		const event = extractEventDetails(rows[1]);
		const eventDatesAndGames = extractEventDatesAndGames(rows[2]);

		return {
			pokemon,
			event: {
				...event,
				...eventDatesAndGames,
			},
		};
	});

	const eventDexFilePath = path.join(EVENT_JSON_PATH, `${pokedexID}.json`);
	fs.writeFileSync(eventDexFilePath, JSON.stringify({ pokedexID, species, events }, null, 2));
	console.log(`${pokedexID}: saved in ${eventDexFilePath}\n`);
	window.close(); // close the jsdom
}
