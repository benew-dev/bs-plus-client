"use client";

import {
  useContext,
  useEffect,
  useState,
  useCallback,
  memo,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import CartContext from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";
import AuthContext from "@/context/AuthContext";
import { Menu, ShoppingCart, User, X } from "lucide-react";

// Constantes
const CART_LOAD_DELAY = 500;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Liens de navigation
const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Boutique" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contactez-nous" },
];

// ✅ Dropdown utilisateur avec gestion vérification
const UserDropdown = memo(({ user }) => {
  const menuItems = [
    { href: "/me", label: "Mon profil" },
    { href: "/me/orders", label: "Mes commandes" },
    { href: "/me/contact", label: "Contactez le vendeur" },
  ];

  return (
    <div className="relative group">
      <Link
        href="/me"
        className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-blue-50"
        aria-expanded="false"
        aria-haspopup="true"
        id="user-menu-button"
        title="Menu utilisateur"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <Image
            data-testid="profile image"
            alt={`Photo de profil de ${user?.name || "utilisateur"}`}
            src={
              user?.avatar?.url !== null
                ? user?.avatar?.url
                : "/images/default.png"
            }
            fill
            sizes="32px"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="hidden lg:block">
          <div className="flex items-center space-x-1">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          </div>
          <p className="text-xs text-gray-500 truncate max-w-[150px]">
            {user?.email}
          </p>
        </div>
      </Link>

      <div
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
        className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50"
      >
        <div className="py-1">
          {menuItems.map((item, index) => (
            <Link
              key={`menu-item-${index}`}
              href={item.href}
              className={`block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 ${
                item.className || ""
              }`}
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            role="menuitem"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
});

UserDropdown.displayName = "UserDropdown";

const Header = () => {
  const { user, setUser, clearUser } = useContext(AuthContext);
  const { setCartToState, cartCount, clearCartOnLogout } =
    useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const { data } = useSession();

  // Refs pour gérer les timeouts
  const loadCartTimeoutRef = useRef(null);
  const signOutTimeoutRef = useRef(null);

  // Flag pour éviter les chargements multiples
  const isCartLoadingRef = useRef(false);

  // Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      if (loadCartTimeoutRef.current) clearTimeout(loadCartTimeoutRef.current);
      if (signOutTimeoutRef.current) clearTimeout(signOutTimeoutRef.current);
    };
  }, []);

  // Fonction loadCart optimisée avec debounce
  const loadCart = useCallback(async () => {
    if (isCartLoadingRef.current) return;

    try {
      isCartLoadingRef.current = true;
      setIsLoadingCart(true);
      await setCartToState();
    } catch (error) {
      if (!IS_PRODUCTION) {
        console.error("Error loading cart:", error);
      }
    } finally {
      setIsLoadingCart(false);
      isCartLoadingRef.current = false;
    }
  }, [setCartToState]);

  // useEffect optimisé pour la gestion de session
  useEffect(() => {
    let mounted = true;

    if (data && mounted) {
      try {
        setUser(data?.user);

        if (loadCartTimeoutRef.current) {
          clearTimeout(loadCartTimeoutRef.current);
        }

        if (data?.isNewLogin) {
          loadCartTimeoutRef.current = setTimeout(() => {
            if (mounted) loadCart();
          }, CART_LOAD_DELAY);
        } else {
          loadCart();
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    } else if (data === null && mounted) {
      setUser(null);
    }

    return () => {
      mounted = false;
    };
  }, [data, setUser, loadCart]);

  // Fermer le menu mobile si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const menuButton = event.target.closest("[data-menu-toggle]");

      if (
        mobileMenu &&
        !mobileMenu.contains(event.target) &&
        !menuButton &&
        mobileMenuOpen
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [mobileMenuOpen]);

  // handleSignOut optimisé
  const handleSignOut = useCallback(async () => {
    try {
      clearUser();
      clearCartOnLogout();
      await signOut({ callbackUrl: "/login" });

      signOutTimeoutRef.current = setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      if (!IS_PRODUCTION) {
        console.error("Erreur lors de la déconnexion:", error);
      }
      window.location.href = "/login";
    }
  }, [clearUser, clearCartOnLogout]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Toggle menu mobile
  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white py-2 border-b sticky top-0 z-50 shadow-sm">
      <div className="container max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="shrink-0 mr-5">
            <Link href="/" aria-label="Accueil Buy It Now">
              <Image
                priority={true}
                src="/images/logo.png"
                height={40}
                width={120}
                alt="BuyItNow"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center justify-center space-x-6 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons Desktop + Mobile */}
          <div className="flex items-center gap-3">
            {/* Icône Panier */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Panier"
              title="Accéder au panier"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Icône User ou Dropdown */}
            {!user ? (
              <Link
                href="/login"
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Connexion"
                title="Se connecter"
              >
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <div className="hidden md:block">
                <UserDropdown user={user} />
              </div>
            )}

            {/* Menu Hamburger Mobile */}
            <button
              onClick={toggleMobileMenu}
              data-menu-toggle
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden mt-4 border-t pt-4 pb-2"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
          >
            <nav className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="mt-4 pt-4 border-t space-y-1">
                <Link
                  href="/me"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md"
                >
                  Mon profil
                </Link>
                <Link
                  href="/me/orders"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md"
                >
                  Mes commandes
                </Link>
                <Link
                  href="/me/contact"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md"
                >
                  Contactez le vendeur
                </Link>
                <button
                  onClick={async () => {
                    closeMobileMenu();
                    await handleSignOut();
                  }}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
