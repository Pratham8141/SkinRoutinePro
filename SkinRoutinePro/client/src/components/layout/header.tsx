import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/questionnaire", label: "Assessment" },
    { href: "/dashboard", label: "My Routines" },
  ];

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <i className="fas fa-spa"></i>
            SkinCare Builder
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`font-medium transition-colors hover:text-primary ${
                    location === link.href ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.username}
                </span>
                <Button 
                  variant="outline" 
                  onClick={logout}
                  data-testid="button-logout"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" data-testid="button-signin">
                    Sign In
                  </Button>
                </Link>
                <Link href="/questionnaire">
                  <Button className="skincare-primary" data-testid="button-get-started">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden mt-4">
          <ul className="flex flex-col gap-2">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`block py-2 font-medium transition-colors hover:text-primary ${
                    location === link.href ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
