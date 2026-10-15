// Floating controls for the Markdown preview (contributed via markdown.previewScripts):
// a dark/light switch and a table of contents dropdown.
(() => {
  // The preview's own script has already called acquireVsCodeApi(), which works only once, so its state API is unavailable.
  const themeKey = "markdown-preview-extras.theme";

  function readTheme() {
    try {
      return localStorage.getItem(themeKey);
    } catch {
      return null;
    }
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(themeKey, theme);
    } catch {}
  }

  // style.css shows the light preview unless this attribute is set, so the default needs no script.
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.dataset.mdTheme = "dark";
    } else {
      delete document.documentElement.dataset.mdTheme;
    }
    const button = document.getElementById("md-theme");
    if (button) {
      button.textContent = theme === "dark" ? "Dark" : "Light";
      button.title = theme === "dark" ? "Switch preview to light" : "Switch preview to dark";
    }
  }

  // The preview replaces only the contents of `.markdown-body`, so the container persists across edits.
  function container() {
    let element = document.getElementById("md-extras");
    if (!element) {
      element = document.createElement("div");
      element.id = "md-extras";
      const button = document.createElement("button");
      button.id = "md-theme";
      button.addEventListener("click", () => {
        const theme = document.documentElement.dataset.mdTheme === "dark" ? "light" : "dark";
        writeTheme(theme);
        applyTheme(theme);
      });
      element.append(button);
      document.body.append(element);
    }
    return element;
  }

  // The preview leaves `#` links to the browser, so plain anchors to the heading ids scroll within the preview.
  function renderToc() {
    // Rebuilding on each edit keeps the dropdown open if it was.
    const wasOpen = document.querySelector("#md-toc details")?.open ?? false;
    document.getElementById("md-toc")?.remove();
    const headings = [...document.querySelectorAll("h1[id], h2[id], h3[id]")];
    if (headings.length < 2) {
      return;
    }
    const details = document.createElement("details");
    details.open = wasOpen;
    const summary = document.createElement("summary");
    summary.textContent = "Contents";
    const list = document.createElement("div");
    for (const heading of headings) {
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.className = heading.tagName.toLowerCase();
      link.textContent = heading.textContent;
      link.title = heading.textContent;
      link.addEventListener("click", () => (details.open = false));
      list.append(link);
    }
    details.append(summary, list);
    const nav = document.createElement("nav");
    nav.id = "md-toc";
    nav.append(details);
    container().append(nav);
  }

  container();
  applyTheme(readTheme());

  // The preview updates its content on each edit and then fires this event.
  window.addEventListener("vscode.markdown.updateContent", renderToc);

  // Preview scripts load async, so the preview may not have inserted its initial content yet.
  function renderInitial() {
    if (document.querySelector(".markdown-body")) {
      renderToc();
    } else {
      requestAnimationFrame(renderInitial);
    }
  }
  renderInitial();
})();
