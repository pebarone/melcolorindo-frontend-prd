import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMail, IconKey, IconEye, IconEyeOff, IconAlertCircle, IconLogin } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../services/api';
import { useMobileAnimations } from '../hooks/useMobileAnimations';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  
  const { login, error, clearError } = useAuth();
  const { spring, overlayTransition, modalVariants, overlayVariants } = useMobileAnimations();

  // Limpar formulário quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setEmailError('');
      setTouched({ email: false, password: false });
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
    
    // Validar email
    if (!isValidEmail(email)) {
      setEmailError('Por favor, insira um email válido');
      return;
    }
    
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validar em tempo real se campo já foi tocado
    if (touched.email && value) {
      if (!isValidEmail(value)) {
        setEmailError('Email inválido');
      } else {
        setEmailError('');
      }
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    
    if (email && !isValidEmail(email)) {
      setEmailError('Por favor, insira um email válido (exemplo@dominio.com)');
    } else {
      setEmailError('');
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
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={overlayTransition}
          onClick={handleOverlayClick}
        >
          <motion.div
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={spring}
          >
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <img src="/closeicon.svg" alt="Fechar" width={24} height={24} />
            </button>

            <div className={styles.modalContent}>
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
                <div className={`${styles.inputWrapper} ${emailError && touched.email ? styles.error : ''}`}>
                  <IconMail size={18} color="#999" className={styles.inputIcon} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    className={emailError && touched.email ? styles.inputError : ''}
                  />
                </div>
                {emailError && touched.email && (
                  <motion.span 
                    className={styles.fieldError}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {emailError}
                  </motion.span>
                )}
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
                disabled={isSubmitting || !email.trim() || !password.trim() || !!emailError}
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
              <p>
                {onSwitchToRegister ? (
                  <>
                    Não tem uma conta?{' '}
                    <button 
                      type="button" 
                      onClick={onSwitchToRegister}
                      className={styles.switchLink}
                    >
                      Cadastre-se
                    </button>
                  </>
                ) : (
                  'Área restrita para administradores'
                )}
              </p>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
