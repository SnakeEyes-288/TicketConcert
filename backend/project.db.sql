BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "members" (
	"id"	integer,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	"username"	text,
	"password"	text,
	"email"	text,
	"first_name"	text,
	"last_name"	text,
	"birthday"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "ticker_types" (
	"id"	integer,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	"type_name"	text,
	"description"	text,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tickers" (
	"id"	integer,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	"price"	real,
	"purchase_date"	datetime,
	"type_id"	integer,
	"member_id"	integer,
	CONSTRAINT "fk_ticker_types_tickers" FOREIGN KEY("type_id") REFERENCES "ticker_types"("id"),
	CONSTRAINT "fk_members_tickets" FOREIGN KEY("member_id") REFERENCES "members"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "payments" (
	"id"	integer,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	"payment_method"	text,
	"payment_date"	datetime,
	"amount"	real,
	"ticker_id"	integer,
	CONSTRAINT "fk_tickers_payment" FOREIGN KEY("ticker_id") REFERENCES "tickers"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "sms" (
	"id"	integer,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	"phone_number"	text,
	"message_content"	text,
	"sent_date"	datetime,
	"member_id"	integer,
	CONSTRAINT "fk_members_smss" FOREIGN KEY("member_id") REFERENCES "members"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE INDEX IF NOT EXISTS "idx_members_deleted_at" ON "members" (
	"deleted_at"
);
CREATE INDEX IF NOT EXISTS "idx_ticker_types_deleted_at" ON "ticker_types" (
	"deleted_at"
);
CREATE INDEX IF NOT EXISTS "idx_tickers_deleted_at" ON "tickers" (
	"deleted_at"
);
CREATE INDEX IF NOT EXISTS "idx_payments_deleted_at" ON "payments" (
	"deleted_at"
);
CREATE INDEX IF NOT EXISTS "idx_sms_deleted_at" ON "sms" (
	"deleted_at"
);
COMMIT;
