-- ============================================================
--  Stylio — Schéma PostgreSQL complet (Supabase)
--  Migration 001 — Création des tables, RLS, triggers
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";   -- pour les requêtes géographiques

-- ─── Enum types ───────────────────────────────────────────────────────────────
CREATE TYPE user_role           AS ENUM ('client', 'hairdresser', 'moderator', 'admin');
CREATE TYPE subscription_plan   AS ENUM ('free', 'pro', 'vip');
CREATE TYPE booking_status      AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status      AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE service_category    AS ENUM (
  'coupe_femme', 'coupe_homme', 'coupe_enfant', 'coloration',
  'meches', 'balayage', 'permanente', 'lissage',
  'coiffure_mariee', 'brushing', 'soin', 'autre'
);
CREATE TYPE report_status       AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE report_target_type  AS ENUM ('review', 'profile', 'message', 'booking');

-- ─── Table: users (étend auth.users) ──────────────────────────────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'client',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.users IS 'Profils utilisateurs synchronisés avec auth.users';

-- ─── Table: hairdresser_profiles ─────────────────────────────────────────────
CREATE TABLE public.hairdresser_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio               TEXT,
  specialties       TEXT[]    NOT NULL DEFAULT '{}',
  years_experience  SMALLINT  NOT NULL DEFAULT 0,
  portfolio_images  TEXT[]    NOT NULL DEFAULT '{}',
  salon_name        TEXT,
  salon_address     TEXT,
  home_service      BOOLEAN   NOT NULL DEFAULT FALSE,
  salon_service     BOOLEAN   NOT NULL DEFAULT TRUE,
  city              TEXT      NOT NULL DEFAULT '',
  zip_code          TEXT      NOT NULL DEFAULT '',
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  location          GEOMETRY(POINT, 4326),   -- colonne PostGIS
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  subscription_end  TIMESTAMPTZ,
  rating            NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count      INTEGER   NOT NULL DEFAULT 0,
  is_verified       BOOLEAN   NOT NULL DEFAULT FALSE,
  is_featured       BOOLEAN   NOT NULL DEFAULT FALSE,
  stripe_account_id TEXT,                      -- Stripe Connect
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.hairdresser_profiles IS 'Profils étendus des coiffeurs indépendants';

-- Index géographique pour les recherches de proximité
CREATE INDEX hairdresser_location_idx ON public.hairdresser_profiles USING GIST(location);
CREATE INDEX hairdresser_city_idx     ON public.hairdresser_profiles (city);
CREATE INDEX hairdresser_plan_idx     ON public.hairdresser_profiles (subscription_plan);

-- ─── Table: services ─────────────────────────────────────────────────────────
CREATE TABLE public.services (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hairdresser_id    UUID NOT NULL REFERENCES public.hairdresser_profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  duration_minutes  SMALLINT NOT NULL CHECK (duration_minutes > 0),
  price             NUMERIC(6,2) NOT NULL CHECK (price >= 0),
  category          service_category NOT NULL DEFAULT 'autre',
  is_available      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX services_hairdresser_idx ON public.services (hairdresser_id);
CREATE INDEX services_category_idx    ON public.services (category);

-- ─── Table: availabilities ───────────────────────────────────────────────────
CREATE TABLE public.availabilities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hairdresser_id  UUID NOT NULL REFERENCES public.hairdresser_profiles(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Dim, 6=Sam
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (hairdresser_id, day_of_week)
);

-- ─── Table: bookings ─────────────────────────────────────────────────────────
CREATE TABLE public.bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  hairdresser_id  UUID NOT NULL REFERENCES public.hairdresser_profiles(id) ON DELETE RESTRICT,
  service_id      UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  date            DATE NOT NULL,
  time_slot       TIME NOT NULL,
  status          booking_status NOT NULL DEFAULT 'pending',
  total_price     NUMERIC(6,2) NOT NULL CHECK (total_price >= 0),
  location_type   TEXT NOT NULL DEFAULT 'salon' CHECK (location_type IN ('salon', 'home')),
  client_address  TEXT,
  notes           TEXT,
  cancelled_by    UUID REFERENCES public.users(id),
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX bookings_client_idx         ON public.bookings (client_id);
CREATE INDEX bookings_hairdresser_idx    ON public.bookings (hairdresser_id);
CREATE INDEX bookings_date_idx           ON public.bookings (date);
CREATE INDEX bookings_status_idx         ON public.bookings (status);

-- ─── Table: payments ─────────────────────────────────────────────────────────
CREATE TABLE public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE RESTRICT,
  client_id           UUID NOT NULL REFERENCES public.users(id),
  hairdresser_id      UUID NOT NULL REFERENCES public.hairdresser_profiles(id),
  amount              NUMERIC(6,2) NOT NULL,
  commission_rate     NUMERIC(4,2) NOT NULL DEFAULT 0.15,
  commission_amount   NUMERIC(6,2) NOT NULL,
  hairdresser_amount  NUMERIC(6,2) NOT NULL,
  status              payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_id   TEXT,
  stripe_transfer_id  TEXT,
  refund_reason       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX payments_client_idx      ON public.payments (client_id);
CREATE INDEX payments_hairdresser_idx ON public.payments (hairdresser_id);

-- ─── Table: conversations ────────────────────────────────────────────────────
CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table: messages ─────────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.users(id),
  content          TEXT NOT NULL,
  read             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id);
