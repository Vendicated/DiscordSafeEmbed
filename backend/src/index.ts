import express from "express";
import { nanoid } from "nanoid";
// @ts-ignore
import { port } from "../config.json";
import { existsEmbed, getEmbedById, saveEmbed } from "./manager";
import { EmbedParseError, generateHtml, getFullUrl, parseEmbed } from "./util";

const app = express();

app.use(
	express.json({
		limit: "5kb"
	})
);

app.post("/embed/create", async (req, res) => {
	const data = typeof req.body === "object" && Object.keys(req.body).length ? req.body : req.query;
	let embed;
	try {
		embed = parseEmbed(data);
		if (!embed.title && !embed.description) {
			embed.title = "Send embeds safely";
			embed.description = "Just head over to "; // TODO
		}
	} catch (error) {
		if (error instanceof EmbedParseError) {
			return res.status(400).end(error.message);
		}
		res.status(500).end("Internal Server Error");
		throw error;
	}

	let id;
	do {
		id = nanoid(10);
	} while (await existsEmbed(id));

	await saveEmbed(id, embed);

	res.status(200).end(JSON.stringify({ code: 200, url: `${getFullUrl(req)}/embed/${id}`, id }));
});

app.get("/embed/:id", async (req, res) => {
	const { id } = req.params;
	const embed = await getEmbedById(id);
	if (!embed) return res.status(404).send(`Embed with id ${id} was not found`);

	res.end(generateHtml(embed, req, id));
});

app.get("/embed", (req, res) => {
	try {
		const embed = parseEmbed(req.query as Record<string, string>);
		if (!embed.title && !embed.description) {
			embed.title = "Send embeds safely";
			embed.description = "Just head over to "; // TODO
		}
		res.end(generateHtml(embed, req));
	} catch (error) {
		if (error instanceof EmbedParseError) {
			return res.status(400).end(error.message);
		}
		res.status(500).end("Internal Server Error");
		throw error;
	}
});

app.get("/oembed/:id.json", async (req, res) => {
	const { id } = req.params;
	const embed = await getEmbedById(id);
	if (!embed) return res.status(404).send(`Embed with id ${id} was not found`);

	res.end(JSON.stringify(embed.oembed));
});

app.get("/oembed", (req, res) => {
	try {
		const embed = parseEmbed(req.query as Record<string, string>);
		if (!embed.title && !embed.description) {
			embed.title = "Send embeds safely";
			embed.description = "Just head over to "; // TODO
		}
		res.end(JSON.stringify(embed.oembed));
	} catch (error) {
		if (error instanceof EmbedParseError) {
			return res.status(400).end(JSON.stringify({ code: 400, message: error.message }));
		}
		res.status(500).end(JSON.stringify({ code: 500, message: "Internal server error" }));
		throw error;
	}
});

app.listen(port, () => console.info(`Listening on port ${port}`));
