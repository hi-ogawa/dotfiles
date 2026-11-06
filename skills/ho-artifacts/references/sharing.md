# Sharing

When the user asks to share an HTML page, create an unlisted gist and send the user the GistHost URL.

```bash
gh gist create app.html --desc "App description"
```

Open it through GistHost:

```text
https://gisthost.github.io/?<gist-id>/<filename>
```

When the user asks to share Markdown notes with SVG figures, publish the topic's notes and figures as one gist and send the user the gist URL, because gist renders the Markdown itself. Gist breaks relative image links and has no directories, so as a temporary workaround, create the gist first, then update its copies of the notes so each image link points to `https://gist.githubusercontent.com/<user>/<gist-id>/raw/img-<n>-<basename>`. Keep the local notes' relative links unchanged. Gist lists files by name, so upload the notes as `<n>-<name>.md` and the images as `img-<n>-<basename>`, each numbered in reading order from 0 with the primary note first. Name each note for what it covers, such as the topic for the primary note. This makes the gist open on the primary note and keeps both groups in order.

Unlisted gists are readable by anyone with the URL, and GistHost pages share a third-party origin. Check for secrets, local paths, and sensitive data first, and give browser storage an app-specific prefix.
