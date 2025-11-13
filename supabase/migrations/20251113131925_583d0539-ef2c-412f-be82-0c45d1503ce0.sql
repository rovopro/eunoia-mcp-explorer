-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for data source connections
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mysql', 'cosmos', 'powerbi')),
  credentials JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own data sources" 
ON public.data_sources 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data sources" 
ON public.data_sources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data sources" 
ON public.data_sources 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data sources" 
ON public.data_sources 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_data_sources_updated_at
BEFORE UPDATE ON public.data_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();