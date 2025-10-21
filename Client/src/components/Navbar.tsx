import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            HealthMate
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button className="gradient-primary" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
