import { BrainCircuit, Cpu, Sparkles, Zap } from 'lucide-react';

export const AI_MODELS = [
  {
    id: 'idr-ai-v1',
    name: 'IDR AI',
    menuName: 'IDR AI',
    desc: 'Your custom-trained, advanced AI model',
    icon: BrainCircuit,
    color: 'text-emerald-400',
    badgeColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    badge: 'Custom',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    menuName: 'GPT-4o (OpenRouter)',
    desc: "OpenAI's flagship high-speed model",
    icon: Zap,
    color: 'text-blue-500',
    badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    badge: 'API',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    menuName: 'DeepSeek',
    desc: 'Advanced DeepSeek reasoning model',
    icon: Cpu,
    color: 'text-blue-400',
    badgeColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    badge: 'API',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    menuName: 'Gemini 2.5 Flash',
    desc: 'Fast and efficient everyday model',
    icon: Zap,
    color: 'text-yellow-400',
    badgeColor: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
    badge: 'API',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    menuName: 'Gemini 2.5 Pro',
    desc: "Google's pro-level complex tasks agent",
    icon: Sparkles,
    color: 'text-purple-400',
    badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    badge: 'API',
  },
];

export const GROUP_MODEL_SUMMARY = {
  id: 'group-active',
  name: 'AI Agent Group',
  desc: 'Multiple models running in collaboration',
  icon: BrainCircuit,
  color: 'text-indigo-400',
};

export const getModelById = (modelId) => AI_MODELS.find((model) => model.id === modelId);
