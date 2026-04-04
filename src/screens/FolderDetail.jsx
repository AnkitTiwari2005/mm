import React, { useState, useContext, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileContext } from '../contexts/FileContext';
import Mascot from '../components/Mascot';
import { format } from 'date-fns';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';

const FILE_TYPE_CONFIG = {
  'image/':       { icon: 'image', label: 'Image',  color: '#F9A8D4', bg: '#FDF2F8' },
  'video/':       { icon: 'play_circle', label: 'Video', color: '#C4B5FD', bg: '#F5F3FF' },
  'audio/':       { icon: 'graphic_eq', label: 'Audio', color: '#7DD3FC', bg: '#F0F9FF' },
  'application/pdf': { icon: 'picture_as_pdf', label: 'PDF', color: '#FCA5A5', bg: '#FFF5F5' },
  'default':      { icon: 'folder_open', label: 'File', color: '#86EFAC', bg: '#F0FDF4' },
};

const getFileConfig = (type) => {
  if (!type) return FILE_TYPE_CONFIG.default;
  for (const [key, val] of Object.entries(FILE_TYPE_CONFIG)) {
    if (type.startsWith(key)) return val;
  }
  return FILE_TYPE_CONFIG.default;
};

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Confirmation Dialog component
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) => (
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
            transform: 'translateY(-50%) scale(1)',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 24px 80px rgba(45,16,64,0.18)',
            border: '1.5px solid rgba(255,255,255,0.95)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: danger ? 'rgba(253,164,175,0.15)' : 'rgba(167,139,202,0.12)' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 32, color: danger ? '#E879A2' : '#A78BCA' }}>
              {danger ? 'delete_forever' : 'help'}
            </span>
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
                background: danger
                  ? 'linear-gradient(135deg, #FDA4AF, #E879A2)'
                  : 'linear-gradient(135deg, #C4B5FD, #A78BCA)',
                boxShadow: danger ? '0 6px 20px rgba(232,121,162,0.4)' : '0 6px 20px rgba(167,139,202,0.4)',
              }}
            >
              {confirmLabel}
            </motion.button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function FolderDetail() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { folders, updateFolder, deleteFolder, files, addFile, deleteFile } = useContext(FileContext);

  const folder = folders.find(f => f.id === folderId);
  const folderFiles = files.filter(f => f.folderId === folderId);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameVal, setRenameVal] = useState(folder?.name || '');
  const [deleteFileConfirm, setDeleteFileConfirm] = useState(null);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const fileDataMap = useRef({}); // store blob URLs for actual files

  if (!folder) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center" style={{ background: '#FFF5FA' }}>
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-rounded" style={{ fontSize: 56, color: '#A78BCA' }}>cloud_off</span>
          <p className="font-headline text-[20px] font-black text-on-surface">
            Oops, this space floated away!
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/files')}
            className="px-6 py-3 rounded-full font-headline font-black text-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #7DD3FC, #38BDF8)' }}
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  // Helper: save file to device filesystem and return the URI
  const saveFileToDevice = async (id, fileName, base64Data) => {
    try {
      // base64Data is "data:mime;base64,XXXX" — strip the prefix
      const pureBase64 = base64Data.split(',')[1];
      const safeName = id + '_' + fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const result = await Filesystem.writeFile({
        path: 'marshmallow_files/' + safeName,
        data: pureBase64,
        directory: Directory.Cache,
        recursive: true,
      });
      return result.uri;
    } catch (e) {
      console.warn('File save error:', e);
      return null;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = Date.now().toString();

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      // Write to device filesystem immediately
      const uri = await saveFileToDevice(id, file.name, base64);
      fileDataMap.current[id] = { base64, uri, fileName: file.name };
      addFile({ folderId, name: file.name, type: file.type || 'unknown', size: file.size, dateAdded: new Date().toISOString(), fileId: id });
    };
    reader.readAsDataURL(file);
  };

  // Restore files from device on mount — re-save any that don't have URIs
  useEffect(() => {
    const restoreFiles = async () => {
      for (const file of folderFiles) {
        if (!fileDataMap.current[file.fileId]?.uri) {
          // Try to read from filesystem
          const safeName = file.fileId + '_' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          try {
            const stat = await Filesystem.stat({
              path: 'marshmallow_files/' + safeName,
              directory: Directory.Cache,
            });
            fileDataMap.current[file.fileId] = {
              uri: stat.uri,
              fileName: file.name,
            };
          } catch {
            // File not on device yet
          }
        }
      }
    };
    restoreFiles();
  }, [folderFiles]);

  const handleOpen = async (file) => {
    const fileInfo = fileDataMap.current[file.fileId];
    if (fileInfo?.uri) {
      try {
        const { FileOpener } = await import('@capawesome-team/capacitor-file-opener');
        await FileOpener.openFile({ path: fileInfo.uri });
      } catch (e) {
        console.warn('Open error:', e);
        setIsPreviewOpen(true);
      }
    } else if (fileInfo?.base64) {
      // Re-save and try again
      const uri = await saveFileToDevice(file.fileId, file.name, fileInfo.base64);
      if (uri) {
        fileInfo.uri = uri;
        handleOpen(file);
      } else {
        setIsPreviewOpen(true);
      }
    } else {
      setIsPreviewOpen(true);
    }
  };

  const handleShare = async (file) => {
    const fileInfo = fileDataMap.current[file.fileId];
    try {
      let fileUri = fileInfo?.uri;
      
      // If no URI saved, save now
      if (!fileUri && fileInfo?.base64) {
        fileUri = await saveFileToDevice(file.fileId, file.name, fileInfo.base64);
        if (fileUri) fileInfo.uri = fileUri;
      }

      if (fileUri) {
        // Share the actual file using its URI
        await Share.share({
          title: file.name,
          url: fileUri,
          dialogTitle: 'Share from Marshmallow Space',
        });
        return;
      }

      // Fallback: just share text
      await Share.share({
        title: file.name,
        text: 'Check out this file from my Marshmallow Space: ' + file.name,
        dialogTitle: 'Share from Marshmallow Space',
      });
    } catch (e) {
      await Toast.show({ text: 'Could not share file', duration: 'short' });
    }
  };

  const confirmDeleteFile = (file) => {
    setDeleteFileConfirm(file);
    setSelectedFile(null);
  };

  const confirmDeleteFolder = () => {
    setIsMenuOpen(false);
    setDeleteFolderConfirm(true);
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative" style={{ background: '#FFF5FA', paddingBottom: 40 }}>
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" style={{ background: 'radial-gradient(ellipse, rgba(186,230,253,0.3) 0%, transparent 70%)' }} />
        <div className="aurora-orb-2" />
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-2 flex items-center gap-3 relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/files')}
          className="w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 16px rgba(45,16,64,0.06)',
          }}
        >
          <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>arrow_back</span>
        </motion.button>

        <div className="flex-1 min-w-0 text-center">
          <h1 className="font-headline text-[20px] font-black text-on-surface truncate">{folder.name}</h1>
          <p className="font-quicksand text-[11px] font-bold text-on-surface-muted">
            {folderFiles.length} file{folderFiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.9)',
          }}
        >
          <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>more_horiz</span>
        </motion.button>
      </motion.header>

      {/* ── FILES CONTENT CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 mx-4 mt-4 mb-4 rounded-[28px] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(30px)',
          border: '1.5px solid rgba(255,255,255,0.95)',
          boxShadow: '0 8px 36px rgba(45,16,64,0.06)',
        }}
      >
        {/* Card header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(196,186,203,0.12)' }}>
          <h2 className="font-headline text-[20px] font-black text-on-surface">Files</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] font-headline font-black text-[11px] uppercase tracking-wide"
            style={{
              background: 'rgba(56,189,248,0.1)',
              color: '#0369A1',
              border: '1.5px solid rgba(56,189,248,0.2)',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            Add Files
          </motion.button>
        </div>

        {/* Files list */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 200px)' }}>
          <AnimatePresence mode="popLayout">
            {folderFiles.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-10 text-center gap-4"
              >
                <Mascot size={110} customEmote="thinking" showGlow={false} customMessage="No files yet! Add some magic here!" />
              </motion.div>
            ) : (
              <div className="space-y-2">
                {folderFiles.map((file, i) => {
                  const cfg = getFileConfig(file.type);
                  return (
                    <motion.button
                      key={file.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedFile(file)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-[18px] text-left transition-all"
                      style={{ background: `${cfg.color}0A`, border: `1.5px solid ${cfg.color}18` }}
                    >
                      {/* Type icon */}
                      <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 24, color: cfg.color }}>{cfg.icon}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-headline text-[14px] font-black text-on-surface truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-quicksand text-[10px] font-bold text-on-surface-muted uppercase tracking-wide">
                            {formatSize(file.size)}
                          </span>
                          <span className="text-on-surface-muted text-[10px]">·</span>
                          <span className="font-quicksand text-[10px] font-bold text-on-surface-muted">
                            {format(new Date(file.dateAdded), 'MMM d')}
                          </span>
                        </div>
                      </div>

                      <span className="material-symbols-rounded text-on-surface-muted" style={{ fontSize: 18 }}>
                        chevron_right
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── FILE ACTION SHEET ── */}
      <AnimatePresence>
        {selectedFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFile(null)}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(45,16,64,0.2)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[36px] px-6 pt-4 pb-10"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 60px rgba(45,16,64,0.1)',
              }}
            >
              <div className="w-14 h-1.5 rounded-full mx-auto mb-5" style={{ background: 'rgba(196,186,203,0.4)' }} />

              {/* File preview header */}
              <div className="flex items-center gap-4 mb-7">
                <div
                  className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0"
                  style={{ background: getFileConfig(selectedFile.type).bg }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 32, color: getFileConfig(selectedFile.type).color }}>
                    {getFileConfig(selectedFile.type).icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-[18px] font-black text-on-surface truncate">{selectedFile.name}</h3>
                  <p className="font-quicksand text-[12px] font-bold text-on-surface-muted mt-0.5">
                    {formatSize(selectedFile.size)} · Added {format(new Date(selectedFile.dateAdded), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpen(selectedFile)}
                  className="flex flex-col items-center justify-center py-5 rounded-[22px] gap-2"
                  style={{ background: 'rgba(186,230,253,0.1)', border: '1.5px solid rgba(186,230,253,0.2)' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#0369A1' }}>open_in_new</span>
                  <span className="font-headline text-[11px] font-black uppercase tracking-wide" style={{ color: '#0369A1' }}>Open</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(selectedFile)}
                  className="flex flex-col items-center justify-center py-5 rounded-[22px] gap-2"
                  style={{ background: 'rgba(232,121,162,0.07)', border: '1.5px solid rgba(232,121,162,0.15)' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#E879A2' }}>share</span>
                  <span className="font-headline text-[11px] font-black uppercase tracking-wide" style={{ color: '#E879A2' }}>Share</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => confirmDeleteFile(selectedFile)}
                  className="flex flex-col items-center justify-center py-5 rounded-[22px] gap-2"
                  style={{ background: 'rgba(253,164,175,0.1)', border: '1.5px solid rgba(253,164,175,0.2)' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#E879A2' }}>delete</span>
                  <span className="font-headline text-[11px] font-black uppercase tracking-wide" style={{ color: '#E879A2' }}>Delete</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── IMAGE PREVIEW MODAL ── */}
      <AnimatePresence>
        {isPreviewOpen && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
            style={{ background: 'rgba(45,16,64,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <motion.button
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-10 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <span className="material-symbols-rounded">close</span>
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg aspect-square rounded-[32px] overflow-hidden bg-white/5 flex flex-col items-center justify-center relative shadow-2xl"
            >
              <span className="material-symbols-rounded mb-4" style={{ fontSize: 80, color: getFileConfig(selectedFile.type).color }}>
                {getFileConfig(selectedFile.type).icon}
              </span>
              <div className="absolute bottom-10 left-0 right-0 text-center px-8">
                <h4 className="font-headline text-[22px] font-black text-white mb-2">{selectedFile.name}</h4>
                <p className="font-quicksand text-[14px] font-bold text-white/60">
                  {formatSize(selectedFile.size)} · {format(new Date(selectedFile.dateAdded), 'MMMM d, yyyy')}
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-8 font-quicksand text-[13px] font-bold text-white/40 uppercase tracking-widest"
            >
              Marshmallow Secure Space
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER MENU ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-[50]" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="fixed right-5 z-[60] rounded-[20px] overflow-hidden"
              style={{
                top: 110,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(30px)',
                border: '1.5px solid rgba(255,255,255,0.95)',
                boxShadow: '0 12px 40px rgba(45,16,64,0.12)',
                minWidth: 200,
              }}
            >
              {[
                {
                  label: 'Add Files',
                  icon: 'attach_file',
                  color: '#0369A1',
                  action: () => { setIsMenuOpen(false); fileInputRef.current?.click(); }
                },
                {
                  label: 'Rename Space',
                  icon: 'edit',
                  color: '#A78BCA',
                  action: () => { setIsMenuOpen(false); setIsRenameOpen(true); }
                },
                {
                  label: 'Delete Space',
                  icon: 'delete_forever',
                  color: '#E879A2',
                  action: confirmDeleteFolder,
                  danger: true
                },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-4 transition-all"
                  style={{
                    background: item.danger ? 'rgba(253,164,175,0.06)' : 'transparent',
                    borderTop: i > 0 ? '1px solid rgba(196,186,203,0.12)' : 'none',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 20, color: item.color }}>{item.icon}</span>
                  <span className="font-headline text-[14px] font-black" style={{ color: item.danger ? '#E879A2' : '#2D1040' }}>
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── RENAME SHEET ── */}
      <AnimatePresence>
        {isRenameOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsRenameOpen(false)}
              className="fixed inset-0 z-[80]"
              style={{ background: 'rgba(45,16,64,0.2)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-[90] rounded-t-[36px] px-6 pt-4 pb-12"
              style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(40px)', boxShadow: '0 -20px 60px rgba(45,16,64,0.1)' }}
            >
              <div className="w-14 h-1.5 rounded-full mx-auto mb-5" style={{ background: 'rgba(196,186,203,0.4)' }} />
              <h3 className="font-headline text-[24px] font-black text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#A78BCA' }}>edit</span>
                Rename Space
              </h3>
              <input
                autoFocus
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                className="w-full rounded-[18px] px-5 py-4 font-headline text-[18px] font-black text-on-surface outline-none mb-5"
                style={{ background: 'rgba(232,121,162,0.07)', border: '2px solid rgba(232,121,162,0.15)' }}
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { updateFolder(folder.id, { name: renameVal }); setIsRenameOpen(false); }}
                className="w-full h-[54px] rounded-[20px] font-headline font-black text-[16px] text-white"
                style={{ background: 'linear-gradient(135deg, #F9A8D4, #E879A2)', boxShadow: '0 6px 24px rgba(232,121,162,0.4)' }}
              >
                Save Changes
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DELETE FILE CONFIRMATION ── */}
      <ConfirmDialog
        isOpen={!!deleteFileConfirm}
        title="Delete this file?"
        message={`"${deleteFileConfirm?.name}" will be removed from this space permanently.`}
        confirmLabel="Delete"
        danger={true}
        onCancel={() => setDeleteFileConfirm(null)}
        onConfirm={() => {
          if (deleteFileConfirm) {
            deleteFile(deleteFileConfirm.id);
            setDeleteFileConfirm(null);
          }
        }}
      />

      {/* ── DELETE FOLDER CONFIRMATION ── */}
      <ConfirmDialog
        isOpen={deleteFolderConfirm}
        title="Delete this space?"
        message={`"${folder.name}" and all its files will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Space"
        danger={true}
        onCancel={() => setDeleteFolderConfirm(false)}
        onConfirm={() => {
          deleteFolder(folder.id);
          navigate('/files');
        }}
      />
    </main>
  );
}
