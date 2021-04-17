import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Embed } from "./types";
import { exists } from "./util";

const basePath = path.join(__dirname, "..", "data");
if (!existsSync(basePath)) mkdirSync(basePath);

export function existsEmbed(id: string) {
	const fileName = path.join(basePath, `${id}.json`);
	return exists(fileName);
}

export async function getEmbedById(id: string): Promise<Embed> {
	const fileName = path.join(basePath, `${id}.json`);
	return readFile(fileName, "utf-8")
		.then(txt => JSON.parse(txt))
		.catch(() => null);
}

export async function saveEmbed(id: string, embed: Embed) {
	const fileName = path.join(basePath, `${id}.json`);
	// Possible race condition but better than nothing
	if (await exists(fileName)) throw new Error(`Embed with id ${id} already exists`);

	return writeFile(fileName, JSON.stringify(embed), "utf-8");
}
