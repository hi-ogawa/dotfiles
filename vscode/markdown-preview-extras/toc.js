// Floating table of contents dropdown for the Markdown preview (contributed via markdown.previewScripts).
// The preview leaves `#` links to the browser, so plain anchors to the heading ids scroll within the preview.
(() => {
  function render() {
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
    document.body.append(nav);
  }

  // The preview updates its content on each edit and then fires this event.
  window.addEventListener("vscode.markdown.updateContent", render);

  // Preview scripts load async, so the preview may not have inserted its initial content yet.
  function renderInitial() {
    if (document.querySelector(".markdown-body")) {
      render();
    } else {
      requestAnimationFrame(renderInitial);
    }
  }
  renderInitial();
})();
