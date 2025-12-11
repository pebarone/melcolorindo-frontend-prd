import { motion } from 'framer-motion';
import { IconHeart } from '../components/Icons';
import styles from './About.module.css';

export const About = () => {
  return (
    <div className={styles.page}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.content}
      >
        <div className={styles.header}>
          <h1>Sobre a Mel</h1>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.mainContent}>
          <motion.div 
            className={styles.imageContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className={styles.imageWrapper}>
              <img 
                src="/profile.jpg" 
                alt="Mel Salomão" 
                className={styles.profileImage}
              />
              <div className={styles.imageDecoration}></div>
            </div>
          </motion.div>

          <div className={styles.textContent}>
            <div className={styles.story}>
              <p>
                Olá! Sou a Mel, a criadora por trás da <strong>Mel Colorindo a Vida</strong>. 
              </p>
              <p>
                Tudo começou em 2020, com o desejo de trazer mais cor e alegria para o dia a dia das pessoas. 
                Cada peça é feita à mão, com muito cuidado e carinho, pensando em cada detalhe para que você se sinta especial.
              </p>
              <p>
                Nossa missão é espalhar sorrisos através de acessórios divertidos e encantados. 
                Acreditamos que a vida é muito curta para usar acessórios sem graça!
              </p>
            </div>

            <div className={styles.signature}>
              <p>Com amor,</p>
              <h3>Mel Salomão <IconHeart size={16} fill="var(--color-red)" color="var(--color-red)" /></h3>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
