import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://samigamezone-backend-2.onrender.com';

const API_URL = `${BASE_URL}/api/games`;
const AUTH_URL = `${BASE_URL}/api/auth`;
const NEWS_URL = `${BASE_URL}/api/news`;

const staticGames = [
  { id: 's1', title: 'eFootball 2025', description: 'Free-to-play football experience.', size: '8 GB', category: 'Football ⚽', downloadLink: 'https://t.me/tech_tips4', imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1665460/header.jpg', views: null, downloads: null },
  { id: 's2', title: 'EA SPORTS FC 26', description: 'Latest football experience.', size: '1.8 GB', category: 'Football ⚽', downloadLink: 'https://t.me/tech_tips4', imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2235570/header.jpg', views: null, downloads: null },
  { id: 's3', title: 'GTA V', description: 'Open world action game.', size: '36 GB', category: 'Open World 🗺️', downloadLink: 'https://t.me/tech_tips4', imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg', views: null, downloads: null },
  { id: 's4', title: 'Call of Duty MW II', description: 'Fast-paced multiplayer battles.', size: '2.1 GB', category: 'Action 💥', downloadLink: 'https://t.me/tech_tips4', imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg', views: null, downloads: null },
  { id: 's5', title: 'PUBG Mobile', description: 'Battle Royale adventure.', size: '1.5 GB', category: 'Action 💥', downloadLink: 'https://t.me/tech_tips4', imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg', views: null, downloads: null },
];

function App() {
  const [page, setPage] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [gameFile, setGameFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('link');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [category, setCategory] = useState('Football ⚽');
  const [games, setGames] = useState([]);
  const [news, setNews] = useState([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImageFile, setNewsImageFile] = useState(null);
  const [newsImagePreview, setNewsImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { if (window.location.hash === '#sami-secret') setPage('login'); }, []);
  useEffect(() => { if (token) setIsAdmin(true); }, []);

  const fetchGames = async () => {
    try { setLoading(true); const res = await axios.get(API_URL); setGames(res.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchNews = async () => {
    try { const res = await axios.get(NEWS_URL); setNews(res.data); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { fetchGames(); fetchNews(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${AUTH_URL}/login`, { email, password });
      if (res.data.status === 'success') {
        setToken(res.data.token);
        localStorage.setItem('adminToken', res.data.token);
        setIsAdmin(true); setPage('dashboard');
        window.location.hash = '';
      }
    } catch (err) { alert(err.response?.data?.message || '❌ Login failed!'); }
  };

  const handleView = async (id) => {
    if (id.startsWith('s')) return;
    try {
      const res = await axios.post(`${API_URL}/${id}/view`);
      setGames(prev => prev.map(g => g.id === id ? {...g, views: res.data.views} : g));
    } catch (e) {}
  };

  const handleDownloadCount = async (id) => {
    if (id.startsWith('s')) return;
    try {
      const res = await axios.post(`${API_URL}/${id}/download`);
      setGames(prev => prev.map(g => g.id === id ? {...g, downloads: res.data.downloads} : g));
    } catch (e) {}
  };

  const handleSubmitGame = async (e) => {
    e.preventDefault();
    try {
      setUploading(true); setUploadProgress(0);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (imageFile) formData.append('image', imageFile);
      if (uploadMode === 'file' && gameFile) formData.append('gamefile', gameFile);
      else { formData.append('downloadLink', downloadLink); formData.append('size', size); }
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded*100)/e.total))
      });
      alert('🎯 ጌሙ ተጭኗል!');
      setTitle(''); setDescription(''); setSize(''); setDownloadLink('');
      setImageFile(null); setImagePreview(''); setGameFile(null); setUploadProgress(0);
      fetchGames();
    } catch (err) { alert(err.response?.data?.message || '❌ ጌሙ አልተጫነም!'); }
    finally { setUploading(false); }
  };

  const handleEditGame = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${editingGame.id}`,
        { title, description, size, downloadLink, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ ጌሙ ተስተካክሏል!');
      setEditingGame(null);
      setTitle(''); setDescription(''); setSize(''); setDownloadLink('');
      fetchGames();
    } catch { alert('❌ ማስተካከል አልተቻለም!'); }
  };

  const startEdit = (g) => {
    setEditingGame(g);
    setTitle(g.title);
    setDescription(g.description);
    setSize(g.size || '');
    setDownloadLink(g.downloadLink || '');
    setCategory(g.category);
  };

  const cancelEdit = () => {
    setEditingGame(null);
    setTitle(''); setDescription(''); setSize(''); setDownloadLink('');
  };

  const handleDeleteGame = async (id) => {
    if (window.confirm('እርግጠኛ ነህ?')) {
      try { await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchGames(); }
      catch { alert('❌ መሰረዝ አልተቻለም!'); }
    }
  };

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newsTitle); formData.append('content', newsContent);
      if (newsImageFile) formData.append('image', newsImageFile);
      await axios.post(NEWS_URL, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      alert('📰 ዜና ተጨምሯል!');
      setNewsTitle(''); setNewsContent(''); setNewsImageFile(null); setNewsImagePreview('');
      fetchNews();
    } catch { alert('❌ ዜና አልተጨመረም!'); }
  };

  const handleDeleteNews = async (id) => {
    try { await axios.delete(`${NEWS_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchNews(); }
    catch { alert('❌ ዜና መሰረዝ አልተቻለም!'); }
  };

  const handleLogout = () => {
    setIsAdmin(false); setToken(''); setEmail(''); setPassword('');
    localStorage.removeItem('adminToken'); setPage('home');
  };

  const filteredGames = [...staticGames, ...games]
    .filter(g => activeCategory === 'All' || g.category === activeCategory)
    .filter(g => g.title.toLowerCase().includes(search.toLowerCase()));

  const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#111b35', color: 'white', border: '1px solid #1e293b', borderRadius: '8px' };
  const labelStyle = { display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '13px' };

  return (
    <div className="app">
      <div className="navbar">
        <h2 className="logo" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>🎮 Sami Game Zone</h2>
        <nav>
          <a href="#home" onClick={() => setPage('home')} style={{ color: page==='home'?'#38bdf8':'white' }}>Home</a>
          <a href="#games-section" onClick={() => setPage('home')}>Games</a>
          <a href="#news-section" onClick={() => setPage('home')}>News</a>
          <a href="#support" onClick={() => setPage('support')} style={{ color: page==='support'?'#38bdf8':'white' }}>Support</a>
          {isAdmin && <a href="#dashboard" onClick={() => setPage('dashboard')} style={{ color:'#22c55e', fontWeight:'bold' }}>👑 Dashboard</a>}
        </nav>
      </div>

      {page === 'home' && (
        <>
          <div className="hero">
            <h1>Welcome to Sami Game Zone</h1>
            <p>Download the latest Android, PC and Console games. Get gaming news, eFootball updates and more.</p>
            <div style={{ marginTop:'35px', display:'flex', justifyContent:'center', gap:'15px', flexWrap:'wrap', position:'relative', zIndex:1 }}>
              <button onClick={() => document.getElementById('games-section').scrollIntoView({ behavior:'smooth' })}
                style={{ background:'linear-gradient(135deg,#1d4ed8,#2563eb)', color:'white', border:'none', padding:'14px 30px', borderRadius:'12px', fontSize:'16px', cursor:'pointer', fontWeight:'600', boxShadow:'0 4px 20px rgba(37,99,235,0.4)' }}>Download Games</button>
              <button onClick={() => document.getElementById('news-section').scrollIntoView({ behavior:'smooth' })}
                style={{ background:'linear-gradient(135deg,#0369a1,#0284c7)', color:'white', border:'none', padding:'14px 30px', borderRadius:'12px', fontSize:'16px', cursor:'pointer', fontWeight:'600', boxShadow:'0 4px 20px rgba(3,105,161,0.4)' }}>Latest News</button>
            </div>
          </div>

          <div id="games-section" className="games">
            <h2>Featured Games</h2>
            <div className="search-bar">
              <input type="text" placeholder="🔍 Search games..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
            </div>
            <div className="category-filter">
              {['All','Football ⚽','Action 💥','Open World 🗺️'].map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`cat-btn ${activeCategory===cat?'cat-btn-active':''}`}>{cat}</button>
              ))}
            </div>
            {loading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p style={{ color:'#94a3b8', marginTop:'15px' }}>Loading games...</p>
              </div>
            ) : (
              <div className="game-grid">
                {filteredGames.map((game) => (
                  <div key={game.id} className="game-card" onMouseEnter={() => handleView(game.id)}>
                    {game.imageUrl
                      ? <img src={game.imageUrl} alt={game.title} className="game-image" onError={(e) => { e.target.style.display='none'; }} />
                      : <div className="game-image-placeholder">🎮</div>}
                    <span className="game-category">{game.category}</span>
                    <h3>{game.title}</h3>
                    <p>{game.description}</p>
                    {game.size && <p className="game-size">💾 {game.size}</p>}
                    {game.views !== null && (
                      <div style={{ display:'flex', gap:'12px', justifyContent:'center', margin:'6px 0', fontSize:'12px', color:'#64748b' }}>
                        <span>👁️ {game.views||0}</span>
                        <span>⬇️ {game.downloads||0}</span>
                      </div>
                    )}
                    {game.hasDirectFile && <p style={{ color:'#22c55e', fontSize:'12px', margin:'4px 0' }}>✅ Direct Download</p>}
                    <a href={game.downloadLink} target="_blank" rel="noreferrer" onClick={() => handleDownloadCount(game.id)}>
                      <button className="download-btn">⬇️ Download</button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div id="news-section" className="news">
            <h2>Latest Gaming News</h2>
            {news.length > 0 ? news.map((n) => (
              <div key={n.id} className="news-card">
                {n.imageUrl && <img src={n.imageUrl} alt={n.title} style={{ width:'100%', height:'200px', objectFit:'cover', borderRadius:'10px', marginBottom:'14px' }} onError={(e) => e.target.style.display='none'} />}
                <h3>{n.title}</h3>
                <p>{n.content}</p>
                <span style={{ fontSize:'12px', color:'#64748b' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            )) : (
              <>
                <div className="news-card"><h3>🔥 EA SPORTS FC 26 Released</h3><p>New gameplay, graphics and career mode updates.</p></div>
                <div className="news-card"><h3>🎮 GTA VI Updates</h3><p>Rockstar shared new details about GTA VI.</p></div>
              </>
            )}
          </div>
        </>
      )}

      {page === 'login' && (
        <div style={{ maxWidth:'400px', margin:'100px auto', backgroundColor:'#0b1329', padding:'40px 30px', borderRadius:'16px', border:'1px solid #1e293b', textAlign:'center', boxShadow:'0 20px 40px rgba(0,0,0,0.6)' }}>
          <span style={{ fontSize:'40px' }}>🔒</span>
          <h2 style={{ color:'#38bdf8', marginTop:'15px', marginBottom:'10px', fontSize:'24px', fontWeight:'bold' }}>Admin Login</h2>
          <p style={{ color:'#94a3b8', fontSize:'14px', marginBottom:'30px' }}>እባክዎ የባለቤትነት username እና ፓስወርድ ያስገቡ</p>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username..." value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width:'100%', padding:'14px', boxSizing:'border-box', backgroundColor:'#111b35', color:'white', border:'1px solid #1e293b', borderRadius:'8px', fontSize:'15px', marginBottom:'15px', textAlign:'center' }} />
            <input type="password" placeholder="Password..." value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width:'100%', padding:'14px', boxSizing:'border-box', backgroundColor:'#111b35', color:'white', border:'1px solid #1e293b', borderRadius:'8px', fontSize:'15px', marginBottom:'20px', textAlign:'center' }} />
            <button type="submit" style={{ width:'100%', backgroundColor:'#38bdf8', color:'#070d19', border:'none', padding:'14px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'15px' }}>🔓 Verify & Unlock</button>
          </form>
          <button onClick={() => { setPage('home'); window.location.hash=''; }} style={{ background:'transparent', border:'none', color:'#94a3b8', marginTop:'20px', cursor:'pointer', fontSize:'14px' }}>← Back to Home</button>
        </div>
      )}

      {page === 'dashboard' && isAdmin && (
        <div style={{ maxWidth:'1000px', margin:'50px auto', padding:'0 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', backgroundColor:'#0b1329', padding:'20px 30px', borderRadius:'12px', border:'1px solid #22c55e' }}>
            <div>
              <h2 style={{ color:'#22c55e', margin:0 }}>👑 Control Dashboard</h2>
              <p style={{ margin:'5px 0 0 0', color:'#94a3b8', fontSize:'13px' }}>
                Games: <span style={{ color:'#38bdf8' }}>{games.length}</span> &nbsp;|&nbsp;
                Views: <span style={{ color:'#38bdf8' }}>{games.reduce((a,g)=>a+(g.views||0),0)}</span> &nbsp;|&nbsp;
                Downloads: <span style={{ color:'#22c55e' }}>{games.reduce((a,g)=>a+(g.downloads||0),0)}</span>
              </p>
            </div>
            <button onClick={handleLogout} style={{ backgroundColor:'#ef4444', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>Sign Out</button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginBottom:'25px' }}>
            {/* ADD / EDIT GAME */}
            <div style={{ backgroundColor:'#0b1329', padding:'25px', borderRadius:'16px', border:`1px solid ${editingGame?'#f59e0b':'#1e293b'}` }}>
              <h3 style={{ marginTop:0, color: editingGame?'#f59e0b':'#38bdf8' }}>
                {editingGame ? '✏️ Edit Game' : '🚀 Deploy New Game'}
              </h3>

              {editingGame && (
                <div style={{ backgroundColor:'rgba(245,158,11,0.1)', padding:'10px', borderRadius:'8px', marginBottom:'12px', fontSize:'13px', color:'#f59e0b', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span>✏️ Editing: <strong>{editingGame.title}</strong></span>
                  <button onClick={cancelEdit} style={{ background:'transparent', border:'none', color:'#ef4444', cursor:'pointer', fontWeight:'bold', fontSize:'16px' }}>✕</button>
                </div>
              )}

              <form onSubmit={editingGame ? handleEditGame : handleSubmitGame}>
                <div style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>Game Title:</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>Description:</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required style={{ ...inputStyle, height:'55px', resize:'none' }} />
                </div>

                {!editingGame && (
                  <div style={{ marginBottom:'12px' }}>
                    <label style={labelStyle}>Game Image:</label>
                    <input type="file" accept="image/*" onChange={(e) => { const f=e.target.files[0]; if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f));} }} style={inputStyle} />
                    {imagePreview && <img src={imagePreview} alt="preview" style={{ width:'100%', height:'100px', objectFit:'cover', borderRadius:'8px', marginTop:'8px' }} />}
                  </div>
                )}

                <div style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>Size (e.g. 2.5 GB):</label>
                  <input type="text" value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>Download Link:</label>
                  <input type="url" value={downloadLink} onChange={(e) => setDownloadLink(e.target.value)} required={!editingGame} style={inputStyle} />
                </div>

                {!editingGame && (
                  <div style={{ marginBottom:'12px' }}>
                    <label style={labelStyle}>Download Type:</label>
                    <div style={{ display:'flex', gap:'10px' }}>
                      <button type="button" onClick={() => setUploadMode('link')} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', backgroundColor:uploadMode==='link'?'#38bdf8':'#1e293b', color:uploadMode==='link'?'#070d19':'#94a3b8' }}>🔗 Link</button>
                      <button type="button" onClick={() => setUploadMode('file')} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', backgroundColor:uploadMode==='file'?'#22c55e':'#1e293b', color:uploadMode==='file'?'#070d19':'#94a3b8' }}>📁 Direct File</button>
                    </div>
                  </div>
                )}

                {!editingGame && uploadMode==='file' && (
                  <div style={{ marginBottom:'12px' }}>
                    <label style={labelStyle}>Game File (max 500MB):</label>
                    <input type="file" onChange={(e) => setGameFile(e.target.files[0])} style={inputStyle} />
                    {gameFile && <p style={{ color:'#22c55e', fontSize:'12px', marginTop:'6px' }}>✅ {gameFile.name}</p>}
                  </div>
                )}

                <div style={{ marginBottom:'16px' }}>
                  <label style={labelStyle}>Category:</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    <option value="Football ⚽">Football ⚽</option>
                    <option value="Action 💥">Action 💥</option>
                    <option value="Open World 🗺️">Open World 🗺️</option>
                  </select>
                </div>

                {!editingGame && uploading && (
                  <div style={{ marginBottom:'12px' }}>
                    <div style={{ background:'#1e293b', borderRadius:'8px', height:'10px', overflow:'hidden' }}>
                      <div style={{ background:'#22c55e', height:'100%', width:`${uploadProgress}%`, transition:'0.3s', borderRadius:'8px' }}></div>
                    </div>
                    <p style={{ color:'#22c55e', fontSize:'12px', marginTop:'4px', textAlign:'center' }}>{uploadProgress}%</p>
                  </div>
                )}

                <button type="submit" disabled={!editingGame && uploading}
                  style={{ width:'100%', padding:'12px', backgroundColor: editingGame?'#f59e0b': uploading?'#1e293b':'#22c55e', color: editingGame?'#070d19': uploading?'#64748b':'white', border:'none', borderRadius:'8px', cursor: (!editingGame&&uploading)?'not-allowed':'pointer', fontWeight:'bold' }}>
                  {editingGame ? '✅ Save Changes' : uploading ? `Uploading... ${uploadProgress}%` : 'Publish Live 🚀'}
                </button>
              </form>
            </div>

            {/* MANAGE GAMES */}
            <div style={{ backgroundColor:'#0b1329', padding:'25px', borderRadius:'16px', border:'1px solid #1e293b' }}>
              <h3 style={{ marginTop:0, color:'#ef4444' }}>🗑️ Manage Games ({games.length})</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'480px', overflowY:'auto' }}>
                {games.map((g) => (
                  <div key={g.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor: editingGame?.id===g.id?'rgba(245,158,11,0.1)':'#111b35', padding:'10px', borderRadius:'8px', border:`1px solid ${editingGame?.id===g.id?'#f59e0b':'#1e293b'}`, gap:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      {g.imageUrl && <img src={g.imageUrl} alt={g.title} style={{ width:'45px', height:'45px', borderRadius:'6px', objectFit:'cover' }} onError={(e) => e.target.style.display='none'} />}
                      <div>
                        <h4 style={{ margin:0, fontSize:'13px', color:'#fff' }}>{g.title}</h4>
                        <span style={{ fontSize:'11px', color:'#38bdf8' }}>{g.category}</span>
                        <span style={{ fontSize:'11px', color:'#64748b', marginLeft:'6px' }}>👁️{g.views||0} ⬇️{g.downloads||0}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => startEdit(g)} style={{ backgroundColor:'rgba(56,189,248,0.1)', border:'1px solid #38bdf8', color:'#38bdf8', padding:'5px 10px', borderRadius:'6px', cursor:'pointer' }}>✏️</button>
                      <button onClick={() => handleDeleteGame(g.id)} style={{ backgroundColor:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', color:'#ef4444', padding:'5px 10px', borderRadius:'6px', cursor:'pointer' }}>❌</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEWS */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px' }}>
            <div style={{ backgroundColor:'#0b1329', padding:'25px', borderRadius:'16px', border:'1px solid #1e293b' }}>
              <h3 style={{ marginTop:0, color:'#f59e0b' }}>📰 Add News</h3>
              <form onSubmit={handleSubmitNews}>
                <div style={{ marginBottom:'12px' }}><label style={labelStyle}>News Title:</label><input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} required style={inputStyle} /></div>
                <div style={{ marginBottom:'12px' }}><label style={labelStyle}>Content:</label><textarea value={newsContent} onChange={(e) => setNewsContent(e.target.value)} required style={{ ...inputStyle, height:'70px', resize:'none' }} /></div>
                <div style={{ marginBottom:'16px' }}>
                  <label style={labelStyle}>News Image (optional):</label>
                  <input type="file" accept="image/*" onChange={(e) => { const f=e.target.files[0]; if(f){setNewsImageFile(f);setNewsImagePreview(URL.createObjectURL(f));} }} style={inputStyle} />
                  {newsImagePreview && <img src={newsImagePreview} alt="preview" style={{ width:'100%', height:'100px', objectFit:'cover', borderRadius:'8px', marginTop:'8px' }} />}
                </div>
                <button type="submit" style={{ width:'100%', padding:'12px', backgroundColor:'#f59e0b', color:'#070d19', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>Publish News 📰</button>
              </form>
            </div>
            <div style={{ backgroundColor:'#0b1329', padding:'25px', borderRadius:'16px', border:'1px solid #1e293b' }}>
              <h3 style={{ marginTop:0, color:'#f59e0b' }}>📋 Manage News ({news.length})</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'300px', overflowY:'auto' }}>
                {news.map((n) => (
                  <div key={n.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'#111b35', padding:'10px', borderRadius:'8px', border:'1px solid #1e293b', gap:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      {n.imageUrl && <img src={n.imageUrl} alt={n.title} style={{ width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover' }} onError={(e) => e.target.style.display='none'} />}
                      <span style={{ fontSize:'13px', color:'#fff' }}>{n.title}</span>
                    </div>
                    <button onClick={() => handleDeleteNews(n.id)} style={{ backgroundColor:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', color:'#ef4444', padding:'5px 10px', borderRadius:'6px', cursor:'pointer' }}>❌</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'support' && (
        <div style={{ maxWidth:'550px', margin:'80px auto', backgroundColor:'#0b1329', padding:'40px', borderRadius:'16px', border:'1px solid #1e293b' }}>
          <h2>✉️ Support & Contact</h2>
          <p style={{ color:'#94a3b8', lineHeight:'1.6' }}>ማናቸውንም አይነት የቴክኒክ ችግር ካጋጠመዎት ከታች ባሉት መንገዶች ሊያገኙን ይችላሉ።</p>
          <a href="https://t.me/neverlag1" target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'12px', backgroundColor:'#111b35', padding:'16px 20px', borderRadius:'12px', textDecoration:'none', color:'white', border:'1px solid #1e293b', marginTop:'20px' }}>
            <span style={{ fontSize:'24px' }}>📩</span>
            <div><h4 style={{ margin:0 }}>Telegram</h4><p style={{ color:'#94a3b8', margin:0, fontSize:'13px' }}>@neverlag1</p></div>
          </a>
          <a href="tel:0905330873" style={{ display:'flex', alignItems:'center', gap:'12px', backgroundColor:'#111b35', padding:'16px 20px', borderRadius:'12px', textDecoration:'none', color:'white', border:'1px solid #1e293b', marginTop:'12px' }}>
            <span style={{ fontSize:'24px' }}>📞</span>
            <div><h4 style={{ margin:0 }}>Phone</h4><p style={{ color:'#94a3b8', margin:0, fontSize:'13px' }}>0905330873</p></div>
          </a>
          <button onClick={() => setPage('home')} style={{ display:'block', margin:'30px auto 0 auto', background:'transparent', border:'none', color:'#38bdf8', fontWeight:'bold', cursor:'pointer' }}>← Return to Homepage</button>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand"><h3>🎮 Sami Game Zone</h3><p>Your trusted source for the latest games and gaming news.</p></div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#home" onClick={() => setPage('home')}>Home</a>
            <a href="#games-section" onClick={() => setPage('home')}>Games</a>
            <a href="#news-section" onClick={() => setPage('home')}>News</a>
            <a href="#support" onClick={() => setPage('support')}>Support</a>
          </div>
          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="social-icons">
              <a href="https://t.me/tech_tips4" target="_blank" rel="noreferrer" className="social-icon">📩</a>
              <a href="https://t.me/neverlag1" target="_blank" rel="noreferrer" className="social-icon">💬</a>
              <a href="tel:0905330873" className="social-icon">📞</a>
            </div>
            <p style={{ color:'#94a3b8', fontSize:'13px', marginTop:'10px' }}>@neverlag1</p>
            <p style={{ color:'#94a3b8', fontSize:'13px' }}>0905330873</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sami Game Zone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
