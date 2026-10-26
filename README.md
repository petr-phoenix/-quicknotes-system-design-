
# QuickNotes - REST API Client & Architecture Documentation

## Description
QuickNotes is a single-page web application (SPA) and documentation suite for managing user notes. The client interface communicates asynchronously with a REST API backend, providing full status management, strict title length validation, security against XSS attacks, and button state toggling.

---

## Documentation Links

*   [API Design Specification](docs/api-design.md) - REST endpoints, HTTP status responses, payload examples, and error schemas.
*   [Data Model Specification](docs/data-model.md) - Database schema definitions, entity relationships, indexing, and SQL queries.
*   [Architecture Documentation](docs/architecture.md) - System topology, throughput calculati

## Running the API Client

No node compilation or build steps are required.

### Using Python Local Server
1. Navigate to the project root directory:
   ```bash
   python3 -m http.server 8000


   ###What I Learned
   Defensive DOM Manipulation: Utilizing textContent exclusively prevents Cross-Site Scripting (XSS) vulnerabilities when inserting dynamic user input into HTML structures.
   Network Lifecycle Management: Wrapping asynchronous HTTP actions in try...catch...finally blocks guarantees UI components (such as action buttons) correctly re-enable upon request completion regardless of success or network failure.
   Database Indexing Optimization: Applying composite indexes like (user_id, created_at DESC) improves read performance from an $O(N)$ table scan to an $O(\log N)$ index range scan for user queries.