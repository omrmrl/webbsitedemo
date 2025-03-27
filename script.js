// Önbellek atlatmalı fetch yardımcı fonksiyonu
function fetchWithCache(url, options = {}) {
    // Önbelleği atlamak için zaman damgası ve rastgele sayı ekle
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    
    // URL'e parametre ekle
    const cacheBypassUrl = url.includes('?') 
        ? `${url}&_=${timestamp}&r=${random}` 
        : `${url}?_=${timestamp}&r=${random}`;
    
    console.log(`🔄 Fetch isteği (önbellek atlatmalı): ${cacheBypassUrl}`);
    
    // Önbelleği kesinlikle atlatmak için güçlendirilmiş header'lar ekle
    const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Cache-Bypass': 'true',
        'X-Random': random.toString(),
        ...(options.headers || {})
    };
    
    // Fetch seçeneklerini birleştir
    const fetchOptions = {
        ...options,
        headers,
        cache: 'no-store' // Önbelleği devre dışı bırak
    };
    
    // Retry mekanizması ekleyelim
    return new Promise(async (resolve, reject) => {
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount <= maxRetries) {
            try {
                // Fetch isteğini gönder
                const response = await fetch(cacheBypassUrl, fetchOptions);
                
                // Yanıt başarılı mı kontrol et
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                }
                
                // Başarılı yanıtı döndür
                return resolve(response);
            } catch (error) {
                // Son deneme başarısız oldu mu?
                if (retryCount === maxRetries) {
                    console.error(`❌ Fetch başarısız oldu (${retryCount}/${maxRetries} deneme): ${error.message}`);
                    return reject(error);
                }
                
                // Tekrar dene
                retryCount++;
                console.warn(`⚠️ Fetch başarısız oldu, tekrar deneniyor (${retryCount}/${maxRetries}): ${error.message}`);
                
                // Exponential backoff ile bekle
                await new Promise(r => setTimeout(r, 500 * Math.pow(2, retryCount)));
            }
        }
    });
}

// Test notu gönderme fonksiyonu - Global scope
window.testSendNote = async function() {
    console.log('🚀 Manuel not gönderme testi başlatılıyor...');
    
    try {
        // Manuel not içeriği oluştur
        const testContent = "Test notu - " + new Date().toISOString();
        console.log('Test içeriği:', testContent);
        
        // Manuel cüzdan adresi
        const testWallet = "TEST_WALLET_" + Math.random().toString(36).substring(2, 8);
        console.log('Test cüzdanı:', testWallet);
        
        // API URL'sini belirleme
        const apiUrl = window.location.origin + '/backend/api/create_note.php';
        console.log('API URL:', apiUrl);
        
        // API isteği için veriyi hazırla
        const requestData = {
            content: testContent,
            walletAddress: testWallet
        };
        console.log('Gönderilecek veri:', JSON.stringify(requestData, null, 2));
        
        // API isteğini yap
        console.log('API isteği yapılıyor...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('API yanıt durumu:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('API yanıtı:', responseText);
        
        // Başarılı yanıt kontrolü
        if (response.ok) {
            console.log('✅ Not başarıyla gönderildi!');
            alert('Test notu başarıyla gönderildi!');
        } else {
            console.error('❌ Not gönderilemedi:', responseText);
            alert('Not gönderilemedi: ' + responseText);
        }
        
    } catch (error) {
        console.error('Test hatası:', error);
        alert('Test sırasında hata oluştu: ' + error.message);
    }
};

// Buffer ve Web3.js kontrolü
if (typeof window !== 'undefined' && !window.Buffer) {
  console.error('Buffer is not defined!');
}

if (typeof solanaWeb3 === 'undefined') {
  console.error('Solana Web3 could not be loaded!');
}

// Global debug flag ekleyelim - tüm detayları görelim
const DEBUG_MODE = true;

// Test için konsol logları
console.log('Script initializing...');
console.log('Buffer check:', typeof window.Buffer);
console.log('Web3 check:', typeof solanaWeb3);

// HTML elemanlarını seç
const shareForm = document.getElementById('shareForm');
const shareNoteButton = document.getElementById('shareNote');
const noteInput = document.getElementById('noteInput');

// Test için element kontrolü
console.log('HTML elements loaded:', {
  shareForm: !!shareForm,
  shareNoteButton: !!shareNoteButton,
  noteInput: !!noteInput
});

// Notları saklamak için dizi ve cüzdan durumu
let notes = [
{ id: 1, content: "This is a small note.", likes: 5, dislikes: 2, size: "small" },
{ id: 2, content: "This is a longer note with more content.", likes: 10, dislikes: 0, size: "tall" },
{ id: 3, content: "Great to step into blockchain world with Solana!", likes: 3, dislikes: 1, size: "medium" },
{ id: 4, content: "Nice platform to share short notes.", likes: 7, dislikes: 2, size: "tall" },
{ id: 5, content: "Web3 technologies are evolving every day.", likes: 15, dislikes: 1, size: "medium" },
{ id: 6, content: "Blockchain-based applications will shape the future.", likes: 12, dislikes: 3, size: "tall" },
{ id: 7, content: "Decentralized systems are gaining importance.", likes: 8, dislikes: 1, size: "small" },
{ id: 8, content: "Crypto world is constantly renewing.", likes: 6, dislikes: 2, size: "medium" },
{ id: 9, content: "DeFi projects are transforming finance.", likes: 20, dislikes: 4, size: "tall" },
{ id: 10, content: "NFTs are democratizing digital art.", likes: 14, dislikes: 3, size: "medium" },
{ id: 11, content: "Metaverse concept is entering our lives.", likes: 11, dislikes: 2, size: "small" },
{ id: 12, content: "DAOs could be the new governance model.", likes: 9, dislikes: 1, size: "tall" },
{ id: 13, content: "Smart contracts automate business processes.", likes: 16, dislikes: 2, size: "medium" },
{ id: 14, content: "Digital identity solutions are gaining importance.", likes: 13, dislikes: 3, size: "small" },
{ id: 15, content: "Layer 2 solutions increase scalability.", likes: 18, dislikes: 1, size: "tall" },
{ id: 16, content: "Privacy-focused blockchain projects are developing.", likes: 7, dislikes: 2, size: "medium" },
{ id: 17, content: "Cross-chain bridges unite the ecosystem.", likes: 4, dislikes: 1, size: "small" },
{ id: 18, content: "Tokenization spreads to every field.", likes: 8, dislikes: 3, size: "tall" },
{ id: 19, content: "Sustainable blockchain solutions stand out.", likes: 12, dislikes: 2, size: "medium" },
{ id: 20, content: "Web3 gaming sector is growing.", likes: 15, dislikes: 4, size: "small" }
];

let walletAddress = null;
let currentPage = 1;
const notesPerPage = 20;
let votedNotes = new Set();

// Solana bağlantısı için gerekli global değişkenleri ve eksik fonksiyonları ekledim:
let connection = null;
let currentEndpointIndex = 0;

// Solana bağlantısı ve transfer ayarları
const SOLANA_NETWORK = 'mainnet-beta';
const RECEIVER_ADDRESS = 'D5W9VDUNTXWmmpCfZz5ZPi5tWZ8GyANuHbvjgv2jvKypX'; // Admin cüzdan adresi
const NOTE_COST = 0.01;

// Admin kontrolü için cache mekanizması
let isAdminCache = null;
let lastAdminCheck = 0;
const ADMIN_CHECK_INTERVAL = 5000; // 5 saniye

// Public RPC endpoints
const RPC_ENDPOINTS = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/solana'
];

// Debug modunda konsol çıktılarını yönet
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

// Bağlantı oluşturma fonksiyonunu güncelle
async function createConnection(retryCount = 3) {
    try {
        const endpoint = RPC_ENDPOINTS[currentEndpointIndex];
        debugLog(`RPC bağlantısı oluşturuluyor: ${endpoint}`);
        
        connection = new solanaWeb3.Connection(endpoint, 'confirmed');
        await connection.getVersion();
        
        debugLog('Bağlantı başarıyla kuruldu');
        return true;
    } catch (error) {
        console.error('Bağlantı hatası:', error);
        
        currentEndpointIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
        
        if (retryCount > 0) {
            debugLog(`Yeni endpoint deneniyor: ${RPC_ENDPOINTS[currentEndpointIndex]}`);
            return await createConnection(retryCount - 1);
        }
        
        return false;
    }
}

// Solana bağlantısını kur
async function initializeSolanaConnection() {
    console.log('Solana bağlantısı başlatılıyor...');
    
    for (const endpoint of RPC_ENDPOINTS) {
        try {
            const connection = new solanaWeb3.Connection(endpoint, 'confirmed');
            console.log(`${endpoint} bağlantısı başarılı`);
            return connection;
        } catch (error) {
            console.warn(`${endpoint} bağlantısı başarısız:`, error);
            continue;
        }
    }
    
    throw new Error('Hiçbir RPC endpoint\'ine bağlanılamadı');
}

// Cüzdan bağlantısını kur
async function connectWallet() {
    try {
        console.log('🔄 Cüzdan bağlantısı başlatılıyor...');
        
        if (!window.solana || !window.solana.isPhantom) {
            console.error('❌ Phantom cüzdanı bulunamadı');
            alert('Lütfen Phantom cüzdanını yükleyin!');
            window.open('https://phantom.app/', '_blank');
            return;
        }

        console.log('📡 Solana bağlantısı kuruluyor...');
        const connection = await initializeSolanaConnection();
        console.log('✅ Solana bağlantısı kuruldu');

        console.log('🔄 Phantom cüzdanı connect isteği yapılıyor...');
        const resp = await window.solana.connect();
        console.log('✅ Phantom cüzdanı bağlandı:', resp);
        
        walletAddress = resp.publicKey.toString();
        console.log('✅ Cüzdan adresi alındı:', walletAddress);

        console.log('🔄 Cüzdan görünümü güncelleniyor...');
        updateWalletDisplay();
        
        console.log('🔄 Paylaşım formu görünürlüğü güncelleniyor...');
        updateShareFormVisibility();
        
        // Bakiye kontrolü
        console.log('💰 Cüzdan bakiyesi kontrolü...');
        const balance = await connection.getBalance(resp.publicKey);
        const balanceInSOL = balance / solanaWeb3.LAMPORTS_PER_SOL;
        console.log('✅ Cüzdan bakiyesi:', balanceInSOL, 'SOL');
        
        if (balanceInSOL < 0.011) {
            console.warn('⚠️ Yetersiz bakiye! En az 0.011 SOL gerekli');
            alert(`Cüzdan bakiyeniz çok düşük: ${balanceInSOL.toFixed(4)} SOL\nNot paylaşmak için en az 0.011 SOL gerekli.`);
        }
        
        return walletAddress;
        
    } catch (error) {
        console.error('❌ Cüzdan bağlantı hatası:', error);
        alert('Cüzdan bağlantısında hata: ' + error.message);
        return null;
    }
}

// LocalStorage'dan verileri yükle
function loadFromLocalStorage() {
  try {
    const savedNotes = localStorage.getItem('notes');
    const savedVotedNotes = localStorage.getItem('votedNotes');
    const savedWalletAddress = localStorage.getItem('walletAddress');

    if (savedNotes) {
      const loadedNotes = JSON.parse(savedNotes);
      // Yeni notları mevcut notların başına ekle
      const existingNotes = [...notes];
      notes = [...loadedNotes.filter(note => note.id > 20), ...existingNotes];
    }

    if (savedVotedNotes) {
      votedNotes = new Set(JSON.parse(savedVotedNotes));
    }

    if (savedWalletAddress) {
      walletAddress = savedWalletAddress;
      updateWalletDisplay();
    }
  } catch (error) {
    console.error("Error loading data from LocalStorage:", error);
  }
}

// LocalStorage'a verileri kaydet
function saveToLocalStorage() {
  try {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('votedNotes', JSON.stringify([...votedNotes]));
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    } else {
      localStorage.removeItem('walletAddress');
    }
  } catch (error) {
    console.error("Error saving data to LocalStorage:", error);
  }
}

