// paymentProcessor.js

// -------------------- CONSTANTS --------------------
const DEFAULT_CURRENCY = "USD";
const DEFAULT_CONVERSION_RATE = 1.2;
const REFUND_FEE_PERCENT = 0.05;

// -------------------- SERVICES --------------------
class FraudService {
  async check(userId, amount, level) {
    if (level <= 0) return { checked: false };

    if (amount < 100) {
      return amount < 10
        ? { checked: true, risk: "very_low" }
        : { checked: true, risk: "low" };
    }

    return amount < 1000
      ? { checked: true, risk: "medium" }
      : { checked: true, risk: "high" };
  }
}

class DiscountService {
  apply(amount, code) {
    if (!code) return { amount, code: null };

    if (code === "SUMMER20") return { amount: amount * 0.8, code };
    if (code === "WELCOME10") return { amount: amount - 10, code };

    return { amount, code };
  }
}

class EmailService {
  async send(userId, amount, currency) {
    console.log(
      `Email sent to ${userId}: Payment of ${amount} ${currency} processed.`
    );
  }
}

class AnalyticsService {
  async log(event) {
    console.log("Analytics event:", event);
  }
}

// -------------------- MAIN CLASS --------------------
class PaymentProcessor {
  constructor(apiClient, options = {}) {
    this.apiClient = apiClient;
    this.currencyConversionRate =
      options.currencyConversionRate ?? DEFAULT_CONVERSION_RATE;

    this.fraudService = new FraudService();
    this.discountService = new DiscountService();
    this.emailService = new EmailService();
    this.analyticsService = new AnalyticsService();

    this.endpoints = {
      credit_card: "/payments/credit",
      paypal: "/payments/paypal",
    };
  }

  async processPayment({
    amount,
    currency = DEFAULT_CURRENCY,
    userId,
    paymentMethod,
    metadata = {},
    discountCode,
    fraudCheckLevel = 0,
  }) {
    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!userId) throw new Error("userId required");

    // Metadata validation
    if (paymentMethod === "credit_card") {
      if (!metadata.cardNumber || !metadata.expiry)
        throw new Error("Invalid card metadata");
    } else if (paymentMethod === "paypal") {
      if (!metadata.paypalAccount)
        throw new Error("Invalid PayPal metadata");
    } else {
      throw new Error("Unsupported payment method");
    }

    // Fraud check
    const fraud = await this.fraudService.check(
      userId,
      amount,
      fraudCheckLevel
    );

    // Discount
    const discounted = this.discountService.apply(amount, discountCode);
    let finalAmount = discounted.amount;

    // Currency conversion
    if (currency !== DEFAULT_CURRENCY) {
      finalAmount *= this.currencyConversionRate;
    }

    const transaction = {
      userId,
      originalAmount: amount,
      finalAmount,
      currency,
      paymentMethod,
      metadata,
      discountCode: discounted.code,
      fraud,
      timestamp: new Date().toISOString(),
    };

    // API call
    const endpoint = this.endpoints[paymentMethod];
    await this.apiClient.post(endpoint, transaction);

    // Side effects (not blocking)
    this.emailService.send(userId, finalAmount, currency);
    this.analyticsService.log({
      userId,
      amount: finalAmount,
      method: paymentMethod,
      currency,
    });

    return transaction;
  }

  async refundPayment({ transactionId, userId, reason, amount, currency }) {
    if (!transactionId) throw new Error("transactionId required");
    if (!userId) throw new Error("userId required");

    const refundFee = amount * REFUND_FEE_PERCENT;
    const refund = {
      transactionId,
      userId,
      reason,
      amount,
      currency,
      netAmount: amount - refundFee,
      date: new Date().toISOString(),
    };

    await this.apiClient.post("/payments/refund", refund);

    return refund;
  }
}

module.exports = PaymentProcessor;
