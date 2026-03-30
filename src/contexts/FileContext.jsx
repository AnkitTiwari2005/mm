import React, { createContext, useState, useEffect, useMemo } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [folders, setFolders] = useState(() => JSON.parse(localStorage.getItem('marshmallow_folders')) || []);
  const [files, setFiles] = useState(() => JSON.parse(localStorage.getItem('marshmallow_files')) || []);

  useEffect(() => {
    localStorage.setItem('marshmallow_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('marshmallow_files', JSON.stringify(files));
  }, [files]);

  // Folders enriched with fileCount
  const foldersWithCount = useMemo(() =>
    folders.map(f => ({
      ...f,
      fileCount: files.filter(file => file.folderId === f.id).length,
    })),
    [folders, files]
  );

  const addFolder = (name, theme) => {
    setFolders(prev => [...prev, { id: Date.now().toString(), name, theme }]);
  };

  const updateFolder = (id, updates) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFolder = (id) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setFiles(prev => prev.filter(f => f.folderId !== id));
  };

  const addFile = (file) => {
    setFiles(prev => [...prev, { ...file, id: Date.now().toString() }]);
  };

  const deleteFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <FileContext.Provider value={{
      folders: foldersWithCount,
      addFolder, updateFolder, deleteFolder,
      files, addFile, deleteFile,
    }}>
      {children}
    </FileContext.Provider>
  );
};
