import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ShoppingCart, User, Search, Heart, ChevronDown, ChevronLeft, ChevronRight,
  Truck, Calendar, Package, RotateCcw, Star, Droplets, Battery,
  X, Plus, Minus, MessageCircle, Send, CheckCircle2
} from 'lucide-react';
import './style.css';

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: string;
  heart: boolean;
  spo2: boolean;
  days: number;
  color: string;
  colorName: string;
};

const products: Product[] = [
  { id: 'A1', name: 'Vita A1', price: 4400000, oldPrice: 5100000, discount: '۱۵٪', heart: true, spo2: true, days: 7, color: '#26292e', colorName: 'مشکی' },
  { id: 'B2', name: 'Vita B2', price: 3900000, oldPrice: 4500000, discount: '۱۳٪', heart: true, spo2: false, days: 6, color: '#39465a', colorName: 'سورمه‌ای' },
  { id: 'C3', name: 'Vita C3', price: 5800000, oldPrice: 6500000, discount: '۱۱٪', heart: true, spo2: true, days: 8, color: '#9bb8d3', colorName: 'آبی روشن' },
  { id: 'D4', name: 'Vita D4', price: 4100000, oldPrice: 4800000, discount: '۱۵٪', heart: true, spo2: true, days: 3, color: '#dfceb8', colorName: 'کرم' },
  { id: 'E5', name: 'Vita E5', price: 4600000, oldPrice: 5300000, discount: '۱۳٪', heart: true, spo2: false, days: 9, color: '#688c77', colorName: 'سبز' },
  { id: 'F6', name: 'Vita F6', price: 4200000, oldPrice: 4900000, discount: '۱۴٪', heart: true, spo2: true, days: 4, color: '#e08f9c', colorName: 'صورتی' },
];

const format = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

// Config per repository variant
const variant: 'a-no-chat' | 'a-chat' | 'b-no-chat' | 'b-chat' = 'b-chat';
const arch: 'A' | 'B' = variant.startsWith('b') ? 'B' : 'A';
const chatEnabled = variant.includes('chat') && !variant.includes('no-chat');

function Watch({ p, customColor, large = false, small = false }: { p: Product; customColor?: string; large?: boolean; small?: boolean }) {
  const strap = customColor || p.color;
  return (
    <div
      className={`watch-container ${large ? 'large' : ''} ${small ? 'small' : ''}`}
      style={{ '--strap-color': strap } as React.CSSProperties}
    >
      <div className="watch-strap-top" />
      <div className="watch-case">
        <div className="watch-crown" />
        <div className="watch-screen">
          <div className="watch-time">10:08</div>
          <div className="watch-rings">
            <span />
            <span />
            <span />
          </div>
          <div className="watch-metrics">
            <span className="heart-stat">♥ 78</span>
            <span className="spo2-stat">◉ 97%</span>
          </div>
        </div>
      </div>
      <div className="watch-strap-bottom" />
    </div>
  );
}

