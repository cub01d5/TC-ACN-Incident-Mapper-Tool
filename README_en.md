# TC-ACN-Incident-Mapper-Tool

The **TC-ACN-Incident-Mapper-Tool** is an interactive dashboard designed to assist cybersecurity professionals and analysts in mapping cyber incidents according to the **ACN Taxonomy (Agenzia per la Cybersicurezza Nazionale - Italian National Cybersecurity Agency)**.

The application allows users to quickly define, visualize, and export rigorous descriptive vectors in compliance with national standards for cyber event reporting. The interface is built purely on standard web technologies (HTML, CSS, and JavaScript), ensuring great flexibility and immediate out-of-the-box execution.

## Key Features

- **Interactive Manual Mapping**: A grid-based dashboard presenting taxonomy predicates (Baseline Characterization, Threat Type, Threat Actor, and additional elements like Vector, Abusive Content, Physical Security, etc.).
- **Built-in Dictionary (Tooltips)**: During the mapping process, hovering over or focusing on field labels reveals an elegant, real-time tooltip. This displays the official ACN predicate definition and clarifies every single available option, preventing input confusion.
- **ACN Vector Generation and Parsing**: At the end of the mapping process, a simple click auto-generates the standardized vector string representing your criteria (e.g., `BC:IM_AP BC:RO_MA TT:AV_DD...`).
- **Reverse Mapping (Populate Vectors)**: A useful reverse engineering tool where users can paste a previously generated ACN vector string. The system will automatically parse the string and seamlessly populate the dashboard fields, visually rendering the nature of the incident.
- **AI Vector Builder**: A multi-provider Artificial Intelligence integration (configurable with OpenAI, Google Gemini, or Anthropic Claude) that allows you to paste an incident description in natural language. The AI efficiently extracts the events and automatically proposes a rigorous mapping according to the ACN standard, applying the required choices to the frontend dashboard.
- **High-Fidelity Export (Screenshot Report)**: Thanks to the built-in "Export as Image" function, it is possible to download a visual summary of the mapped criteria. The data is organized into classified report cards, perfectly suited for ready-to-use presentations.
- **Premium Modular Design**: The user interface is driven by a beautiful "glassmorphism" aesthetic, featuring smooth transitions, dynamic dark/light mode palettes, and visual groupings in an environment tailored to resemble a professional operational SOC dashboard.

## Project Structure

- `v1.html`: The core of the application. It contains all the semantic markup, JavaScript logic (event listeners, LLM API calls, tooltip generation, and vector formatting), and the embedded ACN taxonomy cache data.
- `style.css`: The visual engine. It provides a modern design system, responsive layouts, glassmorphism CSS declarations, "Dark Mode" theme styling, and useful state-modifier classes.
- `taxonomy_full.json`: The original, full-source JSON document of the ACN Taxonomy, provided for comprehensive structural reference or future backend expansions.
- `ACN_Tassonomia_Cyber_CLEAR.pdf`: Classification documentation drafted by the ACN, included purely for academic guidance and manual study reference.

## Getting Started

This tool is **100% Client-Side** and completely serverless for standard operations.

1. Extract the environment or make sure you are in the main project folder.
2. Simply double-click on `v1.html` to execute the application using any modern web browser (e.g., Chrome, Edge, Firefox, Safari).
3. There is absolutely no need for pre-installed servers, backend runtimes, or NodeJS package dependencies.
4. *Note on utilizing Artificial Intelligence*: In the top right corner, there is a gear icon. Click the AI Settings button to confidently configure your desired API Key and Provider if you wish to leverage the "AI Vector Builder". The interface fully respects your privacy by storing these sensitive configurations exclusively within your own browser's internal storage (Local Storage).

## Technical Information & Compatibility

The application natively interfaces with the Clipboard API to copy the vector, uses localStorage to securely persist user preferences and keys, and fluently integrates `html2canvas` via CDN for DOM capture. It maintains perfect standalone performance and high responsiveness, heavily optimized for Desktop-first SOC (Security Operations Center) workflows and analytical reporting environments.
