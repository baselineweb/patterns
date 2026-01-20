# <img src="public/icon.svg" width="32" height="32" valign="middle"> patterns

This pattern library is a collection of accessible component examples.

## Intent
These patterns are **not** supposed to be used as is in production. They are meant to be used as **examples for LLMs** (Large Language Models) to help them create WCAG 2.1 and WCAG 2.2 compliant components in your desired frameworks (like React, Vue, Svelte, etc.) using web standards and best practices.

**Example prompt/skill intent:**
> "Use the accessibility patterns from https://github.com/baselineweb/patterns/tree/main as a reference to create a React accordion component that matches the design description from my Figma MCP [figma selection accordion link]."

Additionally, they can serve as a **reference for creating completely new components**, providing best practice examples for accessibility.

These examples utilize the **latest HTML and CSS features**, as well as modern **Web APIs**, to ensure lean and efficient implementations.

Note that design-specific accessibility checks and implementation are not covered (contrast etc.), as these component patterns are headless/unstyled,
to give maximum flexibility to style them however you want.

## How to use with LLMs
When you use these patterns in a prompt for an LLM, your prompt should also include:
*   A **design description** or a **design example** that matches the pattern.
*   Alternatively, you should be utilizing an **MCP server** such as the Figma MCP or Penpot MCP to provide design context.

## Browser Support
Before using any generated code, you should:
1.  Check the examples with **browserslist** to ensure compatibility with your target browsers.
2.  Instruct the LLM in your prompt to check the code against the specific browsers you need to support.
