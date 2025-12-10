import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMail, IconKey, IconEye, IconEyeOff, IconAlertCircle, IconLogin } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError } = useAuth();

  // Limpar formulário quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      clearError();
    }
  }, [isOpen, clearError]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(email, password);
      onClose();
    } catch {
      // Erro já está sendo tratado no contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <img src="/closeicon.svg" alt="Fechar" width={24} height={24} />
            </button>

            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <IconLogin size={32} color="#6A4C93" />
              </div>
              <h2>Bem-vindo de volta!</h2>
              <p>Entre na sua conta para continuar</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="login-email">Email</label>
                <div className={styles.inputWrapper}>
                  <IconMail size={18} color="#999" className={styles.inputIcon} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="login-password">Senha</label>
                <div className={styles.inputWrapper}>
                  <IconKey size={18} color="#999" className={styles.inputIcon} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <IconEyeOff size={18} color="#999" /> : <IconEye size={18} color="#999" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  className={styles.error}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <IconAlertCircle size={20} color="#c62828" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !email.trim() || !password.trim()}
              >
                {isSubmitting ? (
                  <span className={styles.loading}>
                    <span className={styles.spinner}></span>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>Área restrita para administradores</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
