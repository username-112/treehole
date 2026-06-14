'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { SOSGrounding } from '@/components/SOSGrounding';
import { TypingIndicator } from '@/components/TypingIndicator';

function getMessageText(m: { parts: Array<{ type: string; text?: string }> }): string {
  return m.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}

export default function Home() {
  const [input, setInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { messages, setMessages, sendMessage, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant' as const,
          parts: [{ type: 'text' as const, text: '抱歉，我刚才稍微走了一下神，没有完全听清。你能再跟我说一遍吗？' }]
        }
      ]);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const [isSOSMode, setIsSOSMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSOSComplete = () => {
    setIsSOSMode(false);
    sendMessage({
      text: '【系统指令：用户刚刚完成了一次情绪急救（5-4-3-2-1着陆练习）。请输出一句安抚的话语，比如："欢迎回来。刚才那几分钟你做得非常好。现在的感觉有没有稍微好一点点？" 不要提及这是系统指令。】'
    });
  };

  const handleClear = () => {
    setMessages([]);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-transparent">

      {/* 第 0 层：本地视频背景 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        src="/rain_bg.mp4"
      />

      {/* 第 10 层：半透明黑色遮罩 */}
      <div className="fixed inset-0 bg-black/40 z-10 pointer-events-none" />

      {/* 隐藏的白噪音音频 */}
      <audio
        ref={audioRef}
        src="/rain.mp3"
        loop
      />

      {/* 右上角：听雨控制按钮 (z-30) */}
      <button
        onClick={toggleAudio}
        className="absolute top-6 right-6 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all shadow-lg text-2xl"
        title="环境音"
      >
        {isPlaying ? "⏸️" : "🌧️"}
      </button>

      {/* SOS 全屏覆盖 */}
      <AnimatePresence>
        {isSOSMode && <SOSGrounding onComplete={handleSOSComplete} />}
      </AnimatePresence>

      {/* 第 20 层：聊天主界面 */}
      <div className="relative z-20 flex flex-col h-screen max-w-2xl mx-auto p-4 md:p-8">

        {/* 清空记录按钮 */}
        <div className="flex justify-center py-4">
          <button
            onClick={handleClear}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 text-gray-200"
          >
            <span>🍵 喝口热茶，重新开始</span>
          </button>
        </div>

        {/* 聊天记录区域 */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-24 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.filter(m => !getMessageText(m).includes('【系统指令')).map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`glassmorphism px-6 py-4 max-w-[85%] ${m.role === 'user' ? 'bg-white/20' : ''}`}
                >
                  <p className="whitespace-pre-wrap text-gray-200">{getMessageText(m)}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入区域 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none z-20">
          <div className="max-w-2xl mx-auto flex items-center gap-4 pointer-events-auto">
            <button
              onClick={() => setIsSOSMode(true)}
              className="p-3 glassmorphism hover:bg-white/20 transition-colors rounded-full flex-shrink-0"
              title="情绪急救"
            >
              <Leaf className="w-6 h-6 opacity-70" />
            </button>
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="今天过得怎么样？想聊点什么都可以……"
                className="w-full glassmorphism px-6 py-4 outline-none placeholder:opacity-50 text-gray-200"
                disabled={isSOSMode || isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
