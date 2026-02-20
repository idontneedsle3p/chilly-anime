import express from "express";
import { getAnimeById, getPopular, proxyImage, searchAnime } from "../controllers/anime.controller.js";

const router = express.Router();

router.get("/proxy-image", proxyImage);
router.get("/popular", getPopular);
router.get("/search", searchAnime);
router.get("/anime/:id", getAnimeById);

export default router;