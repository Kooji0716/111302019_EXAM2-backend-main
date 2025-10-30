// === 產品資料 ===
const products = [
  {'name': 'T-Shirt', 'price': 25, 'gender': '男裝', 'category': '上衣', 'image_url': './static/img/T-Shirt.png'},
  {'name': 'Blouse', 'price': 30, 'gender': '女裝', 'category': '上衣', 'image_url': './static/img/Blouse.png'},
  {'name': 'Jeans', 'price': 50, 'gender': '通用', 'category': '褲/裙子', 'image_url': './static/img/Jeans.png'},
  {'name': 'Skirt', 'price': 40, 'gender': '女裝', 'category': '褲/裙子', 'image_url': './static/img/Skirt.png'},
  {'name': 'Sneakers', 'price': 60, 'gender': '通用', 'category': '鞋子', 'image_url': './static/img/Sneakers.png'},
  {'name': 'Leather Shoes', 'price': 80, 'gender': '男裝', 'category': '鞋子', 'image_url': './static/img/LeatherShoes.png'},
  {'name': 'Baseball Cap', 'price': 20, 'gender': '通用', 'category': '帽子', 'image_url': './static/img/BaseballCap.png'},
  {'name': 'Sun Hat', 'price': 25, 'gender': '女裝', 'category': '帽子', 'image_url': './static/img/SunHat.png'},
  {'name': 'Running Shoes', 'price': 85, 'gender': '通用', 'category': '鞋子', 'image_url': './static/img/RunningShoes.png'},
  {'name': 'Dress', 'price': 75, 'gender': '女裝', 'category': '上衣', 'image_url': './static/img/Dress.png'}
];


// === 狀態：每列的勾選與數量 ===
const rowState = new Map(); 

// === 工具：規整圖片路徑 ===
function normalizeImg(url = '') {
  // 將 './static/img/file.png' 轉換為 '/static/img/file.png'
  // 這樣瀏覽器才能從網站根目錄正確找到檔案
  if (url.startsWith('./static/')) {
    return url.replace('./static/', '/static/');
  }
  return url;
}

// === 初始化/確保下單按鈕存在 ===
(function ensureOrderButton() {
  if (!document.getElementById('place-order')) {
    const wrap = document.createElement('div');
    wrap.className = 'footer-actions';
    wrap.style.position = 'fixed';
    wrap.style.left = '12px';
    wrap.style.bottom = '12px';
    wrap.style.background = '#fff';
    wrap.style.border = '1px solid #e5e7eb';
    wrap.style.borderRadius = '8px';
    wrap.style.padding = '10px 12px';
    wrap.style.boxShadow = '0 6px 18px rgba(0,0,0,.06)';
    wrap.style.zIndex = '20';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';

    const btn = document.createElement('button');
    btn.id = 'place-order';
    btn.textContent = '下單';
    btn.disabled = true;
    btn.style.background = '#2563eb';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.padding = '8px 14px';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';

    const span = document.createElement('span');
    span.id = 'cart-summary';
    span.style.marginLeft = '12px';
    span.style.color = '#475569';
    span.textContent = '已選 0 項、總數量 0、總金額 $0';

    wrap.appendChild(btn);
    wrap.appendChild(span);
    document.body.appendChild(wrap);
  }
})();

