# QuickNotes System Architecture

## Requirements

*   **Functional:** Users can create, list, and delete notes asynchronously.
*   **Non-Functional:** High availability (99.9% uptime), low read latency (<100ms P95), scalable to 1M registered users.

---

## Load Estimates (1M Users / 100k DAU)

*   **Assumptions:** 100,000 DAU, 20 reads/day per active user, 2 writes/day per active user, average note size of 1 KB.
*   **Reads per second:**
    $$\text{Daily Reads} = 100,000 \times 20 = 2,000,000 \text{ reads/day} \implies \approx 23.15 \text{ average RPS (Peak ~230 RPS)}$$
*   **Writes per second:**
    $$\text{Daily Writes} = 100,000 \times 2 = 200,000 \text{ writes/day} \implies \approx 2.31 \text{ average WPS (Peak ~23 WPS)}$$
*   **Storage per year:**
    $$\text{Notes/Year} = 100,000 \times 2 \times 365 = 73,000,000 \text{ notes/year} \implies \approx 73 \text{ GB data/year (+27 GB index metadata = 100 GB/year)}$$

---

## Architecture Diagram

[ Client Browser ]
|
v
[ DNS ]
|
v
[ CDN ] (Static Assets)
|
v
[ Load Balancer ]
/

v         v
[App Server 1] [App Server 2]
|      \      /      |
v       v    v       v
[ Cache ]  [Primary DB]  [ Message Queue ]
(Redis)       |            |
v            v
[Read Replica]  [ Worker Node ]



## Component Responsibilities

1. **Client Browser:** Handles rendering UI and executing client-side HTTP requests via JavaScript.
2. **DNS:** Maps domain requests to appropriate load balancer IP addresses.
3. **CDN:** Caches static files (`index.html`, `style.css`, `api.js`) geographically close to users to optimize startup latency.
4. **Load Balancer:** Distributes API traffic evenly across application servers and isolates unhealthy nodes.
5. **App Servers (1 & 2):** Runs stateless backend application logic, validating payloads and managing cache/database connections.
6. **Cache (Redis):** Stores recent note read queries in memory to accelerate read responses.
7. **Primary Database:** Handles incoming writes and maintains relational master record.
8. **Read Replica:** Offloads query traffic from the primary database using asynchronous replication.
9. **Message Queue:** Queues asynchronous background tasks (e.g., search indexing or email notifications).
10. **Worker Node:** Consumes background jobs off the queue asynchronously without blocking client HTTP responses.

## End-to-End Request Flows

### `GET /notes` Flow
1. Client issues `GET /api/v1/notes` to Load Balancer, routed to App Server 1.
2. App Server 1 queries Redis Cache for `user:{id}:notes`.
3. **Hit:** Cached notes JSON returned immediately to client.
4. **Miss:** App Server reads from Read Replica DB, caches payload in Redis, and returns JSON response to client.

### `POST /notes` Flow
1. Client issues `POST /api/v1/notes` payload to Load Balancer, routed to App Server 2.
2. App Server 2 validates payload title and constraints.
3. App Server writes record to Primary Database.
4. App Server invalidates Redis key `user:{id}:notes`.
5. App Server enqueues background job on Message Queue and responds with `201 Created`.


## Single Points of Failure & Trade-offs

### Eliminating SPOFs
*   **Application Tier:** Redundant stateless app servers behind health-checked load balancers guarantee availability if one node fails.
*   **Database Tier:** Automated failover from Primary DB to Read Replica maintains availability upon database node failure.

### Architectural Trade-offs
1. **Eventual Consistency vs Read Speed:** Caching via Redis minimizes DB load, but cache invalidation lag can briefly serve stale read data following write operations.
2. **Asynchronous Replication Lag:** Offloading reads to a read replica introduces a tiny latency window where a newly created note might not appear instantly on read queries executed strictly against the replica.