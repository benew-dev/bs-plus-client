// components/cart/Confirmation.jsx
"use client";

import CartContext from "@/context/CartContext";
import OrderContext from "@/context/OrderContext";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import BreadCrumbs from "../layouts/BreadCrumbs";
import {
  CircleCheckBig,
  CreditCard,
  Smartphone,
  Building2,
  HandCoins,
} from "lucide-react";

// Configuration des plateformes de paiement
const PLATFORM_CONFIG = {
  WAAFI: {
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Smartphone,
    displayName: "Waafi",
  },
  "D-MONEY": {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Smartphone,
    displayName: "D-Money",
  },
  "CAC-PAY": {
    color: "bg-green-500 text-green-700 border-green-300",
    icon: Building2,
    displayName: "CAC Pay",
  },
  "BCI-PAY": {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Building2,
    displayName: "BCI Pay",
  },
  CASH: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: HandCoins,
    displayName: "Espèces",
  },
};

const Confirmation = () => {
  const { orderId, paymentTypes } = useContext(OrderContext);
  const { setCartToState } = useContext(CartContext);

  useEffect(() => {
    // Chargement initial du panier - OPTIMISÉ
    const loadCart = async () => {
      try {
        await setCartToState();
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        toast.error("Impossible de charger votre panier. Veuillez réessayer.");
      }
    };

    loadCart();
  }, [setCartToState]);

  if (orderId === undefined || orderId === null) {
    return notFound();
  }

  const breadCrumbs = [
    { name: "Home", url: "/" },
    { name: "Confirmation", url: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <BreadCrumbs breadCrumbs={breadCrumbs} />
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Icône de succès */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CircleCheckBig
                size={72}
                strokeWidth={1.5}
                className="text-green-600"
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Commande confirmée !
            </h1>

            <p className="text-gray-600">
              Numéro de commande :{" "}
              <span className="font-mono font-semibold">{orderId}</span>
            </p>
          </div>

          {/* Informations de paiement */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {paymentTypes &&
                paymentTypes.length > 0 &&
                paymentTypes[0]?.platform === "CASH"
                  ? "Mode de paiement"
                  : "Moyens de paiement disponibles"}
              </h2>
            </div>

            {paymentTypes && paymentTypes.length > 0 ? (
              <div className="flex flex-col gap-4">
                {paymentTypes.map((payment, index) => {
                  const config = PLATFORM_CONFIG[payment?.platform] || {
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                    icon: CreditCard,
                    displayName: payment?.platform || "Inconnu",
                  };
                  const IconComponent = config.icon;
                  const isCash = payment?.platform === "CASH";

                  return (
                    <div
                      key={payment._id || index}
                      className="group relative p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        {/* Icône de la plateforme */}
                        <div className={`flex-shrink-0 p-4 rounded-xl ${config.color} border-2`}>
                          <IconComponent className="w-8 h-8" />
                        </div>

                        {/* Contenu principal - responsive */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Section gauche - Nom de la plateforme */}
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              {config.displayName}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} border`}>
                              Disponible
                            </span>
                          </div>

                          {/* Section droite - Informations de paiement */}
                          {isCash ? (
                            <div className="flex items-center gap-2">
                              <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                                <p className="text-sm text-emerald-700 font-medium">
                                  Paiement à la livraison
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              {/* Titulaire */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase">
                                  Titulaire:
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {payment?.name || "Non renseigné"}
                                </span>
                              </div>

                              {/* Séparateur */}
                              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

                              {/* Numéro */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase">
                                  N°:
                                </span>
                                <span className="font-mono font-bold text-gray-900">
                                  {payment?.number || "Non renseigné"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Indicateur hover */}
                      <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-900 mb-1">
                      Aucune information de paiement disponible
                    </p>
                    <p className="text-sm text-yellow-700">
                      Veuillez contacter le support pour plus d'informations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/me/orders"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center transition-colors font-medium"
            >
              Voir mes commandes
            </Link>

            <Link
              href="/"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center transition-colors font-medium"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;