// === 渲染產品表格 ===
function display_products(products_to_display) {
  const tbody = document.querySelector('#products table tbody');
  if (!tbody) {
    console.warn('找不到 #products table tbody 元素，無法渲染產品');
    return;
  }
  tbody.innerHTML = '';

  for (let i = 0; i < products_to_display.length; i++) {
    const p = products_to_display[i];
    const key = `${p.name}-${i}`; 
    if (!rowState.has(key)) rowState.set(key, { checked: false, qty: 0 });

    const state = rowState.get(key);
    const price = Number(p.price) || 0;
    const total = price * (state.qty || 0);

    const product_info = `
      <tr data-key="${key}" data-name="${p.name}" data-price="${price}">
        <td><input type="checkbox" class="row-check" ${state.checked ? 'checked' : ''}></td>
        <td><img src="${normalizeImg(p.image_url)}" alt="${p.name}" class="product-image"></td>
        <td>${p.name}</td>
        <td data-price-display="${price}">${price.toLocaleString()}</td>
        <td>${p.gender}</td>
        <td>${p.category}</td>
        <td>
          <div class="qty-control" style="display:inline-flex;align-items:center;gap:6px;">
            <button type="button" class="btn-dec" data-action="dec">-</button>
            <input type="number" class="qty-input" min="0" value="${state.qty}" style="width:50px;text-align:center;">
            <button type="button" class="btn-inc" data-action="inc">+</button>
          </div>
        </td>
        <td class="row-total">${total.toLocaleString()}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', product_info);
  }

  tbody.querySelectorAll('tr').forEach(tr => updateRowButtons(tr));
  refreshSummary();
}

// === 核心：更新 ± 按鈕和數量輸入的狀態 ===
function updateRowButtons(tr) {
  const key = tr.getAttribute('data-key');
  const state = rowState.get(key) || { checked: false, qty: 0 };
  const input = tr.querySelector('.qty-input');
  const btnDec = tr.querySelector('.btn-dec');
  const btnInc = tr.querySelector('.btn-inc');
  const qty = Number(input.value || 0);

  if (!state.checked) {
    input.value = 0; 
    btnDec.disabled = true;
    btnInc.disabled = true;
    input.disabled = true;
  } else {
    input.disabled = false;
    btnInc.disabled = false;
    btnDec.disabled = (qty <= 1); 
  }
}

// === 處理 Selection 勾選框變動 ===
function handleSelectionChange(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const key = tr.getAttribute('data-key');
  const state = rowState.get(key) || { checked: false, qty: 0 };
  const input = tr.querySelector('.qty-input');
  
  state.checked = e.target.checked;

  if (state.checked) {
    state.qty = 1;
    input.value = 1;
  } else {
    state.qty = 0;
    input.value = 0;
  }

  rowState.set(key, state);
  updateRowTotal(tr);
  updateRowButtons(tr); 
  refreshSummary();
}

// === 處理數量增減按鈕點擊及輸入 ===
function handleQuantityChange(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const key = tr.getAttribute('data-key');
  const state = rowState.get(key) || { checked: false, qty: 0 };
  const input = tr.querySelector('.qty-input');
  
  let newQty = Number(input.value || 0);
  
  if (e.target.dataset.action === 'inc') {
    newQty++;
  } else if (e.target.dataset.action === 'dec') {
    newQty = Math.max(0, newQty - 1); // 確保不會低於0
  } else if (e.type === 'input') {
    newQty = Math.max(0, newQty); // 確保不會低於0
  } else {
    return;
  }
  
  input.value = newQty;
  state.qty = newQty;

  const chk = tr.querySelector('.row-check');
  
  // 如果數量 > 0 且未勾選，自動勾選
  if (newQty > 0 && !chk.checked) {
    chk.checked = true;
    state.checked = true;
  } 
  
  // 如果數量變為 0 且已勾選，保持勾選，讓使用者手動取消
  // (這符合 "取消勾選 -> 歸零" 的邏輯)

  rowState.set(key, state);
  updateRowTotal(tr);
  updateRowButtons(tr); 
  refreshSummary();
}

// === 更新單列總金額 ===
function updateRowTotal(tr) {
  // 從 tr 的 data-price 屬性獲取價格，更穩定
  const price = Number(tr.dataset.price || 0);
  const qty = Number(tr.querySelector('.qty-input')?.value || 0);
  const totalCell = tr.querySelector('.row-total');
  if (totalCell) totalCell.textContent = (price * qty).toLocaleString();
}

// === 合計 & 下單按鈕狀態 ===
function refreshSummary() {
  const tbody = document.querySelector('#products table tbody');
  if (!tbody) return;

  let selectedCount = 0;
  let totalQty = 0;
  let totalPrice = 0;

  tbody.querySelectorAll('tr').forEach(tr => {
    const chk = tr.querySelector('.row-check');
    const qty = Number(tr.querySelector('.qty-input')?.value || 0);
    const price = Number(tr.dataset.price || 0);
    
    if (chk?.checked && qty > 0) {
      selectedCount += 1;
      totalQty += qty;
      totalPrice += qty * price;
    }
  });

  const btnOrder = document.getElementById('place-order');
  if (btnOrder) btnOrder.disabled = !(selectedCount > 0); 
  
  const summaryEl = document.getElementById('cart-summary');
  if (summaryEl) summaryEl.textContent =
    `已選 ${selectedCount} 項、總數量 ${totalQty}、總金額 $${totalPrice.toLocaleString()}`;
}

// === 篩選功能 (暫時保留前端邏輯) ===
function apply_filter(products_to_filter = products) {
  // ... 您的篩選邏輯 ...
  // 為了演示，我們先假設篩選邏輯不動
  display_products(products_to_filter); // 暫時顯示所有產品
}

// === 事件委派綁定 (用於購物頁面) ===
function bindTableEvents() {
  const tbody = document.querySelector('#products table tbody');
  if (!tbody) return; // 如果不在購物頁面，就跳過

  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('row-check')) {
      handleSelectionChange(e); 
    } else if (e.target.classList.contains('btn-dec') || e.target.classList.contains('btn-inc')) {
      handleQuantityChange(e); 
    }
  });

  tbody.addEventListener('input', (e) => {
    if (e.target.classList.contains('qty-input')) {
      handleQuantityChange(e);
    }
  });
}

// 
// ======================================================
// === 新增：登入 / 註冊 / 下單 相關的函式 ===
// ======================================================
//

/**
 * 處理登入表單提交 (用於 page_login_.html)
 * @param {Event} event - 表單提交事件
 */
async function handleLogin(event) {
    if (event) event.preventDefault(); 

    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');

    if (!usernameEl || !passwordEl) return; // 確保在登入頁面

    const username = usernameEl.value;
    const password = passwordEl.value;

    try {
        const response = await fetch('/page_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        const data = await response.json();
        if (data.status === 'success') {
            alert('登入成功！正在跳轉至購物頁面...');
            window.location.href = '/shopping'; 
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('登入時發生錯誤:', error);
        alert('登入失敗，請稍後再試。');
    }
}

/**
 * 處理註冊表單提交 (用於 page_register_.html)
 * @param {Event} event - 表單提交事件
 */
async function handleRegister(event) {
    if (event) event.preventDefault();

    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const emailEl = document.getElementById('email');

    if (!usernameEl || !passwordEl || !emailEl) return; // 確保在註冊頁面

    const username = usernameEl.value;
    const password = passwordEl.value;
    const email = emailEl.value;

    try {
        const response = await fetch('/page_register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username, 
                password: password,
                email: email
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            alert('註冊成功！將導向登入頁面。');
            window.location.href = '/page_login';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('註冊時發生錯誤:', error);
        alert('註冊失敗，請稍後再試。');
    }
}

/**
 * 處理下單 (用於 index_.html)
 */
async function handlePlaceOrder() {
    console.log("準備下單...");
    
    const orderItems = [];
    const tbody = document.querySelector('#products table tbody');
    if (!tbody) return;

    // 收集所有已勾選且數量 > 0 的項目
    tbody.querySelectorAll('tr').forEach(tr => {
        const chk = tr.querySelector('.row-check');
        const qty = Number(tr.querySelector('.qty-input')?.value || 0);
        
        if (chk?.checked && qty > 0) {
            const name = tr.dataset.name;
            const price = Number(tr.dataset.price);
            const total = price * qty;
            
            orderItems.push({
                name: name,
                price: price,
                qty: qty,
                total: total
            });
        }
    });

    if (orderItems.length === 0) {
        alert('您的購物車是空的！');
        return;
    }

    try {
        // 發送 POST 請求到後端
        const response = await fetch('/place_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderItems: orderItems })
        });

        const data = await response.json();

        if (data.status === 'success') {
            alert('下單成功！感謝您的購買。');
            // 成功後，可以選擇重置購物車或跳轉頁面
            // 這裡我們先重新載入頁面來清空購物車
            location.reload();
        } else {
            // 顯示後端錯誤 (例如：未登入)
            alert(`下單失敗: ${data.message}`);
        }
    } catch (error) {
        console.error('下單時發生錯誤:', error);
        alert('下單失敗，請稍後再試。');
    }
}


// === 總入口：DOM 載入完成後 ===
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否在購物頁面
    if (document.querySelector('#products table tbody')) {
        if (typeof products !== 'undefined' && products.length > 0) {
            display_products(products);
        }
        bindTableEvents();
    }
    
    // 綁定下單按鈕 (這個按鈕是動態產生的，所以要這樣綁定)
    const btnOrder = document.getElementById('place-order');
    if (btnOrder) {
      // ** 關鍵修改：呼叫 handlePlaceOrder 函式 **
      btnOrder.addEventListener('click', handlePlaceOrder);
    }
});

