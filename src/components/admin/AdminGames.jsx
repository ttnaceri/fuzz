import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';
import Modal from '../common/Modal.jsx';
import useToast from '../hooks/useToast.js';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    title: '', description: '', genre: 'Action', price: 0, 
    image: '', downloadUrl: '', isHtmlGame: true
  });

  const loadGames = () => {
    if (!api.isConfigured()) { setLoading(false); return; }
    setLoading(true);
    adminService.games.list()
      .then((r) => setGames(r?.games || r || []))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGames(); }, []);

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!api.isConfigured()) {
      toastError("Backend yo'q. Hozircha faqat local o'yin qo'shish mumkin.");
      return;
    }
    try {
      await adminService.games.create(form);
      success("O'yin muvaffaqiyatli qo'shildi!");
      setIsModalOpen(false);
      setForm({ title: '', description: '', genre: 'Action', price: 0, image: '', downloadUrl: '', isHtmlGame: true });
      loadGames();
    } catch (err) {
      toastError(err.message || "O'yin qo'shishda xatolik");
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>O'yinlar Boshqaruvi</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus" /> Yangi o'yin qo'shish
        </button>
      </div>

      {!api.isConfigured() && <div className="unavailable-notice">Backend yo'q. O'yinlar ro'yxatini o'zgartirish uchun backend kerak.</div>}
      
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
      
      {games.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr><th>Rasm</th><th>Nomi</th><th>Janr</th><th>Narx</th><th>HTML?</th><th>Amallar</th></tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id}>
                <td><img src={g.image} alt="" style={{ width: 60, height: 30, objectFit: 'cover', borderRadius: 4 }} /></td>
                <td>{g.title}</td>
                <td>{g.genre}</td>
                <td>{g.price === 0 ? 'Free' : `$${g.price}`}</td>
                <td>{g.isHtmlGame ? 'Ha' : "Yo'q"}</td>
                <td>
                  <button className="btn btn-ghost btn-sm text-muted"><i className="fa-solid fa-pen" /></button>
                  <button className="btn btn-ghost btn-sm text-muted"><i className="fa-solid fa-trash" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={isModalOpen} title="Yangi o'yin qo'shish" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleAddGame} className="flex flex-col gap-2">
          <div className="form-group">
            <label className="form-label">O'yin nomi</label>
            <input required className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea required className="form-input" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Janr</label>
            <select className="form-input" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>
              <option value="Action">Action</option>
              <option value="FPS">FPS</option>
              <option value="Survival">Survival</option>
              <option value="RPG">RPG</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rasm URL (masalan: /image/games/rasm.jpg)</label>
            <input className="form-input" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Yuklash/O'ynash Havolasi</label>
            <input required className="form-input" value={form.downloadUrl} onChange={e => setForm({...form, downloadUrl: e.target.value})} />
          </div>
          <div className="form-group flex items-center gap-1">
            <input type="checkbox" id="isHtml" checked={form.isHtmlGame} onChange={e => setForm({...form, isHtmlGame: e.target.checked})} />
            <label htmlFor="isHtml" style={{ cursor: 'pointer' }}>Bu HTML o'yinmi?</label>
          </div>
          <div className="mt-2 flex justify-between">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
            <button type="submit" className="btn btn-primary">Saqlash</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}