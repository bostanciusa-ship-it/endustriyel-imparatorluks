import React, { useState, useEffect, useRef } from 'react';

// FOTOĞRAFI YAZI FORMATINDA (BASE64) KODUN İÇİNE GÖMDÜM. 
// ARTIK LİNK PATLAMA DERDİ BİTTİ PATRON!
const DUBA_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABCCAYAAAAOq78DAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIQSURBVGhD7ZmxSgNREEXXIKKgpYVpUuTf29rYWFvYWPgFNoKNhV9gYWFpYalgaWEp6Ofszm6yO8nuxmRhc88D97079+7O6yY77800GCHEYDBCiMFghBCD4R9CptNpfH1+p9NpUqXatvYatC37FpIkSRL/P98HhT9kYQ8yGo1O96u88Ics7EEMBiOEGKwqX8O4DAbDB6sa3OIn6xqcqurY7v6uBieUatvYtmVvW/b7vLqYyWQSX/X8Lp8X/pCHPUjX9Tf6fWf8IQt7EIPBCCEGgxFCDEYIMRiMEGAwGCHEYDAajBBiMBiMEGAwGCHEYDAajBBiMBghxGAwGCHEYDBCCDEYjBBisKp+D/GIn6xqcKqqY7v7uxqcUNuxbWzbSrcve9uy3+fVp6Gv18+LP2RhD9J13U99PzP+kIU9iMFghBCDwaq29mI97K6116Btrb2YyWQSv776G/288Ics7EG6rrtR3zvjD1nYgxgMRggxWKpU29Zeg7Zl30KSJEni/+/8UPhDFvYgo9Ho9PDy6/v9C/+vEPiEwCcEPiHwCYFPCHxC4BMCN7/AmZmfwCcEPiHwCYFPCHxC4BMCN78InxCCnxCCnxCCnxCCnxCCnxD4hMDnl8DPCN97vff6ePH9hMAvAZ8Q+ITAP4S8vL4S8AmBTwj6fVf8EAL/A4FfFfAJgc8fP/L90D6EEOIDVv8A69vMOf+p72wAAAAASUVORK5CYII=";

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

  const getCost = (type: keyof typeof _levels, base: number) => Math.floor(base * Math.pow(2.5, _levels[type]));
  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.2; 
  const salePrice = 5 + (_levels.marketing * 3); 
  const storageLimit = _levels.factorySize * 30; 

  const _an = (msg: string) => {
    _sns(prev => [...prev.slice(-3), { id: Date.now(), text: msg }]);
  };

  const spawnPlane = () => {
    _setPlane(true);
    _an("✈️ Uçak geçiyor, lojistik kargo bırakıldı!");
    setTimeout(() => {
      _setDuba({ id: Date.now(), x: Math.random() * 70 + 15, y: Math.random() * 60 + 20 });
    }, 1500);
    setTimeout(() => _setPlane(false), 4000);
    lastPlaneTime.current = Date.now();
  };

  const spawnNargile = () => {
    const id = Date.now();
    _setNargile({ id, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
    lastNargileTime.current = Date.now();
    _an("🌬️ Nargile borusu belirdi!");
    setTimeout(() => _setNargile(prev => prev?.id === id ? null : prev), 5000);
  };

  const buyUpgrade = (type: keyof typeof _levels, baseCost: number) => {
    const cost = getCost(type, baseCost);
    if (_c >= cost) {
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      if (Math.random() < 0.12 && _c > 500) {
        _setIsTaxing(true);
        setTimeout(() => _setIsTaxing(false), 800);
        _sc(prev => prev - Math.floor(prev * 0.05));
        _an(`🚨 Şüpheli para transferi tespit edildi!`);
      } else {
        _an("Yatırım yapıldı patron!");
      }
    } else {
      _an("KASADA PARA YOK!"); 
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
    return () => clearInterval(_t);
  }, [_p, autoProdRate, salePrice, storageLimit]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: _isTaxing ? '#2d0a0a' : '#0a0a0c', transition: 'background-color 0.3s ease', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk v3.6.5 🚧</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Kasa: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={() => { if (_p < storageLimit) { _sc(prev => prev + clickGain); _sp(prev => prev + 1); } }} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>

      {_plane && <div style={{ position: 'absolute', top: '10%', left: '-100px', fontSize: '3rem', animation: 'fly 4s linear forwards', zIndex: 50 }}>✈️</div>}

      {/* GÖMÜLÜ FOTOĞRAFLI DUBA */}
      {_duba && (
        <img 
          src={DUBA_BASE64} 
          alt="Koni"
          onClick={() => { _sc(prev => prev + 1); _setDuba(null); _an("🚧 +1$ Koni toplandı."); }}
          style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, width: '60px', height: 'auto', cursor: 'pointer', zIndex: 60, animation: 'bob 2s infinite' }} 
        />
      )}

      {_nargile && <div onClick={() => { _sc(prev => prev + 150); _setNargile(null); }} style={{ position: 'absolute', left: `${_nargile.x}%`, top: `${_nargile.y}%`, padding: '10px 20px', backgroundColor: '#fbbf24', color: '#1a1a1a', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', animation: 'pulse 1s infinite alternate' }}>🌬️ Nargile</div>}

      <div style={{ maxWidth: '750px', margin: '30px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button onClick={() => buyUpgrade('clickPower', 150)} style={upgBtn}>🚀 Tık Gücü (Lv {_levels.clickPower})<br/><span style={{color: '#4ade80'}}>${getCost('clickPower', 150)}</span></button>
        <button onClick={() => buyUpgrade('autoWorker', 600)} style={upgBtn}>🤖 İşçi (Lv {_levels.autoWorker})<br/><span style={{color: '#4ade80'}}>${getCost('autoWorker', 600)}</span></button>
        <button onClick={() => buyUpgrade('marketing', 200)} style={upgBtn}>📈 Pazarlama (Lv {_levels.marketing})<br/><span style={{color: '#4ade80'}}>${getCost('marketing', 200)}</span></button>
        <button onClick={() => buyUpgrade('factorySize', 400)} style={upgBtn}>🏗️ Depo (Lv {_levels.factorySize})<br/><span style={{color: '#4ade80'}}>${getCost('factorySize', 400)}</span></button>
      </div>

      <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '0.8rem' }}>
        {_ns.map(n => <div key={n.id}>⚡ {n.text}</div>)}
      </div>

      <style>{`
        @keyframes fly { from { left: -15%; } to { left: 115%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', minWidth: '130px', border: '1px solid #333' };
const mainBtn = { padding: '25px 50px', fontSize: '1.4rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' };
const upgBtn = { width: '100%', padding: '15px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

export default App;
