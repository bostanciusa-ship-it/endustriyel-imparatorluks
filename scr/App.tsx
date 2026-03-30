import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [_c, _sc] = useState(100); 
  const [_p, _sp] = useState(0);   
  const [_ns, _sns] = useState<{id: number, text: string}[]>([]); 
  const [_isTaxing, _setIsTaxing] = useState(false); 
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); 
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number} | null>(null);

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
      } else if (type === 'tax') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
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
    _an("✈️ Uçak geçiyor, duba fırlatıldı!");
    setTimeout(() => {
      _setDuba({ id: Date.now(), x: Math.random() * 70 + 15, y: Math.random() * 60 + 20 });
    }, 1500);
    setTimeout(() => _setPlane(false), 4000);
    lastPlaneTime.current = Date.now();
  };

  const spawnNargile = () => {
    const id = Date.now();
    _setNargile({ id, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
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
      
      if (Math.random() < 0.12 && _c > 500) {
        _setIsTaxing(true);
        setTimeout(() => _setIsTaxing(false), 800);
        const tax = Math.floor((_c - cost) * 0.05);
        _sc(prev => prev - tax);
        playSound('tax');
        _an(`🚨 paranın % 5 i hayır kurumlarına verildi (şüpheli )`);
      } else {
        _an("Yatırım yapıldı!");
      }
    } else {
      _an("AKBİL YETERSİZ!"); 
    }
  };

  useEffect(() => {
    const _t = setInterval(() => {
      if (autoProdRate > 0) _sp(prev => (prev < storageLimit ? prev + autoProdRate : prev));
      _sc(prev => {
        if (_p >= 1) { _sp(p => p - 1); return prev + salePrice; }
        return prev;
      });

      if (Date.now() - lastNargileTime.current > 60000) spawnNargile();
      if (Date.now() - lastPlaneTime.current > 120000) spawnPlane();
    }, 1000);

    const _nChance = setInterval(() => {
        if (Math.random() < 0.15) spawnNargile();
    }, 10000);

    return () => { clearInterval(_t); clearInterval(_nChance); };
  }, [_p, autoProdRate, salePrice, storageLimit]);

  return (
    <div style={{ 
      color: 'white', padding: '20px', textAlign: 'center', 
      backgroundColor: _isTaxing ? '#2d0a0a' : '#0a0a0c', 
      transition: 'background-color 0.3s ease',
      minHeight: '100vh', fontFamily: 'sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      <h2>Endüstriyel İmparatorluk v3.6.1</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Kasa: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={() => {
        if (_p < storageLimit) { 
            const isBonus = Math.random() < 0.05;
            const finalGain = isBonus ? clickGain * 5 : clickGain;
            if(isBonus) _an("MAVİ AKBİL BASILDI! x5 Para!");
            _sc(prev => prev + finalGain); 
            _sp(prev => prev + 1); 
            playSound('click'); 
        } else { _an("DEPO DOLU!"); }
      }} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>

      {_plane && <div style={{ position: 'absolute', top: '10%', left: '-100px', fontSize: '3rem', animation: 'fly 4s linear forwards', zIndex: 50 }}>✈️</div>}

      {_duba && <div onClick={() => { _sc(prev => prev + 1); _setDuba(null); playSound('duba'); _an("⚓ 1$ toplandı. Fakirlik ayıp değil..."); }}
          style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, fontSize: '2rem', cursor: 'pointer', zIndex: 60, animation: 'bob 2s infinite' }}>⚓</div>}

      {_nargile && <div onClick={() => { _sc(prev => prev + 150); _setNargile(null); playSound('nargile'); }}
             style={{ position: 'absolute', left: `${_nargile.x}%`, top: `${_nargile.y}%`, padding: '10px 20px', backgroundColor: '#fbbf24', color: '#1a1a1a', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 20px #fbbf24', animation: 'pulse 1s infinite alternate' }}>🌬️ Nargile borusu</div>}

      <div style={{ maxWidth: '750px', margin: '30px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('clickPower', 150)} style={upgBtn}>🚀 Tık Gücü (Lv {_levels.clickPower})<br/><small>${Math.floor(150 * Math.pow(2.5, _levels.clickPower))}</small></button>
          <p style={descText}>daha sert bas</p>
        </div>
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('autoWorker', 600)} style={upgBtn}>🤖 İşçi (Lv {_levels.autoWorker})<br/><small>${Math.floor(600 * Math.pow(2.5, _levels.autoWorker))}</small></button>
          <p style={descText}>çok yavaş bir köle</p>
        </div>
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('marketing', 200)} style={upgBtn}>📈 Pazarlama (Lv {_levels.marketing})<br/><small>${Math.floor(200 * Math.pow(2.5, _levels.marketing))}</small></button>
          <p style={descText}>yalan söylemeyi öğren</p>
        </div>
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('factorySize', 400)} style={upgBtn}>🏗️ Depo (Lv {_levels.factorySize})<br/><small>${Math.floor(400 * Math.pow(2.5, _levels.factorySize))}</small></button>
          <p style={descText}>yer aç patron</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '0.8rem' }}>
        {_ns.map(n => <div key={n.id}>⚡ {n.text}</div>)}
      </div>

      <style>{`
        @keyframes fly { from { left: -15%; } to { left: 115%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', minWidth: '130px', border: '1px solid #333' };
const mainBtn = { padding: '25px 50px', fontSize: '1.4rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' };
const upgradeContainer = { display: 'flex', flexDirection: 'column' as any, alignItems: 'center' };
const upgBtn = { width: '100%', padding: '15px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '10px', cursor: 'pointer' };
const descText = { fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px', fontStyle: 'italic' };

export default App;
