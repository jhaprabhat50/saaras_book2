# Saara's Book of Stories

An interactive author website for **Saara's Book of Stories**, featuring a dusk-sky hero
with a flock of paper-bird boids that scatter as your cursor moves, an author profile,
a table of contents, a book showcase, and a call to action to read the book on Amazon
Kindle.

## About the Project

This website showcases **Saara**, a young storyteller whose imagination comes alive
through heartwarming stories filled with adventure, creativity, kindness, and valuable
life lessons.

The website is designed to provide visitors with:

* An engaging interactive experience (a flocking-birds hero animation built with three.js)
* Information about the young author
* The full table of contents and a look at the book itself
* Easy access to purchase or explore the book on Amazon Kindle

## Features

* Interactive animated hero: a boid-simulation flock of folded-paper birds that reacts
  to the cursor (built with three.js — no build step, loaded straight from a CDN)
* Responsive design for desktop and mobile devices
* Respects `prefers-reduced-motion` (renders a single still frame instead of animating)
* Author introduction section
* Full table of contents pulled from the book
* Book showcase section with the real cover art
* Family testimonials section
* Amazon Kindle call-to-action
* Ready for GitHub Pages hosting — plain HTML/CSS/JS, no build tools required

## Technology Stack

* HTML5
* CSS3
* JavaScript (ES modules)
* [three.js](https://threejs.org/) r160 (loaded via CDN import map — see `index.html`)
* GitHub Pages

## Project Structure

```text
.
├── index.html
├── style.css
├── main.js
├── assets/
│   ├── author-placeholder.svg   <!-- swap for a real photo of Saara -->
│   └── book-cover.jpg           <!-- extracted from the published book -->
└── README.md
```

## Running Locally

No build step needed — but since `main.js` is loaded as an ES module, open it through a
local server rather than double-clicking `index.html` (browsers block module imports on
the `file://` protocol).

```bash
# Option A: Python
python3 -m http.server 8000

# Option B: Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `saaras-book-of-stories`).
2. Push this folder's contents to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch
   `main`, folder `/ (root)`.
5. Save. GitHub will publish the site at:
   `https://<your-username>.github.io/<repo-name>/`

## Things to Personalize Before Launch

* **Author photo** — replace `assets/author-placeholder.svg` with a real photo of Saara,
  and update the `src` in `index.html` (`<img src="assets/author-placeholder.svg" …>`
  inside the `.author-portrait` block).
* **Amazon Kindle link** — the "Get it on Kindle" / "Buy on Amazon Kindle" buttons
  currently point to a placeholder (`https://www.amazon.com`). Update every `href` that
  says `#buy`/Amazon with the book's real Kindle listing URL.
* **Favicon** — none is included yet; add a `favicon.ico` or `favicon.svg` and link it
  in `<head>` if you'd like a browser-tab icon.
* **Bird count** — tuned for a balance of visual richness and performance
  (`BIRD_COUNT` in `main.js`); lower it if the site feels heavy on older devices.

## Future Enhancements

* Book preview / sample-pages section
* Author gallery
* Reader reviews and testimonials
* Contact section
* Direct Amazon Kindle "Buy Now" widget integration

## Live Website

Website URL will be available after GitHub Pages deployment.

---

Made with ❤️ for young readers and dreamers.