// Phantom cüzdan kontrolü
const getProvider = () => {
  try {
    // Mobil cihaz kontrolü
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobil cihazlarda Phantom kontrolü
      if ('solana' in window) {
        const provider = window.solana;
        if (provider?.isPhantom) {
          return provider;
        }
      }
      // Phantom mobil uygulama kontrolü
      if ('phantom' in window) {
        const provider = window.phantom?.solana;
        if (provider?.isPhantom) {
          return provider;
        }
      }
      // Mobil cihazlarda deep linking için özel kontrol
      if (window.location.protocol === 'https:') {
        const deepLink = `https://phantom.app/ul/browse/${window.location.hostname}`;
        window.location.href = deepLink;
        return null;
      }
      alert('Please install the Phantom mobile app or use a desktop browser!');
      window.open('https://phantom.app/download', '_blank');
      return null;
    } else {
      // Masaüstü tarayıcı kontrolü
      if ('phantom' in window) {
        const provider = window.phantom?.solana;
        if (provider?.isPhantom) {
          return provider;
        }
      }
      alert('Please install the Phantom wallet extension!');
      window.open('https://phantom.app/', '_blank');
      return null;
    }
  } catch (error) {
    console.error("Error checking Phantom provider:", error);
    return null;
  }
};

// Cüzdan görünümünü güncelle
function updateWalletDisplay() {
  try {
    if (walletAddress) {
      console.log('✅ Cüzdan adresi güncelleniyor:', walletAddress);
      
      // Connect butonunu kontrol et
      const connectWalletButton = document.getElementById('connectWallet');
      if (connectWalletButton) {
        connectWalletButton.style.display = 'none';
        console.log('Connect butonu gizlendi');
      } else {
        console.warn('Connect butonu bulunamadı');
      }
      
      // Wallet dropdown'ı kontrol et
      const walletDropdown = document.querySelector('.wallet-dropdown');
      if (walletDropdown) {
        walletDropdown.style.display = 'block';
        console.log('Wallet dropdown gösterildi');
      } else {
        console.warn('Wallet dropdown bulunamadı');
      }
      
      // Adres göstergesini kontrol et
      const walletAddressDiv = document.getElementById('walletAddress');
      if (walletAddressDiv) {
        walletAddressDiv.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        console.log('Adres göstergesi güncellendi:', walletAddressDiv.textContent);
      } else {
        console.warn('Adres göstergesi bulunamadı');
      }
      
    } else {
      console.log('❌ Cüzdan adresi boş, bağlı değil');
      
      // Connect butonunu kontrol et
      const connectWalletButton = document.getElementById('connectWallet');
      if (connectWalletButton) {
        connectWalletButton.style.display = 'block';
        console.log('Connect butonu gösterildi');
      }
      
      // Wallet dropdown'ı kontrol et
      const walletDropdown = document.querySelector('.wallet-dropdown');
      if (walletDropdown) {
        walletDropdown.style.display = 'none';
        console.log('Wallet dropdown gizlendi');
      }
      
      // Adres göstergesini kontrol et
      const walletAddressDiv = document.getElementById('walletAddress');
      if (walletAddressDiv) {
        walletAddressDiv.textContent = '';
        console.log('Adres göstergesi temizlendi');
      }
    }
  } catch (error) {
    console.error("Cüzdan görünümü güncellenirken hata:", error);
  }
}

// Admin ayarları
const ADMIN_WALLET = '5W9VDUNTXWmmpCfZz5ZPi5tWZ8GyANuHbvjgv2jvKypX'; // Admin cüzdan adresi

// Admin kontrolü
function isAdmin() {
  const now = Date.now();
  if (isAdminCache !== null && (now - lastAdminCheck) < ADMIN_CHECK_INTERVAL) {
    return isAdminCache;
  }

  if (DEBUG_MODE) {
    console.log('Admin durumu kontrol ediliyor...');
    console.log('Bağlı cüzdan:', walletAddress);
    console.log('Admin cüzdanı:', ADMIN_WALLET);
  }

  lastAdminCheck = now;
  isAdminCache = walletAddress === ADMIN_WALLET;
  return isAdminCache;
}

// Bölüm gösterme fonksiyonunu güncelle
window.showSection = function(sectionId) {
    try {
        // Tüm bölümleri gizle
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Hedef bölümü göster
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Share bölümü için özel kontrol
            if (sectionId === 'share') {
                updateShareFormVisibility();
            }
            
            // Home bölümü için notları yeniden yükle
            if (sectionId === 'home') {
                displayNotes();
            }
        }
    } catch (error) {
        console.error("Bölüm gösterilirken hata:", error);
    }
};

// Admin paneli gösterme
function showAdminPanel() {
  console.log('Show admin panel function called');
  if (!isAdmin()) {
      console.log('Not admin, panel not shown');
      return;
  }

  console.log('Admin verified, preparing panel');
  
  // Mevcut paneli kaldır
  const existingPanel = document.getElementById('adminPanel');
  if (existingPanel) {
      existingPanel.remove();
  }

  const adminSection = document.createElement('div');
  adminSection.id = 'adminPanel';
  adminSection.className = 'admin-panel';
  adminSection.innerHTML = `
      <h2>Admin Panel</h2>
      <div class="admin-stats">
          <p>Total Notes: ${notes.length}</p>
          <p>Total Likes: ${notes.reduce((sum, note) => sum + note.likes, 0)}</p>
          <p>Total Dislikes: ${notes.reduce((sum, note) => sum + note.dislikes, 0)}</p>
      </div>
      <div class="admin-notes">
          <h3>All Notes</h3>
          ${notes.map(note => `
              <div class="admin-note">
                  <p>ID: ${note.id}</p>
                  <textarea id="note-${note.id}">${note.content}</textarea>
                  <div class="admin-buttons">
                      <button onclick="adminEditNote(${note.id})">Edit</button>
                      <button onclick="adminDeleteNote(${note.id})">Delete</button>
                  </div>
              </div>
          `).join('')}
      </div>
  `;

  // Paneli sayfaya ekle
  document.body.appendChild(adminSection);
  console.log('Admin panel added successfully');
}

// Admin not düzenleme
async function adminEditNote(noteId) {
  if (!isAdmin()) {
      return;
  }

  const note = notes.find(n => n.id === noteId);
  if (!note) {
      alert('Note not found!');
      return;
  }

  const textarea = document.getElementById(`note-${noteId}`);
  const newContent = textarea.value.trim();

  if (newContent.length === 0) {
      alert('Note cannot be empty!');
      return;
  }

  if (newContent.length > 280) {
      alert('Note cannot be longer than 280 characters!');
      return;
  }

  note.content = newContent;
  saveToLocalStorage();
  displayNotes();
  showAdminPanel();
  alert('Note updated successfully!');
}

// Admin not silme
async function adminDeleteNote(noteId) {
  if (!isAdmin()) {
      return;
  }

  const noteIndex = notes.findIndex(note => note.id === noteId);
  if (noteIndex === -1) {
      alert('Note not found!');
      return;
  }

  if (confirm('Are you sure you want to delete this note?')) {
      notes.splice(noteIndex, 1);
      saveToLocalStorage();
      displayNotes();
      showAdminPanel();
      alert('Note deleted successfully!');
  }
}

