CREATE TABLE activity (
    transaction_id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(255),
    mobile_phone VARCHAR(255),
    email VARCHAR(255),
    middle_name VARCHAR(255),
    activity_type VARCHAR(255),
    created_at VARCHAR(255),
    amount VARCHAR(255),
    campaign_name VARCHAR(255),
    fund_name VARCHAR(255),
    transaction_type VARCHAR(255),
    tax_deductible_amount VARCHAR(255),
    declined VARCHAR(255),
    check_number VARCHAR(255),
    card VARCHAR(255),
    card_type VARCHAR(255),
    campaign_custom_1_question VARCHAR(255),
    campaign_custom_1_answer VARCHAR(255),
    split_parent VARCHAR(255),
    admin_note VARCHAR(255),
    designation VARCHAR(255),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    postal_code VARCHAR(255),
    country VARCHAR(255),
    gender VARCHAR(255),
    groups VARCHAR(255),
    payout_id VARCHAR(255),
    donation_plugin VARCHAR(255),
    integration_ids VARCHAR(255)
);

CREATE SEQUENCE dbo.import_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO CACHE;

CREATE TABLE import_log (
    id bigint PRIMARY KEY NOT NULL DEFAULT (NEXT VALUE FOR dbo.import_log_id_seq),
    csv_url VARCHAR(255),
    status VARCHAR(255),
    error NVARCHAR(MAX),
    operation_id VARCHAR(255),
    context NVARCHAR(MAX),
    creation_timestamp datetimeoffset(0)
);