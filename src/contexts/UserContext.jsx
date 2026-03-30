import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('marshmallow_name') || '');
  const [onboardingComplete, setOnboardingComplete] = useState(() => localStorage.getItem('marshmallow_onboarding') === 'true');
  const [mascotSettings, setMascotSettings] = useState(() => JSON.parse(localStorage.getItem('marshmallow_settings')) || {
    moodPreference: 'Adaptive',
    animationSpeed: 'Normal',
    idleBehavior: 'Float gently'
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('marshmallow_notifications') !== 'false');
  
  // New States
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('marshmallow_profile_pic') || null);
  const [alarmMode, setAlarmMode] = useState(() => localStorage.getItem('marshmallow_alarm_mode') || 'ring');

  useEffect(() => {
    localStorage.setItem('marshmallow_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('marshmallow_onboarding', onboardingComplete);
  }, [onboardingComplete]);

  useEffect(() => {
    localStorage.setItem('marshmallow_settings', JSON.stringify(mascotSettings));
  }, [mascotSettings]);

  useEffect(() => {
    localStorage.setItem('marshmallow_notifications', notificationsEnabled);
  }, [notificationsEnabled]);

  useEffect(() => {
    if (profilePic) localStorage.setItem('marshmallow_profile_pic', profilePic);
    else localStorage.removeItem('marshmallow_profile_pic');
  }, [profilePic]);

  useEffect(() => {
    localStorage.setItem('marshmallow_alarm_mode', alarmMode);
  }, [alarmMode]);

  return (
    <UserContext.Provider value={{ 
      userName, setUserName, 
      onboardingComplete, setOnboardingComplete,
      mascotSettings, setMascotSettings,
      notificationsEnabled, setNotificationsEnabled,
      profilePic, setProfilePic,
      alarmMode, setAlarmMode
    }}>
      {children}
    </UserContext.Provider>
  );
};
