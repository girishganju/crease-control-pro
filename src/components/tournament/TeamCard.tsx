import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamCardProps {
  team: any;
  onEdit: (team: any) => void;
  onDelete: (teamId: string) => void;
}

export const TeamCard = ({ team, onEdit, onDelete }: TeamCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-all group">
      <CardHeader>
        <div className="flex items-start justify-between">
          {team.logo_url ? (
            <img
              src={team.logo_url}
              alt={team.name}
              className="h-12 w-12 object-contain"
            />
          ) : (
            <Users className="h-12 w-12 text-primary" />
          )}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(team)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Team</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {team.name}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(team.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-2 group-hover:text-primary transition-colors">
          {team.name}
        </CardTitle>
      </CardContent>
    </Card>
  );
};
