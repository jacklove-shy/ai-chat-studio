import { useEffect, useRef, useState } from 'react'
import {
  AudioLines,
  Plus,
  Search,
  ChevronDown,
  Ellipsis,
  Sparkles,
  ArrowRight,
  ArrowUp,
  Paperclip,
  Globe2,
  Mic,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Layers3,
  BookOpen,
  Settings2,
  Menu,
  X,
  Check,
  CircleHelp,
} from 'lucide-react'

type Message = { role: 'user' | 'assistant'; text: string }
type Chat = { id: string; title: string; messages: Message[] }
const starters = [
  {
    title: '帮我梳理一个想法',
    icon: Sparkles,
    prompt: '我有一个产品想法，帮我梳理目标用户、核心问题和最小可行方案。',
  },
  {
    title: '总结一篇文章',
    icon: FileText,
    prompt: '帮我总结一篇文章，并提炼出可执行的行动建议。',
  },
  {
    title: '制定项目计划',
    icon: Layers3,
    prompt: '帮我制定一个清晰的项目计划，拆解阶段、任务和里程碑。',
  },
  {
    title: '一起头脑风暴',
    icon: BookOpen,
    prompt: '围绕一个新产品给我 5 个不一样的创意方向。',
  },
]
const initialChats: Chat[] = [
  {
    id: '1',
    title: 'Q3 产品发布策划',
    messages: [
      {
        role: 'user',
        text: '帮我为一款面向远程团队的 AI 会议助手设计一个 Q3 发布方案，重点关注早期用户增长。',
      },
      {
        role: 'assistant',
        text: '当然。先把目标拆成一条清晰的路径：找到第一批愿意反复使用的团队，再用真实的会议成果带来下一批用户。\n\n**建议的 Q3 北极星指标**\n每周完成至少 3 场 AI 总结会议的活跃团队数。它同时反映激活、产品价值和留存，比注册数更能说明问题。\n\n**发布节奏**\n\n1. **7 月 · 邀请制试用** — 招募 30 个远程团队，重点观察首次会议后的 7 日回访率。\n2. **8 月 · 案例驱动增长** — 发布 3 个可复用的会议模板，并征集团队效率故事。\n3. **9 月 · 公开发布** — 开放自助注册，用模板库和团队邀请机制带动自然增长。\n\n**先验证这三件事**\n- 用户是否愿意把会议记录交给 AI 处理？\n- 总结是否能直接变成可执行的待办？\n- 邀请同事加入，是否能让产品更有价值？',
      },
    ],
  },
  {
    id: '2',
    title: '竞品研究：AI 笔记工具',
    messages: [
      { role: 'user', text: '总结当前 AI 笔记产品常见的定价模式。' },
      {
        role: 'assistant',
        text: 'AI 笔记产品通常采用免费增值、按席位订阅和用量分层三类模式。转录时长和团队协作往往是最清晰的付费边界。',
      },
    ],
  },
  {
    id: '3',
    title: '优化产品新手引导',
    messages: [
      { role: 'user', text: '如何让新用户更快体验到 AI 助手的价值？' },
      {
        role: 'assistant',
        text: '让用户先完成一个真实的小任务，比先讲解所有功能更有效。可以从示例数据开始，让用户在 30 秒内获得第一个可带走的结果。',
      },
    ],
  },
  {
    id: '4',
    title: 'TypeScript 类型设计',
    messages: [
      {
        role: 'user',
        text: '解释一下 discriminated union 在实际项目里的用法。',
      },
      {
        role: 'assistant',
        text: '它适合表达几种可能形态之一。给每种形态加一个字面量标记，TypeScript 就能在分支里自动收窄类型。',
      },
    ],
  },
]
function replyFor(prompt: string) {
  if (/计划|项目/.test(prompt))
    return '我会先把目标转成一个能验证的结果，再拆成小步：\n\n1. **定义完成标准** — 用一句话描述用户最终能做什么。\n2. **确定最小范围** — 只保留验证核心价值所需的功能。\n3. **安排里程碑** — 先做可演示路径，再补充边缘状态和细节。\n4. **收集反馈** — 找 3 位目标用户走一遍流程，记录卡点。\n\n你可以补充截止时间和参与人数，我再给你一版具体排期。'
  if (/代码|react|typescript/i.test(prompt))
    return '可以从 **数据流、组件边界和失败状态** 三个角度来拆解。先让数据结构表达清楚状态，再把异步请求封装到独立的 hook 或 service 中。这样组件只负责展示和交互，后续替换模型接口也更容易。\n\n如果你愿意，可以把具体代码贴出来，我会按这三个方向逐段分析。'
  return '我先把问题拆成几个可执行的部分：\n\n- **明确目标**：说清楚希望解决的核心问题，以及对谁有价值。\n- **收集上下文**：整理已知信息、限制条件和成功标准。\n- **快速行动**：从一个低成本的小实验开始，尽快拿到反馈。\n\n这是一个不错的起点。你可以补充更多背景，我会根据具体场景继续完善。'
}
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*.*?\*\*)/g)
        .map((part, i) =>
          part.startsWith('**') ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : (
            part
          ),
        )}
    </>
  )
}
function MessageText({ text }: { text: string }) {
  return (
    <div className="message-text">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div className="space-line" key={i} />
        const item = line.match(/^(\d+\.|- )\s*(.*)$/)
        if (item)
          return (
            <div className="list-line" key={i}>
              <span>{item[1] === '- ' ? '•' : item[1]}</span>
              <Inline text={item[2]} />
            </div>
          )
        return (
          <p key={i}>
            <Inline text={line} />
          </p>
        )
      })}
    </div>
  )
}
export default function App() {
  const [chats, setChats] = useState(initialChats)
  const [activeId, setActiveId] = useState('1')
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [railOpen, setRailOpen] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [toast, setToast] = useState('')
  const [model, setModel] = useState('Claude 3.5 Sonnet')
  const [providerOpen, setProviderOpen] = useState(false)
  const [providerUrl, setProviderUrl] = useState('https://api.openai.com/v1')
  const [providerModel, setProviderModel] = useState('gpt-4o-mini')
  const [apiKey, setApiKey] = useState('')
  const controller = useRef<AbortController | null>(null)
  const demoTimer = useRef<number | null>(null)
  const [copied, setCopied] = useState(false)
  const area = useRef<HTMLElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const active = chats.find((c) => c.id === activeId) ?? chats[0]
  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }
  function newChat() {
    const chat = {
      id: crypto.randomUUID(),
      title: '新的对话',
      messages: [] as Message[],
    }
    setChats((prev) => [chat, ...prev])
    setActiveId(chat.id)
    setRailOpen(false)
    window.setTimeout(() => input.current?.focus(), 40)
  }
  function send(value = text) {
    const prompt = value.trim()
    if (!prompt || streaming) return
    const answer = replyFor(prompt)
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: c.messages.length ? c.title : prompt.slice(0, 28),
              messages: [
                ...c.messages,
                { role: 'user', text: prompt },
                { role: 'assistant', text: '' },
              ],
            }
          : c,
      ),
    )
    setText('')
    setStreaming(true)
    if (apiKey.trim()) {
      const abortController = new AbortController()
      controller.current = abortController
      void (async () => {
        try {
          const response = await fetch(
            providerUrl.replace(/\/$/, '') + '/chat/completions',
            {
              method: 'POST',
              signal: abortController.signal,
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + apiKey.trim(),
              },
              body: JSON.stringify({
                model: providerModel,
                stream: true,
                messages: [
                  ...active.messages,
                  { role: 'user' as const, text: prompt },
                ].map((message) => ({
                  role: message.role,
                  content: message.text,
                })),
              }),
            },
          )
          if (!response.ok)
            throw new Error(
              'API 返回 ' + response.status + '：' + (await response.text()),
            )
          if (!response.body) throw new Error('当前响应不支持流式输出')
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let result = ''
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (!data || data === '[DONE]') continue
              try {
                result += JSON.parse(data).choices?.[0]?.delta?.content ?? ''
              } catch {
                /* ignore incomplete SSE frames */
              }
              setChats((prev) =>
                prev.map((c) =>
                  c.id === activeId
                    ? {
                        ...c,
                        messages: c.messages.map((message, i) =>
                          i === c.messages.length - 1
                            ? { ...message, text: result }
                            : message,
                        ),
                      }
                    : c,
                ),
              )
            }
          }
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const detail = error instanceof Error ? error.message : '未知错误'
            notify('模型请求失败：' + detail.slice(0, 100))
            setChats((prev) =>
              prev.map((c) =>
                c.id === activeId
                  ? {
                      ...c,
                      messages: c.messages.map((message, i) =>
                        i === c.messages.length - 1
                          ? {
                              ...message,
                              text: '连接模型失败。请检查 API 地址、模型名称和 Key，然后重试。',
                            }
                          : message,
                      ),
                    }
                  : c,
              ),
            )
          }
        } finally {
          controller.current = null
          setStreaming(false)
        }
      })()
      return
    }
    let n = 0
    demoTimer.current = window.setInterval(() => {
      n = Math.min(n + 3, answer.length)
      const part = answer.slice(0, n)
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m, i) =>
                  i === c.messages.length - 1 ? { ...m, text: part } : m,
                ),
              }
            : c,
        ),
      )
      if (n >= answer.length) {
        if (demoTimer.current !== null) window.clearInterval(demoTimer.current)
        demoTimer.current = null
        setStreaming(false)
      }
    }, 20)
  }
  function stopGeneration() {
    if (controller.current) {
      controller.current.abort()
      return
    }
    if (demoTimer.current !== null) window.clearInterval(demoTimer.current)
    demoTimer.current = null
    setStreaming(false)
  }
  useEffect(() => {
    area.current?.scrollTo({
      top: area.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [active.messages.length, streaming])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        newChat()
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
        setRailOpen(false)
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  const matching = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div className="app">
      {railOpen && (
        <button
          className="scrim"
          aria-label="关闭侧栏"
          onClick={() => setRailOpen(false)}
        />
      )}
      <aside className={'sidebar ' + (railOpen ? 'open' : '')}>
        <div className="brand">
          <div className="brand-icon">
            <AudioLines size={18} />
          </div>
          <span>
            forma<span className="brand-dot">.</span>
          </span>
          <button className="collapse" aria-label="收起导航">
            <ArrowRight size={15} />
          </button>
        </div>
        <button
          className="workspace"
          onClick={() => notify('工作区切换即将推出')}
        >
          <span className="workspace-avatar">S</span>
          <span>
            <b>Studio workspace</b>
            <small>个人空间</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav">
          <button className="new-chat" onClick={newChat}>
            <Plus size={16} />
            新建对话<kbd>⌘ K</kbd>
          </button>
          <button onClick={() => setSearchOpen(true)}>
            <Search size={16} />
            搜索对话<kbd>⌘ /</kbd>
          </button>
        </div>
        <div className="history-head">
          最近对话
          <Ellipsis size={17} />
        </div>
        <div className="chat-list">
          <label>今天</label>
          {chats.slice(0, 2).map((c) => (
            <button
              key={c.id}
              className={'chat-item ' + (c.id === activeId ? 'selected' : '')}
              onClick={() => {
                setActiveId(c.id)
                setRailOpen(false)
              }}
            >
              <span>{c.title}</span>
              <Ellipsis size={15} />
            </button>
          ))}
          <label>昨天</label>
          {chats.slice(2).map((c) => (
            <button
              key={c.id}
              className={'chat-item ' + (c.id === activeId ? 'selected' : '')}
              onClick={() => {
                setActiveId(c.id)
                setRailOpen(false)
              }}
            >
              <span>{c.title}</span>
              <Ellipsis size={15} />
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="pro-card">
            <div>
              <Sparkles size={15} />
              <b>解锁更多可能</b>
            </div>
            <span>探索 Forma 的高级功能</span>
            <button onClick={() => notify('演示版本中，暂不支持升级')}>
              了解 Pro <ArrowRight size={13} />
            </button>
          </div>
          <button className="user-profile" onClick={() => setMenuOpen(true)}>
            <span className="user-avatar">J</span>
            <span>
              <b>Jamie Chen</b>
              <small>免费方案</small>
            </span>
            <Ellipsis size={17} />
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="打开导航"
            onClick={() => setRailOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
            <span>Chat</span>
            <i>/</i>
            <b>{active.title}</b>
          </div>
          <div className="top-actions">
            <button onClick={() => notify('分享链接已复制')}>分享</button>
            <button
              className="icon-btn"
              aria-label="更多"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Ellipsis size={19} />
            </button>
            <span className="divider" />
            <button
              className="icon-btn"
              aria-label="帮助"
              onClick={() => notify('Forma AI Chat Studio · 演示模式')}
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <section className="chat-area" ref={area}>
          {!active.messages.length ? (
            <div className="welcome">
              <div className="eyebrow">
                <Sparkles size={13} /> YOUR THOUGHT PARTNER
              </div>
              <h1>
                下午好，Jamie<span>.</span>
              </h1>
              <p>今天有什么想法，我们一起探索？</p>
              <div className="starter-grid">
                {starters.map(({ title, icon: Icon, prompt }) => (
                  <button key={title} onClick={() => send(prompt)}>
                    <span className="starter-icon">
                      <Icon size={17} />
                    </span>
                    <span>{title}</span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              <div className="date-line">
                <span />
                今天
                <button
                  className="icon-btn"
                  onClick={() => setMenuOpen(true)}
                  aria-label="会话选项"
                >
                  <Ellipsis size={17} />
                </button>
              </div>
              {active.messages.map((m, i) => (
                <article key={active.id + i} className={'message ' + m.role}>
                  {m.role === 'user' ? (
                    <>
                      <div className="user-bubble">{m.text}</div>
                      <span className="avatar-small">J</span>
                    </>
                  ) : (
                    <>
                      <span className="assistant-mark">
                        <AudioLines size={15} />
                      </span>
                      <div className="answer">
                        <div className="answer-meta">
                          <b>Forma</b>
                          <i>·</i>
                          <span>
                            {streaming && i === active.messages.length - 1
                              ? '正在思考'
                              : model}
                          </span>
                        </div>
                        <MessageText text={m.text} />
                        {streaming && i === active.messages.length - 1 && (
                          <span className="cursor" />
                        )}
                        {m.text &&
                          !streaming &&
                          i === active.messages.length - 1 && (
                            <div className="answer-tools">
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(m.text)
                                    setCopied(true)
                                    window.setTimeout(
                                      () => setCopied(false),
                                      1400,
                                    )
                                  } catch {
                                    notify('无法访问剪贴板')
                                  }
                                }}
                              >
                                {copied ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                                {copied ? '已复制' : '复制'}
                              </button>
                              <button
                                aria-label="赞同"
                                onClick={() => notify('感谢反馈')}
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <button
                                aria-label="不赞同"
                                onClick={() => notify('感谢反馈')}
                              >
                                <ThumbsDown size={14} />
                              </button>
                              <button
                                aria-label="更多"
                                onClick={() => notify('更多操作即将推出')}
                              >
                                <Ellipsis size={15} />
                              </button>
                            </div>
                          )}
                      </div>
                    </>
                  )}
                </article>
              ))}
              {streaming && (
                <div className="thinking">
                  <span />
                  正在整理思路
                </div>
              )}
            </div>
          )}
        </section>
        <footer className="composer-area">
          <div className="composer">
            <textarea
              ref={input}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 140) + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="给 Forma 发消息…"
              rows={1}
            />
            <div className="composer-tools">
              <div>
                <button
                  aria-label="添加附件"
                  onClick={() => notify('附件上传即将推出')}
                >
                  <Paperclip size={16} />
                </button>
                <button
                  aria-label="搜索网页"
                  onClick={() => notify('联网搜索即将推出')}
                >
                  <Globe2 size={16} />
                </button>
                <span className="tool-divider" />
                <button
                  className="mode"
                  onClick={() => notify('已切换回答风格')}
                >
                  <Sparkles size={13} />
                  标准
                  <ChevronDown size={12} />
                </button>
              </div>
              <div>
                <button
                  aria-label="语音输入"
                  onClick={() => notify('语音输入即将推出')}
                >
                  <Mic size={16} />
                </button>
                <button
                  className="send"
                  aria-label={streaming ? '停止生成' : '发送'}
                  onClick={() => (streaming ? stopGeneration() : send())}
                >
                  {streaming ? (
                    <Square size={12} fill="currentColor" />
                  ) : (
                    <ArrowUp size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>{' '}
          <div className="model-picker">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <span className="model-dot" />
              {apiKey ? providerModel : model}
              <ChevronDown size={13} />
            </button>
            {menuOpen && (
              <div className="model-menu">
                <b>选择模型</b>
                {['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 2.0 Flash'].map(
                  (m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setModel(m)
                        setMenuOpen(false)
                      }}
                    >
                      <span className="model-dot" />
                      {m}
                      {model === m && <Check size={14} />}
                    </button>
                  ),
                )}
                <small>
                  {apiKey
                    ? 'API 已配置 · Key 仅保存在内存中'
                    : '演示模式 · 使用本地模拟回复'}
                </small>
                <button
                  className="preference"
                  onClick={() => {
                    setMenuOpen(false)
                    setProviderOpen(true)
                  }}
                >
                  <Settings2 size={14} />
                  配置模型 API
                </button>
              </div>
            )}
          </div>
          <div className="disclaimer">
            Forma 也会犯错。请核对重要信息。<span>·</span>
            <button onClick={() => notify('你的对话仅保存在本地演示中')}>
              隐私说明
            </button>
          </div>
        </footer>
      </main>
      <aside className="context">
        <div className="context-head">
          工作区
          <button className="icon-btn" aria-label="添加工作区">
            <Plus size={16} />
          </button>
        </div>
        <button className="resource">
          <span className="resource-icon purple">
            <Layers3 size={16} />
          </span>
          <span>
            <b>项目空间</b>
            <small>整理你的工作流</small>
          </span>
          <ArrowRight size={13} />
        </button>
        <button className="resource">
          <span className="resource-icon peach">
            <BookOpen size={16} />
          </span>
          <span>
            <b>提示词库</b>
            <small>常用提示词模板</small>
          </span>
          <ArrowRight size={13} />
        </button>
        <div className="context-rule" />
        <div className="context-head">
          本次对话
          <button
            className="icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="对话设置"
          >
            <Settings2 size={15} />
          </button>
        </div>
        <div className="empty-attachment">
          <FileText size={18} />
          <b>还没有附件</b>
          <span>
            上传文件，让 AI 帮你
            <br />
            提炼重点或回答问题。
          </span>
          <button onClick={() => notify('附件上传即将推出')}>
            <Plus size={14} />
            添加文件
          </button>
        </div>
        <div className="shortcut">
          <span>⌘</span>
          <p>
            使用 <kbd>⌘ K</kbd> 快速
            <br />
            开始新的对话
          </p>
        </div>
      </aside>

      {providerOpen && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProviderOpen(false)
          }}
        >
          <div className="provider-modal">
            <div className="provider-head">
              <div>
                <span>MODEL CONNECTION</span>
                <h2>连接模型 API</h2>
              </div>
              <button
                className="icon-btn"
                onClick={() => setProviderOpen(false)}
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
            <p>
              支持 OpenAI 兼容的 Chat Completions 接口。留空 API Key
              可使用内置演示模式。
            </p>
            <label>
              API Base URL
              <input
                value={providerUrl}
                onChange={(e) => setProviderUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </label>
            <label>
              模型名称
              <input
                value={providerModel}
                onChange={(e) => setProviderModel(e.target.value)}
                placeholder="gpt-4o-mini"
              />
            </label>
            <label>
              API Key
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-…"
                autoComplete="off"
              />
            </label>
            <div className="key-note">
              Key
              仅保存在当前页面内存中，刷新后清除。请求会直接发送到你填写的服务商地址。
            </div>
            <div className="provider-actions">
              <button
                onClick={() => {
                  setApiKey('')
                  setProviderOpen(false)
                  notify('已切换到演示模式')
                }}
              >
                使用演示模式
              </button>
              <button
                className="save-provider"
                onClick={() => {
                  setProviderOpen(false)
                  notify(apiKey ? 'API 配置已保存到当前会话' : '已保存接口偏好')
                }}
              >
                完成配置 <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      {searchOpen && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
        >
          <div className="search-modal">
            <div className="search-input">
              <Search size={18} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索你的对话…"
              />
              <kbd>ESC</kbd>
            </div>
            {matching.length ? (
              matching.map((c) => (
                <button
                  className="search-result"
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id)
                    setSearchOpen(false)
                  }}
                >
                  <AudioLines size={15} />
                  {c.title}
                  <ArrowRight size={14} />
                </button>
              ))
            ) : (
              <div className="no-results">没有找到匹配的对话</div>
            )}
            <div className="search-footer">↑↓ 浏览　　↵ 打开　　ESC 关闭</div>
          </div>
        </div>
      )}
      {menuOpen && (
        <div className="click-away" onClick={() => setMenuOpen(false)} />
      )}
      {toast && (
        <div className="toast">
          <Check size={15} />
          {toast}
        </div>
      )}
    </div>
  )
}
