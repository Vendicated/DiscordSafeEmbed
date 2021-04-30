export interface Embed {
    title?: string;
    description?: string;
    image?: string;
    color?: string;
    oembed: OEmbed;
}

export type OEmbed = Partial<Record<"provider_name" | "provider_url" | "type" | "author_name" | "author_url", string | undefined>>;
