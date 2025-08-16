import { Button } from "@/components/ui/button";
import { Moon, Sun, Wallet, Menu, LogOut, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, account, connectWallet, isLoading } = useWallet();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 theme-transition">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T3</span>
          </div>
          <span className="font-bold text-xl">TicketChain</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/events" className="text-foreground/80 hover:text-foreground transition-colors">
                Events
              </Link>
              <Link to="/organize" className="text-foreground/80 hover:text-foreground transition-colors">
                Organize
              </Link>
            </>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* User Profile */}
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>

              {/* Logout */}
              <Button 
                variant="outline" 
                onClick={logout}
                className="hidden sm:flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>

              {/* Signup Button */}
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Theme Toggle - Moved to the end */}
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/events" className="block py-2 text-foreground/80 hover:text-foreground">
                  Events
                </Link>
                <Link to="/organize" className="block py-2 text-foreground/80 hover:text-foreground">
                  Organize
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-foreground/80 hover:text-foreground">
                  Login
                </Link>
                <Link to="/signup" className="block py-2 text-foreground/80 hover:text-foreground">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}