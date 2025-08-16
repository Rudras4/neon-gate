import { Button } from "@/components/ui/button";
import { Moon, Sun, Wallet, Menu } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 theme-transition">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T3</span>
          </div>
          <span className="font-bold text-xl">TicketChain</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="/events" className="text-foreground/80 hover:text-foreground transition-colors">
            Events
          </a>
          <a href="#organize" className="text-foreground/80 hover:text-foreground transition-colors">
            Organize
          </a>
          <a href="/profile" className="text-foreground/80 hover:text-foreground transition-colors">
            Profile
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="theme-transition"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Connect Wallet */}
          <Button variant="outline" className="hidden sm:flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Connect</span>
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2">
            <a href="/events" className="block py-2 text-foreground/80 hover:text-foreground">
              Events
            </a>
            <a href="#organize" className="block py-2 text-foreground/80 hover:text-foreground">
              Organize
            </a>
            <a href="/profile" className="block py-2 text-foreground/80 hover:text-foreground">
              Profile
            </a>
            <Button variant="outline" className="w-full mt-4">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}