"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { Mail, Send, User, MessageSquare, CheckCircle } from "lucide-react";
import AuthContext from "@/context/AuthContext";

const PublicContact = () => {
  // Contexte d'authentification
  const { sendEmail, error, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Le sujet est requis";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Le sujet doit contenir au moins 5 caractères";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis";
    } else if (formData.message.length < 20) {
      newErrors.message = "Le message doit contenir au moins 20 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast.success(
          "Message envoyé avec succès ! Nous vous répondrons bientôt.",
        );
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Impossible d'envoyer le message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Message envoyé !
          </h2>
          <p className="text-gray-600 mb-8">
            Merci de nous avoir contactés. Notre équipe vous répondra dans les
            plus brefs délais.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Contactez-nous
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Une question ? Un problème ? Notre équipe est là pour vous aider.
          Remplissez le formulaire ci-dessous et nous vous répondrons
          rapidement.
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div>
            <label
              htmlFor="name"
              className="flex items-center text-sm font-semibold text-gray-700 mb-2"
            >
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Nom complet
            </label>
            <input
              ref={nameRef}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Jean Dupont"
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="flex items-center text-sm font-semibold text-gray-700 mb-2"
            >
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="jean.dupont@example.com"
              maxLength={100}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Sujet */}
          <div>
            <label
              htmlFor="subject"
              className="flex items-center text-sm font-semibold text-gray-700 mb-2"
            >
              <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
              Sujet
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.subject ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="De quoi souhaitez-vous parler ?"
              maxLength={100}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="flex items-center text-sm font-semibold text-gray-700 mb-2"
            >
              <Send className="w-4 h-4 mr-2 text-blue-600" />
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              className={`w-full px-4 py-3 border ${
                errors.message ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
              placeholder="Décrivez votre demande en détail..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message && (
                <p className="text-sm text-red-600">{errors.message}</p>
              )}
              <span
                className={`text-xs ml-auto ${
                  formData.message.length > 900
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {formData.message.length}/1000
              </span>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Envoyer le message
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info supplémentaire */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Vous pouvez aussi nous joindre par email à{" "}
          <a
            href="mailto:contact@buyitnow.com"
            className="text-blue-600 hover:underline"
          >
            contact@buyitnow.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PublicContact;
