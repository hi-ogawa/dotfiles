# Standalone HTML Apps

Reference for focused browser apps delivered as one HTML file. Read this when the user asks for a standalone app or utility rather than an explanatory artifact.

## Scope

Use this format for a small, complete task that benefits from instant use and lightweight sharing, such as transforming input, generating a file, or inspecting local data. Keep it browser-only and single-purpose.

Iterate through human review. Treat automatic verification as a lower priority unless the user requests it.

## Authoring

- Keep the app in one `.html` file and prefer browser-native APIs. External JavaScript or CSS from a CDN is allowed when it materially simplifies the app; pin exact versions and account for the resulting network dependency.
- Design around the task rather than the explanatory-artifact rubric.
