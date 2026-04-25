import { supabase } from '@/integrations/supabase/client';

export const createTestArticle = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-test-article');
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating test article:', error);
    throw error;
  }
};