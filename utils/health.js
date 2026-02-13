// utils/health.js
export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return "Insuffisance pondérale";
    if (bmi < 25) return "Poids normal";
    if (bmi < 30) return "Surpoids";
    return "Obésité";
};