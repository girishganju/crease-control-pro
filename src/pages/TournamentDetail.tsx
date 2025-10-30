import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Calendar, ArrowLeft } from "lucide-react";
import { AddTeamDialog } from "@/components/tournament/AddTeamDialog";
import { EditTeamDialog } from "@/components/tournament/EditTeamDialog";
import { AddMatchDialog } from "@/components/tournament/AddMatchDialog";
import { MatchCard } from "@/components/tournament/MatchCard";
import { AddPlayerDialog } from "@/components/tournament/AddPlayerDialog"; // ✅ NEW

const TournamentDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]); // ✅ players state
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Authentication check + initial fetch
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
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, id]);

  // ✅ Combined data fetch
  const fetchTournamentData = async () => {
    setLoading(true);
    await Promise.all([fetchTournament(), fetchTeams(), fetchMatches()]);
    await fetchPlayers();
    setLoading(false);
  };

  // ✅ Fetch tournament
  const fetchTournament = async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) console.error(error);
    if (data) setTournament(data);
  };

  // ✅ Fetch teams
  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    if (data) setTeams(data);
  };

  // ✅ Fetch players for all teams
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

    if (error) console.error(error);
    if (data) setPlayers(data);
  };

  // ✅ Fetch matches
  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    if (data) setMatches(data);
  };

  // ✅ Delete team handler
  const handleDeleteTeam = async (teamId: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Team deleted successfully!" });
      fetchTeams();
      fetchPlayers();
    }
  };

  // ✅ Compute standings (sorted by wins)
  const standings = teams
    .map((team) => {
      const wins = matches.filter((m) => m.winner_team_id === team.id).length;
      const totalMatches = matches.filter(
        (m) => m.team1_id === team.id || m.team2_id === team.id
      ).length;
      return { ...team, wins, totalMatches };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.totalMatches !== b.totalMatches) return a.totalMatches - b.totalMatches;
      return a.name.localeCompare(b.name);
    });

  // ✅ Loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Tournament not found</p>
        </div>
      </div>
    );
  }

  // ✅ Render page
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

        {/* Tournament header */}
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

        {/* Tabs */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams" className="gap-2">
              <Users className="h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <Calendar className="h-4 w-4" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-2">
              <Trophy className="h-4 w-4" />
              Standings
            </TabsTrigger>
          </TabsList>

          {/* ✅ Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-end">
              <AddTeamDialog tournamentId={id!} onTeamAdded={fetchTeams} />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const teamPlayers = players.filter((p) => p.team_id === team.id);
                return (
                  <Card key={team.id} className="shadow-card">
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle>{team.name}</CardTitle>
                      <AddPlayerDialog
                        teamId={team.id}
                        onPlayerAdded={fetchPlayers}
                      />
                    </CardHeader>
                    <CardContent>
                      {teamPlayers.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {teamPlayers.map((p) => (
                            <li key={p.id} className="flex justify-between">
                              <span>{p.name}</span>
                              {p.position && (
                                <span className="text-muted-foreground">
                                  {p.position}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No players yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {teams.length === 0 && (
                <Card className="col-span-full shadow-card">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No teams yet. Add your first team!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {selectedTeam && (
              <EditTeamDialog
                team={selectedTeam}
                open={!!selectedTeam}
                onOpenChange={(open) => !open && setSelectedTeam(null)}
                onTeamUpdated={() => {
                  fetchTeams();
                  fetchPlayers();
                  setSelectedTeam(null);
                }}
              />
            )}
          </TabsContent>

          {/* ✅ Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="flex justify-end">
              <AddMatchDialog
                tournamentId={id!}
                teams={teams}
                onMatchAdded={fetchMatches}
              />
            </div>

            <div className="space-y-4">
              {matches
                .slice()
                .reverse()
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teams={teams}
                    onMatchUpdated={fetchMatches}
                  />
                ))}

              {matches.length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No matches scheduled yet. Create your first match!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ✅ Standings Tab */}
          <TabsContent value="standings" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Tournament Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {standings.map((team, index) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Wins</p>
                          <p className="text-lg font-bold">{team.wins}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            Matches
                          </p>
                          <p className="text-lg font-bold">
                            {team.totalMatches}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {standings.length === 0 && (
                    <div className="py-12 text-center">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No standings available yet. Add teams and matches to see
                        standings.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TournamentDetail;
