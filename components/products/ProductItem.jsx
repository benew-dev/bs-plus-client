"use client";

import { memo, useCallback, useContext, useMemo } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

import CartContext from "@/context/CartContext";
import { INCREASE } from "@/helpers/constants";
import AuthContext from "@/context/AuthContext";

const ProductItem = memo(({ product }) => {
  const { addItemToCart, updateCart, cart } = useContext(CartContext);
  const { user, toggleFavorite } = useContext(AuthContext); // ✅ Ajouter toggleFavorite

  // Vérification de sécurité pour s'assurer que product est un objet valide
  if (!product || typeof product !== "object") {
    return null;
  }

  // ✅ Calculer si le produit est dans les favoris
  const isFavorite = useMemo(() => {
    if (!user || !user.favorites || !Array.isArray(user.favorites)) {
      return false;
    }
    return user.favorites.some(
      (fav) => fav.productId?.toString() === productId,
    );
  }, [user, productId]);

  const inStock = product.stock > 0;
  const productId = product._id || "";
  const productName = product.name || "Produit sans nom";
  const productPrice = product.price || 0;
  const productCategory = product.category?.categoryName || "Non catégorisé";

  // URL de l'image avec fallback
  const imageUrl = product.images?.[0]?.url || "/images/default_product.png";

  // Handler pour ajouter au panier
  const addToCartHandler = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        if (!user) {
          return toast.error(
            "Connectez-vous pour ajouter des articles à votre panier !",
          );
        }

        const isProductInCart = cart.find((i) => i?.productId === productId);

        if (isProductInCart) {
          updateCart(isProductInCart, INCREASE);
        } else {
          addItemToCart({
            product: productId,
          });
        }
      } catch (error) {
        toast.error("Impossible d'ajouter au panier. Veuillez réessayer.");
        console.error("Erreur d'ajout au panier:", error);
      }
    },
    [user, cart, productId, updateCart, addItemToCart],
  );

  // Handler pour les favoris
  const toggleFavoriteHandler = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        return toast.error(
          "Connectez-vous pour ajouter des produits à vos favoris !",
        );
      }

      // Appeler la méthode du context
      await toggleFavorite(productId, productName);
    },
    [user, productId, productName, toggleFavorite],
  );

  return (
    <article className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 w-full">
      <Link
        href={`/shop/${productId}`}
        className="block"
        aria-label={`Voir les détails du produit: ${productName}`}
      >
        {/* Badge de stock */}
        {!inStock && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
            Rupture de stock
          </div>
        )}

        {/* Bouton Favoris */}
        <button
          onClick={toggleFavoriteHandler}
          className={`absolute top-3 right-3 z-10 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-all duration-200 ${
            isFavorite ? "bg-pink-50" : "bg-white/90 hover:bg-white"
          }`}
          aria-label={
            isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
          }
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite
                ? "fill-pink-500 stroke-pink-500"
                : "stroke-gray-700 hover:stroke-pink-500"
            }`}
          />
        </button>

        {/* Image du produit */}
        <div className="relative w-full h-48 bg-white overflow-hidden">
          <Image
            src={imageUrl}
            alt={productName}
            title={productName}
            fill
            onError={(e) => {
              e.currentTarget.src = "/images/default_product.png";
              e.currentTarget.onerror = null;
            }}
            className="object-contain group-hover:scale-105 transition-transform duration-500 p-2"
            priority={false}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Contenu du produit */}
        <div className="p-4 space-y-2.5">
          {/* Catégorie */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {productCategory}
            </span>
          </div>

          {/* Nom du produit */}
          <h3
            className="font-semibold text-base text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors"
            title={productName}
          >
            {productName}
          </h3>

          {/* Prix */}
          <div className="pt-1">
            <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "Fdj",
              }).format(productPrice)}
            </span>
          </div>

          {/* Bouton d'ajout au panier */}
          <div className="pt-3">
            <button
              disabled={!inStock}
              className={`
                w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 shadow-sm
                ${
                  inStock
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }
              `}
              onClick={addToCartHandler}
              aria-label={
                inStock ? "Ajouter au panier" : "Produit indisponible"
              }
              aria-disabled={!inStock}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{inStock ? "Ajouter au panier" : "Indisponible"}</span>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
});

// Ajouter displayName pour faciliter le débogage
ProductItem.displayName = "ProductItem";

export default ProductItem;
