// utils/panier.js

let panierGlobal = [];
export const getPanier = () => {
    return panierGlobal;
};
export const ajouterAuPanierGlobal = (item) => {
    panierGlobal.push(item);
};
export const retirerDuPanierGlobal = (index) => {
    panierGlobal.splice(index, 1);
};
export const viderPanierGlobal = () => {
    panierGlobal = [];
};