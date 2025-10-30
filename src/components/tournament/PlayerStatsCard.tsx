import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PlayerStats {
  player_name: string;
  runs: number;
  wickets: number;
  matches_played: number;
  strike_rate: number;
  average: number;
}

interface PlayerStatsCardProps {
  stats: PlayerStats;
}

const PlayerStatsCard = ({ stats }: PlayerStatsCardProps) => {
  const chartData = [
    { name: "Runs", value: stats.runs },
    { name: "Wickets", value: stats.wickets },
    { name: "Matches", value: stats.matches_played },
  ];

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{stats.player_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm grid grid-cols-2 gap-2">
          <div><strong>Runs:</strong> {stats.runs}</div>
          <div><strong>Wickets:</strong> {stats.wickets}</div>
          <div><strong>Matches:</strong> {stats.matches_played}</div>
          <div><strong>Avg:</strong> {stats.average.toFixed(2)}</div>
          <div><strong>SR:</strong> {stats.strike_rate.toFixed(1)}</div>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;
