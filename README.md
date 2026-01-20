# <img src="public/icon.svg" width="32" height="32" valign="middle"> patterns

This pattern library is a collection of accessible component examples.

## Intent
These patterns are **not** supposed to be used as is in production. They serve as a **foundational reference** for both developers and LLMs (Large Language Models) to create WCAG 2.1 and WCAG 2.2 compliant components in your desired frameworks (like React, Vue, Svelte, etc.) using web standards and best practices.

Whether you are building components manually or using AI-assisted workflows, these examples provide the structural and functional baseline required for accessibility.

**Example prompt/skill intent:**
> "Use the accessibility patterns from https://github.com/baselineweb/patterns/tree/main as a reference to create a React accordion component that matches the design description from my Figma MCP [figma selection accordion link]."

Additionally, they can serve as a **reference for creating completely new components**, providing best practice examples for accessibility.

These examples utilize the **latest HTML and CSS features**, as well as modern **Web APIs**, to ensure lean and efficient implementations.

Note that design-specific accessibility checks and implementation are not covered (contrast etc.), as these component patterns are headless/unstyled (or minimal styled),
to give maximum flexibility to style them however you want.

## Usage Guidelines
When using these patterns as a basis for your components:
*   Combine them with a **design description** or a **design example** to match your visual requirements.
*   If using an LLM, utilize an **MCP server** such as the Figma MCP or Penpot MCP to provide design context.

## Browser Support
Before implementing any code based on these patterns:
1.  Check the examples with **browserslist** to ensure compatibility with your target browsers.
2.  If using an LLM, instruct it in your prompt to check the code against the specific browsers you need to support.

## Local Development
To view the pattern library locally:
1.  `npm install`
2.  `npm run dev`