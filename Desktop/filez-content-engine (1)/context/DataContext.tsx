
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PromptConfig, CategoryKey, BaseOption, Product, Industry, Audience, Channel, Competitor, LayoutStyle } from '../types';
import { INITIAL_DATA } from '../constants/initialData';
import { supabase } from '../lib/supabaseClient';

interface DataContextType {
  data: PromptConfig;
  isLoading: boolean;
  error: string | null;
  addItem: (category: CategoryKey, item: any) => Promise<void>;
  updateItem: (category: CategoryKey, id: string, updatedItem: any) => Promise<void>;
  deleteItem: (category: CategoryKey, id: string) => Promise<void>;
  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PromptConfig>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: rows, error: fetchError } = await supabase
        .from('prompt_configurations')
        .select('*');

      if (fetchError) throw fetchError;

      if (!rows || rows.length === 0) {
        // First run or empty DB, use initial data but don't save automatically to avoid double writes
        // Ideally you should run the SQL script to seed DB.
        console.log("No data found in Supabase, using local defaults.");
        setData(INITIAL_DATA);
      } else {
        // Reconstruct config from flat rows
        const newConfig: PromptConfig = { ...INITIAL_DATA };

        // Clear lists to avoid duplicates from initial data if we want strict DB source
        // But for safety, let's just overwrite categories that exist in DB
        (Object.keys(newConfig) as CategoryKey[]).forEach(key => {
          newConfig[key] = [];
        });

        rows.forEach((row: any) => {
          const category = row.category as CategoryKey;
          if (newConfig[category]) {
            // Merge extra_data back into the object properties
            const item = {
              id: row.option_id,
              name: row.name,
              desc: row.description,
              ...row.extra_data
            };
            newConfig[category].push(item);
          }
        });

        // If some categories are empty in DB (e.g. not seeded yet), fallback to initialData for those?
        // No, let's trust DB. If DB misses data, it should be fixed in DB. 
        // BUT for this demo, to prevent empty UI if user didn't run SQL, let's fast fail? 
        // Actually, let's fallback to INITIAL_DATA if a category is completely empty?
        // Better strategy: If TOTAL rows > 0, trust DB.
        setData(newConfig as PromptConfig);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message);
      // Fallback to local data on error so app doesn't crash
      setData(INITIAL_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = async (category: CategoryKey, item: any) => {
    // Optimistic update
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      [category]: [...prev[category], item]
    }));

    try {
      // Extract extra fields specifically
      const { id, name, desc, ...rest } = item;

      const { error: insertError } = await supabase
        .from('prompt_configurations')
        .insert({
          category,
          option_id: id,
          name,
          description: desc,
          extra_data: rest
        });

      if (insertError) throw insertError;
    } catch (err: any) {
      console.error("Error adding item:", err);
      setError(err.message);
      setData(previousData); // Rollback
      alert("Failed to save to database: " + err.message);
    }
  };

  const updateItem = async (category: CategoryKey, id: string, updatedItem: any) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? updatedItem : item)
    }));

    try {
      const { id: newId, name, desc, ...rest } = updatedItem;
      // We identify by option_id AND category. 
      // Note: If user changed ID, we need to handle that. 
      // For simplicity, assuming ID is immutable or we use old ID lookup. 
      // The UI currently allows editing all fields. If ID changes, we might need to delete & insert or update where option_id matches OLD id.
      // But here we only receive 'updatedItem'. If ID changed, we might lose reference.
      // The `updateItem` signature has `id` (the old id) and `updatedItem` (which contains new id).

      const { error: updateError } = await supabase
        .from('prompt_configurations')
        .update({
          option_id: newId, // Update ID if changed
          name,
          description: desc,
          extra_data: rest,
          updated_at: new Date().toISOString()
        })
        .match({ category, option_id: id });

      if (updateError) throw updateError;

    } catch (err: any) {
      console.error("Error updating item:", err);
      setError(err.message);
      setData(previousData);
      alert("Failed to update database: " + err.message);
    }
  };

  const deleteItem = async (category: CategoryKey, id: string) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));

    try {
      const { error: deleteError } = await supabase
        .from('prompt_configurations')
        .delete()
        .match({ category, option_id: id });

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error("Error deleting item:", err);
      setError(err.message);
      setData(previousData);
      alert("Failed to delete from database: " + err.message);
    }
  };

  const resetData = async () => {
    if (!window.confirm("This will WIPE all DB data and reset to code defaults. Are you sure?")) return;

    setIsLoading(true);
    try {
      // Delete all rows
      const { error: delError } = await supabase.from('prompt_configurations').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      if (delError) throw delError;

      // Re-seed is complex to do here efficiently for all data.
      // For now, let's just clear Client state to INITIAL and let user manual re-seed or reload?
      // Or loop insert (slow).
      // Let's just set local state to Initial.
      setData(INITIAL_DATA);
      alert("Database cleared. Use SQL script to re-seed defaults if needed.");

    } catch (err: any) {
      console.error("Reset failed", err);
      alert("Reset failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DataContext.Provider value={{ data, isLoading, error, addItem, updateItem, deleteItem, resetData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};