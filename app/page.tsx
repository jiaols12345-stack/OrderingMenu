"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type CategoryKey = "all" | "hot" | "rice" | "drink";
type PortionKey = "small" | "regular" | "large";

type Portion = {
  label: string;
  multiplier: number;
};

type Dish = {
  id: number;
  name: string;
  category: Exclude<CategoryKey, "all">;
  price: number;
  image: string;
  desc: string;
};

type CartItem = {
  key: string;
  id: number;
  name: string;
  portionKey: PortionKey;
  portionLabel: string;
  unitPrice: number;
  quantity: number;
};

type SubmittedOrder = {
  time: string;
  summary: string;
  note: string;
  total: number;
};

const categories: Array<{ key: CategoryKey; label: string }> = [
  { key: "all", label: "全部菜品" },
  { key: "hot", label: "招牌热菜" },
  { key: "rice", label: "主食套餐" },
  { key: "drink", label: "饮品甜品" }
];

const portions: Record<PortionKey, Portion> = {
  small: { label: "小份", multiplier: 0.8 },
  regular: { label: "标准份", multiplier: 1 },
  large: { label: "大份", multiplier: 1.25 }
};

const dishes: Dish[] = [
  {
    id: 1,
    name: "黑椒牛肉饭",
    category: "rice",
    price: 32,
    image: "/dishes/black-pepper-beef-rice.svg",
    desc: "嫩牛肉配黑椒汁、溏心蛋和时蔬，适合工作日快速补能。"
  },
  {
    id: 2,
    name: "藤椒鸡腿",
    category: "hot",
    price: 36,
    image: "/dishes/rattan-pepper-chicken.svg",
    desc: "去骨鸡腿肉，藤椒香气清爽，微麻微辣。"
  },
  {
    id: 3,
    name: "番茄牛腩煲",
    category: "hot",
    price: 48,
    image: "/dishes/tomato-beef-stew.svg",
    desc: "慢炖牛腩搭配酸甜番茄汤底，浓郁下饭。"
  },
  {
    id: 4,
    name: "虾仁滑蛋饭",
    category: "rice",
    price: 35,
    image: "/dishes/shrimp-egg-rice.svg",
    desc: "大颗虾仁、嫩滑鸡蛋和热米饭，口感柔和。"
  },
  {
    id: 5,
    name: "金汤酸菜鱼",
    category: "hot",
    price: 56,
    image: "/dishes/sauerkraut-fish.svg",
    desc: "鲜鱼片配金汤酸菜，汤头开胃，适合多人分享。"
  },
  {
    id: 6,
    name: "柠檬气泡茶",
    category: "drink",
    price: 16,
    image: "/dishes/lemon-sparkling-tea.svg",
    desc: "新鲜柠檬与冷萃茶底，清爽解腻。"
  },
  {
    id: 7,
    name: "芋泥布丁杯",
    category: "drink",
    price: 18,
    image: "/dishes/taro-pudding.svg",
    desc: "绵密芋泥、奶香布丁和脆脆燕麦层。"
  },
  {
    id: 8,
    name: "双拼烧味饭",
    category: "rice",
    price: 38,
    image: "/dishes/roast-combo-rice.svg",
    desc: "叉烧与烧鸭双拼，搭配秘制酱汁和青菜。"
  }
];

function formatPrice(value: number) {
  return `￥${Math.round(value)}`;
}

function getPortionPrice(dish: Dish, portionKey: PortionKey) {
  return dish.price * portions[portionKey].multiplier;
}

function getCartKey(id: number, portionKey: PortionKey) {
  return `${id}-${portionKey}`;
}

