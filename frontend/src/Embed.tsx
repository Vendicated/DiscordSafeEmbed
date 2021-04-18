import { Embed } from "./types";

interface Props {
    embed: Embed;
}

export default function EmbedComponent({ embed }: Props) {
    return <div>{embed.description}</div>;
}
