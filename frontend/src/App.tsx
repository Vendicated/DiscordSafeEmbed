import React, { useEffect, useState } from "react";
import { Embed } from "./types";
import querystring from "querystring";
import EmbedComponent from "./Embed";

export default function App() {
    const [data, setData] = useState<Embed>();
    const [error, setError] = useState<Error>();
    const [query, setQuery] = useState<string>();

    console.log(process.env);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) setQuery(`/${id}.json`);
        else {
            const qs = querystring.stringify(Object.fromEntries(params.entries()));
            if (!qs) setError(new Error("No query string"));
            else setQuery(`.json?${qs}`);
        }
    }, []);

    useEffect(() => {
        if (!query) return;
        fetch(`http://localhost:${process.env.REACT_APP_BACKEND_PORT}/embed${query}`)
            .then(res => res.json())
            .then(
                data => setData(data),
                error => setError(error)
            );
    }, [query]);

    if (error) {
        return <div>Error: {error.message ?? error}</div>;
    } else if (data) {
        return <EmbedComponent embed={data} />;
    } else {
        return <div>Loading...</div>;
    }
}
