# Rick & Morty Character Browser

A tiny vanilla JavaScript app that lists characters from the free
[Rick and Morty API](https://rickandmortyapi.com/) and shows details
for each one. No build step, no dependencies, no API key.

## Features

- Paginated list of characters
- Live search by name (debounced)
- Click a character → detail view with origin, location, and episode count
- Hash-based routing (works from `file://` or any static host)
- Loading, empty, and error states

## Tech

- Plain HTML, CSS, and JavaScript
- Native `fetch`
- Hash router (~15 lines)

## Run locally

Just open `index.html` in your browser.
