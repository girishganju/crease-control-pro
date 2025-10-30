import { supabase } from "../client";

export interface PlayerStats {
  id?: string;
  player_id: string;
  tournament_id: string;
  runs: number;
  wickets: number;
  matches_played: number;
  strike_rate: number;
  average: number;
}

export const playerStatsService = {
  async getByTournament(tournament_id: string) {
    const { data, error } = await supabase
      .from("player_stats")
      .select("*, players ( name )")
      .eq("tournament_id", tournament_id)
      .order("runs", { ascending: false });

    if (error) throw error;
    return data?.map((stat) => ({
      player_name: stat.players?.name ?? "Unknown Player",
      runs: stat.runs,
      wickets: stat.wickets,
      matches_played: stat.matches_played,
      strike_rate: stat.strike_rate,
      average: stat.average,
    })) || [];
  },

  async add(stat: PlayerStats) {
    const { data, error } = await supabase.from("player_stats").insert(stat).select();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<PlayerStats>) {
    const { data, error } = await supabase
      .from("player_stats")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },
};
