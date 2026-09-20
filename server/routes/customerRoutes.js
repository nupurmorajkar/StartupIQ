import express from "express";
import {
  getCustomers,
  createCustomer,
  recordCustomerPayment,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomers);
router.post("/", createCustomer);
router.post("/:id/payment", recordCustomerPayment);
router.delete("/:id", deleteCustomer);

export default router;