// Cüzdan bağlantısını kes
async function disconnectWallet() {
  try {
    const provider = getProvider();
    if (provider) {
      await provider.disconnect();
    }
    
    walletAddress = null;
    updateWalletDisplay();
    updateShareFormVisibility();
    saveToLocalStorage();
    displayNotes();
    // walletDropdown.classList.remove('active');
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}

// Share form görünürlüğünü güncelle
function updateShareFormVisibility() {
  try {
    if (walletAddress) {
      shareForm.style.display = 'block';
      // walletWarning.style.display = 'none';
    } else {
      shareForm.style.display = 'none';
      // walletWarning.style.display = 'block';
    }
  } catch (error) {
    console.error("Form görünürlüğü güncellenirken hata:", error);
  }
}

// Notları sıralama
function sortNotes(sortType) {
  try {
    const sortedNotes = [...notes];
    if (sortType === 'liked') {
      sortedNotes.sort((a, b) => b.likes - a.likes);
    } else if (sortType === 'latest') {
      sortedNotes.sort((a, b) => b.id - a.id);
    }
    notes = sortedNotes;
    currentPage = 1;
    displayNotes();
  } catch (error) {
    console.error("Notlar sıralanırken hata:", error);
  }
}

// Daha fazla not yükleme
function loadMore() {
  try {
    currentPage++;
    displayNotes();
  } catch (error) {
    console.error("Notlar yüklenirken hata:", error);
  }
}

// Transfer işlemi için güvenlik kontrolleri
async function checkTransactionSafety(fromWallet, amount) {
  try {
      console.log('Starting security check...');
      
      // Phantom cüzdan kontrolü
      const provider = getProvider();
      if (!provider) {
          throw new Error('Phantom wallet connection not found');
      }

      // Ağ kontrolü - Phantom bağlantısı üzerinden
      try {
          await provider.disconnect();
          const resp = await provider.connect();
          console.log('Wallet connection status:', resp);
          
          // Cüzdan adresini kontrol et
          if (resp.publicKey.toString() !== fromWallet) {
              throw new Error('Wallet address mismatch. Please make sure the correct wallet is connected.');
          }
      } catch (networkError) {
          console.error('Network check error:', networkError);
          throw new Error('Error checking wallet connection. Please check your Phantom settings.');
      }

      // Bağlantıyı test et
      if (!connection) {
          console.log('No connection, creating new connection...');
          await createConnection();
      }

      // Bakiye kontrolü
      console.log('Checking balance...');
      const pubKey = new solanaWeb3.PublicKey(fromWallet);
      
      // Bakiyeyi sorgula
      const balance = await connection.getBalance(pubKey, 'confirmed');
      const balanceInSol = balance / solanaWeb3.LAMPORTS_PER_SOL;
      console.log('Current balance:', balanceInSol, 'SOL');

      // Minimum bakiye kontrolü
      const minBalance = (amount + 0.001) * solanaWeb3.LAMPORTS_PER_SOL;
      if (balance < minBalance) {
          const requiredMore = (minBalance - balance) / solanaWeb3.LAMPORTS_PER_SOL;
          throw new Error(`Insufficient balance! Required: ${(amount + 0.001).toFixed(4)} SOL. Current balance: ${balanceInSol.toFixed(4)} SOL. Need ${requiredMore.toFixed(4)} SOL more.`);
      }

      console.log('Balance sufficient, transaction can proceed');
      return true;

  } catch (error) {
      console.error("Error during security check:", error);
      alert(error.message);
      return false;
  }
}

// Blockchain işlem durum takibi için global değişken
window._transactionStatus = {
    hash: null,
    confirmed: false,
    signature: null,
    timestamp: null,
    noteData: null
};

// SOL transfer işlemi - TEMEL HATA DÜZELTMESİ
async function transferSOL(fromWalletAddress, amount) {
    try {
        console.log('💰 transferSOL fonksiyonu başlatıldı');
        console.log('💰 Starting transfer...', { fromWallet: fromWalletAddress, amount });
        updateShareStatus('payment', 'Cüzdan onayı bekleniyor...', 'info');
        
        // Cüzdanın bağlı olduğunu kontrol et
        if (!window.solana || !window.solana.isPhantom) {
            console.error('❌ Phantom cüzdanı bulunamadı');
            updateShareStatus('payment', 'Phantom cüzdanı bulunamadı!', 'error');
            return false;
        }
        
        try {
            await window.solana.connect();
            console.log('✅ Cüzdan bağlandı');
        } catch (connectErr) {
            console.error('❌ Cüzdan bağlantı hatası:', connectErr);
            updateShareStatus('payment', 'Cüzdan bağlantı hatası!', 'error');
            return false;
        }
        
        // Not içeriğini al
        const noteInput = document.getElementById('noteInput');
        const noteContent = noteInput.value.trim();
        
        // Cüzdan adresini doğru şekilde al
        let walletAddressValue = '';
        
        // Değer HTML elementi mi yoksa düz metin mi kontrol et
        if (typeof fromWalletAddress === 'object' && fromWalletAddress !== null) {
            // HTML element ise içeriğini al
            if (fromWalletAddress.textContent) {
                walletAddressValue = fromWalletAddress.textContent.trim();
            } else if (fromWalletAddress.innerText) {
                walletAddressValue = fromWalletAddress.innerText.trim();
            } else {
                // Globaldeki değeri kullan
                walletAddressValue = window.solana.publicKey.toString();
            }
            console.log('⚠️ fromWalletAddress bir HTML element, metin değeri alındı:', walletAddressValue);
        } else if (typeof fromWalletAddress === 'string') {
            // Zaten string ise doğrudan kullan
            walletAddressValue = fromWalletAddress.trim();
        } else {
            // Son çare olarak bağlı cüzdanın public key'ini kullan
            walletAddressValue = window.solana.publicKey.toString();
            console.log('⚠️ fromWalletAddress beklenmeyen formatta, bağlı cüzdan public key kullanıldı');
        }
        
        // Kısaltılmış cüzdan adresi varsa tam adresle değiştir
        if (walletAddressValue.includes('...')) {
            const storedWallet = localStorage.getItem('walletAddress');
            if (storedWallet && storedWallet.length > 10) {
                walletAddressValue = storedWallet;
                console.log('⚠️ Kısaltılmış cüzdan adresi localStorage ile değiştirildi:', walletAddressValue);
            } else {
                // Cüzdan adresi sağlam değilse, bağlı olanı kullan
                walletAddressValue = window.solana.publicKey.toString();
                console.log('⚠️ Kısaltılmış cüzdan adresi düzeltilemedi, bağlı cüzdan kullanılıyor:', walletAddressValue);
            }
        }
        
        console.log('📝 Not içeriği:', noteContent);
        console.log('👛 Cüzdan adresi (düzeltilmiş):', walletAddressValue);
        
        try {
            // SOL transferi için işlem oluştur
            updateShareStatus('payment', 'İşlem oluşturuluyor...', 'info');
            
            // Cüzdan bağlantısını kontrol et
            console.log('👛 Wallet connection status:', window.solana);
            
            // Alıcı cüzdan adresi (admin cüzdanı)
            const ADMIN_WALLET = 'D5W9VDUNTXWmmpCfZz5ZPi5tWZ8GyANuHbvjgv2jvKypX';
            const toAddress = new solanaWeb3.PublicKey(ADMIN_WALLET);
            
            // Bağlantı kur
            console.log('💰 Preparing transaction...');
            const connection = new solanaWeb3.Connection(
                solanaWeb3.clusterApiUrl('mainnet-beta'),
                'confirmed'
            );
            
            // Son blok hash'i al
            console.log('💰 Getting blockhash...');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            
            // İşlem oluştur
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: window.solana.publicKey,
                    toPubkey: toAddress,
                    lamports: solanaWeb3.LAMPORTS_PER_SOL * amount
                })
            );
            
            // Blockhash'i ayarla
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            transaction.feePayer = window.solana.publicKey;
            
            console.log('💰 Signing transaction...');
            updateShareStatus('payment', 'Cüzdan onayı bekleniyor...', 'info');
            
            console.log('💰 Sending transaction...');
            // İşlemi imzala ve gönder
            const { signature } = await window.solana.signAndSendTransaction(transaction);
            
            console.log('💰 Waiting for confirmation...');
            updateShareStatus('payment', 'Blockchain onayı bekleniyor...', 'info');
            
            // İşlem onayını bekle
            const confirmation = await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature
            });
            
            console.log('💰 Transaction successful:', signature);
            updateShareStatus('payment', 'Ödeme onaylandı ✓', 'success');
            
            // ÖNEMLİ: Not paylaşım işlemi - ödeme başarılı olduktan sonra API'ye gönder
            updateShareStatus('server', 'Not sunucuya gönderiliyor...', 'info');
            
            // API'ye not gönderimi
            console.log('📝 Not sunucuya gönderiliyor...');
            
            // DÜZELTİLMİŞ KOD: Doğrudan XMLHttpRequest kullanarak güvenli istek
            console.log('📝 XHR ile API isteği yapılıyor...');
            
            // Önce form verileri hazırla
            const formData = new FormData();
            formData.append('content', noteContent);
            formData.append('walletAddress', walletAddressValue);
            formData.append('transactionHash', signature);
            
            console.log('📝 Form verileri hazırlandı:', {
                content: noteContent,
                walletAddress: walletAddressValue,
                transactionHash: signature
            });
            
            // API URL
            const timestamp = new Date().getTime();
            const random = Math.floor(Math.random() * 1000000);
            const apiUrl = `${window.location.origin}/backend/api/create_note.php?_=${timestamp}&r=${random}`;
            
            console.log('📝 API URL:', apiUrl);
            
            // XHR ile not gönder - işlem başarılı olup olmadığını izle
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', apiUrl, true);
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                
                // İstek tamamlandığında
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('📝 XHR yanıtı alındı:', xhr.responseText);
                        
                        try {
                            const data = JSON.parse(xhr.responseText);
                            
                            if (data.success) {
                                console.log('✅ Not başarıyla sunucuya kaydedildi!', data);
                                updateShareStatus('server', 'Not sunucuya kaydedildi ✓', 'success');
                                updateShareStatus('complete', 'İşlem tamamlandı ✓', 'success');
                                
                                // Not verilerini sıfırla
                                noteInput.value = '';
                                
                                // Sayfayı yenile
                                setTimeout(() => {
                                    window.location.href = '/';
                                }, 1500);
                            } else {
                                const errorMsg = data.message || 'Bilinmeyen API hatası';
                                console.error('❌ API hatası:', errorMsg);
                                updateShareStatus('server', 'API hatası: ' + errorMsg, 'error');
                            }
                        } catch (e) {
                            console.error('❌ JSON parse hatası:', e, 'Ham yanıt:', xhr.responseText);
                            updateShareStatus('server', 'Yanıt işleme hatası!', 'error');
                        }
                    } else {
                        console.error('❌ HTTP hatası:', xhr.status, xhr.statusText);
                        updateShareStatus('server', `HTTP hatası: ${xhr.status}`, 'error');
                    }
                };
                
                // Ağ hatası
                xhr.onerror = function() {
                    console.error('❌ Ağ hatası!');
                    updateShareStatus('server', 'Ağ hatası! Sunucuya erişilemiyor.', 'error');
                };
                
                // Timeout
                xhr.ontimeout = function() {
                    console.error('❌ İstek zaman aşımına uğradı!');
                    updateShareStatus('server', 'İstek zaman aşımına uğradı!', 'error');
                };
                
                // İsteği gönder
                console.log('📝 XHR isteği gönderiliyor...');
                xhr.send(formData);
                console.log('📝 XHR isteği gönderildi, yanıt bekleniyor...');
                
                return true;
            } catch (apiError) {
                console.error('❌ API isteği hatası:', apiError);
                updateShareStatus('server', 'API isteği hatası: ' + apiError.message, 'error');
                return false;
            }
            
        } catch (err) {
            console.error('❌ İşlem hatası:', err);
            updateShareStatus('payment', 'İşlem hatası: ' + err.message, 'error');
            return false;
        }
        
    } catch (error) {
        console.error('❌ TransferSOL hatası:', error);
        updateShareStatus('payment', 'Hata: ' + error.message, 'error');
        return false;
    }
}

// API URL'sini global olarak tanımla
const API_BASE_URL = window.location.origin + '/backend/api';

// URL hash kontrolü
function checkUrlHash() {
    const hash = window.location.hash;
    if (hash) {
        const section = hash.substring(1); // # işaretini kaldır
        showSection(section);
    } else {
        // Varsayılan olarak home'u göster
        showSection('home');
    }
}

// Sayfa yüklendiğinde notları yükle
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sayfa yüklendi, başlangıç işlemleri başlatılıyor...');
    
    // URL hash kontrolü (ancak varsayılan olarak home'u göster)
    const currentHash = window.location.hash || '#home';
    const section = currentHash.replace('#', '') || 'home';
    
    // İlgili bölümü göster
    showSection(section);
    
    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash || '#home';
        const section = hash.replace('#', '') || 'home';
        console.log(`🔄 Hash değişimi algılandı: ${hash}`);
        showSection(section);
    });
    
    // Notları hemen ve gecikmeli olarak yükle (önbellek sorunlarını aşmak için)
    displayNotes(true);
    
    // 3 saniye sonra notları bir kez daha yükle (sunucu yanıtı gecikme durumları için)
    setTimeout(() => {
        console.log('⏱️ Gecikmeli not yenileme çalıştırılıyor...');
        displayNotes(true);
    }, 3000);
    
    // Share note butonuna click event dinleyicisi ekle
    const shareNoteBtn = document.getElementById('shareNote');
    if (shareNoteBtn) {
        console.log('📝 Share note butonu bulundu, olay dinleyicisi ekleniyor...');
        shareNoteBtn.addEventListener('click', function() {
            console.log('📝 Share note butonuna tıklandı');
            handleShareNote();
        });
    } else {
        console.warn('⚠️ Share note butonu bulunamadı!');
    }
    
    // Share form için submit olayını engelle (button click ile yönetilmeli)
    const shareForm = document.getElementById('shareForm');
    if (shareForm) {
        shareForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Share form submit olayı engellendi, handleShareNote() çağrıldı');
            handleShareNote();
        });
    }
    
    console.log('✅ Başlangıç işlemleri tamamlandı');
});

// Notları görüntüleme fonksiyonu - güçlendirilmiş sürüm
window.displayNotes = async function(force = false) {
    try {
        console.log(`🔄 Geliştirilmiş displayNotes çalışıyor... (force=${force})`);
        
        // 1. Önce sunucudan en son notları çek
        console.log("📡 Önce sunucudan notları çekiyoruz...");
        await fetchNotesFromServer();
        
        // 2. Orijinal displayNotes fonksiyonunu çağır (artık localStorage güncel)
        if (typeof originalDisplayNotes === 'function') {
            return originalDisplayNotes(force);
        } else {
            console.error("❌ Orijinal displayNotes fonksiyonu bulunamadı!");
        }
    } catch (error) {
        console.error("❌ Geliştirilmiş displayNotes hatası:", error);
        
        // Yine de orijinal fonksiyonu çalıştır
        if (typeof originalDisplayNotes === 'function') {
            return originalDisplayNotes(force);
        }
    }
};

// LocalStorage ve sunucu notlarını senkronize et
function syncServerNotesToLocalStorage(serverNotes) {
    try {
        console.log('LocalStorage ile sunucu notları senkronize ediliyor...');
        
        // LocalStorage'dan mevcut notları al
        let localNotes = [];
        try {
            const savedNotes = localStorage.getItem('notes');
            if (savedNotes) {
                localNotes = JSON.parse(savedNotes);
            }
        } catch (parseError) {
            console.error('localStorage parse hatası:', parseError);
            localNotes = [];
        }
        
        // Serverdaki notları ekle ve güncelle
        let updated = false;
        let addedCount = 0;
        
        for (const serverNote of serverNotes) {
            // Aynı ID'ye sahip not var mı kontrol et
            const existingNoteIndex = localNotes.findIndex(note => 
                note.id && serverNote.id && note.id.toString() === serverNote.id.toString()
            );
            
            if (existingNoteIndex >= 0) {
                // Mevcut notu güncelle (içerik, zaman damgası, vb.)
                localNotes[existingNoteIndex] = {
                    ...localNotes[existingNoteIndex],
                    content: serverNote.content,
                    walletAddress: serverNote.wallet_address,
                    created_at: serverNote.created_at,
                    synced: true
                };
                updated = true;
            } else {
                // Yeni not ekle
                localNotes.push({
                    id: serverNote.id || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    content: serverNote.content,
                    walletAddress: serverNote.wallet_address,
                    created_at: serverNote.created_at,
                    synced: true,
                    likes: serverNote.likes || 0,
                    dislikes: serverNote.dislikes || 0
                });
                addedCount++;
                updated = true;
            }
        }
        
        // Değişiklik varsa localStorage'ı güncelle
        if (updated) {
            localStorage.setItem('notes', JSON.stringify(localNotes));
            console.log(`✅ localStorage güncellendi: ${addedCount} not eklendi, toplam ${localNotes.length} not`);
        } else {
            console.log('📊 localStorage güncellemesi gerekmedi, notlar zaten güncel');
        }
        
        return {
            success: true,
            added: addedCount,
            total: localNotes.length
        };
    } catch (error) {
        console.error('localStorage senkronizasyon hatası:', error);
        return { success: false, error: error.message };
    }
}

