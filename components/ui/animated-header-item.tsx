import { motion, AnimatePresence } from 'motion/react';

interface AnimatedHeaderItemProps {
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  width?: string;
  bgColor: string;
  textColor: string;
}

export const AnimatedHeaderItem: React.FC<AnimatedHeaderItemProps> = ({ isHovered, onHoverStart, onHoverEnd, onClick, icon, label, width = 'auto', bgColor, textColor }) => {
  return (
    <motion.div
      className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/80 h-10 overflow-hidden cursor-pointer shadow-sm dark:bg-gray-800/80 dark:border-gray-700/80"
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      animate={{ width: isHovered ? width : '40px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      onClick={onClick}
    >
      <div className={`flex items-center justify-center w-10 h-10 ${bgColor} rounded-l-lg`}>
        {icon}
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="flex items-center h-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <span className={`text-sm font-medium ${textColor} px-3 whitespace-nowrap`}>{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};