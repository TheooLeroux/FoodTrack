// utils/clerkErrors.js
export const translateClerkError = (err) => {
    const error = err?.errors?.[0] || err;
    const code = error?.code;
    const meta = error?.meta;

    const messages = {
        "form_password_length_too_short": `Le mot de passe doit faire au moins ${meta?.minimum_length || 8} caractères.`,
        "password_too_short": `Le mot de passe doit faire au moins ${meta?.minimum_length || 8} caractères.`,
        "form_password_validation_failed": "Le mot de passe ne respecte pas les règles de sécurité.",
        "password_too_weak": "Le mot de passe est trop simple.",
        "form_password_pwned": "Ce mot de passe est compromis, choisissez-en un autre.",
        "form_identifier_not_found": "Cet utilisateur ou email n'existe pas.",
        "form_password_incorrect": "Mot de passe incorrect.",
        "form_identifier_exists": "Ce nom d'utilisateur ou email est déjà pris.",
        "form_param_format_invalid": "Le format saisi est invalide.",
        "form_param_nil": "Tous les champs sont obligatoires.",
        "username_exists": "Ce nom d'utilisateur est déjà utilisé.",
    };

    return messages[code] || error?.message || "Une erreur est survenue.";
};