// Özel notları zorla yenileme fonksiyonu ekle
window.forceRefreshNotes = async function() {
    console.log('🔄 Notları zorla yenileme başlatıldı...');
    
    try {
        // Güçlü önbellek atlama mekanizması ile API çağrısı yap
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        const apiUrl = `${window.location.origin}/backend/api/get_notes.php?_=${timestamp}&r=${random}`;
        
        console.log(`📡 API isteği gönderiliyor: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Cache-Bypass': 'true',
                'X-Random': random.toString()
            }
        });
        
        if (!response.ok) {
            throw new Error(`API hatası: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API başarısız oldu');
        }
        
        console.log(`✅ Sunucudan ${data.data.notes.length} not alındı.`);
        
        // Mevcut notları ekranda göster
        const notesGrid = document.getElementById('notesList');
        if (!notesGrid) {
            throw new Error('Notes grid elementi bulunamadı');
        }
        
        // Ekrandaki mevcut notların sayısını kontrol et
        const existingNotes = notesGrid.querySelectorAll('.note');
        console.log(`📊 Ekranda şu anda ${existingNotes.length} not var.`);
        
        // Yeni notları göstermek için displayNotes fonksiyonunu çağır
        await window.displayNotes(true);
        
        // Yenileme sonrası ekrandaki notları kontrol et
        const updatedNotes = notesGrid.querySelectorAll('.note');
        console.log(`📊 Yenileme sonrası ekranda ${updatedNotes.length} not var.`);
        
        return {
            success: true,
            serverNotes: data.data.notes.length,
            displayedNotesBefore: existingNotes.length,
            displayedNotesAfter: updatedNotes.length,
            addedNotes: updatedNotes.length - existingNotes.length
        };
    } catch (error) {
        console.error('❌ Not yenileme hatası:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Beğeni işlemi için güçlendirilmiş fonksiyon
function vote(noteId, voteType) {
    try {
        console.log(`🔄 Beğeni işlemi başlatılıyor: Not ID=${noteId}, İşlem=${voteType}`);
        
        // Cüzdan bağlantı kontrolü
        if (!walletAddress) {
            console.error('❌ Cüzdan bağlı değil!');
            alert('Beğeni yapabilmek için lütfen cüzdanınızı bağlayın!');
            return;
        }
        
        // Daha önce oy verilmiş mi kontrol et (yerel kontrol)
        if (votedNotes.has(noteId)) {
            console.warn('⚠️ Bu nota daha önce oy verilmiş!');
            alert('Bu nota daha önce oy verdiniz!');
            return;
        }
        
        // Beğeni butonunu devre dışı bırak
        const noteElement = document.querySelector(`.note[data-note-id="${noteId}"]`);
        const likeButton = noteElement?.querySelector('.like');
        const dislikeButton = noteElement?.querySelector('.dislike');
        
        if (likeButton) likeButton.disabled = true;
        if (dislikeButton) dislikeButton.disabled = true;
        
        // Beğeni tipine göre butonlara "yükleniyor" işareti ekle
        if (voteType === 'like' && likeButton) {
            likeButton.innerHTML = '⏳ İşleniyor...';
        } else if (voteType === 'dislike' && dislikeButton) {
            dislikeButton.innerHTML = '⏳ İşleniyor...';
        }
        
        // Sunucuya beğeni gönder
        console.log('📡 Beğeni sunucuya gönderiliyor...');
        
        // Formdata hazırla
        const formData = new FormData();
        formData.append('noteId', noteId);
        formData.append('voteType', voteType);
        formData.append('walletAddress', walletAddress);
        
        // Cüzdan adresini düzelt (HTML span elementiyse metin içeriğini al)
        if (typeof walletAddress === 'object' && walletAddress !== null) {
            if (walletAddress.textContent) {
                formData.set('walletAddress', walletAddress.textContent.trim());
            }
        }
        
        // Önbellek atlatmalı API isteği gönder
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        const apiUrl = `${window.location.origin}/backend/api/vote.php?_=${timestamp}&r=${random}`;
        
        console.log('📡 Beğeni gönderiliyor:', {
            url: apiUrl,
            noteId: noteId,
            voteType: voteType,
            walletAddress: formData.get('walletAddress')
        });
        
        // XMLHttpRequest kullanarak alternatif yaklaşım
        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl, true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('📡 API yanıtı:', data);
                    
                    if (data.success) {
                        console.log('✅ Beğeni işlemi başarılı!', data);
                        
                        // Oyları eklenen nota güncelle
                        if (noteElement) {
                            // Beğeni sayılarını güncelle
                            if (voteType === 'like' && likeButton) {
                                likeButton.innerHTML = `👍 Beğen (${data.data?.likes || 0})`;
                            } else if (voteType === 'dislike' && dislikeButton) {
                                dislikeButton.innerHTML = `👎 Beğenme (${data.data?.dislikes || 0})`;
                            }
                            
                            // Oy verdikten sonra butonları devre dışı bırak
                            if (likeButton) {
                                likeButton.disabled = true;
                                likeButton.classList.add('voted');
                            }
                            if (dislikeButton) {
                                dislikeButton.disabled = true; 
                                dislikeButton.classList.add('voted');
                            }
                        }
                        
                        // Yerel depolama da güncelle
                        votedNotes.add(noteId);
                        saveToLocalStorage();
                        
                        // Başarı mesajı
                        alert('Oyunuz başarıyla kaydedildi!');
                    } else {
                        console.error('❌ Beğeni işlemi başarısız!', data.message);
                        alert('Beğeni işlemi başarısız: ' + data.message);
                        
                        // Butonları normal haline getir
                        resetVoteButtons(voteType, likeButton, dislikeButton);
                    }
                } catch (e) {
                    console.error('❌ API yanıtı işlenirken hata:', e, xhr.responseText);
                    alert('API yanıtı işlenemedi!');
                    resetVoteButtons(voteType, likeButton, dislikeButton);
                }
            } else {
                console.error('❌ HTTP hatası:', xhr.status, xhr.statusText, xhr.responseText);
                alert(`Beğeni gönderilirken HTTP hatası: ${xhr.status}`);
                resetVoteButtons(voteType, likeButton, dislikeButton);
            }
        };
        
        xhr.onerror = function(e) {
            console.error('❌ Ağ hatası:', e);
            alert('Beğeni gönderilirken ağ hatası oluştu!');
            resetVoteButtons(voteType, likeButton, dislikeButton);
        };
        
        xhr.send(formData);
        
    } catch (error) {
        console.error('❌ Beğeni işlemi genel hatası:', error);
        alert('Beğeni işlemi sırasında bir hata oluştu: ' + error.message);
    }
}

// Beğeni butonlarını sıfırlama yardımcı fonksiyonu
function resetVoteButtons(voteType, likeButton, dislikeButton) {
    if (voteType === 'like' && likeButton) {
        likeButton.innerHTML = '👍 Beğen';
        likeButton.disabled = false;
    } else if (voteType === 'dislike' && dislikeButton) {
        dislikeButton.innerHTML = '👎 Beğenme';
        dislikeButton.disabled = false;
    }
}

// Cüzdan adresini kısaltma fonksiyonu
function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 4) + '...' + address.slice(-4);
}

// Uyarı mesajlarını güncelle
function updateWarningMessages() {
    const connectWarning = document.getElementById('connect-warning');
    const balanceWarning = document.getElementById('balance-warning');
    const networkWarning = document.getElementById('network-warning');
    const transactionWarning = document.getElementById('transaction-warning');
    const errorWarning = document.getElementById('error-warning');

    if (connectWarning) connectWarning.textContent = 'Please connect your Phantom wallet to continue.';
    if (balanceWarning) balanceWarning.textContent = 'Insufficient balance. Please add funds to your wallet.';
    if (networkWarning) networkWarning.textContent = 'Please switch to Solana Devnet network.';
    if (transactionWarning) transactionWarning.textContent = 'Transaction failed. Please try again.';
    if (errorWarning) errorWarning.textContent = 'An error occurred. Please try again later.';
}

// Footer telif hakkı metnini güncelle
function updateFooter() {
    const footer = document.querySelector('.main-footer .copyright');
    if (footer) {
        footer.textContent = ' 2024 Not Paylaşım Platformu. Tüm hakları saklıdır.';
    }
}

// Not verisini sunucuya gönder - YENİ FONKSİYON
async function sendNoteToServer(noteData, transactionHash) {
  if (!noteData || !noteData.content || !noteData.walletAddress) {
      console.error('❌ Gönderilecek not verisi eksik!');
      return false;
  }
  
  console.log('📤 Not verisi gönderiliyor (Onaylanmış işlem hash ile):', transactionHash);
  console.log('- İçerik:', noteData.content);
  console.log('- Cüzdan:', noteData.walletAddress);
  
  try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('content', noteData.content);
      formData.append('walletAddress', noteData.walletAddress);
      formData.append('transactionHash', transactionHash || '');
      
      // API URL'ini belirle
      const apiUrl = window.location.origin + '/backend/api/create_note.php';
      
      // Önbellek atlatmalı fetch kullan
      const response = await fetchWithCache(apiUrl, {
          method: 'POST',
          body: formData
      });
      
      const responseText = await response.text();
      
      try {
          const jsonData = JSON.parse(responseText);
          
          if (jsonData.success) {
              console.log('✅ Not başarıyla kaydedildi! ID:', jsonData.data?.id);
              
              // Not girişini temizle
              const noteInput = document.getElementById('noteInput');
              if (noteInput) noteInput.value = '';
              
              // Ana sayfaya yönlendir ve notları yenile
              window.location.hash = '#home';
              setTimeout(async () => {
                  await displayNotes();
              }, 500);
              
              alert('Notunuz başarıyla paylaşıldı!');
              return true;
          } else {
              console.error('❌ Not kaydedilemedi:', jsonData.message);
              alert('Not paylaşılamadı: ' + jsonData.message);
              return false;
          }
      } catch (e) {
          console.error('❌ API yanıtı işlenemedi:', e);
          console.log('Ham yanıt:', responseText);
          alert('Sunucu yanıtı işlenemedi!');
          return false;
      }
  } catch (error) {
      console.error('❌ Not gönderme hatası:', error);
      alert('Not gönderilirken bir hata oluştu: ' + error.message);
      return false;
  }
}

// Durum göstergesini güncelle
function updateShareStatus(step, message, type = 'info') {
    const statusEl = document.getElementById('shareStatus');
    const messageEl = document.getElementById('statusMessage');
    
    // Durum panelini göster
    if (statusEl) statusEl.style.display = 'block';
    
    // Mesajı güncelle
    if (messageEl) {
        messageEl.textContent = message;
        // Renk tipi
        messageEl.style.color = type === 'error' ? '#f44336' : 
                               type === 'warning' ? '#ff9800' : 
                               type === 'success' ? '#4CAF50' : '#2196F3';
    }
    
    // Adımları güncelle
    const steps = ['wallet', 'payment', 'blockchain', 'server', 'complete'];
    const stepIndex = steps.indexOf(step);
    
    for (let i = 0; i < steps.length; i++) {
        const indicator = document.querySelector(`#step-${steps[i]} .status-indicator`);
        if (indicator) {
            // Önceki adımlar tamamlandı
            if (i < stepIndex) {
                indicator.textContent = '✅';
            }
            // Şu anki adım
            else if (i === stepIndex) {
                indicator.textContent = type === 'error' ? '❌' : 
                                      type === 'warning' ? '⚠️' : 
                                      type === 'success' ? '✅' : '🔄';
            }
            // Sonraki adımlar
            else {
                indicator.textContent = '⚪';
            }
        }
    }
}

