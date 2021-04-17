import type { Request } from "express";
import { access } from "fs/promises";
import { htmlEncode } from "htmlencode";
import querystring from "querystring";
import { Embed } from "./types";

export function getFullUrl({ protocol, hostname }: Request) {
    return `${protocol}://${hostname}`;
}

export function generateHtml(embed: Embed, req: Request, id?: string) {
    const oembedUrl = `${getFullUrl(req)}/oembed${id ? `/${id}.json` : `?${querystring.stringify(embed.oembed)}`}`;
    return `<!DOCTYPE html>
    <html>
        <head>
            ${embed.title ? `<meta property="og:title" content="${htmlEncode(embed.title)}">` : ""}
            ${embed.description ? `<meta property="og:description" content="${htmlEncode(embed.description)}">` : ""}
            ${embed.image ? `<meta property="og:image" content="${htmlEncode(embed.image)}">` : ""}
            ${embed.color ? `<meta name="theme-color" content="#${embed.color}">` : ""}
            <link type="application/json+oembed" href=${oembedUrl}>
        </head>
        <body>
            <script>location.replace("/")</script>
        </body>
    </html>`;
}
// ${/* embed.siteName ? `<meta property="og:site_name" content="${htmlEncode(embed.siteName)}">` : "" */}

export function exists(fileName: string) {
    return access(fileName)
        .then(() => true)
        .catch(() => false);
}

export function parseEmbed(values: Record<string, string>) {
    const embed: Embed = {
        oembed: {
            type: "rich"
        }
    };

    for (const [key, value] of Object.entries(values)) {
        switch (key) {
            case "colour":
            case "color": {
                const color = value === "RANDOM" ? Math.floor(Math.random() * (0xffffff + 1)) : parseInt(value.replace("#", ""), 16);
                if (isNaN(color)) throw new EmbedParseError(`Colour must be valid hex colour, received ${value}`);
                else if (color < 0 || color > 0xffffff) throw new EmbedParseError(`Colour must be between 0 and #FFFFFF, received #${color}`);
                embed.color = color;
                break;
            }
            case "image":
                embed.image = value;
                break;
            case "description":
                if (value.length > 2048) throw new EmbedParseError(`Description must be 2048 characters or shorter, received ${value.length} characters`);
                embed.description = value;
                break;
            case "title":
                if (value.length > 256) throw new EmbedParseError(`Title must be 256 characters or shorter, received ${value.length} characters`);
                embed.title = value;
                break;
            case "authorName":
            case "author_name":
                if (value.length > 256) throw new EmbedParseError(`AuthorName must be 256 characters or shorter, received ${value.length} characters`);
                embed.oembed.author_name = value;
                break;
            case "authorUrl":
            case "author_url":
                embed.oembed.author_url = value;
                break;
            case "providerName":
            case "provider_name":
                embed.oembed.provider_name = value;
                break;
            case "type":
                embed.oembed.type = value;
                break;
        }
    }

    return embed;
}

export class EmbedParseError extends Error {}
