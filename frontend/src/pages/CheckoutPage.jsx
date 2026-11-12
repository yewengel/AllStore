import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { getProductImageUrl } from '../api/axios';
import { toEtb } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';

const FREE_SHIPPING_THRESHOLD = toEtb(100, 'USD');
const STANDARD_SHIPPING_COST = toEtb(9.99, 'USD');

const CheckoutPage = () => {
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [address, setAddress] = useState('123 University Campus Blvd');
  const [city, setCity] = useState('New York');
  const [postalCode, setPostalCode] = useState('10001');
  const [country, setCountry] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="empty-cart-card">
          <h2>No Items to Checkout</h2>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Go to Products
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const grandTotal = Number((totalPrice + shippingCost).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber.trim() || !address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setError('Please fill in your phone number and all required shipping address fields.');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          qty: item.qty,
        })),
        shippingAddress: {
          address,
          city,
          postalCode,
          country,
        },
        phoneNumber,
        paymentMethod,
      };

      const { data } = await api.post('/orders', orderPayload);

      // Successfully created order & backend decreased stockQuantity!
      clearCart();
      navigate('/my-orders', {
        state: { newOrderPlaced: true, orderNumber: data.orderNumber },
      });
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(
        err.response?.data?.message || 'An error occurred while placing your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Checkout</h1>
            <p className="page-description">Complete your shipping information and finalize your order.</p>
          </div>
          <Link to="/cart" className="back-link">
            &larr; Back to Cart
          </Link>
        </div>

        {error && <div className="alert-error-banner">{error}</div>}

        <div className="checkout-layout-grid">
          {/* Left: Shipping & Payment Form */}
          <div className="checkout-form-col">
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="checkout-card">
              <h2 className="card-section-title">1. Shipping Address</h2>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength="50"
                  placeholder="e.g. +1 555 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  id="address"
                  type="text"
                  required
                  placeholder="e.g. 123 Main St, Apt 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder="e.g. New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode">Postal / ZIP Code *</label>
                  <input
                    id="postalCode"
                    type="text"
                    required
                    placeholder="e.g. 10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  id="country"
                  type="text"
                  required
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="summary-divider" style={{ margin: '32px 0 24px' }}></div>

              <h2 className="card-section-title">2. Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-radio-label ${paymentMethod === 'Credit Card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit Card"
                    checked={paymentMethod === 'Credit Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">💳</span>
                  <div>
                    <strong>Credit / Debit Card</strong>
                    <p>Fast and secure card payment</p>
                  </div>
                </label>

                <label className={`payment-radio-label ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">💵</span>
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay when items are delivered to your doorstep</p>
                  </div>
                </label>

                <label className={`payment-radio-label ${paymentMethod === 'PayPal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayPal"
                    checked={paymentMethod === 'PayPal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">🅿️</span>
                  <div>
                    <strong>PayPal</strong>
                    <p>Fast and safe online digital payment</p>
                  </div>
                </label>
              </div>
            </form>
          </div>

          {/* Right: Order Review */}
          <div className="checkout-summary-col">
            <div className="order-summary-card">
              <h3 className="summary-title">Order Review ({totalItems} items)</h3>

              <div className="checkout-items-preview">
                {cartItems.map((item) => (
                  <div key={item.product} className="checkout-item-compact">
                    <img
                      src={getProductImageUrl(item.image)}
                      alt={item.name}
                      className="checkout-thumb"
                      onError={(e) => {
                        e.target.src = '/uploads/sample-product.svg';
                      }}
                    />
                    <div className="checkout-item-details">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-meta">
                        Qty: {item.qty} &times; {formatPrice(item.price, item.currency)}
                      </span>
                    </div>
                    <span className="checkout-item-subtotal">{formatPrice(item.price * item.qty, item.currency)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-line">
                <span>Items Subtotal</span>
                <span>{formatPrice(totalPrice, 'ETB')}</span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <strong style={{ color: '#10b981' }}>FREE</strong> : formatPrice(shippingCost, 'ETB')}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-line">
                <span>Total Amount</span>
                <span className="summary-grand-total">{formatPrice(grandTotal, 'ETB')}</span>
              </div>

              <div className="customer-info-note">
                Ordering as <strong>{user?.name}</strong> ({user?.email})
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="btn-primary btn-checkout-action"
              >
                {loading ? 'Processing Order...' : `Place Order (${formatPrice(grandTotal, 'ETB')})`}
              </button>

              <p className="stock-notice">
                ⚡ Fast order processing and instant order confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

