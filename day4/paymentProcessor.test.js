// paymentProcessor.test.js

const PaymentProcessor = require("./paymentProcessor");

describe("PaymentProcessor", () => {
  let apiClient;
  let processor;

  beforeEach(() => {
    apiClient = { post: jest.fn().mockResolvedValue({ status: 200 }) };
    processor = new PaymentProcessor(apiClient, {
      currencyConversionRate: 1.2,
    });
  });

  test("processes credit card payment", async () => {
    const tx = await processor.processPayment({
      amount: 200,
      currency: "USD",
      userId: "user1",
      paymentMethod: "credit_card",
      metadata: { cardNumber: "123", expiry: "10/30" },
      discountCode: "SUMMER20",
      fraudCheckLevel: 1,
    });

    expect(tx.finalAmount).toBeCloseTo(160);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/payments/credit",
      expect.any(Object)
    );
  });

  test("processes PayPal payment with conversion", async () => {
    const tx = await processor.processPayment({
      amount: 50,
      currency: "EUR",
      userId: "user2",
      paymentMethod: "paypal",
      metadata: { paypalAccount: "me@test.com" },
    });

    expect(tx.finalAmount).toBeCloseTo(50 * 1.2);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/payments/paypal",
      expect.any(Object)
    );
  });

  test("throws for invalid card metadata", async () => {
    await expect(
      processor.processPayment({
        amount: 50,
        userId: "x",
        paymentMethod: "credit_card",
        metadata: {},
      })
    ).rejects.toThrow("Invalid card metadata");
  });

  test("refund applies correct fee", async () => {
    const refund = await processor.refundPayment({
      transactionId: "t1",
      userId: "u3",
      reason: "test",
      amount: 100,
      currency: "USD",
    });

    expect(refund.netAmount).toBeCloseTo(95);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/payments/refund",
      expect.any(Object)
    );
  });
});
