import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileContext } from '../contexts/FileContext';
import { MascotContext } from '../contexts/MascotContext';
import Mascot from '../components/Mascot';
import BottomNavBar from '../components/BottomNavBar';

// Folder color themes
const FOLDER_THEMES = [
  { bg: '#FFE4F5', icon: '🌸', ring: '#F9A8D4' },
  { bg: '#EDE9FE', icon: '💜', ring: '#C4B5FD' },
  { bg: '#E0F2FE', icon: '☁️', ring: '#7DD3FC' },
  { bg: '#DCFCE7', icon: '🌿', ring: '#86EFAC' },
  { bg: '#FEF3C7', icon: '⭐', ring: '#FCD34D' },
  { bg: '#FFE4E6', icon: '🎀', ring: '#FDA4AF' },
];

export default function FileOrganizer() {
  const { folders, addFolder, deleteFolder } = useContext(FileContext);
  const { triggerRandom } = useContext(MascotContext);
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                <motion.input
                  key="search"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: 0 }}
                  autoFocus
                  placeholder="Find a space..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent font-quicksand text-[16px] font-bold text-on-surface outline-none w-full"
                />
              ) : (
                <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="font-headline text-[38px] font-black text-on-surface leading-none">My Spaces</h1>
                  <p className="font-quicksand text-[13px] font-semibold text-on-surface-muted mt-1">
                    {folders.length} space{folders.length !== 1 ? 's' : ''} organized ✦
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
                <Mascot size={140} customEmote="thinking" showGlow={false} customMessage={searchQuery ? "No matches found! 🔍" : "Your space is waiting for memories 🌌"} />
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
                    onContextMenu={e => { e.preventDefault(); setDeletingId(folder.id); }}
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
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl"
                        style={{ background: theme.bg }}
                      >
                        {theme.icon}
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

                    {/* Delete badge */}
                    <AnimatePresence>
                      {deletingId === folder.id && (
                        <motion.button
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          onClick={() => { deleteFolder(folder.id); setDeletingId(null); }}
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
      {deletingId && <div className="fixed inset-0 z-0" onClick={() => setDeletingId(null)} />}

      {/* ── FAB ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88, rotate: 90 }}
        onClick={() => setIsSheetOpen(true)}
        className="fixed flex items-center gap-2 z-40"
        style={{
          bottom: 110, right: 20,
          height: 56, paddingInline: 20,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #7DD3FC, #38BDF8)',
          boxShadow: '0 8px 28px rgba(56,189,248,0.45)',
          border: '2.5px solid white',
        }}
      >
        <span className="material-symbols-rounded text-white" style={{ fontSize: 22 }}>create_new_folder</span>
        <span className="font-headline font-black text-[13px] text-white uppercase tracking-wide">New Space</span>
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
                New Dream Space 🌌
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

              {/* Color preview / icon picker */}
              <div className="flex gap-2 justify-center mb-6 overflow-x-auto no-scrollbar pb-2">
                {FOLDER_THEMES.map((t, i) => (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedThemeIndex(i)}
                    key={i} 
                    className="w-10 h-10 shrink-0 rounded-[12px] text-xl flex items-center justify-center transition-all" 
                    style={{ 
                      background: t.bg,
                      border: selectedThemeIndex === i ? `2px solid ${t.ring}` : '2px solid transparent',
                      transform: selectedThemeIndex === i ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: selectedThemeIndex === i ? `0 4px 12px ${t.ring}55` : 'none',
                    }}
                  >
                    {t.icon}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCreate}
                disabled={!newFolderName.trim()}
                className="w-full h-[56px] rounded-[20px] font-headline font-black text-[16px] transition-all"
                style={{
                  background: newFolderName.trim() ? 'linear-gradient(135deg, #7DD3FC, #38BDF8)' : 'rgba(196,186,203,0.3)',
                  color: newFolderName.trim() ? 'white' : '#C4BACB',
                  boxShadow: newFolderName.trim() ? '0 8px 28px rgba(56,189,248,0.4)' : 'none',
                }}
              >
                Create Space ✨
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavBar />
    </main>
  );
}
