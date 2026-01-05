import { Link } from "wouter";

export default function Footer() {
  const footerLinks = {
    quickLinks: [
      { href: "/questionnaire", label: "Skin Assessment" },
      { href: "/dashboard", label: "My Routines" },
      { href: "#", label: "Expert Tips" },
      { href: "#", label: "Community" },
    ],
    support: [
      { href: "#", label: "Help Center" },
      { href: "#", label: "Contact Us" },
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
    ],
  };

  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">SkinCare Builder</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Personalized skincare routines for healthy, glowing skin. 
              Science-backed recommendations tailored to your unique needs.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map(link => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            &copy; 2024 SkinCare Builder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
