-- GreenLens Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  company TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  report_year INT NOT NULL,
  report_text TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'stage1', 'stage2', 'stage3', 'stage4', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results
CREATE TABLE IF NOT EXISTS public.results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE UNIQUE,
  score INT CHECK (score >= 0 AND score <= 100),
  grade TEXT CHECK (grade IN ('trusted', 'suspicious', 'critical')),
  stage1_result JSONB,
  stage2_result JSONB,
  stage3_result JSONB,
  stage4_result JSONB,
  verdict TEXT,
  radar_data JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT CHECK (type IN ('FACTUAL_CLAIM', 'INTENTION_DECLARATION', 'NUMERICAL_CLAIM', 'VAGUE_RHETORIC')),
  flag TEXT CHECK (flag IN ('red', 'amber', 'green')),
  penalty_points INT DEFAULT 0,
  evidence_found BOOLEAN DEFAULT FALSE,
  evidence_type TEXT,
  stage INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.analyses(status);
CREATE INDEX IF NOT EXISTS idx_claims_analysis_id ON public.claims(analysis_id);
CREATE INDEX IF NOT EXISTS idx_results_analysis_id ON public.results(analysis_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- profiles: own row only
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);

-- analyses: own rows only
CREATE POLICY "analyses_own" ON public.analyses FOR ALL USING (auth.uid() = user_id);

-- results: via analysis ownership
CREATE POLICY "results_own" ON public.results FOR ALL USING (
  EXISTS (SELECT 1 FROM public.analyses WHERE analyses.id = results.analysis_id AND analyses.user_id = auth.uid())
);

-- claims: via analysis ownership
CREATE POLICY "claims_own" ON public.claims FOR ALL USING (
  EXISTS (SELECT 1 FROM public.analyses WHERE analyses.id = claims.analysis_id AND analyses.user_id = auth.uid())
);

-- Function: auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
