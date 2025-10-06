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
import * as Sentry from "@sentry/nextjs";
import CartContext from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";
import AuthContext from "@/context/AuthContext";
import { Menu, ShoppingCart, User, X } from "lucide-react";
// import dynamic from "next/dynamic";

// Chargement dynamique optimisé du composant Search
// const Search = dynamic(() => import("./Search"), {
//   loading: () => (
//     <div className="h-10 w-full max-w-xl bg-gray-100 animate-pulse rounded-md"></div>
//   ),
//   ssr: true,
// });

// Constantes pour éviter les recréations
const CART_LOAD_DELAY = 500;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ✅ Bouton panier
const CartButton = memo(({ cartCount }) => {
  return (
    <Link
      href="/cart"
      className="px-3 py-2 flex flex-row text-gray-700 bg-white shadow-sm border border-gray-200 rounded-md transition-colors relative hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
      aria-label="Panier"
      data-testid="cart-button"
      title="Accéder au panier"
    >
      <ShoppingCart className="text-gray-400 w-5" />
      <span className="ml-1">Panier ({cartCount > 0 ? cartCount : 0})</span>
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {cartCount}
        </span>
      )}
    </Link>
  );
});

CartButton.displayName = "CartButton";

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
  const {
    user,
    setLoading: setAuthLoading,
    setUser,
    clearUser,
  } = useContext(AuthContext);
  const { setCartToState, cartCount, clearCartOnLogout } =
    useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const { data } = useSession();

  // Refs pour gérer les timeouts
  const loadCartTimeoutRef = useRef(null);
  const signOutTimeoutRef = useRef(null);
  const mobileMenuTimeoutRef = useRef(null);

  // Flag pour éviter les chargements multiples
  const isCartLoadingRef = useRef(false);

  // Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      if (loadCartTimeoutRef.current) clearTimeout(loadCartTimeoutRef.current);
      if (signOutTimeoutRef.current) clearTimeout(signOutTimeoutRef.current);
      if (mobileMenuTimeoutRef.current)
        clearTimeout(mobileMenuTimeoutRef.current);
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
      Sentry.captureException(error, {
        tags: {
          component: "Header",
          action: "loadCart",
        },
        level: "warning",
      });
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
        Sentry.captureException(error, {
          tags: {
            component: "Header",
            action: "initUserData",
          },
        });
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
      const profileButton = event.target.closest("[data-profile-toggle]");

      if (
        mobileMenu &&
        !mobileMenu.contains(event.target) &&
        !profileButton &&
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
        <div className="flex flex-wrap items-center justify-between">
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

          {/* Mobile buttons (Panier + Photo profil OU Hamburger) */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <>
                {/* Bouton Panier Mobile */}
                <Link
                  href="/cart"
                  className="px-3 py-2 inline-block text-center text-gray-700 bg-white shadow-sm border border-gray-200 rounded-md relative hover:bg-blue-50"
                  aria-label="Panier"
                  title="Accéder au panier"
                >
                  <ShoppingCart className="text-gray-400 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Photo de profil Mobile (remplace hamburger) */}
                <button
                  onClick={toggleMobileMenu}
                  data-profile-toggle
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                  aria-label={
                    mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
                  }
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  <Image
                    alt={`Photo de profil de ${user?.name || "utilisateur"}`}
                    src={
                      user?.avatar?.url !== null
                        ? user?.avatar?.url
                        : "/images/default.png"
                    }
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </button>
              </>
            )}

            {/* Menu Hamburger pour utilisateurs non connectés */}
            {!user && (
              <button
                onClick={toggleMobileMenu}
                className="px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                aria-label={
                  mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            )}
          </div>

          {/* Search - Desktop */}
          {/* <div className="hidden md:block md:flex-1 max-w-xl mx-4">
            <Search setLoading={setAuthLoading} />
          </div> */}

          {/* User navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user && <CartButton cartCount={cartCount} />}

            {!user ? (
              <Link
                href="/login"
                className="px-3 py-2 flex flex-row text-gray-700 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                data-testid="login"
              >
                <User className="text-gray-400 w-5" />
                <span className="ml-1">Connexion</span>
              </Link>
            ) : (
              <UserDropdown user={user} />
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden mt-4 border-t pt-4"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
          >
            {/* <div className="mb-4">
              <Search setLoading={setAuthLoading} />
            </div> */}
            {user ? (
              <div className="space-y-3">
                {/* Mon profil réapparaît */}
                <Link
                  href="/me"
                  onClick={closeMobileMenu}
                  className="block px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                >
                  Mon profil
                </Link>

                <Link
                  href="/me/orders"
                  onClick={closeMobileMenu}
                  className="block px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                >
                  Mes commandes
                </Link>

                <Link
                  href="/me/contact"
                  onClick={closeMobileMenu}
                  className="block px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                >
                  Contactez le vendeur
                </Link>

                <button
                  onClick={async () => {
                    closeMobileMenu();
                    await handleSignOut();
                  }}
                  className="block cursor-pointer w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
