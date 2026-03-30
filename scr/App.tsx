import React, { useState, useEffect } from 'react';

function App() {
  const [_c, _sc] = useState(100); 
  const [_p, _sp] = useState(0);   
  const [_tp, _stp] = useState(0); 
  const [_ns, _sns] = useState([]); 
  const [_isTaxing, _setIsTaxing] = useState(false); 
  
  // Nargile Borusu Durumları
  const [_nargile, _setNargile] = useState(null); // { id: number, x: number, y: number }

  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  const playSound = (type: 'click' | 'upgrade' | 'tax' | 'nargile') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
      } else if (type === 'tax') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
      } else if (type === 'nargile') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
      }
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.2; 
  const salePrice = 5 + (_levels.marketing * 3); 
  const storageLimit = _levels.factorySize * 30; 

  const _an = (msg: string) => {
    _sns(prev => [...prev.slice(-3), { id: Date.now(), text: msg }]);
  };

  const _hmp = () => {
    if (_p < storageLimit) {
      const isBonus = Math.random() < 0.05;
      const finalGain = isBonus ? clickGain * 5 : clickGain;
      playSound('click');
      if(isBonus) _an("MAVİ AKBİL BASILDI! x5 Kazanıldı!");
      _sp(prev => prev + 1);
      _stp(prev => prev + 1);
      _sc(prev => prev + finalGain);
    } else {
      _an("DEPO DOLU!");
    }
  };

  const buyUpgrade = (type: keyof typeof _levels, baseCost: number) => {
    const cost = Math.floor(baseCost * Math.pow(2.5, _levels[type]));
    if (_c >= cost) {
      playSound('upgrade');
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      
      if (Math.random() < 0.12 && _c > 500) {
        _setIsTaxing(true);
        setTimeout(() => _setIsTaxing(false), 800);
        const currentMoney = _c - cost;
        const tax = Math.floor(currentMoney * 0.05);
        _sc(prev => prev - tax);
        playSound('tax');
        _an(`🚨 paranın % 5 i hayır kurumlarına verildi (şüpheli )`);
      } else {
        _an("Geliştirme tamamlandı!");
      }
    } else {
      _an("Akbil yetersiz!!"); 
    }
  };

  // Nargile Borusu Tıklama Fonksiyonu
  const _handleNargileClick = () => {
    if (_nargile) {
      playSound('nargile');
      // 50 ile 200 arasında rastgele para
      const gained = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
      _sc(prev => prev + gained);
      _an(`🌬️ Nargile Borusu! +${gained}$ köz getirildi!`);
      _setNargile(null); // Tıklayınca kaybolsun
    }
  };

  const _se = async () => {
    const message = `🚀 Endüstriyel İmparatorluk'ta $${_c.toLocaleString()} sermayeye ulaştım!`;
    if (navigator.share) {
      await navigator.share({ title: 'Skorum', text: message }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message);
      _an("Kopyalandı!");
    }
  };

  useEffect(() => {
    const _t = setInterval(() => {
      if (autoProdRate > 0) {
        _sp(prev => (prev < storageLimit ? prev + autoProdRate : prev));
      }
      _sc(prev => {
        if (_p >= 1) {
          _sp(p => p - 1);
          return prev + salePrice;
        }
        return prev;
      });
    }, 1000);

    // MUZİPLİK: Nargile Borusu Belirme Döngüsü
    const _nargileInterval = setInterval(() => {
      // %15 ihtimalle belirsin
      if (Math.random() < 0.15) {
        // Rastgele pozisyon (ekranın içinde kalacak şekilde)
        const x = Math.random() * 80 + 10; // %10 ile %90 arası
        const y = Math.random() * 80 + 10; // %10 ile %90 arası
        const id = Date.now();
        _setNargile({ id, x, y });

        // 5 saniye sonra kaybolsun (eğer tıklanmazsa)
        setTimeout(() => {
            _setNargile(prev => prev?.id === id ? null : prev);
        }, 5000);
      }
    }, 10000); // Her 10 saniyede bir kontrol et

    return () => {
        clearInterval(_t);
        clearInterval(_nargileInterval);
    };
  }, [_p, autoProdRate, salePrice, storageLimit]);

  return (
    <div style={{ 
      color: 'white', padding: '20px', textAlign: 'center', 
      backgroundColor: _isTaxing ? '#2d0a0a' : '#0a0a0c', 
      transition: 'background-color 0.3s ease',
      minHeight: '100vh', fontFamily: 'sans-serif',
      position: 'relative' // Nargile borusunu konumlandırmak için
    }}>
      <h2 style={{ color: _isTaxing ? '#ff4d4d' : '#3b82f6' }}>
        Endüstriyel İmparatorluk {_c > 10000 ? '💰👑🌬️' : 'v2.99'}
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Cepteki Para: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={_hmp} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>
      <button onClick={_se} style={shareBtn}>🚀 PAYLAŞ</button>

      <h3 style={{marginTop: '30px', color: '#9ca3af'}}>Yatırımlar</h3>
      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('clickPower', 150)} style={upgBtn}>
            🚀 Tık Gücü (Lv {_levels.clickPower})<br/>
            <small>${Math.floor(150 * Math.pow(2.5, _levels.clickPower))}</small>
          </button>
          <p style={descText}>Tıklama kazancını katlar.</p>
        </div>

        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('autoWorker', 600)} style={upgBtn}>
            🤖 Otomatik İşçi (Lv {_levels.autoWorker})<br/>
            <small>${Math.floor(600 * Math.pow(2.5, _levels.autoWorker))}</small>
          </button>
          <p style={descText}>çok yavaş bir köle</p>
        </div>

        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('marketing', 200)} style={upgBtn}>
            📈 Pazarlama (Lv {_levels.marketing})<br/>
            <small>${Math.floor(200 * Math.pow(2.5, _levels.marketing))}</small>
          </button>
          <p style={descText}>Satış fiyatını +3$ artırır.</p>
        </div>

        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('factorySize', 400)} style={upgBtn}>
            🏗️ Depo Büyüt (Lv {_levels.factorySize})<br/>
            <small>${Math.floor(400 * Math.pow(2.5, _levels.factorySize))}</small>
          </button>
          <p style={descText}>Stok kapasitesini +30 artırır.</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', color: '#6b7280', fontSize: '0.8rem' }}>
        {_ns.map(n => <div key={n.id} style={{ color: n.text.includes('şüpheli') ? '#ff4d4d' : '#6b7280' }}>⚡ {n.text}</div>)}
      </div>

      {/* MUZİPLİK: Nargile Borusu Görseli (CSS ile konumlandırma) */}
      {_nargile && (
          <div
            onClick={_handleNargileClick}
            style={{
                position: 'absolute',
                left: `${_nargile.x}%`,
                top: `${_nargile.y}%`,
                padding: '10px 15px',
                backgroundColor: 'rgba(251, 191, 36, 0.9)', // Hafif şeffaf sarı
                color: '#1a1a1a',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'transform 0.1s ease', // Tıklama efekti için
                animation: 'pulse 1s infinite alternate', // Hafif parlama animasyonu
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🌬️ Nargile borusu
          </div>
      )}

      {/* CSS Animasyonu (püskürtme efekti) */}
      <style>{`
        @keyframes pulse {
            from { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
            to { box-shadow: 0 0 15px rgba(251, 191, 36, 1); }
        }
      `}</style>

    </div>
  );
}

const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', border: '1px solid #333', minWidth: '120px' };
const mainBtn = { padding: '20px 40px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', margin: '10px' };
const shareBtn = { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const upgradeContainer = { display: 'flex', flexDirection: 'column' as any, alignItems: 'center' };
const upgBtn = { width: '100%', padding: '12px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer' };
const descText = { fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px', fontStyle: 'italic' };

export default App;