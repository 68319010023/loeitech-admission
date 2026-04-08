-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP TYPE public."payment_status";

CREATE TYPE public."payment_status" AS ENUM (
	'บังคับจ่าย',
	'ไม่บังคับจ่าย');

-- DROP TYPE public."payment_type";

CREATE TYPE public."payment_type" AS ENUM (
	'บังคับจ่าย',
	'ไม่บังคับจ่าย');

-- DROP SEQUENCE public.admission_plan_ap_id_seq;

CREATE SEQUENCE public.admission_plan_ap_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.curriculums_cur_id_seq;

CREATE SEQUENCE public.curriculums_cur_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.divisions_div_id_seq;

CREATE SEQUENCE public.divisions_div_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.expense_detail_exp_id_seq;

CREATE SEQUENCE public.expense_detail_exp_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.curriculums definition

-- Drop table

-- DROP TABLE public.curriculums;

CREATE TABLE public.curriculums (
	cur_id serial4 NOT NULL,
	cur_name varchar(200) NULL,
	cur_shortname varchar(50) NULL,
	CONSTRAINT curriculums_pkey PRIMARY KEY (cur_id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	username varchar(100) NOT NULL,
	password_hash varchar(255) NOT NULL,
	"role" varchar(10) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'staff'::character varying])::text[]))),
	CONSTRAINT users_username_key UNIQUE (username)
);


-- public.divisions definition

-- Drop table

-- DROP TABLE public.divisions;

CREATE TABLE public.divisions (
	div_id serial4 NOT NULL,
	div_name varchar(100) NULL,
	cur_id int4 NULL,
	CONSTRAINT divisions_pkey PRIMARY KEY (div_id),
	CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id)
);


-- public.expense_detail definition

-- Drop table

-- DROP TABLE public.expense_detail;

CREATE TABLE public.expense_detail (
	exp_id serial4 NOT NULL,
	exp_name varchar(200) NULL,
	exp_detail text NOT NULL,
	exp_img text NULL,
	cur_id int4 NULL,
	exp_cost float8 NULL,
	"payment_type" varchar(20) NULL,
	CONSTRAINT expense_detail_pkey PRIMARY KEY (exp_id),
	CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id)
);


-- public.admission_plan definition

-- Drop table

-- DROP TABLE public.admission_plan;

CREATE TABLE public.admission_plan (
	ap_id serial4 NOT NULL,
	ap_years varchar(10) NULL,
	div_id int4 NULL,
	cur_id int4 NULL,
	plan_num int4 NULL,
	CONSTRAINT admission_plan_pkey PRIMARY KEY (ap_id),
	CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id),
	CONSTRAINT fk_div_id FOREIGN KEY (div_id) REFERENCES public.divisions(div_id)
);


-- public.applicants definition

-- Drop table

-- DROP TABLE public.applicants;

CREATE TABLE public.applicants (
	app_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	id_card_number varchar(20) NOT NULL, -- หมายเลขประจำตัว ตามประเภทเอกสาร (id_type) เช่น เลขบัตรปชช. 13 หลัก / เลขต่างด้าว / passport / G-code
	prefix varchar(20) NOT NULL,
	full_name varchar(200) NOT NULL,
	address text NOT NULL,
	phone varchar(15) NOT NULL,
	email varchar(200) NOT NULL,
	prev_school varchar(200) NOT NULL,
	prev_level varchar(10) NOT NULL,
	prev_year varchar(4) NOT NULL,
	gpa varchar(10) NOT NULL,
	cur_id int4 NOT NULL,
	div_id int4 NOT NULL,
	ap_id int4 NOT NULL,
	status varchar(30) DEFAULT 'pending_payment'::character varying NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	id_type varchar(20) DEFAULT 'thai_id'::character varying NOT NULL, -- ประเภทเอกสารแสดงตน: thai_id, alien_id, passport, g_code, other
	CONSTRAINT applicants_id_card_number_key UNIQUE (id_card_number),
	CONSTRAINT applicants_pkey PRIMARY KEY (app_id),
	CONSTRAINT fk_ap_id FOREIGN KEY (ap_id) REFERENCES public.admission_plan(ap_id),
	CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id),
	CONSTRAINT fk_div_id FOREIGN KEY (div_id) REFERENCES public.divisions(div_id)
);

-- Column comments

COMMENT ON COLUMN public.applicants.id_card_number IS 'หมายเลขประจำตัว ตามประเภทเอกสาร (id_type) เช่น เลขบัตรปชช. 13 หลัก / เลขต่างด้าว / passport / G-code';
COMMENT ON COLUMN public.applicants.id_type IS 'ประเภทเอกสารแสดงตน: thai_id, alien_id, passport, g_code, other';

-- Table Triggers

create trigger update_applicants_updated_at before
update
    on
    public.applicants for each row execute function update_updated_at_column();


-- public.documents definition

-- Drop table

-- DROP TABLE public.documents;

