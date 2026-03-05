-- NexiaAI Production Database Schema

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  confidence DECIMAL(3,2),
  category TEXT,
  detected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  score INTEGER,
  total_questions INTEGER,
  passed BOOLEAN,
  test_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  confidence DECIMAL(3,2),
  skill_count INTEGER,
  test_score INTEGER,
  project_count INTEGER,
  predicted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE interview_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  overall_score INTEGER,
  posture_score INTEGER,
  eye_contact_score INTEGER,
  gestures_score INTEGER,
  speech_score INTEGER,
  duration INTEGER,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_title TEXT,
  company TEXT,
  match_percentage INTEGER,
  location TEXT,
  salary_range TEXT,
  recommended_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_tests_user ON skill_tests(user_id);
CREATE INDEX idx_predictions_user ON ml_predictions(user_id);
CREATE INDEX idx_interviews_user ON interview_analysis(user_id);
