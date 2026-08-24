CREATE TABLE categories (
    id          VARCHAR(255) PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    approved    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE tags (
    id          VARCHAR(255) PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    approved    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE posts (
    id              VARCHAR(255) PRIMARY KEY,
    company_name    VARCHAR(255) NOT NULL,
    category_name   VARCHAR(255),
    description     TEXT,
    submitted_by    VARCHAR(255),
    anonymous       BOOLEAN NOT NULL DEFAULT false,
    status          VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP,
    reviewed_at     TIMESTAMP,
    reviewed_by     VARCHAR(255),
    source_links    JSONB,
    highlights      JSONB,
    tags            JSONB
);

-- Optional indexes
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);