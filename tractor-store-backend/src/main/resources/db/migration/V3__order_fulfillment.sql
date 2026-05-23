ALTER TABLE order_header
    ADD COLUMN fulfillment_type VARCHAR(16) NOT NULL DEFAULT 'DELIVERY',
    ADD COLUMN pickup_store_id VARCHAR(64) REFERENCES catalog_store(store_id),
    ADD COLUMN customer_email VARCHAR(255),
    ADD COLUMN customer_name VARCHAR(255),
    ADD COLUMN shipping_address VARCHAR(255),
    ADD COLUMN shipping_city VARCHAR(128),
    ADD COLUMN shipping_zip VARCHAR(32);
