// Buffer ve Web3.js kontrolü
if (typeof window !== 'undefined' && !window.Buffer) {
  console.error('Buffer is not defined!');
}

if (typeof solanaWeb3 === 'undefined') {
  console.error('Solana Web3 could not be loaded!');
}

// Test için konsol logları
console.log('Script initializing...');
console.log('Buffer check:', typeof window.Buffer);
console.log('Web3 check:', typeof solanaWeb3);

// HTML elemanlarını seç
const connectWalletButton = document.getElementById('connectWallet');
const walletAddressDiv = document.getElementById('walletAddress');
const noteInput = document.getElementById('noteInput');
const shareNoteButton = document.getElementById('shareNote');
const notesList = document.getElementById('notesList');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const shareForm = document.getElementById('shareForm');
const walletWarning = document.getElementById('walletWarning');
const walletDropdown = document.querySelector('.wallet-dropdown');
const disconnectWalletButton = document.getElementById('disconnectWallet');

// Test için element kontrolü
console.log('HTML elements loaded:', {
  connectWalletButton: !!connectWalletButton,
  walletAddressDiv: !!walletAddressDiv,
  noteInput: !!noteInput,
  shareNoteButton: !!shareNoteButton,
  notesList: !!notesList
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

// Solana bağlantı ve transfer ayarları
const SOLANA_NETWORK = 'mainnet-beta';
const RECEIVER_ADDRESS = 'D5rfpoAKzdZdSrEqzSsEeYYkbiS19BrZmBRGAyQ1GwrE';
const NOTE_COST = 0.01;

// Public RPC endpoints
const RPC_ENDPOINTS = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/solana'
];

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
        if (!window.solana || !window.solana.isPhantom) {
            alert('Lütfen Phantom cüzdanını yükleyin!');
            window.open('https://phantom.app/', '_blank');
            return;
        }

        const connection = await initializeSolanaConnection();
        console.log('Solana bağlantısı kuruldu');

        const resp = await window.solana.connect();
        walletAddress = resp.publicKey.toString();
        console.log('Cüzdan bağlandı:', walletAddress);

        updateWalletDisplay();
        updateShareFormVisibility();
        
        // Bakiye kontrolü
        const balance = await connection.getBalance(resp.publicKey);
        console.log('Cüzdan bakiyesi:', balance / solanaWeb3.LAMPORTS_PER_SOL, 'SOL');
        
    } catch (error) {
        console.error('Cüzdan bağlantı hatası:', error);
        alert('Cüzdan bağlantısında hata: ' + error.message);
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
      connectWalletButton.style.display = 'none';
      walletDropdown.style.display = 'block';
      walletAddressDiv.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
    } else {
      connectWalletButton.style.display = 'block';
      walletDropdown.style.display = 'none';
      walletAddressDiv.textContent = '';
    }
  } catch (error) {
    console.error("Error updating wallet display:", error);
  }
}

// Admin ayarları
const ADMIN_WALLET = '5W9VDUNTXWmmpCfZz5ZPi5tWZ8GyANuHbvjgv2jvKypX'; // Admin cüzdan adresi

// Admin kontrolü
function isAdmin() {
  console.log('Checking admin status...');
  console.log('Connected wallet:', walletAddress);
  console.log('Admin wallet:', ADMIN_WALLET);
  return walletAddress === ADMIN_WALLET;
}

// Bölüm gösterme fonksiyonu
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
    walletDropdown.classList.remove('active');
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}

