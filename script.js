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
const SOLANA_NETWORK = 'devnet'; // Test için devnet kullanıyoruz
const RECEIVER_ADDRESS = 'YOUR_RECEIVER_WALLET_ADDRESS'; // Buraya kendi cüzdan adresinizi yazın
const NOTE_COST = 0.01; // SOL cinsinden ücret

// Solana bağlantısını oluştur
let connection;
try {
  connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl(SOLANA_NETWORK),
    'confirmed'
  );
} catch (error) {
  console.error("Solana bağlantısı oluşturulamadı:", error);
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
      const existingNotes = [...notes]; // Örnek notların kopyasını al
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
    console.error("LocalStorage'dan veri yüklenirken hata:", error);
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
    console.error("LocalStorage'a veri kaydedilirken hata:", error);
  }
}

// Phantom cüzdan kontrolü
const getProvider = () => {
  try {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }
    // Phantom yüklü değilse uyarı göster
    alert('Lütfen Phantom cüzdan eklentisini yükleyin!');
    window.open('https://phantom.app/', '_blank');
    return null;
  } catch (error) {
    console.error("Phantom provider kontrolünde hata:", error);
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
    console.error("Cüzdan görünümü güncellenirken hata:", error);
  }
}

// Solana cüzdan bağlantısı
async function connectWallet() {
  try {
    const provider = getProvider();
    
    if (!provider) {
      return; // Provider yoksa fonksiyondan çık
    }

    // Eğer zaten bağlıysa
    if (walletAddress) {
      console.log('Cüzdan zaten bağlı');
      return;
    }

    const response = await provider.connect();
    walletAddress = response.publicKey.toString();
    updateWalletDisplay();
    updateShareFormVisibility();
    saveToLocalStorage();
    displayNotes();
    
  } catch (err) {
    console.error("Cüzdan bağlantısında hata:", err);
    alert('Cüzdan bağlantısı başarısız. Lütfen tekrar deneyin.');
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
    console.error("Cüzdan bağlantısı kesilirken hata:", error);
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

// Bölüm gösterme fonksiyonu
function showSection(sectionId) {
  try {
    document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
      
      // Share bölümü gösterildiğinde form görünürlüğünü güncelle
      if (sectionId === 'share') {
        updateShareFormVisibility();
      }
    }
  } catch (error) {
    console.error("Bölüm gösterilirken hata:", error);
  }
}

// Notları sıralama
function sortNotes(sortType) {
  try {
    const sortedNotes = [...notes]; // Notların kopyasını al
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

// SOL transfer işlemi
async function transferSOL(fromWallet, amount) {
  try {
    const provider = getProvider();
    if (!provider || !connection) return false;

    // Bakiye kontrolü
    const balance = await connection.getBalance(new solanaWeb3.PublicKey(fromWallet));
    const requiredBalance = amount * solanaWeb3.LAMPORTS_PER_SOL;
    
    if (balance < requiredBalance) {
      alert('Yetersiz bakiye! Lütfen cüzdanınıza SOL yükleyin.');
      return false;
    }

    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(fromWallet),
        toPubkey: new solanaWeb3.PublicKey(RECEIVER_ADDRESS),
        lamports: requiredBalance
      })
    );

    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new solanaWeb3.PublicKey(fromWallet);

    try {
      const signed = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      const confirmation = await connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }
      
      return true;
    } catch (err) {
      console.error("Transfer işlemi başarısız:", err);
      return false;
    }
  } catch (error) {
    console.error("SOL transfer sırasında hata:", error);
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
      notesList.innerHTML = '<p class="no-notes">Henüz hiç not paylaşılmamış.</p>';
      return;
    }

    visibleNotes.forEach((note) => {
      const noteDiv = document.createElement('div');
      noteDiv.className = `note ${note.size}`;

      const isVoted = votedNotes.has(note.id);
      const buttonsDisabled = !walletAddress || isVoted;

      noteDiv.innerHTML = `
        <p>${note.content}</p>
        <div class="note-buttons">
          <button class="like" onclick="vote(${note.id}, 'like')" ${buttonsDisabled ? 'disabled' : ''}>
            Like (${note.likes})
          </button>
          <button class="dislike" onclick="vote(${note.id}, 'dislike')" ${buttonsDisabled ? 'disabled' : ''}>
            Dislike (${note.dislikes})
          </button>
        </div>
      `;
      notesList.appendChild(noteDiv);
    });

    // Daha fazla yükle butonunu sadece 20 nottan sonra göster
    loadMoreBtn.style.display = notes.length > 20 && endIndex < notes.length ? 'block' : 'none';
  } catch (error) {
    console.error("Notlar görüntülenirken hata:", error);
  }
}

// Oy verme
function vote(noteId, voteType) {
  try {
    if (!walletAddress) {
      alert('Oy vermek için cüzdanınızı bağlamalısınız!');
      return;
    }

    if (votedNotes.has(noteId)) {
      alert('Bu nota zaten oy verdiniz!');
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
    console.error("Oy verme işlemi sırasında hata:", error);
  }
}

// Event Listener'ları ayarla
function setupEventListeners() {
  try {
    // Cüzdan bağlantı butonları
    connectWalletButton.addEventListener('click', connectWallet);
    disconnectWalletButton.addEventListener('click', disconnectWallet);

    // Cüzdan dropdown menüsü
    walletAddressDiv.addEventListener('click', (event) => {
      event.stopPropagation();
      walletDropdown.classList.toggle('active');
    });

    // Sayfa herhangi bir yerine tıklandığında dropdown'ı kapat
    document.addEventListener('click', (event) => {
      if (!walletDropdown.contains(event.target) && !walletAddressDiv.contains(event.target)) {
        walletDropdown.classList.remove('active');
      }
    });

    // Not paylaşma işlemi
    shareNoteButton.addEventListener('click', async () => {
      if (!walletAddress) {
        alert('Not paylaşmak için cüzdanınızı bağlamalısınız!');
        return;
      }

      const content = noteInput.value.trim();
      if (content.length === 0) {
        alert('Not boş olamaz!');
        return;
      }

      if (content.length > 280) {
        alert('Not 280 karakterden uzun olamaz!');
        return;
      }

      // Ödeme işlemini gerçekleştir
      const paymentSuccess = await transferSOL(walletAddress, NOTE_COST);
      
      if (!paymentSuccess) {
        alert('Ödeme başarısız. Lütfen tekrar deneyin.');
        return;
      }

      const newNote = {
        id: Date.now(),
        content: content,
        likes: 0,
        dislikes: 0,
        size: ["small", "medium", "tall"][Math.floor(Math.random() * 3)]
      };

      notes.unshift(newNote);
      noteInput.value = '';
      currentPage = 1;
      saveToLocalStorage();
      displayNotes();
      showSection('home');
      alert('Not başarıyla paylaşıldı!');
    });
  } catch (error) {
    console.error("Event listener'lar ayarlanırken hata:", error);
  }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Ana sayfayı göster
    showSection('home');
    
    // LocalStorage'dan verileri yükle
    loadFromLocalStorage();
    
    // Cüzdan durumunu güncelle
    updateWalletDisplay();
    updateShareFormVisibility();
    
    // Event listener'ları ayarla
    setupEventListeners();
    
    // Notları göster
    displayNotes();
  } catch (error) {
    console.error("Sayfa yüklenirken hata:", error);
  }
});
