import { useEffect, useState } from 'react';

const isMobile = () => {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Instalación:', outcome);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // No guardamos nada, solo lo ocultamos temporalmente
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={styles.container}>
      <p style={styles.text}>¿Deseás instalar la app?</p>
      <div style={styles.buttons}>
        <button style={styles.button} onClick={handleInstall}>Sí</button>
        <button style={styles.button} onClick={handleDismiss}>No</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: '60px',
    left: '20px',
    right: '20px',
    backgroundColor: '#32CD32',
    color: 'white',
    padding: '10px 15px',    
    borderRadius: '10px',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'sans-serif',
    boxShadow: '2px 2px 10px rgba(0,0,0,0.2)',
    minHeight: '50px',       
  },
  text: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '50px',      
  },
  buttons: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    backgroundColor: '#F0F0F0',
    color: 'black',
    border: 'none',
    padding: '8px 14px',     
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    height: '34px',          
  }
};
export default InstallPrompt;