function App() {
  const [page, setPage] = useState<'catalog' | 'detail' | 'cart' | 'checkout' | 'done'>('catalog');
  const [selectedId, setSelectedId] = useState('A1');
  const [cart, setCart] = useState<{ id: string; qty: number; color?: string } | null>(null);
  const [activeColor, setActiveColor] = useState<string | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy] = useState('پرفروش‌ترین');
  const [filterHeart, setFilterHeart] = useState(false);
  const [filterSpo2, setFilterSpo2] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Checkout form fields
  const [form, setForm] = useState({
    name: 'مرجان گرامی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۲ واحد ۵',
  });

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ who: 'bot' | 'user'; text: string }[]>([
    { who: 'bot', text: 'سلام! درباره مشخصات ساعت‌های هوشمند چه سؤالی دارید؟' },
  ]);
  const [question, setQuestion] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  const product = products.find((p) => p.id === selectedId) || products[0];
  const cartProduct = cart ? products.find((p) => p.id === cart.id) || products[0] : null;

  function go(p: typeof page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function addToCart(p: Product, customColor?: string) {
    setCart((prev) =>
      prev && prev.id === p.id
        ? { id: p.id, qty: prev.qty + 1, color: customColor || prev.color || p.color }
        : { id: p.id, qty: 1, color: customColor || p.color }
    );
    go('cart');
  }

  async function handleChatReply() {
    const q = question.trim();
    if (!q || chatBusy) return;
    const next = [...messages, { who: 'user' as const, text: q }];
    setMessages(next);
    setQuestion('');
    setChatBusy(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.who === 'user' || m.who === 'bot')
            .map((m) => ({
              role: m.who === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
        }),
      });
      const data = await response.json();
      setMessages((m) => [
        ...m,
        { who: 'bot', text: response.ok ? data.reply : data.error || 'خطا در ارتباط با دستیار.' },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { who: 'bot', text: 'اتصال به دستیار هوشمند برقرار نشد. لطفاً دوباره تلاش کنید.' },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterHeart && !p.heart) return false;
    if (filterSpo2 && !p.spo2) return false;
    return true;
  });

  return (
    <div className={`app-root theme-${arch.toLowerCase()}`}>
      {/* 1. Header */}
      <header className="site-header">
        <div className="header-inner">
          {/* Logo & Navigation */}
          <div className="nav-and-brand">
            <button className="brand-logo" onClick={() => go('catalog')}>
              <Activity className="brand-pulse-icon" size={26} />
              <span className="brand-name">دیجی‌سلامت</span>
            </button>
            <nav className="main-nav">
              <button className="nav-item" onClick={() => go('catalog')}>
                خانه
              </button>
              <button className="nav-item" onClick={() => go('catalog')}>
                دسته‌بندی‌ها
              </button>
              <button className="nav-item active" onClick={() => go('catalog')}>
                ساعت هوشمند
              </button>
            </nav>
          </div>

          {/* Search Box */}
          <div className="header-search">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="جستجو در محصولات..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (page !== 'catalog') go('catalog');
              }}
            />
          </div>

          {/* User & Cart Icons */}
          <div className="header-actions">
            <button className="icon-btn" aria-label="پروفایل کاربر">
              <User size={22} />
            </button>
            <button className="icon-btn cart-btn" onClick={() => go('cart')} aria-label="سبد خرید">
              <ShoppingCart size={22} />
              {cart && cart.qty > 0 && <span className="cart-badge">{format(cart.qty)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-container">
        {/* ================= PAGE 1: CATALOG ================= */}
        {page === 'catalog' && (
          <div className="catalog-page">
            <div className="page-heading">
              <h1 className="heading-title">ساعت‌های هوشمند</h1>
              <p className="heading-subtitle">انتخابی هوشمند برای سبک زندگی سالم</p>
            </div>

            {arch === 'B' && (
              <div className="sort-bar-b">
                <div className="sort-dropdown">
                  <span>مرتب‌سازی: {sortBy}</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            )}

            <div className={`catalog-layout ${arch === 'A' ? 'with-sidebar' : 'full-width'}`}>
              {/* Product Grid */}
              <div className="products-grid">
                {filteredProducts.map((p) => (
                  <div className="product-card" key={p.id}>
                    <button
                      className="card-media"
                      onClick={() => {
                        setSelectedId(p.id);
                        setActiveColor(undefined);
                        go('detail');
                      }}
                    >
                      <Watch p={p} />
                    </button>
                    <div className="card-info">
                      <h3
                        className="product-title"
                        onClick={() => {
                          setSelectedId(p.id);
                          setActiveColor(undefined);
                          go('detail');
                        }}
                      >
                        {p.name}
                      </h3>
                      <div className="product-price">
                        <strong>{format(p.price)}</strong> <small>تومان</small>
                      </div>

                      {/* Design A specific: Health Feature Chips */}
                      {arch === 'A' && (
                        <div className="feature-chips">
                          <span className="chip">
                            <Heart size={14} className="chip-icon heart" /> ضربان قلب
                          </span>
                          <span className="chip">
                            <Droplets size={14} className="chip-icon spo2" /> اکسیژن خون
                          </span>
                        </div>
                      )}

                      {/* Button: Solid Purple for A, Outline Blue for B */}
                      <button
                        className={`add-btn ${arch === 'A' ? 'solid-btn' : 'outline-btn'}`}
                        onClick={() => addToCart(p)}
                      >
                        <ShoppingCart size={17} />
                        <span>افزودن به سبد خرید</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Design A Sidebar: Filter Panel */}
              {arch === 'A' && (
                <aside className="filters-sidebar">
                  <div className="filter-header">
                    <h3>فیلتر محصولات</h3>
                  </div>

                  {/* Price Range */}
                  <div className="filter-section">
                    <label className="section-title">محدوده قیمت</label>
                    <div className="slider-track">
                      <div className="slider-bar" />
                      <div className="slider-thumb left" />
                      <div className="slider-thumb right" />
                    </div>
                    <div className="price-range-badge">
                      <span>از ۳,۹۰۰,۰۰۰ تا ۵,۸۰۰,۰۰۰ تومان</span>
                    </div>
                  </div>

                  {/* Health Features */}
                  <div className="filter-section">
                    <label className="section-title">ویژگی‌های سلامت</label>
                    <div className="checkbox-list">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filterHeart}
                          onChange={(e) => setFilterHeart(e.target.checked)}
                        />
                        <span>ضربان قلب</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filterSpo2}
                          onChange={(e) => setFilterSpo2(e.target.checked)}
                        />
                        <span>اکسیژن خون (SpO2)</span>
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" />
                        <span>مانیتورینگ خواب</span>
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" />
                        <span>شمارش‌گر گام</span>
                      </label>
                    </div>
                  </div>

                  {/* Product Colors */}
                  <div className="filter-section">
                    <label className="section-title">رنگ محصول</label>
                    <div className="color-swatches">
                      <span className="swatch" style={{ background: '#ffffff', border: '1px solid #d1d5db' }} />
                      <span className="swatch" style={{ background: '#dfceb8' }} />
                      <span className="swatch" style={{ background: '#e08f9c' }} />
                      <span className="swatch" style={{ background: '#688c77' }} />
                      <span className="swatch" style={{ background: '#9bb8d3' }} />
                      <span className="swatch" style={{ background: '#26292e' }} />
                    </div>
                  </div>

                  <button className="apply-filters-btn">اعمال فیلترها</button>
                </aside>
              )}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="page-nav prev">
                <ChevronRight size={18} />
              </button>
              <button className="page-number active">۱</button>
              <button className="page-nav next">
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= PAGE 2: DETAIL ================= */}
        {page === 'detail' && (
          <div className="detail-page">
            {/* Design A Breadcrumb */}
            {arch === 'A' && (
              <nav className="breadcrumb">
                <button onClick={() => go('catalog')}>خانه</button>
                <ChevronLeft size={14} />
                <button onClick={() => go('catalog')}>دسته‌بندی‌ها</button>
                <ChevronLeft size={14} />
                <button onClick={() => go('catalog')}>ساعت هوشمند</button>
                <ChevronLeft size={14} />
                <span className="current">{product.name}</span>
              </nav>
            )}

            <div className="detail-main-layout">
              {/* Product Info (Right Column in RTL) */}
              <div className="detail-info-col">
                <h1 className="detail-title">ساعت هوشمند {product.name}</h1>
                <p className="detail-subtitle">
                  {arch === 'A'
                    ? 'پایش دقیق سلامت، همراه شما تمام فعالیت‌ها'
                    : 'مناسب پایش سلامت روزانه'}
                </p>

                <div className="detail-rating">
                  <span className="score">۴.۲</span>
                  <Star size={16} className="star-filled" fill="#f59e0b" color="#f59e0b" />
                  <span className="review-count">(۴۲ نظر)</span>
                </div>

                {/* Price block */}
                <div className="detail-price-box">
                  {arch === 'A' ? (
                    <div className="price-with-discount">
                      <div className="discount-row">
                        <span className="discount-badge">٪۱۵ تخفیف</span>
                        <span className="old-price">{format(product.oldPrice)} تومان</span>
                      </div>
                      <div className="current-price">
                        <strong>{format(product.price)}</strong> <small>تومان</small>
                      </div>
                    </div>
                  ) : (
                    <div className="current-price clean">
                      <strong>{format(product.price)}</strong> <small>تومان</small>
                    </div>
                  )}
                </div>

                {/* Design A Value Prop Badges */}
                {arch === 'A' && (
                  <div className="value-badges-list">
                    <div className="badge-item green">
                      <Truck size={18} />
                      <span>ارسال رایگان</span>
                    </div>
                    <div className="badge-item blue">
                      <Calendar size={18} />
                      <span>تحویل ۲ تا ۳ روز کاری</span>
                    </div>
                    <div className="badge-item red">
                      <Package size={18} />
                      <span>موجودی محدود (فقط ۸ عدد)</span>
                    </div>
                    <div className="badge-item purple">
                      <RotateCcw size={18} />
                      <span>بازگشت کالا تا ۷ روز</span>
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                <div className="color-selector">
                  <div className="color-dots">
                    {[
                      { code: '#dfceb8', name: 'کرم' },
                      { code: '#688c77', name: 'سبز' },
                      { code: '#e08f9c', name: 'صورتی' },
                      { code: '#26292e', name: 'مشکی' },
                    ].map((c) => (
                      <button
                        key={c.code}
                        className={`color-circle ${
                          (activeColor || product.color) === c.code ? 'selected' : ''
                        }`}
                        style={{ background: c.code }}
                        onClick={() => setActiveColor(c.code)}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="quantity-row">
                  <span className="qty-label">تعداد:</span>
                  <div className="qty-counter">
                    <button onClick={() => {}}><Minus size={14} /></button>
                    <span>۱</span>
                    <button onClick={() => {}}><Plus size={14} /></button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-row">
                  <button
                    className={`main-add-btn ${arch === 'A' ? 'theme-purple' : 'theme-blue'}`}
                    onClick={() => addToCart(product, activeColor)}
                  >
                    <ShoppingCart size={19} />
                    <span>افزودن به سبد خرید</span>
                  </button>
                  <button
                    className={`wishlist-btn ${liked ? 'liked' : ''}`}
                    onClick={() => setLiked(!liked)}
                    aria-label="افزودن به علاقه‌مندی"
                  >
                    <Heart size={20} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#64748b'} />
                  </button>
                </div>
              </div>

              {/* Product Visual (Left Column in RTL) */}
              <div className="detail-media-col">
                <div className="main-visual-box">
                  <Watch p={product} customColor={activeColor} large />
                </div>
                <div className="thumbnails-row">
                  <button className="thumb-nav prev">
                    <ChevronRight size={16} />
                  </button>
                  <div className="thumb-list">
                    {[0, 1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        className={`thumb-item ${selectedThumb === idx ? 'active' : ''}`}
                        onClick={() => setSelectedThumb(idx)}
                      >
                        <Watch p={product} customColor={activeColor} small />
                      </button>
                    ))}
                  </div>
                  <button className="thumb-nav next">
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Design A Features Row vs Design B Tabs */}
            {arch === 'A' ? (
              <div className="feature-cards-banner">
                <div className="feature-box">
                  <Droplets size={24} className="feature-icon water" />
                  <h4>مقاومت در برابر آب</h4>
                  <p>IP68</p>
                </div>
                <div className="feature-box">
                  <Droplets size={24} className="feature-icon spo2" />
                  <h4>سنجش اکسیژن خون</h4>
                  <p>SpO2</p>
                </div>
                <div className="feature-box">
                  <Battery size={24} className="feature-icon battery" />
                  <h4>شارژدهی</h4>
                  <p>۷ روز</p>
                </div>
                <div className="feature-box">
                  <Heart size={24} className="feature-icon heart" />
                  <h4>پایش ضربان قلب</h4>
                  <p>۲۴ ساعته</p>
                </div>
              </div>
            ) : (
              <div className="tabs-container">
                <div className="tabs-header">
                  <button
                    className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('desc')}
                  >
                    توضیحات محصول
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('specs')}
                  >
                    مشخصات فنی
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    نظرات کاربران
                  </button>
                </div>
                <div className="tab-content">
                  {activeTab === 'desc' && (
                    <p>
                      ساعت هوشمند {product.name} با طراحی سبک و امکانات پایش سلامت، گزینه‌ای مناسب
                      برای استفاده روزمره و فعالیت‌های ورزشی است.
                    </p>
                  )}
                  {activeTab === 'specs' && (
                    <p>سنجش ضربان قلب: بله | سنجش SpO2: بله | باتری: تا ۷ روز | شارژ مغناطیسی</p>
                  )}
                  {activeTab === 'reviews' && (
                    <p>۴۲ نظر ثبت‌شده با میانگین رضایت ۴.۲ از ۵ توسط خریداران.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PAGE 3: CART ================= */}
        {page === 'cart' && (
          <div className="cart-page">
            <div className="cart-header">
              <h2>سبد خرید</h2>
              {arch === 'A' && (
                <button className="continue-shopping-link" onClick={() => go('catalog')}>
                  ادامه خرید ←
                </button>
              )}
            </div>

            {cart && cartProduct ? (
              <div className="cart-content-wrapper">
                {/* Cart item card */}
                <div className="cart-item-card">
                  <button
                    className="cart-remove-btn"
                    onClick={() => setCart(null)}
                    aria-label="حذف"
                  >
                    <X size={18} />
                  </button>
                  <div className="cart-item-qty">
                    <button onClick={() => setCart((c) => c && { ...c, qty: Math.max(1, c.qty - 1) })}>
                      <Minus size={13} />
                    </button>
                    <span>{format(cart.qty)}</span>
                    <button onClick={() => setCart((c) => c && { ...c, qty: c.qty + 1 })}>
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="cart-item-price">
                    <strong>{format(cartProduct.price * cart.qty)} تومان</strong>
                  </div>
                  <div className="cart-item-info">
                    <h4>ساعت هوشمند {cartProduct.name}</h4>
                    <p>رنگ: مشکی</p>
                  </div>
                  <div className="cart-item-thumb">
                    <Watch p={cartProduct} customColor={cart.color} small />
                  </div>
                </div>

                {/* Design A Related Recommendations Box */}
                {arch === 'A' && (
                  <div className="related-recommendations-box">
                    <h3>پیشنهادهای مرتبط</h3>
                    <div className="related-grid">
                      <button
                        className="related-item"
                        onClick={() => {
                          setSelectedId('B2');
                          go('detail');
                        }}
                      >
                        <Watch p={products[1]} small />
                        <div className="related-info">
                          <h4>Vita B2</h4>
                          <p>{format(products[1].price)} تومان</p>
                        </div>
                      </button>
                      <button
                        className="related-item"
                        onClick={() => {
                          setSelectedId('E5');
                          go('detail');
                        }}
                      >
                        <Watch p={products[4]} small />
                        <div className="related-info">
                          <h4>Vita E5</h4>
                          <p>{format(products[4].price)} تومان</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Cart Summary */}
                <div className="cart-summary-row">
                  <span className="summary-label">جمع کل سفارش</span>
                  <span className="summary-amount">
                    {format(cartProduct.price * cart.qty)} تومان
                  </span>
                </div>

                {/* Proceed Button */}
                <button
                  className={`checkout-cta-btn ${arch === 'A' ? 'theme-purple' : 'theme-blue'}`}
                  onClick={() => go('checkout')}
                >
                  <span>ادامه و ثبت سفارش</span>
                  <ChevronLeft size={18} />
                </button>
              </div>
            ) : (
              <div className="cart-empty-box">
                <ShoppingCart size={48} className="empty-icon" />
                <h3>سبد خرید شما خالی است</h3>
                <button className="return-store-btn" onClick={() => go('catalog')}>
                  مشاهده محصولات
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= PAGE 4: CHECKOUT ================= */}
        {page === 'checkout' && (
          <div className="checkout-page">
            {/* Step Wizard Progress */}
            <div className="wizard-progress">
              <div className="step-node active">
                <div className="node-circle">۱</div>
                <span className="node-label">اطلاعات سفارش</span>
              </div>
              <div className="step-connector" />
              <div className="step-node">
                <div className="node-circle">۲</div>
                <span className="node-label">پرداخت</span>
              </div>
              <div className="step-connector" />
              <div className="step-node">
                <div className="node-circle">۳</div>
                <span className="node-label">تکمیل سفارش</span>
              </div>
            </div>

            <div className="checkout-content-card">
              <h3 className="card-section-title">اطلاعات سفارش</h3>
              <form
                className="checkout-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (cart) go('done');
                }}
              >
                <div className="form-group">
                  <label>
                    نام و نام خانوادگی <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    شماره موبایل <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    آدرس تحویل <span className="req">*</span>
                  </label>
                  <div className="dropdown-input-wrapper">
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                    />
                    <ChevronDown className="input-chevron" size={18} />
                  </div>
                </div>

                {/* Order Summary Sub-box */}
                <div className="checkout-summary-box">
                  <div className="summary-title">خلاصه سفارش</div>
                  {cartProduct && cart && (
                    <div className="summary-product-item">
                      <div className="item-details">
                        <h4>{cartProduct.name}</h4>
                        <small>رنگ: مشکی</small>
                      </div>
                      <div className="item-price">
                        <span>{format(cartProduct.price)} تومان</span>
                        <small>× {format(cart.qty)}</small>
                      </div>
                      <div className="item-thumb">
                        <Watch p={cartProduct} customColor={cart.color} small />
                      </div>
                    </div>
                  )}

                  {arch === 'A' && (
                    <div className="summary-line-detail">
                      <span>هزینه ارسال</span>
                      <strong className="free-shipping-text">رایگان</strong>
                    </div>
                  )}

                  <div className="summary-line-detail total">
                    <span>مبلغ قابل پرداخت</span>
                    <strong>
                      {format(cartProduct && cart ? cartProduct.price * cart.qty : 0)} تومان
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`submit-order-btn ${arch === 'A' ? 'theme-purple' : 'theme-blue'}`}
                >
                  <span>پرداخت و ثبت سفارش</span>
                  <ChevronLeft size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= PAGE 5: DONE ================= */}
        {page === 'done' && (
          <div className="done-page">
            <CheckCircle2 size={68} className="done-icon" />
            <h2>سفارش آزمایشی با موفقیت ثبت شد</h2>
            <p>
              فرایند ثبت سفارش با موفقیت به پایان رسید. این یک محیط آزمایشی است و هیچ تراکنش مالی یا
              ارسال کالایی انجام نخواهد شد.
            </p>
            <button
              className="return-btn"
              onClick={() => {
                setCart(null);
                go('catalog');
              }}
            >
              بازگشت به فروشگاه
            </button>
          </div>
        )}
      </main>

      {/* Floating Chatbot (for chatEnabled variants) */}
      {chatEnabled && (
        <>
          <button
            className={`chat-fab ${arch === 'A' ? 'theme-purple' : 'theme-blue'}`}
            onClick={() => setChatOpen(!chatOpen)}
            aria-label="گفتگو با پشتیبانی"
          >
            {chatOpen ? <X size={26} /> : <MessageCircle size={26} />}
          </button>

          {chatOpen && (
            <div className="chat-window">
              <div className={`chat-window-header ${arch === 'A' ? 'theme-purple' : 'theme-blue'}`}>
                <div>
                  <strong>پشتیبانی آنلاین ویتا</strong>
                  <small>دستیار هوشمند پاسخگویی به سؤالات</small>
                </div>
                <button onClick={() => setChatOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="chat-messages-container">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.who}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="chat-input-bar">
                <input
                  type="text"
                  placeholder={chatBusy ? 'در حال دریافت پاسخ...' : 'سؤال خود را بنویسید...'}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatReply()}
                  disabled={chatBusy}
                />
                <button onClick={handleChatReply} disabled={chatBusy}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
