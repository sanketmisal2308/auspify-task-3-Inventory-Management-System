const STORAGE_KEY = "auspify_inventory_task3_v1";

let products = loadProducts();
let editingProductId = null;
let stockProductId = null;
let toastTimer;

const $ = (id) => document.getElementById(id);

function loadProducts() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const data = saved ? JSON.parse(saved) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Unable to load inventory:", error);
        return [];
    }
}

function saveProducts() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return true;
    } catch (error) {
        console.error("Unable to save inventory:", error);
        showToast("Unable to save data. Check browser storage.");
        return false;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

function getStockStatus(product) {
    if (product.quantity === 0) {
        return {
            label: "Out of Stock",
            className: "status-out",
            key: "out"
        };
    }

    if (product.quantity <= product.threshold) {
        return {
            label: "Low Stock",
            className: "status-low",
            key: "low"
        };
    }

    return {
        label: "In Stock",
        className: "status-in",
        key: "in"
    };
}

function getStockValue(product) {
    return product.quantity * product.price;
}

function renderDashboard() {
    const totalProducts = products.length;

    const totalUnits = products.reduce(
        (sum, product) => sum + product.quantity, 0
    );

    const lowStockCount = products.filter(
        (product) => product.quantity > 0 &&
            product.quantity <= product.threshold
    ).length;

    const totalValue = products.reduce(
        (sum, product) => sum + getStockValue(product), 0
    );

    $("total-products").textContent = totalProducts;
    $("total-units").textContent = totalUnits;
    $("low-stock").textContent = lowStockCount;
    $("stock-value").textContent = formatCurrency(totalValue);

    $("report-products").textContent = totalProducts;
    $("report-value").textContent = formatCurrency(totalValue);

    $("report-out").textContent = products.filter(
        (product) => product.quantity === 0
    ).length;
}

function renderCategoryFilter() {
    const select = $("category-filter");
    const selectedValue = select.value;

    const categories = [...new Set(
        products.map((product) => product.category)
    )].sort((a, b) => a.localeCompare(b));

    select.innerHTML =
        '<option value="">All Categories</option>' +
        categories.map((category) =>
            `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
        ).join("");

    if (categories.includes(selectedValue)) {
        select.value = selectedValue;
    }
}

function getFilteredProducts() {
    const searchTerm = $("search-input").value.trim().toLowerCase();
    const category = $("category-filter").value;
    const stockStatus = $("stock-filter").value;

    return products.filter((product) => {
        const matchesSearch =
            product.id.toLowerCase().includes(searchTerm) ||
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        const matchesCategory =
            !category || product.category === category;

        const status = getStockStatus(product);
        const matchesStock =
            !stockStatus || status.key === stockStatus;

        return matchesSearch && matchesCategory && matchesStock;
    });
}

function renderProducts() {
    const tbody = $("product-table-body");
    const filteredProducts = getFilteredProducts();

    tbody.innerHTML = filteredProducts.map((product) => {
        const status = getStockStatus(product);

        return `
            <tr>
                <td class="product-id">${escapeHTML(product.id)}</td>
                <td class="product-name">${escapeHTML(product.name)}</td>
                <td>${escapeHTML(product.category)}</td>
                <td>${product.quantity}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${formatCurrency(getStockValue(product))}</td>
                <td>
                    <span class="status ${status.className}">
                        ${status.label}
                    </span>
                </td>
                <td>
                    <div class="action-group">
                        <button class="action-btn"
                            data-action="stock"
                            data-id="${escapeHTML(product.id)}">
                            Stock
                        </button>
                        <button class="action-btn"
                            data-action="edit"
                            data-id="${escapeHTML(product.id)}">
                            Edit
                        </button>
                        <button class="action-btn delete"
                            data-action="delete"
                            data-id="${escapeHTML(product.id)}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    $("empty-message").style.display =
        filteredProducts.length === 0 ? "block" : "none";
}

function renderCategorySummary() {
    const container = $("category-summary");

    const summary = {};

    products.forEach((product) => {
        if (!summary[product.category]) {
            summary[product.category] = {
                products: 0,
                units: 0,
                value: 0
            };
        }

        summary[product.category].products += 1;
        summary[product.category].units += product.quantity;
        summary[product.category].value += getStockValue(product);
    });

    const categories = Object.entries(summary).sort(
        ([a], [b]) => a.localeCompare(b)
    );

    if (categories.length === 0) {
        container.innerHTML =
            '<p class="empty-message" style="display:block">No report data available yet.</p>';
        return;
    }

    container.innerHTML = categories.map(([category, data]) => `
        <div class="category-row">
            <div>
                <strong>${escapeHTML(category)}</strong>
                <br>
                <span>${data.products} products · ${data.units} units</span>
            </div>
            <strong>${formatCurrency(data.value)}</strong>
        </div>
    `).join("");
}

function renderApp() {
    renderDashboard();
    renderCategoryFilter();
    renderProducts();
    renderCategorySummary();
}

function openProductModal(product = null) {
    editingProductId = product ? product.id : null;

    $("product-form").reset();

    $("modal-title").textContent =
        product ? "Edit Product" : "Add New Product";

    $("save-product-btn").textContent =
        product ? "Update Product" : "Save Product";

    $("product-id").disabled = Boolean(product);

    if (product) {
        $("product-id").value = product.id;
        $("product-name").value = product.name;
        $("product-category").value = product.category;
        $("product-quantity").value = product.quantity;
        $("product-price").value = product.price;
        $("product-threshold").value = product.threshold;
    } else {
        $("product-threshold").value = 5;
    }

    $("product-modal").hidden = false;
    $("product-name").focus();
}

function closeProductModal() {
    $("product-modal").hidden = true;
    editingProductId = null;
    $("product-id").disabled = false;
}

function handleProductSubmit(event) {
    event.preventDefault();

    const id = $("product-id").value.trim();
    const name = $("product-name").value.trim();
    const category = $("product-category").value.trim();
    const quantity = Number($("product-quantity").value);
    const price = Number($("product-price").value);
    const threshold = Number($("product-threshold").value);

    if (!id || !name || !category) {
        showToast("Please fill in all required fields.");
        return;
    }

    if (
        !Number.isInteger(quantity) || quantity < 0 ||
        !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(threshold) || threshold < 0
    ) {
        showToast("Enter valid quantity, price and threshold.");
        return;
    }

    const duplicate = products.some((product) =>
        product.id.toLowerCase() === id.toLowerCase() &&
        product.id !== editingProductId
    );

    if (duplicate) {
        showToast("This Product ID already exists.");
        return;
    }

    if (editingProductId) {
        const index = products.findIndex(
            (product) => product.id === editingProductId
        );

        if (index === -1) {
            showToast("Product not found.");
            return;
        }

        products[index] = {
            ...products[index],
            name,
            category,
            quantity,
            price,
            threshold
        };
    } else {
        products.push({
            id,
            name,
            category,
            quantity,
            price,
            threshold
        });
    }

    if (!saveProducts()) {
        products = loadProducts();
        renderApp();
        return;
    }

    closeProductModal();
    renderApp();

    showToast(editingProductId
        ? "Product updated successfully."
        : "Product added successfully."
    );
}

function deleteProduct(id) {
    const product = products.find((item) => item.id === id);

    if (!product) {
        showToast("Product not found.");
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    const previousProducts = [...products];
    products = products.filter((item) => item.id !== id);

    if (!saveProducts()) {
        products = previousProducts;
        renderApp();
        return;
    }

    renderApp();
    showToast("Product deleted successfully.");
}

function openStockModal(product) {
    stockProductId = product.id;
    $("stock-form").reset();
    $("stock-product-name").textContent =
        `${product.name} · Current stock: ${product.quantity}`;

    $("stock-action").value = "add";
    $("stock-modal").hidden = false;
    $("stock-quantity").focus();
}

function closeStockModal() {
    $("stock-modal").hidden = true;
    stockProductId = null;
}

function handleStockSubmit(event) {
    event.preventDefault();

    const product = products.find(
        (item) => item.id === stockProductId
    );

    if (!product) {
        showToast("Product not found.");
        closeStockModal();
        return;
    }

    const action = $("stock-action").value;
    const quantity = Number($("stock-quantity").value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showToast("Enter a positive whole-number quantity.");
        return;
    }

    if (action === "remove" && quantity > product.quantity) {
        showToast("Cannot remove more stock than is available.");
        return;
    }

    const previousQuantity = product.quantity;

    if (action === "add") {
        product.quantity += quantity;
    } else {
        product.quantity -= quantity;
    }

    if (!saveProducts()) {
        product.quantity = previousQuantity;
        return;
    }

    closeStockModal();
    renderApp();
    showToast("Stock updated successfully.");
}

function exportCSV() {
    if (products.length === 0) {
        showToast("No inventory data available to export.");
        return;
    }

    const headers = [
        "Product ID",
        "Product Name",
        "Category",
        "Quantity",
        "Unit Price",
        "Stock Value",
        "Stock Status",
        "Low Stock Threshold"
    ];

    const rows = products.map((product) => [
        product.id,
        product.name,
        product.category,
        product.quantity,
        product.price.toFixed(2),
        getStockValue(product).toFixed(2),
        getStockStatus(product).label,
        product.threshold
    ]);

    function csvCell(value) {
        let text = String(value);

        // Prevent spreadsheet formula injection for text values.
        if (/^[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    }

    const csvContent = [headers, ...rows]
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    showToast("Inventory CSV exported successfully.");
}

// Product table actions
$("product-table-body").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;
    const product = products.find((item) => item.id === id);

    if (!product) {
        showToast("Product not found.");
        return;
    }

    if (action === "edit") {
        openProductModal(product);
    } else if (action === "delete") {
        deleteProduct(id);
    } else if (action === "stock") {
        openStockModal(product);
    }
});

// Product form
$("product-form").addEventListener("submit", handleProductSubmit);

$("add-product-btn").addEventListener("click", () => {
    openProductModal();
});

$("close-modal").addEventListener("click", closeProductModal);
$("cancel-modal").addEventListener("click", closeProductModal);

// Stock form
$("stock-form").addEventListener("submit", handleStockSubmit);

$("close-stock-modal").addEventListener("click", closeStockModal);
$("cancel-stock").addEventListener("click", closeStockModal);

// Search and filters
$("search-input").addEventListener("input", renderProducts);
$("category-filter").addEventListener("change", renderProducts);
$("stock-filter").addEventListener("change", renderProducts);

// CSV report
$("export-btn").addEventListener("click", exportCSV);

// Close modal when clicking outside it
$("product-modal").addEventListener("click", (event) => {
    if (event.target === $("product-modal")) {
        closeProductModal();
    }
});

$("stock-modal").addEventListener("click", (event) => {
    if (event.target === $("stock-modal")) {
        closeStockModal();
    }
});

// Escape key closes open modals
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeProductModal();
        closeStockModal();
    }
});

// Initial application render
renderApp();