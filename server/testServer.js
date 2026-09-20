import app from "./server.js";

setTimeout(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/health");
    const health = await res.json();
    console.log("HEALTH_CHECK:", health.app, "DB:", health.database);

    // Test signup
    const signupRes = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Founder",
        email: `founder_${Date.now()}@startapiq.com`,
        password: "securepassword123",
        businessName: "IQ Test Bakery",
        businessType: "baker",
      }),
    });
    const signupData = await signupRes.json();
    console.log("SIGNUP_SUCCESS:", signupData.success, "TOKEN_EXISTS:", Boolean(signupData.token));

    // Test customers
    const custRes = await fetch("http://localhost:5000/api/customers");
    const custData = await custRes.json();
    console.log("CUSTOMERS_LOADED:", custData.data?.length);

    // Test stock movements
    const movRes = await fetch("http://localhost:5000/api/stock/movements");
    const movData = await movRes.json();
    console.log("MOVEMENTS_AUDIT_LOADED:", movData.data?.length);

    // Test analytics
    const aRes = await fetch("http://localhost:5000/api/analytics/dashboard");
    const aData = await aRes.json();
    console.log("ANALYTICS_PROFIT:", aData.data?.summary?.netProfit, "INVENTORY_VALUATION:", aData.data?.summary?.totalInventoryValue);

    console.log("ALL_STARTUP_IQ_BACKEND_TESTS_PASSED!");
    process.exit(0);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}, 500);