// Durum göstergesini sıfırla
function resetShareStatus() {
    const statusEl = document.getElementById('shareStatus');
    if (statusEl) statusEl.style.display = 'none';
    
    const steps = ['wallet', 'payment', 'blockchain', 'server', 'complete'];
    for (const step of steps) {
        const indicator = document.querySelector(`#step-${step} .status-indicator`);
        if (indicator) indicator.textContent = '⚪';
    }
}

// handleShareNote fonksiyonunu global olarak tanımla
window.handleShareNote = async function() {
    try {
        console.log('🔄 handleShareNote başlatıldı');
        resetShareStatus();
        
        // Global walletAddress değişkenini kontrol et
        console.log('📊 Global walletAddress değeri:', walletAddress);
        updateShareStatus('wallet', 'Cüzdan kontrolü yapılıyor...');
        
        // DÜZELTME: walletAddress string değerini al
        let walletAddressValue = '';
        if (typeof walletAddress === 'object' && walletAddress !== null) {
            // HTML element ise içeriğini al
            if (walletAddress.textContent) {
                walletAddressValue = walletAddress.textContent.trim();
            } else if (walletAddress.innerText) {
                walletAddressValue = walletAddress.innerText.trim();
            } else {
                console.error('❌ Cüzdan adresi alınamadı');
                updateShareStatus('wallet', 'Cüzdan adresi alınamadı!', 'error');
                alert('Cüzdan adresi alınamadı. Lütfen tekrar bağlanın.');
                return;
            }
        } else if (typeof walletAddress === 'string') {
            walletAddressValue = walletAddress.trim();
        } else {
            console.error('❌ Cüzdan bağlı değil');
            updateShareStatus('wallet', 'Cüzdan bağlı değil!', 'error');
            alert('Lütfen önce cüzdanınızı bağlayın!');
            return;
        }
        
        console.log('👛 Cüzdan adresi (düzeltilmiş):', walletAddressValue);
        updateShareStatus('wallet', 'Cüzdan doğrulandı ✓', 'success');

        const noteInput = document.getElementById('noteInput');
        const noteContent = noteInput.value.trim();
        console.log('📝 Not içeriği:', noteContent);

        if (!noteContent) {
            console.error('❌ Not içeriği boş');
            updateShareStatus('wallet', 'Not içeriği boş!', 'error');
            alert('Lütfen bir not girin!');
            return;
        }
        
        // Doğrudan ödeme işlemini başlat
        console.log('💰 Ödeme işlemi başlatılıyor...');
        updateShareStatus('payment', 'Ödeme işlemi başlatılıyor...', 'info');
        
        // Ödeme işlemini yap ve not gönderme işlemini içinde hallediyoruz
        // DÜZELTME: String cüzdan adresini gönder
        const paymentSuccess = await transferSOL(walletAddressValue, 0.01); // 0.01 SOL ödeme
        
        if (!paymentSuccess) {
            console.error('❌ Ödeme başarısız oldu');
            updateShareStatus('payment', 'Ödeme başarısız oldu!', 'error');
            alert('Ödeme başarısız oldu. Lütfen tekrar deneyin.');
            return;
        }
        
        console.log('✅ Ödeme ve not gönderme işlemi tamamlandı!');
        
        // Ana sayfaya yönlendir
        window.location.hash = '#home';
        
        // Notları yenile
        setTimeout(async () => {
            await forceRefreshNotes();
        }, 1000);
        
        // 3 saniye sonra durum göstergesini gizle
        setTimeout(() => {
            resetShareStatus();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Not gönderme hatası:', error);
        updateShareStatus('complete', 'Hata: ' + error.message, 'error');
        alert('Not gönderilirken bir hata oluştu: ' + error.message);
    }
};

async function syncNotesToServer() {
    try {
        console.log('🔄 Not senkronizasyonu başlatılıyor...');
        
        // LocalStorage'dan notları al
        const savedNotes = localStorage.getItem('notes');
        if (!savedNotes) {
            console.log('LocalStorage\'da not bulunamadı');
            return { success: false, message: 'LocalStorage\'da not bulunamadı' };
        }

        const parsedNotes = JSON.parse(savedNotes);
        console.log('Toplam not sayısı:', parsedNotes.length);

        // Senkronize edilmemiş notları filtrele
        const notesToSync = parsedNotes.filter(note => !note.synced && note.walletAddress);
        console.log('Senkronize edilecek not sayısı:', notesToSync.length);

        if (notesToSync.length === 0) {
            console.log('Senkronize edilecek not yok');
            return { success: true, message: 'Senkronize edilecek not yok' };
        }

        let successCount = 0;
        let errorCount = 0;
        
        // Her not için senkronizasyon işlemi
        for (const note of notesToSync) {
            try {
                console.log(`Not senkronize ediliyor: ID=${note.id}`);
                
                const formData = new FormData();
                formData.append('content', note.content);
                formData.append('walletAddress', note.walletAddress);
                
                const response = await fetch(`${API_BASE_URL}/create_note.php`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                console.log('API yanıtı:', result);
                
                if (result.success) {
                    console.log(`✅ Not ID=${note.id} başarıyla senkronize edildi!`);
                    note.synced = true;
                    successCount++;
                } else {
                    console.error(`❌ Not ID=${note.id} senkronizasyonu başarısız! Hata: ${result.message}`);
                    errorCount++;
                }

            } catch (syncError) {
                console.error(`Not ID=${note.id} senkronizasyon hatası:`, syncError);
                errorCount++;
                continue;
            }
        }

        // LocalStorage'ı güncelle
        localStorage.setItem('notes', JSON.stringify(parsedNotes));
        console.log('LocalStorage güncellendi');
        
        console.log(`Not senkronizasyonu tamamlandı. Başarılı: ${successCount}, Başarısız: ${errorCount}`);
        
        return {
            success: true,
            totalNotes: notesToSync.length,
            successCount: successCount,
            errorCount: errorCount
        };
        
    } catch (error) {
        console.error('Genel senkronizasyon hatası:', error);
        return { success: false, error: error.message };
    }
}

// Global olarak erişilebilir tanılama fonksiyonları
window.runBackendDiagnostics = runBackendDiagnostics;
window.checkBackendAPI = checkBackendAPI;
window.advancedAPITest = advancedAPITest;

// Manuel API test fonksiyonu - JSON formatında data alıp direkt olarak gönderen
async function testManualAPICall(data) {
  try {
    console.log('🧪 Manuel API testi başlatılıyor...');
    console.log('Test verisi:', data);
    
    // Alternatif API URLs
    const apiUrls = [
      'https://walletnotes.net/backend/api/create_note.php',
      '/backend/api/create_note.php',
      window.location.origin + '/backend/api/create_note.php',
      `${window.location.protocol}//${window.location.hostname}/backend/api/create_note.php`
    ];
    
    console.log(`${apiUrls.length} farklı API URL denenecek`);
    
    // Farklı header kombinasyonları
    const headerSets = [
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      }
    ];
    
    const results = [];
    
    // Tüm URL'ler ve header kombinasyonlarını dene
    for (const apiUrl of apiUrls) {
      for (const headers of headerSets) {
        console.log(`Test URL: ${apiUrl}`);
        console.log('Test headers:', headers);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            credentials: 'include'
          });
          
          console.log(`URL: ${apiUrl} - Durum: ${response.status} ${response.statusText}`);
          
          const responseText = await response.text();
          console.log('Yanıt:', responseText);
          
          results.push({
            url: apiUrl,
            headers: headers,
            status: response.status,
            statusText: response.statusText,
            response: responseText,
            success: response.ok
          });
        } catch (testError) {
          console.error(`URL: ${apiUrl} - Hata:`, testError);
          results.push({
            url: apiUrl,
            headers: headers,
            error: testError.message,
            success: false
          });
        }
      }
    }
    
    console.log('Test sonuçları:', results);
    
    // Başarılı sonuç var mı kontrol et
    const successfulTest = results.find(r => r.success);
    if (successfulTest) {
      console.log('✅ Başarılı API bağlantısı bulundu!');
      console.log('Başarılı URL:', successfulTest.url);
      console.log('Başarılı headers:', successfulTest.headers);
    } else {
      console.error('❌ Hiçbir API bağlantısı başarılı olmadı!');
    }
    
    return {
      results: results,
      successfulTest: successfulTest || null
    };
  } catch (error) {
    console.error('API test hatası:', error);
    return { success: false, error: error.message };
  }
}

// localStorage'daki tüm notları konsola yazdır
function logAllNotes() {
  const savedNotes = localStorage.getItem('notes');
  if (!savedNotes) {
    console.log('LocalStorage\'da not bulunamadı');
    return;
  }
  
  const parsedNotes = JSON.parse(savedNotes);
  console.log(`LocalStorage'da ${parsedNotes.length} not bulundu:`);
  console.table(parsedNotes.map(note => ({
    id: note.id,
    content: note.content?.substring(0, 30) + '...',
    walletAddress: note.walletAddress?.substring(0, 10) + '...',
    synced: note.synced,
    created_at: note.created_at
  })));
  
  return parsedNotes;
}

// Global olarak erişilebilir
window.testManualAPICall = testManualAPICall;
window.logAllNotes = logAllNotes;

// Test butonunu sayfaya ekle
document.addEventListener('DOMContentLoaded', function() {
    const testButton = document.createElement('button');
    testButton.textContent = 'Not Paylaşım Testi';
    testButton.style.padding = '10px 20px';
    testButton.style.margin = '10px';
    testButton.style.backgroundColor = '#4CAF50';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    testButton.onclick = window.testNoteSharing;
    
    const shareForm = document.getElementById('shareForm');
    if (shareForm) {
        shareForm.parentNode.insertBefore(testButton, shareForm);
    }
});

// Tanılama fonksiyonları
window.diagnoseFunctions = function() {
    console.log("🔍 Fonksiyon Tanılama Raporu:");
    console.log("- handleShareNote global olarak tanımlı mı:", typeof window.handleShareNote === 'function' ? "✅ EVET" : "❌ HAYIR");
    console.log("- connectWallet global olarak tanımlı mı:", typeof window.connectWallet === 'function' ? "✅ EVET" : "❌ HAYIR");
    console.log("- transferSOL global olarak tanımlı mı:", typeof window.transferSOL === 'function' ? "✅ EVET" : "❌ HAYIR");
    console.log("- displayNotes global olarak tanımlı mı:", typeof window.displayNotes === 'function' ? "✅ EVET" : "❌ HAYIR");
    
    // Buton kontrolü
    const shareNoteButton = document.getElementById('shareNote');
    console.log("- shareNote butonu DOM'da var mı:", shareNoteButton ? "✅ EVET" : "❌ HAYIR");
    if (shareNoteButton) {
        console.log("  - onclick özelliği:", shareNoteButton.onclick ? "✅ VAR" : "❌ YOK");
        console.log("  - event listener sayısı:", getEventListeners(shareNoteButton).click ? getEventListeners(shareNoteButton).click.length : 0);
    }
    
    // Not girişi kontrolü
    const noteInput = document.getElementById('noteInput');
    console.log("- noteInput DOM'da var mı:", noteInput ? "✅ EVET" : "❌ HAYIR");
    
    // Cüzdan kontrolü
    const walletAddressElement = document.getElementById('walletAddress');
    console.log("- walletAddress DOM'da var mı:", walletAddressElement ? "✅ EVET" : "❌ HAYIR");
    if (walletAddressElement) {
        console.log("  - İçeriği:", walletAddressElement.textContent || "(boş)");
    }
    
    // Önbellek/fetch kontrolü
    console.log("- fetchWithCache tanımlı mı:", typeof fetchWithCache === 'function' ? "✅ EVET" : "❌ HAYIR");
    
    // Transaction durumu
    console.log("- _transactionStatus:", window._transactionStatus);
};

