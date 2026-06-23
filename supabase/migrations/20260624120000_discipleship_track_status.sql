-- Program lifecycle status for discipleship tracks (running vs finished cohort)

ALTER TABLE public.discipleship_tracks
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'finished'));