function calculateTotals(entries: CartItem[]) {
  return {
    count: entries.reduce((sum, item) => sum + item.quantity, 0),
    total: entries.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  };
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [keyword, setKeyword] = useState("");
  const [selectedPortions, setSelectedPortions] = useState<Record<number, PortionKey>>(
    () => Object.fromEntries(dishes.map((dish) => [dish.id, "regular"])) as Record<number, PortionKey>
  );
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [submittedOrders, setSubmittedOrders] = useState<SubmittedOrder[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [toast, setToast] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleDishes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return dishes.filter((dish) => {
      const inCategory = activeCategory === "all" || dish.category === activeCategory;
      const inSearch =
        dish.name.toLowerCase().includes(normalizedKeyword) ||
        dish.desc.toLowerCase().includes(normalizedKeyword);
      return inCategory && inSearch;
    });
  }, [activeCategory, keyword]);

  const cartEntries = useMemo(() => Object.values(cart), [cart]);
  const totals = useMemo(() => calculateTotals(cartEntries), [cartEntries]);
  const hasItems = cartEntries.length > 0;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function updatePortion(id: number, portionKey: PortionKey) {
    setSelectedPortions((current) => ({ ...current, [id]: portionKey }));
  }

  function addToCart(dish: Dish) {
    const portionKey = selectedPortions[dish.id] ?? "regular";
    const portion = portions[portionKey];
    const key = getCartKey(dish.id, portionKey);

    setCart((current) => {
      const existing = current[key];
      return {
        ...current,
        [key]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : {
              key,
              id: dish.id,
              name: dish.name,
              portionKey,
              portionLabel: portion.label,
              unitPrice: getPortionPrice(dish, portionKey),
              quantity: 1
            }
      };
    });

    showToast(`${dish.name}（${portion.label}）已加入订单`);
  }

  function changeQuantity(key: string, action: "plus" | "minus") {
    setCart((current) => {
      const item = current[key];
      if (!item) return current;

      const nextQuantity = item.quantity + (action === "plus" ? 1 : -1);
      if (nextQuantity <= 0) {
        const nextCart = { ...current };
        delete nextCart[key];
        return nextCart;
      }

      return { ...current, [key]: { ...item, quantity: nextQuantity } };
    });
  }

  function clearCart() {
    setCart({});
    showToast("购物车已清空");
  }

  function submitOrder() {
    if (!hasItems) return;

    const summary = cartEntries.map((item) => `${item.name}${item.portionLabel}×${item.quantity}`).join("、");
    setSubmittedOrders((current) => [
      {
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        summary,
        note: orderNote.trim(),
        total: totals.total
      },
      ...current
    ]);
    setCart({});
    setOrderNote("");
    setIsModalOpen(true);
    showToast("订单已提交，已保存到最近提交订单");
  }

  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <h1>云巷小厨</h1>
            <p>现点现做，约 20 分钟送达餐桌。</p>
          </div>
          <nav className="category-list" aria-label="菜品分类">
            {categories.map((category) => (
              <button
                className={`category${activeCategory === category.key ? " active" : ""}`}
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          <section className="topbar">
            <div className="title">
              <h2>今日推荐</h2>
              <p>选择菜品、份量和数量，右侧可以随时查看已点餐品。</p>
            </div>
            <input
              className="search"
              type="search"
              placeholder="搜索菜名，例如：牛肉、柠檬茶"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </section>

          <section className="menu-grid" aria-live="polite">
            {visibleDishes.length === 0 ? (
              <p className="empty">没有找到相关菜品，换个关键词试试。</p>
            ) : (
              visibleDishes.map((dish) => {
                const portionKey = selectedPortions[dish.id] ?? "regular";
                return (
                  <article className="dish-card" key={dish.id}>
                    <button className="dish-hit-area" type="button" onClick={() => addToCart(dish)}>
                      <Image className="dish-image" src={dish.image} alt={dish.name} width={640} height={420} />
                    </button>
                    <div className="dish-body">
                      <button className="dish-copy" type="button" onClick={() => addToCart(dish)}>
                        <h3>{dish.name}</h3>
                        <p className="dish-desc">{dish.desc}</p>
                      </button>
                      <div className="portion-row">
                        <select
                          className="portion-select"
                          value={portionKey}
                          aria-label={`${dish.name} 份量`}
                          onChange={(event) => updatePortion(dish.id, event.target.value as PortionKey)}
                        >
                          {Object.entries(portions).map(([key, portion]) => (
                            <option key={key} value={key}>
                              {portion.label} {formatPrice(getPortionPrice(dish, key as PortionKey))}
                            </option>
                          ))}
                        </select>
                        <span className="price">{formatPrice(getPortionPrice(dish, portionKey))}</span>
                      </div>
                      <button className="add-btn" type="button" onClick={() => addToCart(dish)}>
                        加入订单
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </main>

        <aside className="cart">
          <div className="cart-head">
            <h2>我的订单</h2>
            <button
              className="ghost-btn"
              type="button"
              disabled={!hasItems && submittedOrders.length === 0}
              onClick={() => setIsModalOpen(true)}
            >
              查看已点
            </button>
          </div>

          <div className="cart-items">
            {!hasItems ? (
              <div className="empty">购物车还是空的，先加一道想吃的菜吧。</div>
            ) : (
              cartEntries.map((item) => (
                <div className="cart-item" key={item.key}>
                  <div>
                    <h4>{item.name}</h4>
                    <p className="cart-meta">
                      {item.portionLabel} · 单价 {formatPrice(item.unitPrice)}
                    </p>
                    <p className="cart-price">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                  <div className="qty" aria-label={`${item.name} 数量`}>
                    <button className="qty-btn" type="button" onClick={() => changeQuantity(item.key, "minus")}>
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button className="qty-btn" type="button" onClick={() => changeQuantity(item.key, "plus")}>
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="row">
              <span>餐品数量</span>
              <strong>{totals.count}</strong>
            </div>
            <div className="row total">
              <span>合计</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
            <textarea
              className="note"
              placeholder="备注：少辣、不要香菜、餐具数量等"
              value={orderNote}
              onChange={(event) => setOrderNote(event.target.value)}
            />
            <button className="checkout-btn" type="button" disabled={!hasItems} onClick={submitOrder}>
              提交订单
            </button>
            <button className="ghost-btn" type="button" onClick={clearCart}>
              清空购物车
            </button>
          </div>
        </aside>
      </div>

      <div
        className={`modal-backdrop${isModalOpen ? " show" : ""}`}
        aria-hidden={!isModalOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsModalOpen(false);
        }}
      >
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div className="modal-head">
            <h3 id="modalTitle">已点餐品</h3>
            <button className="close-btn" type="button" aria-label="关闭" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
          </div>
          <div className="order-detail">
            {!hasItems ? (
              <div className="empty">当前还没有点餐。</div>
            ) : (
              <>
                {cartEntries.map((item) => (
                  <div className="detail-line" key={item.key}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.portionLabel} · {formatPrice(item.unitPrice)} × {item.quantity}
                      </span>
                    </div>
                    <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
                  </div>
                ))}
                <div className="row total">
                  <span>当前合计</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </>
            )}

            {submittedOrders.length > 0 && (
              <div className="history">
                <h4>最近提交订单</h4>
                {submittedOrders.map((order, index) => (
                  <div className="detail-line" key={`${order.time}-${index}`}>
                    <div>
                      <strong>{order.time}</strong>
                      <span>
                        {order.summary}
                        {order.note ? ` · 备注：${order.note}` : ""}
                      </span>
                    </div>
                    <strong>{formatPrice(order.total)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
