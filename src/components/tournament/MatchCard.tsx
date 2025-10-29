import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Calendar, MapPin } from "lucide-react";

interface MatchCardProps {
  match: any;
  teams: any[];
  onMatchUpdated: () => void;
}

export const MatchCard = ({ match, teams, onMatchUpdated }: MatchCardProps) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(match.status);
  const [team1Score, setTeam1Score] = useState(match.team1_score || "");
  const [team2Score, setTeam2Score] = useState(match.team2_score || "");
  const [winnerId, setWinnerId] = useState(match.winner_team_id || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const team1 = teams.find((t) => t.id === match.team1_id);
  const team2 = teams.find((t) => t.id === match.team2_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("matches")
      .update({
        status,
        team1_score: team1Score || null,
        team2_score: team2Score || null,
        winner_team_id: winnerId || null,
      })
      .eq("id", match.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Match updated successfully!",
      });
      setOpen(false);
      onMatchUpdated();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-500";
      case "ongoing":
        return "bg-yellow-500/10 text-yellow-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-right flex-1">
                  <p className="font-semibold text-lg">
                    {team1?.name || "Team 1"}
                  </p>
                  {match.team1_score && (
                    <p className="text-2xl font-bold text-primary">
                      {match.team1_score}
                    </p>
                  )}
                </div>
                <div className="px-4 py-2 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">VS</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {team2?.name || "Team 2"}
                  </p>
                  {match.team2_score && (
                    <p className="text-2xl font-bold text-primary">
                      {match.team2_score}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  match.status
                )}`}
              >
                {match.status}
              </span>
              {match.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {match.venue}
                </span>
              )}
              {match.match_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(match.match_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {match.winner_team_id && (
              <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  Winner:{" "}
                  {teams.find((t) => t.id === match.winner_team_id)?.name}
                </p>
              </div>
            )}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="ml-4">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Match</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team1-score">
                      {team1?.name || "Team 1"} Score
                    </Label>
                    <Input
                      id="team1-score"
                      placeholder="150/7"
                      value={team1Score}
                      onChange={(e) => setTeam1Score(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team2-score">
                      {team2?.name || "Team 2"} Score
                    </Label>
                    <Input
                      id="team2-score"
                      placeholder="145/10"
                      value={team2Score}
                      onChange={(e) => setTeam2Score(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="winner">Winner</Label>
                  <Select value={winnerId} onValueChange={setWinnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={match.team1_id}>
                        {team1?.name || "Team 1"}
                      </SelectItem>
                      <SelectItem value={match.team2_id}>
                        {team2?.name || "Team 2"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Match"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
