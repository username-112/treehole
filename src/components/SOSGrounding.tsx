import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    text: "我感觉到你现在承受着很大的压力……没关系，我们先停下来，我陪你在这里喘口气。跟着屏幕的明暗，深吸气……缓缓呼气……",
    buttonText: "深呼吸",
  },
  {
    text: "现在，环顾四周，在心里默默指出五件你能看到的物品。找到了告诉我。",
    buttonText: "我找到了",
  },
  {
    text: "很好。现在伸出手，去触摸四件真实存在的物体，感受物理世界对你的承托。",
    buttonText: "我感受到了",
  },
  {
    text: "轻轻闭上眼睛，去捕捉环境里三种微小的声音。",
    buttonText: "我听到了",
  },
  {
    text: "试着去感受两种气味。如果没有，就感受微凉的空气吸入鼻腔的真实感。",
    buttonText: "呼吸的质感",
  },
  {
    text: "最后，在心里对自己默念：此时此刻，我是安全的。",
    buttonText: "我在这里",
  }
];

export const SOSGrounding = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white/10 dark:bg-black/20"
    >
      <div className="max-w-md w-full text-center space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="text-xl md:text-2xl font-light tracking-wide text-foreground/90"
          >
            {steps[currentStep].text}
          </motion.div>
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={handleNext}
          className="glassmorphism px-8 py-3 text-lg hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-500 rounded-full"
        >
          {steps[currentStep].buttonText}
        </motion.button>
      </div>
    </motion.div>
  );
};