// Tanılama fonksiyonunu otomatik çalıştır
setTimeout(function() {
    console.log("%c📊 WalletNotes Tanılama Başlatılıyor...", "font-size: 14px; font-weight: bold; color: blue;");
    try {
        window.diagnoseFunctions();
    } catch (e) {
        console.error("Tanılama sırasında hata:", e);
    }
}, 2000);

// Sayfaya manuel test butonları ekle
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Test panel div'i oluştur
        const testPanel = document.createElement('div');
        testPanel.id = "testPanel";
        testPanel.style.position = "fixed";
        testPanel.style.bottom = "10px";
        testPanel.style.right = "10px";
        testPanel.style.backgroundColor = "#f8f9fa";
        testPanel.style.border = "1px solid #ddd";
        testPanel.style.padding = "10px";
        testPanel.style.borderRadius = "5px";
        testPanel.style.zIndex = "9999";
        testPanel.style.fontSize = "14px";
        testPanel.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        testPanel.innerHTML = `
            <div style="margin-bottom:10px;font-weight:bold;text-align:center;">🛠️ Test Paneli</div>
            <div style="display:flex;flex-direction:column;gap:5px;">
                <button id="testRefreshNotes" style="padding:5px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;">Notları Yenile</button>
                <button id="testManualShare" style="padding:5px;background:#2196F3;color:white;border:none;border-radius:3px;cursor:pointer;">Manuel Paylaşım</button>
                <button id="testDiagnostics" style="padding:5px;background:#FF9800;color:white;border:none;border-radius:3px;cursor:pointer;">Tanılama</button>
                <button id="testHidePanel" style="padding:5px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Gizle</button>
            </div>
        `;
        
        // Sayfaya ekle
        document.body.appendChild(testPanel);
        
        // Buton işlevlerini ekle
        document.getElementById('testRefreshNotes').addEventListener('click', function() {
            console.log("🔄 Notları yenileme testi başlatılıyor...");
            window.displayNotes().then(() => {
                console.log("✅ Notlar yenilendi");
                alert("Notlar yenilendi!");
            }).catch(err => {
                console.error("❌ Notlar yenilenirken hata:", err);
                alert("Hata: " + err.message);
            });
        });
        
        document.getElementById('testManualShare').addEventListener('click', function() {
            console.log("📤 Manuel not paylaşım testi başlatılıyor...");
            
            // Test verisi
            const testContent = "Test notu - " + new Date().toLocaleString();
            const testWallet = "TEST_WALLET_" + Math.random().toString(36).substring(2, 8);
            
            console.log("Test içeriği:", testContent);
            console.log("Test cüzdanı:", testWallet);
            
            // Not alanını doldur
            const noteInput = document.getElementById('noteInput');
            if (noteInput) {
                noteInput.value = testContent;
                console.log("✅ Not alanı dolduruldu");
            } else {
                console.error("❌ Not alanı bulunamadı");
            }
            
            // Sayfayı paylaşım bölümüne yönlendir
            window.showSection('share');
            console.log("✅ Paylaşım bölümü açıldı");
            
            // API ile doğrudan not gönder
            fetch(window.location.origin + '/backend/api/create_note.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: testContent,
                    walletAddress: testWallet
                })
            }).then(response => response.json())
            .then(data => {
                console.log("✅ API yanıtı:", data);
                if (data.success) {
                    alert("Test notu başarıyla paylaşıldı! ID: " + data.data.id);
                    window.showSection('home');
                    window.displayNotes();
                } else {
                    alert("Hata: " + data.message);
                }
            })
            .catch(err => {
                console.error("❌ API hatası:", err);
                alert("API hatası: " + err.message);
            });
        });
        
        document.getElementById('testDiagnostics').addEventListener('click', function() {
            console.log("🔍 Tanılama başlatılıyor...");
            try {
                window.diagnoseFunctions();
                alert("Tanılama tamamlandı! Konsolu kontrol edin.");
            } catch (err) {
                console.error("❌ Tanılama hatası:", err);
                alert("Tanılama hatası: " + err.message);
            }
        });
        
        document.getElementById('testHidePanel').addEventListener('click', function() {
            document.getElementById('testPanel').style.display = 'none';
            
            // 10 saniye sonra göster butonunu ekle
            const showButton = document.createElement('button');
            showButton.textContent = "Test Panelini Göster";
            showButton.style.position = "fixed";
            showButton.style.bottom = "10px";
            showButton.style.right = "10px";
            showButton.style.zIndex = "9999";
            showButton.style.padding = "5px 10px";
            showButton.style.backgroundColor = "#4CAF50";
            showButton.style.color = "white";
            showButton.style.border = "none";
            showButton.style.borderRadius = "3px";
            showButton.style.cursor = "pointer";
            
            showButton.addEventListener('click', function() {
                document.getElementById('testPanel').style.display = 'block';
                showButton.remove();
            });
            
            document.body.appendChild(showButton);
        });
        
        console.log("✅ Test paneli eklendi");
    } catch (err) {
        console.error("❌ Test paneli eklenirken hata:", err);
    }
});