CREATE INDEX messages_sender_idx       ON public.messages (sender_id);

-- ─── Table: reviews ──────────────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hairdresser_id  UUID NOT NULL REFERENCES public.hairdresser_profiles(id) ON DELETE CASCADE,
  booking_id      UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX reviews_hairdresser_idx ON public.reviews (hairdresser_id);

-- ─── Table: reports (signalements) ──────────────────────────────────────────
CREATE TABLE public.reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  UUID NOT NULL REFERENCES public.users(id),
  target_type  report_target_type NOT NULL,
  target_id    UUID NOT NULL,
  reason       TEXT NOT NULL,
  status       report_status NOT NULL DEFAULT 'pending',
  handled_by   UUID REFERENCES public.users(id),
  handled_at   TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX reports_status_idx ON public.reports (status);

-- ─── Table: subscriptions (historique) ──────────────────────────────────────
CREATE TABLE public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hairdresser_id  UUID NOT NULL REFERENCES public.hairdresser_profiles(id) ON DELETE CASCADE,
  plan            subscription_plan NOT NULL,
  stripe_sub_id   TEXT,
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
--  TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Trigger: updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users','hairdresser_profiles','services','bookings','payments','reviews']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl
    );
  END LOOP;
END;
$$;

-- Trigger: sync hairdresser location PostGIS depuis lat/lng
CREATE OR REPLACE FUNCTION sync_hairdresser_location()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER sync_location
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.hairdresser_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_hairdresser_location();

-- Trigger: recalcul rating coiffeur après insert/update/delete avis
CREATE OR REPLACE FUNCTION refresh_hairdresser_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE target_id UUID;
BEGIN
  target_id := COALESCE(NEW.hairdresser_id, OLD.hairdresser_id);
  UPDATE public.hairdresser_profiles
  SET
    rating       = COALESCE((SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM public.reviews WHERE hairdresser_id = target_id AND is_visible = TRUE), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE hairdresser_id = target_id AND is_visible = TRUE)
  WHERE id = target_id;
  RETURN NULL;
END;
$$;
CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_hairdresser_rating();

-- Trigger: auto-créer profil hairdresser à l'inscription
CREATE OR REPLACE FUNCTION create_hairdresser_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'hairdresser' THEN
    INSERT INTO public.hairdresser_profiles (user_id, city, zip_code)
    VALUES (NEW.id, '', '')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER after_user_role_set
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_hairdresser_profile();

-- Trigger: sync users depuis auth.users (création)
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ═══════════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hairdresser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;

-- Helper: récupérer le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE POLICY "users_select_own"    ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_select_admin"  ON public.users FOR SELECT USING (auth_user_role() IN ('admin', 'moderator'));
CREATE POLICY "users_update_own"    ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_update_admin"  ON public.users FOR UPDATE USING (auth_user_role() = 'admin');

