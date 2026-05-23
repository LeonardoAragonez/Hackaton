CREATE TABLE catalog_teaser (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    image       VARCHAR(512) NOT NULL,
    url         VARCHAR(512) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE catalog_category (
    category_key VARCHAR(64) PRIMARY KEY,
    name         VARCHAR(255) NOT NULL
);

CREATE TABLE catalog_category_product (
    id           BIGSERIAL PRIMARY KEY,
    category_key VARCHAR(64) NOT NULL REFERENCES catalog_category(category_key),
    product_id   VARCHAR(32) NOT NULL,
    name         VARCHAR(255) NOT NULL,
    image        VARCHAR(512) NOT NULL,
    start_price  INT NOT NULL,
    url          VARCHAR(512) NOT NULL,
    sort_order   INT NOT NULL DEFAULT 0
);

CREATE TABLE catalog_product (
    product_id  VARCHAR(32) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(64) NOT NULL,
    highlights  JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE catalog_variant (
    sku        VARCHAR(32) PRIMARY KEY,
    product_id VARCHAR(32) NOT NULL REFERENCES catalog_product(product_id),
    name       VARCHAR(128) NOT NULL,
    image      VARCHAR(512) NOT NULL,
    color      VARCHAR(32),
    price      INT NOT NULL
);

CREATE TABLE catalog_recommendation (
    sku   VARCHAR(32) PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    image VARCHAR(512) NOT NULL,
    url   VARCHAR(512) NOT NULL,
    rgb   JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE catalog_store (
    store_id VARCHAR(64) PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    street   VARCHAR(255) NOT NULL,
    city     VARCHAR(128) NOT NULL,
    image    VARCHAR(512) NOT NULL
);

CREATE TABLE inventory_item (
    sku      VARCHAR(32) PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE cart_session (
    session_id VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_item (
    id         BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES cart_session(session_id) ON DELETE CASCADE,
    sku        VARCHAR(32) NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    unit_price INT NOT NULL,
    name       VARCHAR(255) NOT NULL,
    image      VARCHAR(512) NOT NULL,
    UNIQUE (session_id, sku)
);

CREATE TABLE order_header (
    order_id     UUID PRIMARY KEY,
    session_id   VARCHAR(64) NOT NULL,
    status       VARCHAR(32) NOT NULL,
    total_amount INT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_line (
    id         BIGSERIAL PRIMARY KEY,
    order_id   UUID NOT NULL REFERENCES order_header(order_id) ON DELETE CASCADE,
    sku        VARCHAR(32) NOT NULL,
    quantity   INT NOT NULL,
    unit_price INT NOT NULL,
    name       VARCHAR(255) NOT NULL,
    image      VARCHAR(512) NOT NULL
);

CREATE TABLE notification_log (
    id         BIGSERIAL PRIMARY KEY,
    order_id   UUID NOT NULL,
    channel    VARCHAR(64) NOT NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalog_category_product_key ON catalog_category_product(category_key);
CREATE INDEX idx_cart_item_session ON cart_item(session_id);
CREATE INDEX idx_order_line_order ON order_line(order_id);
