import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const AddPlayerDialog = ({ teamId, onPlayerAdded }: { teamId: string; onPlayerAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name) {
      toast({ title: "Error", description: "Player name is required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("players").insert([{ team_id: teamId, name, position }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Player added!" });
      setName("");
      setPosition("");
      setOpen(false);
      onPlayerAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">+ Player</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Player name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Position (optional)" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Button onClick={handleAdd}>Add Player</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
