import express from "express";
import {
  getStock,
  createStock,
  updateStock,
  adjustStockQuantity,
  getInventoryMovements,
  deleteStock,
} from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getStock);
router.get("/movements", getInventoryMovements);
router.post("/", createStock);
router.put("/:id", updateStock);
router.patch("/:id/adjust", adjustStockQuantity);
router.delete("/:id", deleteStock);

export default router;