-- ── hairdresser_profiles ──────────────────────────────────────────────────────
CREATE POLICY "hp_select_public"  ON public.hairdresser_profiles FOR SELECT USING (TRUE);
CREATE POLICY "hp_insert_own"     ON public.hairdresser_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "hp_update_own"     ON public.hairdresser_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "hp_update_admin"   ON public.hairdresser_profiles FOR UPDATE USING (auth_user_role() IN ('admin', 'moderator'));

-- ── services ─────────────────────────────────────────────────────────────────
CREATE POLICY "services_select_public" ON public.services FOR SELECT USING (is_available = TRUE);
CREATE POLICY "services_all_own"       ON public.services FOR ALL
  USING (hairdresser_id IN (SELECT id FROM public.hairdresser_profiles WHERE user_id = auth.uid()));

-- ── availabilities ────────────────────────────────────────────────────────────
CREATE POLICY "avail_select_public" ON public.availabilities FOR SELECT USING (TRUE);
CREATE POLICY "avail_all_own"       ON public.availabilities FOR ALL
  USING (hairdresser_id IN (SELECT id FROM public.hairdresser_profiles WHERE user_id = auth.uid()));

-- ── bookings ─────────────────────────────────────────────────────────────────
CREATE POLICY "bookings_client_own" ON public.bookings FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "bookings_hairdresser_own" ON public.bookings FOR SELECT
  USING (hairdresser_id IN (SELECT id FROM public.hairdresser_profiles WHERE user_id = auth.uid()));
CREATE POLICY "bookings_insert_client" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "bookings_update_parties" ON public.bookings FOR UPDATE
  USING (
    client_id = auth.uid()
    OR hairdresser_id IN (SELECT id FROM public.hairdresser_profiles WHERE user_id = auth.uid())
    OR auth_user_role() IN ('admin', 'moderator')
  );
CREATE POLICY "bookings_admin"      ON public.bookings FOR SELECT USING (auth_user_role() IN ('admin', 'moderator'));

-- ── payments ─────────────────────────────────────────────────────────────────
CREATE POLICY "payments_client_own"      ON public.payments FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "payments_hairdresser_own" ON public.payments FOR SELECT
  USING (hairdresser_id IN (SELECT id FROM public.hairdresser_profiles WHERE user_id = auth.uid()));
CREATE POLICY "payments_admin"           ON public.payments FOR SELECT USING (auth_user_role() = 'admin');

-- ── messages & conversations ──────────────────────────────────────────────────
CREATE POLICY "conv_participants" ON public.conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "conv_insert"       ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "msg_participants" ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids)));
CREATE POLICY "msg_insert"       ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids))
  );

-- ── reviews ──────────────────────────────────────────────────────────────────
CREATE POLICY "reviews_select_visible" ON public.reviews FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "reviews_select_own"     ON public.reviews FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "reviews_insert_client"  ON public.reviews FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND booking_id IN (SELECT id FROM public.bookings WHERE client_id = auth.uid() AND status = 'completed')
  );
CREATE POLICY "reviews_admin_all"      ON public.reviews FOR ALL USING (auth_user_role() IN ('admin', 'moderator'));

-- ── reports ──────────────────────────────────────────────────────────────────
CREATE POLICY "reports_insert_auth"  ON public.reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_admin_all"    ON public.reports FOR ALL USING (auth_user_role() IN ('admin', 'moderator'));

-- ── subscriptions ────────────────────────────────────────────────────────────
CREATE POLICY "subs_own"   ON public.subscriptions FOR SELECT
  USING (hairdresser_id IN (SELECT id FROM public.hairdresser_profiles WHERE user_id = auth.uid()));
CREATE POLICY "subs_admin" ON public.subscriptions FOR ALL USING (auth_user_role() = 'admin');

-- ═══════════════════════════════════════════════════════════════════════════════
--  STORAGE BUCKETS (à créer via Supabase dashboard ou CLI)
-- ═══════════════════════════════════════════════════════════════════════════════
-- supabase storage create avatars       --public
-- supabase storage create portfolios    --public
-- supabase storage create documents     --private

-- ═══════════════════════════════════════════════════════════════════════════════
--  SEED DATA — données de test initiales
-- ═══════════════════════════════════════════════════════════════════════════════
-- (À exécuter séparément via seed.sql ou Supabase Studio)
-- Voir /supabase/seed.sql pour les données de démonstration
