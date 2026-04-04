import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileContext } from '../contexts/FileContext';
import { MascotContext } from '../contexts/MascotContext';
import Mascot from '../components/Mascot';
import BottomNavBar from '../components/BottomNavBar';

// Folder color themes
const FOLDER_THEMES = [
  { bg: '#FFE4F5', iconName: 'favorite', ring: '#F9A8D4' },
  { bg: '#EDE9FE', iconName: 'auto_awesome', ring: '#C4B5FD' },
  { bg: '#E0F2FE', iconName: 'cloud', ring: '#7DD3FC' },
  { bg: '#DCFCE7', iconName: 'eco', ring: '#86EFAC' },
  { bg: '#FEF3C7', iconName: 'star', ring: '#FCD34D' },
  { bg: '#FFE4E6', iconName: 'local_fire_department', ring: '#FDA4AF' },
];

// Confirmation Dialog
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 z-[120]"
          style={{ background: 'rgba(45,16,64,0.3)', backdropFilter: 'blur(16px)' }}
        />
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', bounce: 0.35 }}
          className="fixed z-[130] left-6 right-6 rounded-[32px] p-6 flex flex-col items-center text-center"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 24px 80px rgba(45,16,64,0.18)',
            border: '1.5px solid rgba(255,255,255,0.95)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(253,164,175,0.15)' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#E879A2' }}>delete_forever</span>
          </div>
          <h3 className="font-headline text-[22px] font-black text-on-surface mb-2">{title}</h3>
          <p className="font-quicksand text-[14px] font-semibold text-on-surface-muted mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onCancel}
              className="flex-1 h-[50px] rounded-[18px] font-headline font-black text-[14px]"
              style={{ background: 'rgba(196,186,203,0.15)', color: '#7C6D85' }}
            >
              Keep it
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onConfirm}
              className="flex-1 h-[50px] rounded-[18px] font-headline font-black text-[14px] text-white"
              style={{
                background: 'linear-gradient(135deg, #FDA4AF, #E879A2)',
                boxShadow: '0 6px 20px rgba(232,121,162,0.4)',
              }}
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function FileOrganizer() {
  const { folders, files, addFolder, deleteFolder } = useContext(FileContext);
  const { triggerRandom } = useContext(MascotContext);
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // folder object to delete
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);

  // Search across both folder names AND file names
  const filteredFolders = searchQuery.trim()
    ? folders.filter(f => {
        const q = searchQuery.toLowerCase();
        const nameMatch = f.name.toLowerCase().includes(q);
        const fileMatch = files.some(file => file.folderId === f.id && file.name.toLowerCase().includes(q));
        return nameMatch || fileMatch;
      })
    : folders;

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim(), FOLDER_THEMES[selectedThemeIndex]);
    setNewFolderName('');
    setIsSheetOpen(false);
    triggerRandom('playful');
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative" style={{ background: '#FFF5FA', paddingBottom: 110 }}>
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" style={{ background: 'radial-gradient(ellipse, rgba(186,230,253,0.35) 0%, transparent 70%)' }} />
        <div className="aurora-orb-2" style={{ background: 'radial-gradient(ellipse, rgba(251,207,232,0.3) 0%, transparent 70%)' }} />
      </div>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-2 relative z-10"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0 mr-3">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-on-surface-muted" style={{ fontSize: 20 }}>search</span>
                  <input
                    autoFocus
                    placeholder="Find spaces or files..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent font-quicksand text-[16px] font-bold text-on-surface outline-none flex-1"
                  />
                </motion.div>
              ) : (
                <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="font-headline text-[38px] font-black text-on-surface leading-none">My Spaces</h1>
                  <p className="font-quicksand text-[13px] font-semibold text-on-surface-muted mt-1">
                    {folders.length} space{folders.length !== 1 ? 's' : ''} organized
                    <span className="ml-1 text-[#E879A2]">✦</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery(''); }}
            className="w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0"
            style={{
              background: isSearchOpen ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid ${isSearchOpen ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.9)'}`,
              boxShadow: '0 4px 16px rgba(56,189,248,0.1)',
            }}
          >
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 22 }}>
              {isSearchOpen ? 'close' : 'search'}
            </span>
          </motion.button>
        </div>
      </motion.header>

      {/* Search results hint */}
      {isSearchOpen && searchQuery && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="px-6 pt-1 font-quicksand text-[12px] font-semibold text-on-surface-muted relative z-10"
        >
          Found: {filteredFolders.length} space{filteredFolders.length !== 1 ? 's' : ''}
          {filteredFolders.length === 0 && files.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
            ? ' — try opening a space to find matching files'
            : ''}
        </motion.p>
      )}

      {/* ── FOLDER GRID ── */}
      <div className="flex-1 px-5 mt-5 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredFolders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-16 text-center gap-5"
            >
              <div className="scale-110">
                <Mascot
                  size={140}
                  customEmote="thinking"
                  showGlow={false}
                  customMessage={searchQuery ? "No matches found! Try something else" : "Your space is waiting for memories"}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="grid" layout className="grid grid-cols-2 gap-4">
              {filteredFolders.map((folder, i) => {
                const theme = folder.theme || FOLDER_THEMES[i % FOLDER_THEMES.length];
                return (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    layout
                    className="relative"
                    onContextMenu={e => { e.preventDefault(); setDeleteConfirm(folder); }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => navigate(`/folder/${folder.id}`)}
                      className="w-full rounded-[28px] p-5 flex flex-col gap-4 min-h-[140px] items-start justify-between"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(20px)',
                        border: `1.5px solid ${theme.ring}44`,
                        boxShadow: `0 4px 24px ${theme.ring}22`,
                      }}
                    >
                      {/* Folder icon */}
                      <div
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center"
                        style={{ background: theme.bg }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 28, color: theme.ring }}>
                          {theme.iconName || 'folder'}
                        </span>
                      </div>

                      <div className="text-left w-full">
                        <p className="font-headline text-[15px] font-black text-on-surface leading-tight truncate">
                          {folder.name}
                        </p>
                        <p className="font-quicksand text-[11px] font-bold text-on-surface-muted mt-0.5">
                          {folder.fileCount || 0} items
                        </p>
                      </div>
                    </motion.button>

                    {/* Delete badge on long press */}
                    <AnimatePresence>
                      {deleteConfirm?.id === folder.id && (
                        <motion.button
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          onClick={() => setDeleteConfirm(folder)}
                          className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-full flex items-center justify-center z-10 border-3 border-white"
                          style={{
                            background: 'linear-gradient(135deg, #FDA4AF, #E879A2)',
                            boxShadow: '0 4px 16px rgba(232,121,162,0.4)',
                          }}
                        >
                          <span className="material-symbols-rounded text-white" style={{ fontSize: 16 }}>close</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dismiss delete overlay */}
      {deleteConfirm && <div className="fixed inset-0 z-0" onClick={() => setDeleteConfirm(null)} />}

      {/* ── NEW SPACE FAB (premium design) ── */}
      <motion.button
        whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(232,121,162,0.6)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsSheetOpen(true)}
        className="fixed flex items-center gap-3 z-40"
        style={{
          bottom: 110, right: 20,
          height: 60, paddingInline: 22,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #F9A8D4 0%, #E879A2 50%, #BE185D 100%)',
          boxShadow: '0 8px 32px rgba(232,121,162,0.5), 0 2px 12px rgba(232,121,162,0.3)',
          border: '2.5px solid rgba(255,255,255,0.4)',
        }}
      >
        <motion.span
          animate={{ rotate: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="material-symbols-rounded text-white"
          style={{ fontSize: 24 }}
        >
          add_circle
        </motion.span>
        <span className="font-headline font-black text-[14px] text-white tracking-wide">New Space</span>
      </motion.button>

      {/* ── CREATE FOLDER SHEET ── */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(45,16,64,0.2)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[36px] px-6 pt-4 pb-12"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 60px rgba(45,16,64,0.1)',
              }}
            >
              <div className="w-14 h-1.5 rounded-full mx-auto mb-6" style={{ background: 'rgba(196,186,203,0.4)' }} />
              <h3 className="font-headline text-[26px] font-black text-on-surface text-center mb-6">
                New Dream Space
                <span className="ml-2 material-symbols-rounded align-middle" style={{ fontSize: 26, color: '#E879A2' }}>auto_awesome</span>
              </h3>

              <input
                autoFocus
                className="w-full rounded-[18px] px-5 py-4 font-headline text-[18px] font-black text-on-surface outline-none text-center mb-5"
                style={{ background: 'rgba(56,189,248,0.07)', border: '2px solid rgba(56,189,248,0.15)' }}
                placeholder="Space name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />

              {/* Theme picker */}
              <div className="flex gap-2 justify-center mb-6 overflow-x-auto no-scrollbar pb-2">
                {FOLDER_THEMES.map((t, i) => (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedThemeIndex(i)}
                    key={i}
                    className="w-12 h-12 shrink-0 rounded-[14px] flex items-center justify-center transition-all"
                    style={{
                      background: t.bg,
                      border: selectedThemeIndex === i ? `2.5px solid ${t.ring}` : '2px solid transparent',
                      transform: selectedThemeIndex === i ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: selectedThemeIndex === i ? `0 4px 12px ${t.ring}55` : 'none',
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: t.ring }}>{t.iconName}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCreate}
                disabled={!newFolderName.trim()}
                className="w-full h-[56px] rounded-[20px] font-headline font-black text-[16px] text-white transition-all"
                style={{
                  background: newFolderName.trim()
                    ? 'linear-gradient(135deg, #F9A8D4 0%, #E879A2 50%, #BE185D 100%)'
                    : 'rgba(196,186,203,0.3)',
                  color: newFolderName.trim() ? 'white' : '#C4BACB',
                  boxShadow: newFolderName.trim() ? '0 8px 28px rgba(232,121,162,0.45)' : 'none',
                }}
              >
                Create Space
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DELETE FOLDER CONFIRMATION ── */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete this space?"
        message={`"${deleteConfirm?.name}" and all files inside will be permanently removed.`}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteFolder(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
      />

      <BottomNavBar />
    </main>
  );
}
