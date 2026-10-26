### `docs/data-model.md`

```markdown
# QuickNotes Data Model Specification

## Entities & Columns

*   **`users`**: `id` (BIGINT, PK, AUTO_INCREMENT), `email` (VARCHAR(255), UNIQUE, NOT NULL), `password_hash` (VARCHAR(255), NOT NULL), `created_at` (TIMESTAMP).
*   **`notes`**: `id` (BIGINT, PK, AUTO_INCREMENT), `user_id` (BIGINT, FK -> `users.id`, NOT NULL), `title` (VARCHAR(100), NOT NULL), `body` (TEXT), `created_at` (TIMESTAMP), `updated_at` (TIMESTAMP).
*   **`tags`**: `id` (BIGINT, PK, AUTO_INCREMENT), `name` (VARCHAR(50), UNIQUE, NOT NULL).
*   **`note_tags`**: `note_id` (BIGINT, FK -> `notes.id`), `tag_id` (BIGINT, FK -> `tags.id`), PK (`note_id`, `tag_id`).

---

## Relationships

*   **One-to-Many (`users` → `notes`)**: One user owns zero or many notes; each note belongs to exactly one user via `notes.user_id`.
*   **Many-to-Many (`notes` ↔ `tags`)**: A note can associate with multiple tags, and a tag can apply to multiple notes via the `note_tags` junction table.

---

## DDL Statements

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note_tags_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);

INSERT INTO notes (user_id, title, body)
VALUES (12, 'Sprint Planning', 'Finalize API documentation and schema migration.');
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 12
ORDER BY created_at DESC
LIMIT 10;

SELECT 
    n.id AS note_id,
    n.title,
    n.body,
    n.created_at,
    GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') AS tags
FROM notes n
LEFT JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.user_id = 12
GROUP BY n.id, n.title, n.body, n.created_at
ORDER BY n.created_at DESC
LIMIT 10;