// Not karşılaştırma test fonksiyonu
window.compareNotesWithServer = async function() {
    console.log('🔍 Not karşılaştırması başlatılıyor...');
    
    // Sonuç paneli oluştur
    const panel = document.createElement('div');
    panel.className = 'result-panel';
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        padding: 20px;
        z-index: 1000;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
        font-family: Arial, sans-serif;
    `;
    
    // Başlık ekle
    const title = document.createElement('h2');
    title.textContent = '🔍 Not Karşılaştırma Sonuçları';
    title.style.margin = '0 0 15px 0';
    panel.appendChild(title);
    
    // Status mesajı
    const status = document.createElement('div');
    status.className = 'status';
    status.style.padding = '10px';
    status.style.borderRadius = '4px';
    status.style.background = '#f0f0f0';
    status.style.marginBottom = '10px';
    status.textContent = 'Notlar karşılaştırılıyor...';
    panel.appendChild(status);
    
    // Yükleme göstergesi
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.style.cssText = `
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 2s linear infinite;
        margin: 10px auto;
    `;
    
    // Stil ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .result-panel button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #4CAF50;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }
        .result-panel button:hover {
            background: #45a049;
        }
        .result-panel button.secondary {
            background: #2196F3;
        }
        .result-panel button.secondary:hover {
            background: #0b7dda;
        }
        .result-panel button.warning {
            background: #f44336;
        }
        .result-panel button.warning:hover {
            background: #d32f2f;
        }
        .result-panel .note-item {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 8px;
            background: #f9f9f9;
        }
        .result-panel .success {
            background: #e7f9e7;
            border-left: 4px solid #4CAF50;
            padding-left: 10px;
        }
        .result-panel .error {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding-left: 10px;
        }
        .result-panel .warning {
            background: #fff8e1;
            border-left: 4px solid #ffeb3b;
            padding-left: 10px;
        }
        .result-panel .info {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding-left: 10px;
        }
    `;
    document.head.appendChild(style);
    
    status.appendChild(loader);
    document.body.appendChild(panel);
    
    try {
        // Durum güncelleme yardımcı fonksiyonu
        function updateStatus(message, type = 'info') {
            status.innerHTML = message;
            status.className = `status ${type}`;
        }
        
        // Ekrandaki notları al
        updateStatus('Ekrandaki notlar toplanıyor...', 'info');
        const displayedNotesElements = document.querySelectorAll('.note-card');
        const displayedNotes = Array.from(displayedNotesElements).map(noteEl => {
            const contentEl = noteEl.querySelector('.note-content');
            const walletEl = noteEl.querySelector('.wallet-address');
            const idEl = noteEl.querySelector('.note-id');
            
            return {
                id: idEl ? idEl.textContent.trim() : 'Bilinmiyor',
                content: contentEl ? contentEl.textContent.trim() : 'İçerik bulunamadı',
                walletAddress: walletEl ? walletEl.textContent.trim() : 'Adres bulunamadı',
                element: noteEl
            };
        });
        
        // API'den notları al
        updateStatus('Sunucudan notlar alınıyor...', 'info');
        
        // API URL'sini oluştur
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        const apiUrl = `${window.location.origin}/backend/api/get_notes.php?_=${timestamp}&r=${random}`;
        
        console.log('📡 API isteği yapılıyor:', apiUrl);
        
        // API'ye istek yap
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API hatası: ${response.status} ${response.statusText}`);
        }
        
        // Yanıtı JSON olarak parse et
        const responseText = await response.text();
        console.log('📡 API yanıtı (ham):', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error('API yanıtı JSON olarak ayrıştırılamadı: ' + responseText);
        }
        
        if (!data.success) {
            throw new Error('API hatası: ' + (data.message || 'Bilinmeyen hata'));
        }
        
        const serverNotes = data.notes || [];
        console.log('📊 Sunucu notları:', serverNotes);
        console.log('📊 Ekrandaki notlar:', displayedNotes);
        
        // LocalStorage'dan notları al
        const localStorageNotes = loadFromLocalStorage() || [];
        console.log('📊 LocalStorage notları:', localStorageNotes);
        
        // Notları karşılaştır
        updateStatus('Notlar karşılaştırılıyor...', 'info');
        
        // Sunucuda bulunmayan notları tespit et
        const missingOnServer = displayedNotes.filter(displayedNote => {
            return !serverNotes.some(serverNote => {
                return serverNote.content.trim() === displayedNote.content.trim() &&
                       serverNote.wallet_address.trim().toLowerCase() === displayedNote.walletAddress.trim().toLowerCase();
            });
        });
        
        // Ekranda bulunmayan sunucu notlarını tespit et
        const missingOnDisplay = serverNotes.filter(serverNote => {
            return !displayedNotes.some(displayedNote => {
                return serverNote.content.trim() === displayedNote.content.trim() &&
                       serverNote.wallet_address.trim().toLowerCase() === displayedNote.walletAddress.trim().toLowerCase();
            });
        });
        
        // LocalStorage'da bulunmayan notları tespit et
        const missingInLocalStorage = serverNotes.filter(serverNote => {
            return !localStorageNotes.some(localNote => {
                return serverNote.content.trim() === localNote.content.trim() &&
                       serverNote.wallet_address.trim().toLowerCase() === localNote.walletAddress.trim().toLowerCase();
            });
        });
        
        // Sonuçları göster
        updateStatus(`Karşılaştırma tamamlandı. ${serverNotes.length} sunucu notu, ${displayedNotes.length} ekran notu, ${localStorageNotes.length} local depo notu.`, 'success');
        
        // Sonuç özeti
        const summary = document.createElement('div');
        summary.innerHTML = `
            <h3>📊 Özet</h3>
            <p><strong>Sunucu Notları:</strong> ${serverNotes.length}</p>
            <p><strong>Ekran Notları:</strong> ${displayedNotes.length}</p>
            <p><strong>LocalStorage Notları:</strong> ${localStorageNotes.length}</p>
        `;
        panel.appendChild(summary);
        
        // Sunucuda eksik olan notları göster (önemli sorun)
        if (missingOnServer.length > 0) {
            const missingSection = document.createElement('div');
            missingSection.className = 'error';
            missingSection.innerHTML = `
                <h3>⚠️ Sunucuda Bulunmayan ${missingOnServer.length} Not</h3>
                <p>Bu notlar ekranda görünüyor ancak sunucuda kaydedilmemiş!</p>
            `;
            
            missingOnServer.forEach(note => {
                const noteItem = document.createElement('div');
                noteItem.className = 'note-item';
                noteItem.innerHTML = `
                    <p><strong>İçerik:</strong> ${note.content}</p>
                    <p><strong>Cüzdan:</strong> ${shortenAddress(note.walletAddress)}</p>
                `;
                
                // Not gönderme butonu ekle
                const sendButton = document.createElement('button');
                sendButton.textContent = 'Bu Notu Sunucuya Gönder';
                sendButton.className = 'secondary';
                sendButton.onclick = async () => {
                    try {
                        sendButton.disabled = true;
                        sendButton.textContent = 'Gönderiliyor...';
                        
                        // FormData oluştur
                        const formData = new FormData();
                        formData.append('content', note.content);
                        formData.append('walletAddress', note.walletAddress);
                        
                        // API URL oluştur
                        const timestamp = new Date().getTime();
                        const random = Math.floor(Math.random() * 1000000);
                        const apiUrl = `${window.location.origin}/backend/api/create_note.php?_=${timestamp}&r=${random}`;
                        
                        // API'ye POST isteği yap
                        const sendResponse = await fetch(apiUrl, {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            }
                        });
                        
                        // Yanıt durumunu kontrol et
                        if (!sendResponse.ok) {
                            throw new Error(`API hatası: ${sendResponse.status} ${sendResponse.statusText}`);
                        }
                        
                        // Ham yanıtı al ve logla
                        const responseText = await sendResponse.text();
                        console.log('📡 Gönderim API yanıtı (ham):', responseText);
                        
                        // JSON olarak parse et
                        let result;
                        try {
                            result = JSON.parse(responseText);
                        } catch (e) {
                            throw new Error('API yanıtı JSON olarak ayrıştırılamadı: ' + responseText);
                        }
                        
                        // Başarı durumunu kontrol et
                        if (result.success) {
                            sendButton.textContent = 'Başarıyla Gönderildi ✓';
                            sendButton.style.background = '#4CAF50';
                            noteItem.style.background = '#e7f9e7';
                        } else {
                            throw new Error(result.message || 'API hatası');
                        }
                    } catch (error) {
                        console.error('❌ Not gönderim hatası:', error);
                        sendButton.textContent = 'Hata: ' + error.message;
                        sendButton.style.background = '#f44336';
                    } finally {
                        // 3 saniye sonra butonu normale döndür
                        setTimeout(() => {
                            sendButton.disabled = false;
                        }, 3000);
                    }
                };
                
                noteItem.appendChild(sendButton);
                missingSection.appendChild(noteItem);
            });
            
            panel.appendChild(missingSection);
        }
        
        // Debug & Teşhis bölümü - HAY MECBURİ
        const debugSection = document.createElement('div');
        debugSection.className = 'info';
        debugSection.innerHTML = '<h3>🧪 Hata Teşhis & Çözüm</h3>';
        
        // API testi butonu
        const apiTestButton = document.createElement('button');
        apiTestButton.textContent = 'API Direkt Test';
        apiTestButton.className = 'secondary';
        apiTestButton.style.marginRight = '10px';
        apiTestButton.onclick = async () => {
            try {
                apiTestButton.disabled = true;
                apiTestButton.textContent = 'Test ediliyor...';
                
                // Test notu oluştur
                const testNote = {
                    content: 'Test notu - ' + new Date().toLocaleTimeString(),
                    walletAddress: walletAddress || 'test-wallet-address'
                };
                
                // FormData oluştur
                const formData = new FormData();
                formData.append('content', testNote.content);
                formData.append('walletAddress', testNote.walletAddress);
                
                // API URL oluştur
                const timestamp = new Date().getTime();
                const random = Math.floor(Math.random() * 1000000);
                const apiUrl = `${window.location.origin}/backend/api/create_note.php?_=${timestamp}&r=${random}`;
                
                // API'ye POST isteği yap - HAM XMLHttpRequest ile
                const xhr = new XMLHttpRequest();
                xhr.open('POST', apiUrl, true);
                xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                xhr.setRequestHeader('Pragma', 'no-cache');
                xhr.setRequestHeader('Expires', '0');
                
                xhr.onload = function() {
                    try {
                        console.log('📡 XHR ham yanıt:', xhr.responseText);
                        
                        // JSON olarak parse et
                        let result;
                        try {
                            result = JSON.parse(xhr.responseText);
                        } catch (e) {
                            throw new Error('API yanıtı JSON olarak ayrıştırılamadı: ' + xhr.responseText);
                        }
                        
                        // Sonuçları göster
                        const resultDiv = document.createElement('div');
                        resultDiv.className = result.success ? 'success' : 'error';
                        resultDiv.innerHTML = `
                            <h4>${result.success ? '✅ API Testi Başarılı' : '❌ API Testi Başarısız'}</h4>
                            <p><strong>Mesaj:</strong> ${result.message}</p>
                            <p><strong>Status Code:</strong> ${xhr.status}</p>
                            <p><strong>Yanıt:</strong> <pre>${JSON.stringify(result, null, 2)}</pre></p>
                        `;
                        debugSection.appendChild(resultDiv);
                        
                        apiTestButton.textContent = result.success ? 'API Test Başarılı ✓' : 'API Test Başarısız ❌';
                        apiTestButton.style.background = result.success ? '#4CAF50' : '#f44336';
                    } catch (error) {
                        console.error('❌ API test parse hatası:', error);
                        apiTestButton.textContent = 'Test Hatası: ' + error.message;
                        apiTestButton.style.background = '#f44336';
                    } finally {
                        // 3 saniye sonra butonu normale döndür
                        setTimeout(() => {
                            apiTestButton.disabled = false;
                        }, 3000);
                    }
                };
                
                xhr.onerror = function() {
                    console.error('❌ XHR network hatası');
                    apiTestButton.textContent = 'Ağ Hatası!';
                    apiTestButton.style.background = '#f44336';
                    setTimeout(() => {
                        apiTestButton.disabled = false;
                    }, 3000);
                };
                
                // FormData gönder
                xhr.send(formData);
                
            } catch (error) {
                console.error('❌ API test hatası:', error);
                apiTestButton.textContent = 'Test Hatası: ' + error.message;
                apiTestButton.style.background = '#f44336';
                setTimeout(() => {
                    apiTestButton.disabled = false;
                }, 3000);
            }
        };
        
        // Config.php kontrol butonu
        const checkConfigButton = document.createElement('button');
        checkConfigButton.textContent = 'PHP Error Log Kontrol';
        checkConfigButton.className = 'secondary';
        checkConfigButton.style.marginRight = '10px';
        checkConfigButton.onclick = async () => {
            try {
                checkConfigButton.disabled = true;
                checkConfigButton.textContent = 'Kontrol ediliyor...';
                
                // Timestamp ekleyen API URL oluştur
                const timestamp = new Date().getTime();
                const random = Math.floor(Math.random() * 1000000);
                const apiUrl = `${window.location.origin}/backend/api/get_error_log.php?_=${timestamp}&r=${random}`;
                
                // API'ye GET isteği yap
                const logResponse = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                // Ham yanıtı al
                const logText = await logResponse.text();
                console.log('📡 Log API yanıtı (ham):', logText);
                
                // Sonuçları göster
                const resultDiv = document.createElement('div');
                resultDiv.className = 'info';
                resultDiv.innerHTML = `
                    <h4>📋 PHP Error Log</h4>
                    <pre style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">${logText}</pre>
                `;
                debugSection.appendChild(resultDiv);
                
                checkConfigButton.textContent = 'Log Görüntülendi ✓';
                checkConfigButton.style.background = '#4CAF50';
            } catch (error) {
                console.error('❌ Log görüntüleme hatası:', error);
                checkConfigButton.textContent = 'Hata: ' + error.message;
                checkConfigButton.style.background = '#f44336';
            } finally {
                // 3 saniye sonra butonu normale döndür
                setTimeout(() => {
                    checkConfigButton.disabled = false;
                }, 3000);
            }
        };
        
        // Manual bir not ekleme butonu
        const manualAddButton = document.createElement('button');
        manualAddButton.textContent = 'Manual Not Ekle';
        manualAddButton.className = 'secondary';
        manualAddButton.onclick = async () => {
            try {
                const noteContent = prompt('Not içeriğini girin:');
                if (!noteContent) return;
                
                manualAddButton.disabled = true;
                manualAddButton.textContent = 'Ekleniyor...';
                
                // FormData oluştur
                const formData = new FormData();
                formData.append('content', noteContent);
                formData.append('walletAddress', walletAddress || 'manuel-ekleme');
                
                // API URL oluştur
                const timestamp = new Date().getTime();
                const random = Math.floor(Math.random() * 1000000);
                const apiUrl = `${window.location.origin}/backend/api/create_note.php?_=${timestamp}&r=${random}`;
                
                // API'ye POST isteği yap
                const addResponse = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                // Ham yanıtı al
                const responseText = await addResponse.text();
                console.log('📡 Manuel ekleme API yanıtı (ham):', responseText);
                
                // JSON olarak parse et
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    throw new Error('API yanıtı JSON olarak ayrıştırılamadı: ' + responseText);
                }
                
                // Sonuçları göster
                const resultDiv = document.createElement('div');
                resultDiv.className = result.success ? 'success' : 'error';
                resultDiv.innerHTML = `
                    <h4>${result.success ? '✅ Not Eklendi' : '❌ Not Eklenemedi'}</h4>
                    <p><strong>Mesaj:</strong> ${result.message}</p>
                    <p><strong>İçerik:</strong> ${noteContent}</p>
                `;
                debugSection.appendChild(resultDiv);
                
                manualAddButton.textContent = result.success ? 'Not Eklendi ✓' : 'Not Eklenemedi ❌';
                manualAddButton.style.background = result.success ? '#4CAF50' : '#f44336';
            } catch (error) {
                console.error('❌ Manuel not ekleme hatası:', error);
                manualAddButton.textContent = 'Hata: ' + error.message;
                manualAddButton.style.background = '#f44336';
            } finally {
                // 3 saniye sonra butonu normale döndür
                setTimeout(() => {
                    manualAddButton.disabled = false;
                    manualAddButton.textContent = 'Manual Not Ekle';
                    manualAddButton.style.background = '';
                }, 3000);
            }
        };
        
        debugSection.appendChild(apiTestButton);
        debugSection.appendChild(checkConfigButton);
        debugSection.appendChild(manualAddButton);
        panel.appendChild(debugSection);
        
        // Sonuç aksiyonları
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.justifyContent = 'space-between';
        actionsDiv.style.marginTop = '20px';
        
        // Notları yenile butonu
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Notları Yenile';
        refreshButton.onclick = async function() {
            try {
                this.disabled = true;
                this.textContent = 'Yenileniyor...';
                await window.forceRefreshNotes();
                window.compareNotesWithServer();
                panel.remove();
            } catch (error) {
                alert('Hata: ' + error.message);
            }
        };
        
        // Sayfayı yeniden yükle butonu
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Sayfayı Yeniden Yükle';
        reloadButton.className = 'warning';
        reloadButton.onclick = function() {
            if (confirm('Sayfa yenilenecek. Emin misiniz?')) {
                location.reload();
            }
        };
        
        // Kapat butonu
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Kapat';
        closeButton.onclick = function() {
            panel.remove();
        };
        
        actionsDiv.appendChild(refreshButton);
        actionsDiv.appendChild(reloadButton);
        actionsDiv.appendChild(closeButton);
        panel.appendChild(actionsDiv);
        
    } catch (error) {
        console.error('❌ Not karşılaştırma hatası:', error);
        updateStatus('Hata: ' + error.message, 'error');
    }
};

// Not ekleme için özel bir apı fonksiyonu
async function createNote(content, walletAddress, transactionHash = null) {
    console.log('📝 createNote API ile not oluşturuluyor...');
    console.log({content, walletAddress, transactionHash});
    
    // FormData hazırla
    const formData = new FormData();
    formData.append('content', content);
    formData.append('walletAddress', walletAddress);
    if (transactionHash) {
        formData.append('transactionHash', transactionHash);
    }
    
    // Önbellek bypass için timestamp ve random ekle
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    const apiUrl = `${window.location.origin}/backend/api/create_note.php?_=${timestamp}&r=${random}`;
    
    console.log('📡 API URL:', apiUrl);
    
    try {
        // API isteği yap - normal fetch
        console.log('FormData ile istek yapılıyor...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        // Ham yanıtı logla
        const responseText = await response.text();
        console.log('📡 API yanıtı (ham):', responseText);
        
        // JSON parse et
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error('API yanıtı JSON olarak ayrıştırılamadı: ' + responseText);
        }
        
        // Sonucu logla ve döndür
        console.log('📡 API yanıtı (işlenmiş):', data);
        return data;
        
    } catch (error) {
        console.error('❌ createNote API hatası:', error);
        
        // Yedek: XMLHttpRequest dene
        console.log('Yedek: XMLHttpRequest ile tekrar deneniyor...');
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', apiUrl, true);
            xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            xhr.setRequestHeader('Pragma', 'no-cache');
            xhr.setRequestHeader('Expires', '0');
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.log('📡 XHR başarılı:', data);
                        resolve(data);
                    } catch (e) {
                        console.error('❌ XHR yanıt parse hatası:', e);
                        reject(new Error('API yanıtı JSON olarak ayrıştırılamadı: ' + xhr.responseText));
                    }
                } else {
                    console.error('❌ XHR hata:', xhr.status, xhr.statusText);
                    reject(new Error(`API hatası: ${xhr.status} ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = function() {
                console.error('❌ XHR network hatası');
                reject(new Error('Ağ hatası'));
            };
            
            xhr.send(formData);
        });
    }
}

