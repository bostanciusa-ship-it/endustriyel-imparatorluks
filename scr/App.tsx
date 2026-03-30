import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [_c, _sc] = useState(100); 
  const [_p, _sp] = useState(0);   
  const [_ns, _sns] = useState<{id: number, text: string}[]>([]); 
  const [_isTaxing, _setIsTaxing] = useState(false); 
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); // Uçak geçiyor mu?
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number} | null>(null); // Düşen duba

  const lastNargileTime = useRef(Date.now());
  const lastPlaneTime = useRef(Date.now());

  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  const playSound = (type: 'click' | 'upgrade' | 'tax' | 'nargile' | 'plane' | 'duba') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
      } else if (type === 'nargile' || type === 'plane') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
      } else if (type === 'duba') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
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

  const spawnPlane = () => {
    _setPlane(true);
    playSound('plane');
    _an("✈️ Uçak geçiyor, duba bırakıldı!");
    
    // Uçak geçerken ortalarda bir yere duba bıraksın
    setTimeout(() => {
      const id = Date.now();
      _setDuba({ id, x: Math.random() * 70 + 15, y: Math.random() * 60 + 20 });
    }, 1500);

    // Uçak animasyonu bitince kaldır
    setTimeout(() => _setPlane(false), 4000);
    lastPlaneTime.current = Date.now();
  };

  const spawnNargile = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    const id = Date.now();
    _setNargile({ id, x, y });
    playSound('nargile'); 
    lastNargileTime.current = Date.now();
    setTimeout(() => {
        _setNargile(prev => prev?.id === id ? null : prev);
    }, 5000);
  };

  const buyUpgrade = (type: keyof typeof _levels, baseCost: number) => {
    const cost = Math.floor(baseCost * Math.pow(2.5, _levels[type]));
    if (_c >= cost) {
      playSound('upgrade');
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      _an("Yatırım yapıldı!");
    } else {
      _an("AKBİL YETERSİZ!"); 
    }
  };

  useEffect(() => {
    const _t = setInterval(() => {
      // Üretim ve Satış
      if (autoProdRate > 0) _sp(prev => (prev < storageLimit ? prev + autoProdRate : prev));
      _sc(prev => {
        if (_p >= 1) { _sp(p => p - 1); return prev + salePrice; }
        return prev;
      });

      // GARANTİ NARGİLE (1 dk)
      if (Date.now() - lastNargileTime.current > 60000) spawnNargile();

      // GARANTİ UÇAK (2 dk = 120000 ms)
      if (Date.now() - lastPlaneTime.current > 120000) spawnPlane();

    }, 1000);

    return () => clearInterval(_t);
  }, [_p, autoProdRate, salePrice, storageLimit]);

  return (
    <div style={{ 
      color: 'white', padding: '20px', textAlign: 'center', 
      backgroundColor: '#0a0a0c', minHeight: '100vh', fontFamily: 'sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      <h2>Endüstriyel İmparatorluk v3.6</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Kasa: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={() => {
        if (_p < storageLimit) { _sc(prev => prev + clickGain); _sp(prev => prev + 1); playSound('click'); }
      }} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>

      {/* UÇAK ANİMASYONU */}
      {_plane && (
        <div style={{
          position: 'absolute', top: '10%', left: '-100px', fontSize: '3rem',
          animation: 'fly 4s linear forwards', zIndex: 50
        }}>✈️</div>
      )}

      {/* DUBA */}
      {_duba && (
        <div 
          onClick={() => { _sc(prev => prev + 1); _setDuba(null); playSound('duba'); _an("⚓ 1$ toplandı. Fakirlik ayıp değil..."); }}
          style={{
            position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`,
            fontSize: '2rem', cursor: 'pointer', zIndex: 60, animation: 'bob 2s infinite'
          }}
        >⚓</div>
      )}

      {/* NARGİLE */}
      {_nargile && (
        <div onClick={() => { _sc(prev => prev + 150); _setNargile(null); playSound('nargile'); }}
             style={{ position: 'absolute', left: `${_nargile.x}%`, top: `${_nargile.y}%`, padding: '10px 20px', backgroundColor: '#fbbf24', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
          🌬️ Nargile borusu
        </div>
      )}

      <div style={{ maxWidth: '600px', margin: '30px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button onClick={() => buyUpgrade('autoWorker', 600)} style={upgBtn}>🤖 İşçi (Lv {_levels.autoWorker})<br/><small>çok yavaş bir köle</small></button>
        <button onClick={() => buyUpgrade('factorySize', 400)} style={upgBtn}>🏗️ Depo (Lv {_levels.factorySize})<br/><small>yer aç patron</small></button>
      </div>

      <div style={{ marginTop: '20px', color: '#6b7280' }}>
        {_ns.map(n => <div key={n.id}>⚡ {n.text}</div>)}
      </div>

      <style>{`
        @keyframes fly { from { left: -10%; } to { left: 110%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}

const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', minWidth: '120px' };
const mainBtn = { padding: '20px 40px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const upgBtn = { padding: '15px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '10px', cursor: 'pointer' };

export default App;
