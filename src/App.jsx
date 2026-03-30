import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import NameEntry from './screens/NameEntry';
import Home from './screens/Home';
import Tasks from './screens/Tasks';
import Calendar from './screens/Calendar';
import FileOrganizer from './screens/FileOrganizer';
import FolderDetail from './screens/FolderDetail';
import MascotScreen from './screens/MascotScreen';
import RemindersScreen from './screens/RemindersScreen';
import ProfileScreen from './screens/ProfileScreen';

import { UserProvider } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import { MascotProvider } from './contexts/MascotContext';
import { ReminderProvider } from './contexts/ReminderContext';
import { FileProvider } from './contexts/FileContext';

import { setupNotificationChannels } from './utils/notifications';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    setupNotificationChannels();
  }, []);

  return (
    <UserProvider>
      <MascotProvider>
        <TaskProvider>
          <ReminderProvider>
            <FileProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Splash />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/name-entry" element={<NameEntry />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/files" element={<FileOrganizer />} />
                  <Route path="/folder/:folderId" element={<FolderDetail />} />
                  <Route path="/mascot" element={<MascotScreen />} />
                  <Route path="/reminders" element={<RemindersScreen />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </FileProvider>
          </ReminderProvider>
        </TaskProvider>
      </MascotProvider>
    </UserProvider>
  );
}
