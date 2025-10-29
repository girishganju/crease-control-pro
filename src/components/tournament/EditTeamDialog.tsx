import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface EditTeamDialogProps {
  team: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamUpdated: () => void;
}

export const EditTeamDialog = ({
  team,
  open,
  onOpenChange,
  onTeamUpdated,
}: EditTeamDialogProps) => {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (team) {
      setName(team.name);
      setLogoUrl(team.logo_url || "");
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("teams")
      .update({
        name,
        logo_url: logoUrl || null,
      })
      .eq("id", team.id);

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
        description: "Team updated successfully!",
      });
      onTeamUpdated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Team Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-logo">Logo URL (optional)</Label>
            <Input
              id="edit-logo"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Team"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
