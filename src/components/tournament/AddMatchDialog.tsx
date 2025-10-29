import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Plus } from "lucide-react";

interface AddMatchDialogProps {
  tournamentId: string;
  teams: any[];
  onMatchAdded: () => void;
}

export const AddMatchDialog = ({
  tournamentId,
  teams,
  onMatchAdded,
}: AddMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [venue, setVenue] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (team1Id === team2Id) {
      toast({
        title: "Error",
        description: "Please select different teams",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("matches").insert([
      {
        tournament_id: tournamentId,
        team1_id: team1Id,
        team2_id: team2Id,
        venue: venue || null,
        match_date: matchDate || null,
        status: "scheduled",
      },
    ]);

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
        description: "Match scheduled successfully!",
      });
      setOpen(false);
      setTeam1Id("");
      setTeam2Id("");
      setVenue("");
      setMatchDate("");
      onMatchAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Match
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team1">Team 1</Label>
            <Select value={team1Id} onValueChange={setTeam1Id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select team 1" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team2">Team 2</Label>
            <Select value={team2Id} onValueChange={setTeam2Id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select team 2" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem
                    key={team.id}
                    value={team.id}
                    disabled={team.id === team1Id}
                  >
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              placeholder="Match venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Match Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Match"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
