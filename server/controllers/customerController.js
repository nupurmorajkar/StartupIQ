import { Customer } from "../models/Customer.js";
import { isDbConnected } from "../config/db.js";
import { memStore } from "../store/memStore.js";

export async function getCustomers(req, res) {
  try {
    const { businessTypeId } = req.query;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (isDbConnected()) {
      const customers = await Customer.find({ businessTypeId: craft }).sort({ outstandingDue: -1, name: 1 });
      return res.json({ success: true, data: customers });
    }

    const filtered = memStore.customers.filter((c) => c.businessTypeId === craft);
    filtered.sort((a, b) => b.outstandingDue - a.outstandingDue);
    return res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, phone, email, businessTypeId } = req.body;
    const craft = businessTypeId || memStore.currentBusinessType;

    if (!name) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }

    if (isDbConnected()) {
      const customer = await Customer.create({
        name: name.trim(),
        phone: phone?.trim() || "",
        email: email?.trim() || "",
        businessTypeId: craft,
      });
      return res.status(201).json({ success: true, data: customer });
    }

    const newCust = {
      id: "cust_" + Date.now(),
      name: name.trim(),
      phone: phone?.trim() || "",
      email: email?.trim() || "",
      totalOrders: 0,
      totalSpent: 0,
      outstandingDue: 0,
      paymentHistory: [],
      businessTypeId: craft,
    };
    memStore.customers.push(newCust);
    return res.status(201).json({ success: true, data: newCust });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function recordCustomerPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount, method = "UPI", notes = "" } = req.body;

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid payment amount is required" });
    }

    if (isDbConnected()) {
      const customer = await Customer.findById(id);
      if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

      customer.outstandingDue = Math.max(0, customer.outstandingDue - payAmount);
      customer.paymentHistory.unshift({
        date: new Date(),
        amount: payAmount,
        method,
        notes,
      });
      await customer.save();
      return res.json({ success: true, data: customer, message: `Recorded payment of ₹${payAmount}` });
    }

    const cust = memStore.customers.find((c) => c.id === id || c._id === id);
    if (!cust) return res.status(404).json({ success: false, message: "Customer not found" });

    cust.outstandingDue = Math.max(0, cust.outstandingDue - payAmount);
    cust.paymentHistory.unshift({
      date: new Date().toISOString(),
      amount: payAmount,
      method,
      notes,
    });
    return res.json({ success: true, data: cust, message: `Recorded payment of ₹${payAmount}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Customer.findByIdAndDelete(id);
      return res.json({ success: true, message: "Customer deleted" });
    }

    memStore.customers = memStore.customers.filter((c) => c.id !== id && c._id !== id);
    return res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
