--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_students (
    batch_id uuid NOT NULL,
    student_id uuid NOT NULL
);


ALTER TABLE public.batch_students OWNER TO postgres;

--
-- Name: batch_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_subjects (
    batch_id uuid NOT NULL,
    subject_id uuid NOT NULL
);


ALTER TABLE public.batch_subjects OWNER TO postgres;

--
-- Name: batch_timeslots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_timeslots (
    timeslot_id integer NOT NULL,
    batch_id uuid NOT NULL,
    day_of_week character varying(10) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    slot_index integer NOT NULL,
    slot_name character varying(50),
    is_break boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.batch_timeslots OWNER TO postgres;

--
-- Name: batch_timeslots_timeslot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_timeslots_timeslot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.batch_timeslots_timeslot_id_seq OWNER TO postgres;

--
-- Name: batch_timeslots_timeslot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batch_timeslots_timeslot_id_seq OWNED BY public.batch_timeslots.timeslot_id;


--
-- Name: batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batches (
    batch_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    academic_year character varying(20),
    semester_number integer,
    department character varying(100)
);


ALTER TABLE public.batches OWNER TO postgres;

--
-- Name: class_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_sessions (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    batch_timeslot_id integer NOT NULL,
    room_id uuid NOT NULL,
    session_type character varying(20) DEFAULT 'lecture'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.class_sessions OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_name character varying(50) NOT NULL,
    capacity integer,
    is_lab boolean DEFAULT false
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    subject_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    lecture_credits integer,
    lab_credits integer
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    teacher_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    user_id uuid
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- Name: batch_timetable_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.batch_timetable_view AS
 SELECT cs.session_id,
    cs.session_type,
    b.name AS batch_name,
    s.name AS subject_name,
    s.code AS subject_code,
    t.name AS teacher_name,
    r.room_name,
    bt.day_of_week,
    bt.start_time,
    bt.end_time,
    bt.slot_index,
    bt.slot_name,
    cs.batch_id,
    cs.subject_id,
    cs.teacher_id,
    cs.room_id,
    cs.batch_timeslot_id
   FROM (((((public.class_sessions cs
     JOIN public.batches b ON ((cs.batch_id = b.batch_id)))
     JOIN public.subjects s ON ((cs.subject_id = s.subject_id)))
     JOIN public.teachers t ON ((cs.teacher_id = t.teacher_id)))
     JOIN public.rooms r ON ((cs.room_id = r.room_id)))
     JOIN public.batch_timeslots bt ON ((cs.batch_timeslot_id = bt.timeslot_id)))
  ORDER BY b.name, bt.day_of_week, bt.slot_index;


ALTER VIEW public.batch_timetable_view OWNER TO postgres;

--
-- Name: blocked_timeslots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_timeslots (
    block_id integer NOT NULL,
    timeslot_id uuid,
    reason character varying(255),
    blocked_date date,
    is_permanent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    batch_timeslot_id integer
);


ALTER TABLE public.blocked_timeslots OWNER TO postgres;

--
-- Name: blocked_timeslots_block_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blocked_timeslots_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blocked_timeslots_block_id_seq OWNER TO postgres;

--
-- Name: blocked_timeslots_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blocked_timeslots_block_id_seq OWNED BY public.blocked_timeslots.block_id;


--
-- Name: class_sessions_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_sessions_backup (
    session_id uuid,
    subject_id uuid,
    batch_id uuid,
    teacher_id uuid,
    timeslot_id uuid,
    room_id uuid,
    session_type character varying(20),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.class_sessions_backup OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    user_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    roll_number character varying(20) NOT NULL
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: teacher_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_allocations (
    allocation_id integer NOT NULL,
    teacher_id uuid,
    subject_id uuid,
    batch_id uuid,
    can_teach_lecture boolean DEFAULT true,
    can_teach_lab boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teacher_allocations OWNER TO postgres;

--
-- Name: teacher_allocations_allocation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_allocations_allocation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_allocations_allocation_id_seq OWNER TO postgres;

--
-- Name: teacher_allocations_allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_allocations_allocation_id_seq OWNED BY public.teacher_allocations.allocation_id;


--
-- Name: timeslots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timeslots (
    timeslot_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    day_of_week character varying(10) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    slot_index integer NOT NULL,
    is_practical_slot boolean DEFAULT false
);


ALTER TABLE public.timeslots OWNER TO postgres;

--
-- Name: timetable_generations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable_generations (
    generation_id integer NOT NULL,
    batch_id uuid,
    status character varying(20) NOT NULL,
    objective_value numeric(10,2),
    solver_time_seconds integer,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    error_message text,
    output_file_path character varying(255)
);


ALTER TABLE public.timetable_generations OWNER TO postgres;

--
-- Name: timetable_generations_generation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.timetable_generations_generation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timetable_generations_generation_id_seq OWNER TO postgres;

--
-- Name: timetable_generations_generation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.timetable_generations_generation_id_seq OWNED BY public.timetable_generations.generation_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100),
    email character varying(100) NOT NULL,
    password_hash character varying(255),
    google_id character varying(255),
    provider character varying(20) DEFAULT 'local'::character varying NOT NULL,
    role_id integer,
    requires_password_change boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: batch_timeslots timeslot_id; Type: DEFAULT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.batch_timeslots ALTER COLUMN timeslot_id SET DEFAULT nextval('public.batch_timeslots_timeslot_id_seq'::regclass);


--
-- Name: blocked_timeslots block_id; Type: DEFAULT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.blocked_timeslots ALTER COLUMN block_id SET DEFAULT nextval('public.blocked_timeslots_block_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: teacher_allocations allocation_id; Type: DEFAULT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.teacher_allocations ALTER COLUMN allocation_id SET DEFAULT nextval('public.teacher_allocations_allocation_id_seq'::regclass);


--
-- Name: timetable_generations generation_id; Type: DEFAULT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.timetable_generations ALTER COLUMN generation_id SET DEFAULT nextval('public.timetable_generations_generation_id_seq'::regclass);


--
-- Name: batch_students batch_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_students
    ADD CONSTRAINT batch_students_pkey PRIMARY KEY (batch_id, student_id);


--
-- Name: batch_subjects batch_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_subjects
    ADD CONSTRAINT batch_subjects_pkey PRIMARY KEY (batch_id, subject_id);


--
-- Name: batch_timeslots batch_timeslots_batch_id_day_of_week_slot_index_key; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.batch_timeslots
    ADD CONSTRAINT batch_timeslots_batch_id_day_of_week_slot_index_key UNIQUE (batch_id, day_of_week, slot_index);


--
-- Name: batch_timeslots batch_timeslots_pkey; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.batch_timeslots
    ADD CONSTRAINT batch_timeslots_pkey PRIMARY KEY (timeslot_id);


--
-- Name: batches batches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_name_key UNIQUE (name);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (batch_id);


--
-- Name: blocked_timeslots blocked_timeslots_pkey; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.blocked_timeslots
    ADD CONSTRAINT blocked_timeslots_pkey PRIMARY KEY (block_id);


--
-- Name: class_sessions class_sessions_new_pkey; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_new_pkey PRIMARY KEY (session_id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: rooms rooms_room_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_name_key UNIQUE (room_name);


--
-- Name: students students_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_email_key UNIQUE (email);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- Name: students students_roll_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_roll_number_key UNIQUE (roll_number);


--
-- Name: subjects subjects_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_key UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- Name: teacher_allocations teacher_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.teacher_allocations
    ADD CONSTRAINT teacher_allocations_pkey PRIMARY KEY (allocation_id);


--
-- Name: teacher_allocations teacher_allocations_unique; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.teacher_allocations
    ADD CONSTRAINT teacher_allocations_unique UNIQUE (teacher_id, subject_id, batch_id);


--
-- Name: teachers teachers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_email_key UNIQUE (email);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (teacher_id);


--
-- Name: teachers teachers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);


--
-- Name: timeslots timeslots_day_slot_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeslots
    ADD CONSTRAINT timeslots_day_slot_unique UNIQUE (day_of_week, slot_index);


--
-- Name: timeslots timeslots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeslots
    ADD CONSTRAINT timeslots_pkey PRIMARY KEY (timeslot_id);


--
-- Name: timetable_generations timetable_generations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_generations
    ADD CONSTRAINT timetable_generations_pkey PRIMARY KEY (generation_id);


--
-- Name: class_sessions unique_batch_room_timeslot; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT unique_batch_room_timeslot UNIQUE (batch_id, room_id, batch_timeslot_id);


--
-- Name: class_sessions unique_batch_teacher_timeslot; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT unique_batch_teacher_timeslot UNIQUE (batch_id, teacher_id, batch_timeslot_id);


--
-- Name: class_sessions unique_batch_timeslot_new; Type: CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT unique_batch_timeslot_new UNIQUE (batch_id, batch_timeslot_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_batch_timeslots_batch_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_batch_timeslots_batch_id ON public.batch_timeslots USING btree (batch_id);


--
-- Name: idx_batch_timeslots_day_slot; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_batch_timeslots_day_slot ON public.batch_timeslots USING btree (batch_id, day_of_week, slot_index);


--
-- Name: idx_class_sessions_batch_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_class_sessions_batch_id ON public.class_sessions USING btree (batch_id);


--
-- Name: idx_class_sessions_batch_timeslot_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_class_sessions_batch_timeslot_id ON public.class_sessions USING btree (batch_timeslot_id);


--
-- Name: idx_class_sessions_room_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_class_sessions_room_id ON public.class_sessions USING btree (room_id);


--
-- Name: idx_class_sessions_teacher_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_class_sessions_teacher_id ON public.class_sessions USING btree (teacher_id);


--
-- Name: idx_teacher_allocations_batch_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_teacher_allocations_batch_id ON public.teacher_allocations USING btree (batch_id);


--
-- Name: idx_teacher_allocations_subject_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_teacher_allocations_subject_id ON public.teacher_allocations USING btree (subject_id);


--
-- Name: idx_teacher_allocations_teacher_id; Type: INDEX; Schema: public; Owner: timetable
--

CREATE INDEX idx_teacher_allocations_teacher_id ON public.teacher_allocations USING btree (teacher_id);


--
-- Name: idx_timeslots_day_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_timeslots_day_slot ON public.timeslots USING btree (day_of_week, slot_index);


--
-- Name: batch_students batch_students_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_students
    ADD CONSTRAINT batch_students_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id) ON DELETE CASCADE;


--
-- Name: batch_students batch_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_students
    ADD CONSTRAINT batch_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- Name: batch_subjects batch_subjects_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_subjects
    ADD CONSTRAINT batch_subjects_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id) ON DELETE CASCADE;


--
-- Name: batch_subjects batch_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_subjects
    ADD CONSTRAINT batch_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- Name: batch_timeslots batch_timeslots_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.batch_timeslots
    ADD CONSTRAINT batch_timeslots_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id) ON DELETE CASCADE;


--
-- Name: blocked_timeslots blocked_timeslots_batch_timeslot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.blocked_timeslots
    ADD CONSTRAINT blocked_timeslots_batch_timeslot_id_fkey FOREIGN KEY (batch_timeslot_id) REFERENCES public.batch_timeslots(timeslot_id) ON DELETE CASCADE;


--
-- Name: class_sessions class_sessions_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id) ON DELETE CASCADE;


--
-- Name: class_sessions class_sessions_batch_timeslot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_batch_timeslot_id_fkey FOREIGN KEY (batch_timeslot_id) REFERENCES public.batch_timeslots(timeslot_id) ON DELETE CASCADE;


--
-- Name: class_sessions class_sessions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE RESTRICT;


--
-- Name: class_sessions class_sessions_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(teacher_id) ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_allocations teacher_allocations_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.teacher_allocations
    ADD CONSTRAINT teacher_allocations_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id) ON DELETE CASCADE;


--
-- Name: teacher_allocations teacher_allocations_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.teacher_allocations
    ADD CONSTRAINT teacher_allocations_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: teacher_allocations teacher_allocations_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.teacher_allocations
    ADD CONSTRAINT teacher_allocations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(teacher_id);


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: timetable_generations timetable_generations_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: timetable
--

ALTER TABLE ONLY public.timetable_generations
    ADD CONSTRAINT timetable_generations_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: TABLE batch_students; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.batch_students TO postgres;


--
-- Name: TABLE batch_subjects; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.batch_subjects TO postgres;


--
-- Name: TABLE batches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.batches TO postgres;


--
-- Name: TABLE rooms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rooms TO postgres;


--
-- Name: TABLE subjects; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subjects TO postgres;


--
-- Name: TABLE teachers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.teachers TO postgres;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.refresh_tokens TO postgres;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO postgres;


--
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.roles_id_seq TO postgres;


--
-- Name: TABLE students; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.students TO postgres;


--
-- Name: TABLE timeslots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.timeslots TO postgres;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO postgres;


--
-- PostgreSQL database dump complete
--