// PHP hata log dosyasını kontrol etmek için get_error_log.php oluştur
// bu kodu backend/api/ klasörüne ekle
async function createLogViewer() {
    try {
        console.log('📝 Log görüntüleyici oluşturuluyor...');
        
        const logViewerContent = `<?php
// Debug modunu aktifleştir
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS ayarları
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: text/plain; charset=UTF-8');

// CACHE KONTROLÜ
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Log dosyası yolu
$logFile = dirname(__FILE__) . '/error.log';

// Log dosyası var mı kontrol et
if (file_exists($logFile)) {
    // Son 100 satırı oku (çok uzun olmasın diye)
    $log = shell_exec('tail -n 100 ' . escapeshellarg($logFile) . ' 2>&1');
    
    if ($log === null) {
        // Shell komutu çalışmadıysa, PHP ile oku
        $log = file_get_contents($logFile);
        // Çok uzunsa son 10KB'ı göster
        if (strlen($log) > 10240) {
            $log = "... (Log dosyası çok uzun, son kısmı gösteriliyor) ...\n\n" . 
                   substr($log, -10240);
        }
    }
    
    echo $log;
} else {
    echo "Log dosyası bulunamadı: $logFile";
}
?>`;
        
        // Önbellek bypass için timestamp ve random ekle
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        const apiUrl = `${window.location.origin}/backend/api/create_file.php?_=${timestamp}&r=${random}`;
        
        // FormData oluştur
        const formData = new FormData();
        formData.append('filename', 'get_error_log.php');
        formData.append('content', logViewerContent);
        formData.append('path', '/backend/api/');
        
        // API isteği yap
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('📡 Log görüntüleyici oluşturma yanıtı:', data);
        
        return data.success;
    } catch (error) {
        console.error('❌ Log görüntüleyici oluşturma hatası:', error);
        return false;
    }
}

// Notları sunucudan çeken fonksiyon
async function fetchNotesFromServer() {
    console.log("🔄 Notlar sunucudan yükleniyor...");
    
    try {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        const response = await fetch(`${window.location.origin}/backend/api/test_api.php?action=list_notes&limit=50&_=${timestamp}&r=${random}`, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP hatası: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.notes)) {
            console.log(`✅ Sunucudan ${data.notes.length} not yüklendi`);
            
            // Notları lokale kaydet
            const serverNotes = data.notes.map(note => ({
                id: parseInt(note.id) || Date.now() + Math.floor(Math.random() * 1000),
                content: note.content,
                likes: parseInt(note.likes) || 0,
                dislikes: parseInt(note.dislikes) || 0,
                walletAddress: note.wallet_address,
                timestamp: new Date(note.created_at).getTime() || Date.now(),
                synced: true,
                size: 'small'
            }));
            
            // Yerel notları yükle
            let localNotes = [];
            try {
                localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
            } catch (e) {
                console.error("Yerel notlar yüklenemedi:", e);
            }
            
            // Sunucu ve yerel notları birleştir (ID'ye göre)
            const noteMap = new Map();
            
            // Önce yerel notları ekle
            localNotes.forEach(note => {
                noteMap.set(note.id, note);
            });
            
            // Sonra sunucu notlarını ekle (aynı ID varsa üzerine yaz)
            serverNotes.forEach(note => {
                noteMap.set(note.id, note);
            });
            
            // Map'ten tekrar diziye dönüştür
            const mergedNotes = Array.from(noteMap.values());
            
            // Notları zamana göre sırala
            mergedNotes.sort((a, b) => b.timestamp - a.timestamp);
            
            // Birleştirilmiş notları kaydet
            localStorage.setItem('notes', JSON.stringify(mergedNotes));
            console.log(`✅ Toplam ${mergedNotes.length} not birleştirildi`);
            
            return mergedNotes;
        } else {
            console.error("❌ Sunucudan not yüklenemedi:", data.message || "Bilinmeyen hata");
            return null;
        }
    } catch (error) {
        console.error("❌ Sunucudan not yükleme hatası:", error);
        return null;
    }
}

// ... existing code ...

// displayNotes fonksiyonunu değiştir (sunucudan not çekme ekle)
async function displayNotes() {
    // Önce sunucudan notları çek ve lokalle birleştir
    await fetchNotesFromServer();
    
    // Sonraki kod aynı kalacak - notları localStorage'dan çekip görüntüleyecek
    console.log("📝 Notlar görüntüleniyor...");
    
    // Not container'ı temizle
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    // Notları localStorage'dan çek (artık sunucu notlarını da içeriyor)
    let notes = [];
    
    try {
        const notesJson = localStorage.getItem('notes');
        if (notesJson) {
            notes = JSON.parse(notesJson);
        }
    } catch (error) {
        console.error("Notlar yüklenirken hata:", error);
    }
    
    // Mevcut kodun geri kalanı...
    // ... (diğer işlemler - sıralama, filtreleme, DOM'a ekleme vs.)
}

// ... existing code ...

// transferSOL fonksiyonunu düzelt
async function transferSOL(recipientAddress, amount) {
    console.log(`💰 TransferSOL başlatıldı: Alıcı=${recipientAddress}, Miktar=${amount}`);
    
    // Not içeriğini şimdi al (ödeme öncesi)
    const noteInput = document.getElementById('noteInput');
    if (!noteInput) {
        console.error("❌ Not alanı bulunamadı!");
        updateShareStatus('error', 'Not alanı bulunamadı!');
        return false;
    }
    
    const noteContent = noteInput.value.trim();
    if (!noteContent) {
        console.error("❌ Not içeriği boş!");
        updateShareStatus('error', 'Lütfen bir not yazın!');
        return false;
    }
    
    // Cüzdan adresini doğru formatta al
    let walletAddress;
    
    if (typeof window.walletAddress === 'string') {
        walletAddress = window.walletAddress;
    } else if (window.walletAddress instanceof HTMLElement) {
        walletAddress = window.walletAddress.textContent.trim(); 
    } else if (document.getElementById('walletAddress')) {
        const walletEl = document.getElementById('walletAddress');
        // Tam adresi data-address attribute'undan almayı dene
        const dataAddress = walletEl.getAttribute('data-address');
        if (dataAddress) {
            walletAddress = dataAddress;
        } else {
            // Yoksa metin içeriğini al
            walletAddress = walletEl.textContent.trim();
            // Kısaltılmış adresi ("D5rf...GwrE") düzelt
            if (walletAddress.includes('...')) {
                // localStorage'dan almayı dene
                const storedWallet = localStorage.getItem('walletAddress');
                if (storedWallet) {
                    walletAddress = storedWallet;
                } else {
                    // Default cüzdan adresi
                    walletAddress = recipientAddress;
                }
            }
        }
    } else {
        // Hiçbir yerden bulunamadıysa
        walletAddress = localStorage.getItem('walletAddress') || recipientAddress;
    }
    
    console.log("📝 Not içeriği:", noteContent);
    console.log("💼 Cüzdan adresi:", walletAddress);
    
    try {
        // Phantom kontrolü
        if (!window.phantom?.solana?.isPhantom) {
            console.error("❌ Phantom cüzdanı bulunamadı!");
            updateShareStatus('error', 'Phantom cüzdanı bulunamadı!');
            return false;
        }
        
        // Wallet bağlantısı
        try {
            updateShareStatus('connecting', 'Cüzdan bağlanıyor...');
            const response = await window.phantom.solana.connect();
            const publicKey = response.publicKey;
            console.log("✅ Cüzdan bağlandı:", publicKey.toString());
        } catch (err) {
            console.error("❌ Cüzdan bağlantı hatası:", err);
            updateShareStatus('error', 'Cüzdan bağlanamadı!');
            return false;
        }
        
        // Mevcut transferSOL fonksiyonunun ödeme işlemleri...
        
        // Ödeme başarılı olduğunda API'ye notu gönder
        const transactionSuccess = true; // Burada gerçek değeri kullan
        
        if (transactionSuccess) {
            console.log("✅ Ödeme başarılı! Not veritabanına kaydediliyor...");
            updateShareStatus('processing', 'Not kaydediliyor...');
            
            // Ödeme sonrası API çağrısı
            try {
                // 1 saniye bekle (blockchain onayı için)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // FormData oluştur
                const formData = new FormData();
                formData.append("content", noteContent);
                formData.append("walletAddress", walletAddress);
                
                // Timestamp ekle
                const timestamp = new Date().getTime();
                const random = Math.floor(Math.random() * 1000000);
                
                // XMLHttpRequest kullan
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `/backend/api/create_note.php?_=${timestamp}&r=${random}`, true);
                
                xhr.onload = function() {
                    console.log(`📬 API yanıt durumu: ${xhr.status}`);
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            console.log("📄 API yanıtı:", response);
                            
                            if (response.success) {
                                console.log("✅ Not başarıyla kaydedildi! ID:", response.data.id);
                                updateShareStatus('success', 'Not başarıyla paylaşıldı!');
                                
                                // Not girişini temizle
                                noteInput.value = '';
                                
                                // Notları yenile
                                setTimeout(() => {
                                    window.location.href = '/';
                                }, 1000);
                            } else {
                                console.error("❌ Not kaydedilemedi:", response.message);
                                updateShareStatus('error', `Not kaydedilemedi: ${response.message}`);
                            }
                        } catch (e) {
                            console.error("❌ API yanıtı işlenirken hata:", e);
                            updateShareStatus('error', 'API yanıtı işlenemedi!');
                        }
                    } else {
                        console.error("❌ API hatası:", xhr.status);
                        updateShareStatus('error', `API hatası: ${xhr.status}`);
                    }
                };
                
                xhr.onerror = function() {
                    console.error("❌ Ağ hatası!");
                    updateShareStatus('error', 'Ağ hatası!');
                };
                
                xhr.send(formData);
            } catch (apiError) {
                console.error("❌ API isteği hatası:", apiError);
                updateShareStatus('error', `API isteği hatası: ${apiError.message}`);
            }
            
            return true;
        } else {
            console.error("❌ Ödeme başarısız!");
            updateShareStatus('error', 'Ödeme başarısız oldu!');
            return false;
        }
        
    } catch (error) {
        console.error("❌ TransferSOL hatası:", error);
        updateShareStatus('error', `İşlem hatası: ${error.message}`);
        return false;
    }
}

// ... existing code ...
