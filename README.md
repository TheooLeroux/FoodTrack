# FoodTrack

## Configuration Clerk (Checklist pour le Prof)

Voici les réglages de Clark :

### 1. Identifiant
- [ ] **Email** : Activé (Required)
    - Sign-up : **Verification Code** (OTP)
    - Sign-in : **Email verification link** + **Same device/browser** (On)
- [ ] **Username** : Activé (Required)
    - Longueur : **4 à 64** caractères
    - Extended characters : **On**

### 2. Mot de Passe
- [ ] **Sign-up with password** : Activé
- [ ] **Client Trust** : Activé (Protection contre le credential stuffing)
- [ ] **Contraintes** :
    - Min : **8 caractères**
    - Reject compromised : **On**
    - Enforce strength : **On**

### 3. Variables d'environnement
Vous pouvez regarder le fichier .env.exemple pour créer le .env