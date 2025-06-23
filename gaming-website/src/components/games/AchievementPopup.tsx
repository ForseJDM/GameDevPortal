import { motion } from 'framer-motion';

type AchievementPopupProps = {
  name: string;
  description: string;
  onClose: () => void;
};

const AchievementPopup = ({ name, description, onClose }: AchievementPopupProps) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="fixed top-5 right-5 z-50 p-4 bg-green-500 text-white rounded-lg shadow-lg"
      onClick={onClose}
    >
      <h3 className="font-bold text-lg">Достижение получено!</h3>
      <p>«{name}» - {description}</p>
    </motion.div>
  );
};

export default AchievementPopup; 