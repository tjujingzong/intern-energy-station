import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { useData } from '../store/dataStore';
import { Save, RefreshCw, Key, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const me = useAuth((s) => s.current());
  const getKey = useAuth((s) => s.getDeepseekKey);
  const setKey = useAuth((s) => s.setDeepseekKey);
  const reset = useData((s) => s.resetAll);

  const [key, setKeyVal] = useState(getKey());
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">设置</h2>
        <p className="text-sm text-slate-500 mt-1">配置 AI 能力与重置演示数据。</p>
      </div>

      <div className="card">
        <div className="section-title">
          <Sparkles size={16} className="text-brand-600" /> 当前用户
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-slate-500">姓名</div>
            <div className="font-medium">{me?.name || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500">账号</div>
            <div className="font-medium">{me?.id || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500">角色</div>
            <div className="font-medium">{me?.role || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500">团队</div>
            <div className="font-medium">{me?.team || '-'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <Key size={16} className="text-brand-600" /> DeepSeek API Key
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          填写后，本应用所有 AI 能力（周报生成 / AI 导师 / 反馈助手 / 适岗分析 / 批次报告）将调用
          DeepSeek 真实大模型；未填写时会使用本地模拟回答以保证演示可用。Key 仅存储在你本地浏览器，
          不会上传到任何服务器，可随时清除。
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              className="input pr-10"
              type={show ? 'text' : 'password'}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={key}
              onChange={(e) => {
                setKeyVal(e.target.value);
                setSaved(false);
              }}
            />
            <button
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setKey(key.trim());
              setSaved(true);
            }}
          >
            <Save size={14} /> 保存
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setKeyVal('');
              setKey('');
              setSaved(true);
            }}
          >
            清除
          </button>
        </div>
        {saved && <div className="text-emerald-600 text-xs mt-2">已保存。AI 调用将立即生效。</div>}
        <div className="text-xs text-slate-400 mt-3">
          API 端点：https://api.deepseek.com/v1/chat/completions · 模型：deepseek-chat
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <RefreshCw size={16} className="text-brand-600" /> 演示数据
        </div>
        <p className="text-xs text-slate-500 mt-1">
          重置后将清空本地任务勾选、周报反馈与 AI 对话历史，恢复为初始 20 名实习生的示例数据。
        </p>
        <button
          className="btn-outline mt-3"
          onClick={() => {
            if (confirm('确认重置所有 Demo 数据？')) reset();
          }}
        >
          <RefreshCw size={14} /> 重置 Demo 数据
        </button>
      </div>
    </div>
  );
}
