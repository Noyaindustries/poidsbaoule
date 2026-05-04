import type { Request, Response } from 'express';
import { app, initializeApp } from '../server/index';

export default async function handler(req: Request, res: Response) {
  try {
    await initializeApp();
    app(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error:
        "Erreur d'initialisation API. Vérifiez les variables Vercel (MONGODB_URI, MONGODB_DB_NAME).",
    });
  }
}
