import { supabase } from "../supabase";
import { Member } from "../types";

export const membersRepository = {
  async list(): Promise<Member[]> {
    const { data, error } = await supabase
      .from("members")
      .select("id, name, color")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch members:", error.message);
      return [];
    }

    return data as Member[];
  },

  async getById(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from("members")
      .select("id, name, color")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Member;
  },

  async create(name: string, color: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from("members")
      .insert({ name, color })
      .select("id, name, color")
      .single();

    if (error) {
      console.error("Failed to create member:", error.message);
      return null;
    }

    return data as Member;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete member:", error.message);
      return false;
    }

    return true;
  },
};