CREATE TABLE public.documents (
	doc_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	app_id uuid NOT NULL,
	doc_type varchar(50) NOT NULL,
	file_path text NOT NULL,
	file_name varchar(200) NOT NULL,
	file_size int4 NULL,
	uploaded_at timestamp DEFAULT now() NULL,
	CONSTRAINT documents_pkey PRIMARY KEY (doc_id),
	CONSTRAINT fk_app_id FOREIGN KEY (app_id) REFERENCES public.applicants(app_id) ON DELETE CASCADE
);


-- public.enrollments definition

-- Drop table

-- DROP TABLE public.enrollments;

CREATE TABLE public.enrollments (
	enroll_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	app_id uuid NOT NULL,
	tabien_self_path text NULL,
	tabien_father_path text NULL,
	tabien_mother_path text NULL,
	enrolled_at timestamp DEFAULT now() NULL,
	verified_at timestamp NULL,
	verified_by varchar(200) NULL,
	CONSTRAINT enrollments_app_id_key UNIQUE (app_id),
	CONSTRAINT enrollments_pkey PRIMARY KEY (enroll_id),
	CONSTRAINT fk_app_id FOREIGN KEY (app_id) REFERENCES public.applicants(app_id) ON DELETE CASCADE
);


-- public.onsite_enrollments definition

-- Drop table

-- DROP TABLE public.onsite_enrollments;

CREATE TABLE public.onsite_enrollments (
	onsite_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	ap_id int4 NOT NULL,
	count int4 DEFAULT 0 NOT NULL,
	note text NULL,
	recorded_by varchar(200) NOT NULL,
	recorded_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT onsite_enrollments_ap_id_key UNIQUE (ap_id),
	CONSTRAINT onsite_enrollments_pkey PRIMARY KEY (onsite_id),
	CONSTRAINT fk_ap_id FOREIGN KEY (ap_id) REFERENCES public.admission_plan(ap_id)
);


-- public.payments definition

-- Drop table

-- DROP TABLE public.payments;

CREATE TABLE public.payments (
	pay_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	app_id uuid NOT NULL,
	total_amount float8 NOT NULL,
	required_amount float8 NOT NULL,
	optional_amount float8 DEFAULT 0 NOT NULL,
	slip_path text NULL,
	slip_name varchar(200) NULL,
	paid_at timestamp NULL,
	due_date timestamp NOT NULL,
	verified_at timestamp NULL,
	verified_by varchar(200) NULL,
	CONSTRAINT payments_app_id_key UNIQUE (app_id),
	CONSTRAINT payments_pkey PRIMARY KEY (pay_id),
	CONSTRAINT fk_app_id FOREIGN KEY (app_id) REFERENCES public.applicants(app_id) ON DELETE CASCADE
);


-- public.applicant_expenses definition

-- Drop table

-- DROP TABLE public.applicant_expenses;

CREATE TABLE public.applicant_expenses (
	ae_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	app_id uuid NOT NULL,
	exp_id int4 NOT NULL,
	quantity int4 DEFAULT 1 NOT NULL,
	"size" varchar(10) NULL,
	unit_price float8 NOT NULL,
	total_price float8 NOT NULL,
	is_required bool DEFAULT false NOT NULL,
	CONSTRAINT applicant_expenses_pkey PRIMARY KEY (ae_id),
	CONSTRAINT fk_app_id FOREIGN KEY (app_id) REFERENCES public.applicants(app_id) ON DELETE CASCADE,
	CONSTRAINT fk_exp_id FOREIGN KEY (exp_id) REFERENCES public.expense_detail(exp_id)
);



-- DROP FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.uuid_generate_v1();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;

-- DROP FUNCTION public.uuid_generate_v1mc();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;

-- DROP FUNCTION public.uuid_generate_v3(uuid, text);

CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;

-- DROP FUNCTION public.uuid_generate_v4();

CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;

-- DROP FUNCTION public.uuid_generate_v5(uuid, text);

CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;

-- DROP FUNCTION public.uuid_nil();

CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;

-- DROP FUNCTION public.uuid_ns_dns();

CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;

-- DROP FUNCTION public.uuid_ns_oid();

CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;

-- DROP FUNCTION public.uuid_ns_url();

CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;

-- DROP FUNCTION public.uuid_ns_x500();

CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;

-- DROP FUNCTION public.validate_student_id_card();

CREATE OR REPLACE FUNCTION public.validate_student_id_card()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT validate_thai_id(NEW.id_card_number) THEN
        RAISE EXCEPTION 'Invalid Thai ID number format';
    END IF;
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.validate_thai_id(varchar);

CREATE OR REPLACE FUNCTION public.validate_thai_id(id_number character varying)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    sum INTEGER := 0;
    i INTEGER;
    digit INTEGER;
    checksum INTEGER;
BEGIN
    IF LENGTH(id_number) != 13 OR id_number ~ '[^0-9]' THEN
        RETURN FALSE;
    END IF;
    FOR i IN 1..12 LOOP
        digit := CAST(SUBSTRING(id_number, i, 1) AS INTEGER);
        sum := sum + (digit * (13 - i + 1));
    END LOOP;
    checksum := (11 - (sum % 11)) % 10;
    RETURN checksum = CAST(SUBSTRING(id_number, 13, 1) AS INTEGER);
END;
$function$
;