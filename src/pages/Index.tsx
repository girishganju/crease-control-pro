import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";
import heroStadium from "@/assets/hero-stadium.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              CricketPro
            </span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="default">
            Get Started
          </Button>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroStadium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Manage Cricket Tournaments{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create tournaments, schedule matches, track scores, and celebrate cricket excellence
              all in one powerful platform.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
                Start Free Tournament
              </Button>
              <Button onClick={() => navigate("/auth")} variant="outline" size="lg">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Tournament Management</h3>
            <p className="text-sm text-muted-foreground">
              Create and organize tournaments with ease
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Team & Player Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Manage teams and track player statistics
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Match Scheduling</h3>
            <p className="text-sm text-muted-foreground">
              Plan and schedule matches efficiently
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Live Leaderboards</h3>
            <p className="text-sm text-muted-foreground">
              Real-time standings and player rankings
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-primary py-16">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Organize Your Tournament?
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Join thousands of cricket enthusiasts managing their tournaments with CricketPro
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" variant="secondary" className="gap-2">
            <Trophy className="h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
