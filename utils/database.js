// utils/database.js
///////A revoir pas sûr que se soit bon
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("foodtrack.db");

export const initDB = async () => {
    try {
        await db.execAsync("PRAGMA foreign_keys = ON;");

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS meals (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            date TEXT NOT NULL
        );
            
        CREATE TABLE IF NOT EXISTS foods (
            id TEXT PRIMARY KEY NOT NULL,
            meal_id TEXT NOT NULL,
            name TEXT NOT NULL,
            brand TEXT,
            image_url TEXT,
            nutriscore TEXT,
            calories REAL DEFAULT 0,
            proteins REAL DEFAULT 0,
            carbs REAL DEFAULT 0,
            fats REAL DEFAULT 0,
            FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_profile (
            id TEXT PRIMARY KEY NOT NULL,
            username TEXT,
            email TEXT,
            weight REAL,
            height REAL,
            gender TEXT,
            age INTEGER,
            profile_pic_local TEXT,
            daily_goal INTEGER DEFAULT 2000,
            first_connection INTEGER DEFAULT 1
        );
    `);
        console.log(">> DB Initialisée avec succès");
    } catch (err) {
        console.error("CRITICAL DB ERROR:", err);
    }
};

/* CRUD REPAS
*/

export const ajouterRepas = async (nom, date) => {
    if (!nom || nom.trim() === "") {
        console.warn("Tentative de créer un repas sans nom");
        return null;
    }

    const newId = Date.now().toString();

    try {
        await db.runAsync(
            "INSERT INTO meals (id, name, date) VALUES (?, ?, ?)",
            [newId, nom, date]
        );
        return newId;
    } catch (e) {
        console.log("Erreur ajout repas:", e);
        return null;
    }
};

export const supprimerAliment = async (idAliment) => {
    try {
        await db.runAsync("DELETE FROM foods WHERE id = ?", [idAliment]);
    } catch (e) {
        console.error("Erreur suppression aliment:", e);
    }
};




export const getHistorique = async () => {
    const sql = `
        SELECT m.id, m.name, m.date, SUM(f.calories) as total_calories
        FROM meals m
        LEFT JOIN foods f ON m.id = f.meal_id
        GROUP BY m.id
        ORDER BY m.date DESC;`;
    return await db.getAllAsync(sql);
};

export const supprimerRepas = async (idRepas) => {
    await db.runAsync("DELETE FROM meals WHERE id = ?", [idRepas]);
};


/* CRUD ALIMENTS */

export const ajouterAliment = async (foodData) => {
    const kcal = foodData.calories < 0 ? 0 : foodData.calories;
    const foodId = foodData.id || Math.random().toString(36).substr(2, 9);
    const query = `
        INSERT INTO foods (id, meal_id, name, brand, image_url, nutriscore, calories, proteins, carbs, fats)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        foodId,
        foodData.meal_id,
        foodData.name || "Aliment inconnu",
        foodData.brand || "",
        foodData.image_url,
        foodData.nutriscore,
        kcal,
        foodData.proteins || 0,
        foodData.carbs || 0,
        foodData.fats || 0
    ];

    try {
        await db.runAsync(query, values);
    } catch (e) {
        console.error("Impossible d'ajouter l'aliment:", foodData.name, e);
    }
};

export const getDetailsRepas = async (idRepas) => {
    const infosRepas = await db.getFirstAsync("SELECT * FROM meals WHERE id = ?", [idRepas]);
    if (!infosRepas) return null;
    const listeAliments = await db.getAllAsync("SELECT * FROM foods WHERE meal_id = ?", [idRepas]);
    return {
        ...infosRepas,
        foods: listeAliments
    };
};





/* USER / CONFIG */

export const initProfile = async (id, username, email) => {
    await db.runAsync(
        "INSERT OR IGNORE INTO user_profile (id, username, email, first_connection) VALUES (?, ?, ?, 1)",
        [id, username, email]
    );
};

export const saveProfile = async (userId, data) => {
    const params = [
        data.weight,
        data.height,
        data.gender,
        data.age,
        data.profile_pic_local,
        data.daily_goal,
        data.first_connection,
        userId
    ];

    await db.runAsync(
        `UPDATE user_profile 
         SET weight=?, height=?, gender=?, age=?, profile_pic_local=?, daily_goal=?, first_connection=? 
         WHERE id=?`,
        params
    );
};

export const getProfile = async (userId) => {
    const p = await db.getFirstAsync("SELECT * FROM user_profile WHERE id = ?", [userId]);
    return p;
};

export const closeTuto = async (userId) => {
    await db.runAsync("UPDATE user_profile SET first_connection = 0 WHERE id = ?", [userId]);
};

export const healthUtils = {
    calculateBMI: (w, h) => {
        if (!w || !h) return "0.0";
        const h_m = h / 100;
        return (w / (h_m * h_m)).toFixed(1);
    },
    getBMICategory: (bmi) => {
        const val = parseFloat(bmi);
        if (val < 18.5) return "Maigreur";
        if (val < 25) return "Normal";
        if (val < 30) return "Surpoids";
        return "Obésité";
    }
};




export const killDB = async () => {
    console.warn("ATTENTION: RESET COMPLET DB");
    await db.execAsync("DROP TABLE IF EXISTS foods");
    await db.execAsync("DROP TABLE IF EXISTS meals");
    await db.execAsync("DROP TABLE IF EXISTS user_profile");
    await initDB();
};


export default db;