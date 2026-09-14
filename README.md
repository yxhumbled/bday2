# Nour's birthday site

Three files — keep them all in the same folder:
- `index.html`
- `style.css`
- `script.js`

The concept: tap the bottle to open it, scroll through a letter, a
playlist of things about her, and end with drawing in the sand and
watching the tide take it.

## 1. Adding music

The vinyl button bottom-right plays a song, but the actual audio file
isn't included — I can't ship a copyrighted song in code.

1. Get an mp3 of the song you want, from a file you already have.
2. Rename it to exactly `song.mp3`.
3. Put it in the same folder as the other three files.

No file = the button just does nothing. Nothing else breaks.

## 2. Put it on GitHub Pages

1. Create a new repository on GitHub (public, since Pages needs that
   on a free account).
2. Upload all three files (and `song.mp3` if you're adding it) —
   **Add file → Upload files**, drag them all in together, commit.
3. Go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**, branch `main`,
   folder `/ (root)`. Save.
5. Wait about a minute, refresh — GitHub shows the live URL, e.g.
   `https://yourusername.github.io/repo-name/`.
6. Test it on your own phone before sending it to her.

## 3. Mobile notes

This was rebuilt to work properly on phones — drawing in the sand,
tapping the bottle, and the music button all use touch-friendly
events now, not just mouse events. If anything still looks off on
your phone specifically, tell me what's happening (what you tap,
what you expected, what happened instead) and I'll fix it.
