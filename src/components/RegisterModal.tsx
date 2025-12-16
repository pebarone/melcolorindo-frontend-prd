import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMail, IconKey, IconEye, IconEyeOff, IconAlertCircle, IconUserPlus } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../services/api';
import { useMobileAnimations } from '../hooks/useMobileAnimations';
import styles from './LoginModal.module.css'; // Reusa os estilos do LoginModal

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });
  
  const { register, error, clearError } = useAuth();
  const { spring, overlayTransition, modalVariants, overlayVariants } = useMobileAnimations();

  // Limpar formulário quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setEmailError('');
      setPasswordError('');
      setTouched({ email: false, password: false, confirmPassword: false });
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

  // Validação de email
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('Email é obrigatório');
      return false;
    }
    if (!isValidEmail(value)) {
      setEmailError('Por favor, insira um email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validação de senha
  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos como touched
    setTouched({ email: true, password: true, confirmPassword: true });

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await register(email, password);
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
                  <IconUserPlus size={32} color="#6A4C93" />
                </div>
                <h2>Criar Conta</h2>
                <p>Cadastre-se para acessar recursos exclusivos</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="register-email">Email</label>
                <div className={`${styles.inputWrapper} ${touched.email && emailError ? styles.error : ''}`}>
                  <IconMail size={18} color="#999" className={styles.inputIcon} />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      validateEmail(email);
                    }}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    className={touched.email && emailError ? styles.inputError : ''}
                  />
                </div>
                {touched.email && emailError && (
                  <span className={styles.fieldError}>{emailError}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="register-password">Senha</label>
                <div className={styles.inputWrapper}>
                  <IconKey size={18} color="#999" className={styles.inputIcon} />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, password: true }));
                      if (confirmPassword) validatePassword();
                    }}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    minLength={6}
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

              <div className={styles.inputGroup}>
                <label htmlFor="register-confirm-password">Confirmar Senha</label>
                <div className={styles.inputWrapper}>
                  <IconKey size={18} color="#999" className={styles.inputIcon} />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, confirmPassword: true }));
                      validatePassword();
                    }}
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? <IconEyeOff size={18} color="#999" /> : <IconEye size={18} color="#999" />}
                  </button>
                </div>
                {touched.confirmPassword && passwordError && (
                  <span className={styles.fieldError}>{passwordError}</span>
                )}
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
                disabled={isSubmitting || !email.trim() || !password.trim() || !confirmPassword.trim()}
              >
                {isSubmitting ? (
                  <span className={styles.loading}>
                    <span className={styles.spinner}></span>
                    Criando conta...
                  </span>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>
                Já tem uma conta?{' '}
                <button 
                  type="button" 
                  onClick={onSwitchToLogin}
                  className={styles.switchLink}
                >
                  Faça login
                </button>
              </p>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
