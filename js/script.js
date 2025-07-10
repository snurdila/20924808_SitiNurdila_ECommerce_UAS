// Menjalankan skrip setelah seluruh konten halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website Store Dila siap!');

    // --- FUNGSI INTERAKSI UI (User Interface) ---

    /**
     * Menambahkan efek bayangan pada header saat halaman di-scroll.
     */
    const handleHeaderScroll = () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    // Menambahkan event listener untuk mendeteksi scroll
    window.addEventListener('scroll', handleHeaderScroll);

    /**
     * Menampilkan notifikasi kustom di bagian bawah layar.
     * @param {string} message - Pesan yang akan ditampilkan dalam notifikasi.
     */
    const showNotification = (message) => {
        // Hapus notifikasi lama jika masih ada untuk menghindari tumpukan
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }

        // Membuat elemen div baru untuk notifikasi
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Tampilkan notifikasi dengan menambahkan class 'show' untuk memicu transisi CSS
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Sembunyikan dan hapus notifikasi setelah 3 detik
        setTimeout(() => {
            notification.classList.remove('show');
            // Hapus elemen dari DOM setelah transisi selesai agar tidak menumpuk
            notification.addEventListener('transitionend', () => notification.remove());
        }, 3000);
    };

    // --- FUNGSI KERANJANG BELANJA ---

    /**
     * Fungsi untuk mendapatkan data keranjang dari localStorage.
     * @returns {Array} - Array objek produk di keranjang.
     */
    const getCart = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    /**
     * Fungsi untuk menyimpan data keranjang ke localStorage.
     * @param {Array} cart - Array objek produk yang akan disimpan.
     */
    const saveCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Perbarui jumlah setiap kali menyimpan
    };

    /**
     * Fungsi untuk memperbarui tampilan jumlah item di ikon keranjang.
     */
    const updateCartCount = () => {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const cart = getCart();
            cartCountElement.textContent = cart.length;
        }
    };

    /**
     * Fungsi untuk menambahkan produk ke keranjang.
     * @param {Event} e - Event object dari tombol yang diklik.
     */
    const addToCart = (e) => {
        // Menggunakan .closest() untuk memastikan kita mendapatkan elemen tombol,
        // bahkan jika yang diklik adalah ikon di dalam tombol.
        const button = e.target.closest('.btn-buy');
        if (!button) return; // Keluar jika klik tidak berasal dari tombol beli

        const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseInt(button.dataset.price, 10),
            image: button.dataset.image,
        };

        const cart = getCart();
        cart.push(product);
        saveCart(cart);

        // Menampilkan notifikasi kustom, bukan alert()
        showNotification('Produk berhasil ditambahkan!');
    };

    // Menambahkan event listener ke semua tombol "Beli Sekarang"
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // --- FUNGSI UNTUK HALAMAN KERANJANG (cart.html) ---

    /**
     * Fungsi untuk merender item dan ringkasan keranjang di halaman cart.html.
     * Menggunakan layout baru dengan dua kolom.
     */
    const renderCartItems = () => {
        // Elemen-elemen dari layout baru di cart.html
        const cartItemsContainer = document.getElementById('cart-items');
        const summaryItemCount = document.getElementById('summary-item-count');
        const summaryTotalPrice = document.getElementById('summary-total-price');

        // Hanya jalankan jika kita berada di halaman keranjang (elemen-elemennya ada)
        if (!cartItemsContainer || !summaryItemCount || !summaryTotalPrice) {
            return;
        }

        const cart = getCart();
        cartItemsContainer.innerHTML = ''; // Kosongkan kontainer sebelum merender
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Keranjang Anda masih kosong.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price;

                // Membuat elemen HTML untuk setiap item di keranjang
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p class="item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button class="btn-remove-item" data-index="${index}" title="Hapus item">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }

        // Memperbarui ringkasan belanja di kolom kanan
        summaryItemCount.textContent = `${cart.length} Produk`;
        summaryTotalPrice.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    };

    /**
     * Fungsi untuk menghapus satu item dari keranjang.
     * @param {Event} e - Event object dari tombol hapus.
     */
    const removeFromCart = (e) => {
        // Menggunakan .closest() untuk menangkap klik pada tombol atau ikon di dalamnya
        const removeButton = e.target.closest('.btn-remove-item');
        if (!removeButton) return;

        const indexToRemove = parseInt(removeButton.dataset.index);
        
        let cart = getCart();
        cart.splice(indexToRemove, 1); // Hapus item dari array berdasarkan index
        saveCart(cart);
        renderCartItems(); // Render ulang tampilan keranjang
    };

    /**
     * Fungsi untuk mengosongkan seluruh keranjang.
     */
    const clearCart = () => {
        if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
            saveCart([]); // Simpan array kosong
            renderCartItems(); // Render ulang tampilan keranjang
        }
    };

    // Menambahkan event listener untuk interaksi di halaman keranjang
    const cartContainer = document.querySelector('.cart-page-container');
    if (cartContainer) {
        // Event listener untuk tombol hapus per item (delegasi event)
        const cartItemsList = document.getElementById('cart-items');
        if (cartItemsList) {
            cartItemsList.addEventListener('click', removeFromCart);
        }

        // Event listener untuk tombol "Kosongkan Keranjang"
        const clearCartButton = document.getElementById('clear-cart');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }
    }

    // --- INISIALISASI SAAT HALAMAN DIMUAT ---

    // Memanggil fungsi-fungsi yang perlu dijalankan saat halaman pertama kali dibuka
    updateCartCount();
    renderCartItems(); // Ini akan berjalan di semua halaman, tapi hanya akan berefek di cart.html
});
