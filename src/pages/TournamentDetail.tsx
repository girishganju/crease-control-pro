import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Calendar, BarChart3, ArrowLeft } from "lucide-react";
import { AddTeamDialog } from "@/components/tournament/AddTeamDialog";
import { EditTeamDialog } from "@/components/tournament/EditTeamDialog";
import { AddMatchDialog } from "@/components/tournament/AddMatchDialog";
import { MatchCard } from "@/components/tournament/MatchCard";
import { AddPlayerDialog } from "@/components/tournament/AddPlayerDialog";

const TournamentDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]); // ✅ NEW
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchTournamentData();
      } else {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate, id]);

  const fetchTournamentData = async () => {
    setLoading(true);
    await Promise.all([fetchTournament(), fetchTeams(), fetchMatches()]);
    await fetchPlayers();
    await fetchPlayerStats(); // ✅ NEW
    setLoading(false);
  };

  const fetchTournament = async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setTournament(data);
    if (error) console.error(error);
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", id)
      .order("created_at", { ascending: false });
    if (data) setTeams(data);
    if (error) console.error(error);
  };

  const fetchPlayers = async () => {
    if (teams.length === 0) return;
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .in(
        "team_id",
        teams.map((t) => t.id)
      )
      .order("created_at", { ascending: true });
    if (data) setPlayers(data);
    if (error) console.error(error);
  };

  const fetchPlayerStats = async () => {
    const { data, error } = await supabase
      .from("player_stats")
      .select("*");
    if (data) setPlayerStats(data);
    if (error) console.error(error);
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", id)
      .order("created_at", { ascending: false });
    if (data) setMatches(data);
    if (error) console.error(error);
  };

  const handleDeleteTeam = async (teamId: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error)
      toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Success", description: "Team deleted successfully!" });
      fetchTeams();
      fetchPlayers();
    }
  };

  const standings = teams
    .map((team) => {
      const wins = matches.filter((m) => m.winner_team_id === team.id).length;
      const totalMatches = matches.filter(
        (m) => m.team1_id === team.id || m.team2_id === team.id
      ).length;
      return { ...team, wins, totalMatches };
    })
    .sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container py-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container py-8 text-center text-muted-foreground">
          Tournament not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/tournaments")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
            <p className="text-muted-foreground">{tournament.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                {tournament.status}
              </span>
              {tournament.start_date && (
                <span className="text-sm text-muted-foreground">
                  {new Date(tournament.start_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams" className="gap-2">
              <Users className="h-4 w-4" /> Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <Calendar className="h-4 w-4" /> Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-2">
              <Trophy className="h-4 w-4" /> Standings
            </TabsTrigger>
            <TabsTrigger value="player-stats" className="gap-2">
              <BarChart3 className="h-4 w-4" /> Player Stats
            </TabsTrigger>
          </TabsList>

          {/* TEAMS TAB */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-end">
              <AddTeamDialog tournamentId={id!} onTeamAdded={fetchTeams} />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const teamPlayers = players.filter((p) => p.team_id === team.id);
                return (
                  <Card key={team.id}>
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle>{team.name}</CardTitle>
                      <AddPlayerDialog teamId={team.id} onPlayerAdded={fetchPlayers} />
                    </CardHeader>
                    <CardContent>
                      {teamPlayers.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {teamPlayers.map((p) => {
                            const stats = playerStats.find((s) => s.player_id === p.id);
                            return (
                              <li key={p.id} className="flex justify-between">
                                <span>{p.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {stats
                                    ? `${stats.goals}G ${stats.assists}A`
                                    : "No stats"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">No players yet.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* PLAYER STATS TAB */}
          <TabsContent value="player-stats">
            <Card>
              <CardHeader>
                <CardTitle>Player Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {playerStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="py-2">Player</th>
                          <th>Team</th>
                          <th>Matches</th>
                          <th>Goals</th>
                          <th>Assists</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerStats.map((s) => {
                          const player = players.find((p) => p.id === s.player_id);
                          const team = teams.find((t) => t.id === player?.team_id);
                          return (
                            <tr key={s.id} className="border-b">
                              <td className="py-2 font-medium">{player?.name}</td>
                              <td>{team?.name}</td>
                              <td>{s.matches_played}</td>
                              <td>{s.goals}</td>
                              <td>{s.assists}</td>
                              <td>{s.rating?.toFixed(1) ?? "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    No player stats available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TournamentDetail;