// Share form görünürlüğünü güncelle
function updateShareFormVisibility() {
  try {
    if (walletAddress) {
      shareForm.style.display = 'block';
      walletWarning.style.display = 'none';
    } else {
      shareForm.style.display = 'none';
      walletWarning.style.display = 'block';
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

      // Bağlantı kontrolü
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

// SOL transfer işlemi
async function transferSOL(fromWallet, amount) {
  try {
      console.log('Starting transfer...', { fromWallet, amount });
      
      const provider = getProvider();
      if (!provider) {
          throw new Error('Phantom wallet connection not found');
      }

      // Basit bağlantı kontrolü
      try {
          await provider.request({ method: "connect" });
      } catch (connError) {
          console.error('Wallet connection error:', connError);
          throw new Error('Failed to establish wallet connection. Please make sure your Phantom wallet is connected.');
      }

      if (!connection) {
          const connected = await createConnection();
          if (!connected) {
              throw new Error('Failed to establish network connection');
          }
      }

      const isSafe = await checkTransactionSafety(fromWallet, amount);
      if (!isSafe) {
          return false;
      }

      console.log('Preparing transaction...');
      const fromPubkey = new solanaWeb3.PublicKey(fromWallet);
      const toPubkey = new solanaWeb3.PublicKey(RECEIVER_ADDRESS);
      const lamports = Math.floor(amount * solanaWeb3.LAMPORTS_PER_SOL);

      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
          try {
              console.log('Getting blockhash...');
              const { blockhash } = await connection.getLatestBlockhash('confirmed');
              
              const transaction = new solanaWeb3.Transaction().add(
                  solanaWeb3.SystemProgram.transfer({
                      fromPubkey,
                      toPubkey,
                      lamports
                  })
              );

              transaction.recentBlockhash = blockhash;
              transaction.feePayer = fromPubkey;

              console.log('Signing transaction...');
              const signed = await provider.signTransaction(transaction);
              
              console.log('Serializing transaction...');
              const serializedTransaction = signed.serialize();
              
              console.log('Sending transaction...');
              const signature = await connection.sendRawTransaction(serializedTransaction, {
                  skipPreflight: false,
                  maxRetries: 5,
                  preflightCommitment: 'confirmed'
              });
              
              console.log('Waiting for confirmation...');
              const confirmation = await connection.confirmTransaction(signature, 'confirmed');
              
              if (confirmation.value.err) {
                  throw new Error('Transaction not confirmed: ' + JSON.stringify(confirmation.value.err));
              }

              console.log('Transaction successful:', signature);
              return true;

          } catch (err) {
              console.error(`Transaction error (${retryCount + 1}):`, err);
              
              if (err.message.includes('block height exceeded') || err.message.includes('blockhash not found')) {
                  console.log('Transaction timed out, retrying...');
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  continue;
              }
              
              if (err.message.includes('403') || err.message.includes('429')) {
                  console.log('RPC error, trying alternative endpoint...');
                  currentEndpointIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
                  await createConnection();
              } else {
                  throw err;
              }
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }

      throw new Error('Maximum retry attempts reached');

  } catch (error) {
      console.error("Error during SOL transfer:", error);
      alert('Transfer error: ' + error.message);
      return false;
  }
}

// Notları gösterme
function displayNotes() {
  try {
    notesList.innerHTML = '';
    const startIndex = 0;
    const endIndex = currentPage * notesPerPage;
    const visibleNotes = notes.slice(startIndex, endIndex);
    
    if (visibleNotes.length === 0) {
      notesList.innerHTML = '<p class="no-notes">Henüz hiç not paylaşılmadı.</p>';
      return;
    }

    visibleNotes.forEach((note) => {
      const noteElement = document.createElement('div');
      noteElement.className = `note ${note.size}`;
      
      const isVoted = votedNotes.has(note.id);
      const buttonsDisabled = !walletAddress || isVoted;
      const isAdminUser = isAdmin();
      
      noteElement.innerHTML = `
        <p>${note.content}</p>
        <div class="note-buttons">
          <button class="like" onclick="vote(${note.id}, 'like')" ${buttonsDisabled ? 'disabled' : ''}>
            Like (${note.likes})
          </button>
          <button class="dislike" onclick="vote(${note.id}, 'dislike')" ${buttonsDisabled ? 'disabled' : ''}>
            Dislike (${note.dislikes})
          </button>
        </div>
        <div class="wallet-address-display ${isAdminUser ? 'admin' : ''}">
          <span class="short-address">${shortenAddress(note.walletAddress || '')}</span>
          ${isAdminUser ? `<span class="full-address">${note.walletAddress || ''}</span>` : ''}
        </div>
      `;
      
      notesList.appendChild(noteElement);
    });
    
    loadMoreBtn.style.display = notes.length > notesPerPage && endIndex < notes.length ? 'block' : 'none';

    // Admin panelini göster
    if (isAdmin()) {
      showAdminPanel();
    }
  } catch (error) {
    console.error("Notlar gösterilirken hata:", error);
  }
}

// Oy verme
function vote(noteId, voteType) {
  try {
    if (!walletAddress) {
      alert('Please connect your wallet to vote!');
      return;
    }

    if (votedNotes.has(noteId)) {
      alert('You have already voted for this note!');
      return;
    }

    const note = notes.find((n) => n.id === noteId);
    if (note) {
      if (voteType === 'like') note.likes += 1;
      else if (voteType === 'dislike') note.dislikes += 1;

      votedNotes.add(noteId);
      saveToLocalStorage();
      displayNotes();
    }
  } catch (error) {
    console.error("Error during voting process:", error);
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
        footer.textContent = '© 2024 Not Paylaşım Platformu. Tüm hakları saklıdır.';
    }
}

// API URL'sini güncelle
const API_URL = 'https://walletnotes.net/backend/api';

// Not paylaşma fonksiyonu
async function handleShareNote(event) {
    event.preventDefault();
    console.log('=== TEST: Not Paylaşma İşlemi Başladı ===');
    
    try {
        // Cüzdan kontrolü
        if (!walletAddress) {
            throw new Error('Lütfen önce cüzdanınızı bağlayın!');
        }

        const content = noteInput.value.trim();
        console.log('TEST: Not içeriği:', content);
        
        // İçerik kontrolü
        if (!content) {
            throw new Error('Not boş olamaz!');
        }
        if (content.length > 280) {
            throw new Error('Not 280 karakterden uzun olamaz!');
        }

        // Önce ödeme işlemini yap
        console.log('TEST: Ödeme işlemi başlatılıyor...');
        const paymentSuccess = await transferSOL(walletAddress, NOTE_COST);
        console.log('TEST: Ödeme durumu:', paymentSuccess);
        
        if (!paymentSuccess) {
            throw new Error('Ödeme işlemi başarısız oldu');
        }

        // API isteği için veriyi hazırla
        const requestData = {
            content: content,
            walletAddress: walletAddress
        };
        console.log('TEST: Gönderilecek veri:', JSON.stringify(requestData, null, 2));

        // API isteğini yap
        console.log('TEST: API isteği yapılıyor...');
        const response = await fetch(`${API_URL}/create_note.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify(requestData)
        });

        console.log('TEST: API yanıt durumu:', response.status);
        const responseText = await response.text();
        console.log('TEST: API ham yanıtı:', responseText);

        // JSON parse
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('TEST: API JSON yanıtı:', result);
        } catch (e) {
            console.error('TEST: JSON parse hatası:', e);
            throw new Error('Sunucudan geçersiz yanıt alındı: ' + responseText);
        }

        // Hata kontrolü
        if (!result.success) {
            throw new Error(result.message || 'Not oluşturulurken bir hata oluştu');
        }

        // Başarılı işlem
        console.log('TEST: Not başarıyla oluşturuldu:', result);

        // Notu listeye ekle
        const newNote = {
            id: result.note.id,
            content: content,
            walletAddress: walletAddress,
            likes: 0,
            dislikes: 0,
            created_at: result.note.created_at
        };

        console.log('TEST: Yeni not objesi:', newNote);

        notes.unshift(newNote);
        saveToLocalStorage();
        displayNotes();
        noteInput.value = '';

        alert('Notunuz başarıyla paylaşıldı!');

    } catch (error) {
        console.error('TEST: Not paylaşma hatası:', error);
        alert('Hata: ' + error.message);
        
        // Hata detaylarını logla
        console.error('TEST: Hata detayları:', {
            message: error.message,
            stack: error.stack
        });
    }
}

// Event listener'ları ekle
document.addEventListener('DOMContentLoaded', () => {
  try {
      console.log('Sayfa yüklendi, event listener\'lar ekleniyor...');
      
      // Share Note butonu için event listener
      if (shareNoteButton) {
          console.log('Share Note butonu bulundu, event listener ekleniyor...');
          shareNoteButton.removeEventListener('click', handleShareNote);
          shareNoteButton.addEventListener('click', handleShareNote);
          console.log('Share Note butonu için event listener eklendi');
      } else {
          console.error('Share Note butonu bulunamadı!');
      }

      // Share form için event listener
      if (shareForm) {
          console.log('Share form bulundu, event listener ekleniyor...');
          shareForm.removeEventListener('submit', handleShareNote);
          shareForm.addEventListener('submit', handleShareNote);
          console.log('Share form için event listener eklendi');
      }

      // Cüzdan bağlantı butonları için event listener'lar
      if (connectWalletButton) {
          connectWalletButton.addEventListener('click', connectWallet);
      }
      if (disconnectWalletButton) {
          disconnectWalletButton.addEventListener('click', disconnectWallet);
      }

      // LocalStorage'dan verileri yükle
      loadFromLocalStorage();
      
      // Cüzdan görünümünü güncelle
      updateWalletDisplay();
      
      // Form görünürlüğünü güncelle
      updateShareFormVisibility();
      
      // Ana sayfayı göster
      showSection('home');
      
      // Notları göster
      displayNotes();
      
      console.log('Başlangıç işlemleri tamamlandı');
  } catch (error) {
      console.error("Sayfa yüklenirken hata:", error);
  }
});

// Cüzdan dropdown menüsünü aç/kapa
walletAddressDiv.addEventListener('click', () => {
  walletDropdown.classList.toggle('active');
});

// Sayfa herhangi bir yerine tıklandığında dropdown'ı kapat
document.addEventListener('click', (event) => {
  if (!walletDropdown.contains(event.target) && !walletAddressDiv.contains(event.target)) {
    walletDropdown.classList.remove('active');
  }
});
