-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

-- DROP TYPE public.payment_status;

CREATE TYPE public.payment_status AS ENUM (
	'บังคับจ่าย',
	'ไม่บังคับจ่าย');

-- DROP TYPE public.payment_type;

CREATE TYPE public.payment_type AS ENUM (
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
	payment_type varchar(20) NULL,
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