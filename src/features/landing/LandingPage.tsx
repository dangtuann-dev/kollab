import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
  Layers, Kanban, ListChecks, Users, BarChart3, Zap,
  ChevronRight, Check, Star, ArrowRight, Menu, X,
  Calendar, Target, TrendingUp, Shield, Clock, Globe,
  Sparkles, Play, ChevronDown
} from 'lucide-react'

const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

const useCountUp = (target: number, duration = 2000, started = false) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, started])
  return count
}

const features = [
  {
    icon: Kanban,
    title: 'Sprint Board Trực quan',
    desc: 'Kanban board kéo-thả mượt mà. Theo dõi tiến độ từng task theo thời gian thực trong mỗi Sprint.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-100 dark:border-rose-900/40',
  },
  {
    icon: ListChecks,
    title: 'Product Backlog',
    desc: 'Quản lý User Stories, phân loại độ ưu tiên MoSCoW và kéo thả vào Sprint Planning cực dễ dàng.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-100 dark:border-violet-900/40',
  },
  {
    icon: Calendar,
    title: 'Scrum Ceremonies',
    desc: 'Phòng họp số cho Sprint Planning, Daily Standup, Sprint Review và Retrospective tích hợp sẵn.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-900/40',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo & Biểu đồ',
    desc: 'Burndown chart, velocity chart và báo cáo Sprint tự động giúp team nhìn rõ hiệu suất.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-100 dark:border-emerald-900/40',
  },
  {
    icon: Users,
    title: 'Quản lý Nhóm',
    desc: 'Phân quyền linh hoạt theo vai trò: Product Owner, Scrum Master, Developer và vai trò tùy chỉnh.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-100 dark:border-amber-900/40',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    desc: 'Mọi thay đổi được đồng bộ ngay lập tức cho toàn bộ thành viên — không cần F5, không bao giờ lỗi thời.',
    color: 'from-fuchsia-500 to-rose-600',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
    border: 'border-fuchsia-100 dark:border-fuchsia-900/40',
  },
]

const steps = [
  {
    num: '01',
    icon: Target,
    title: 'Tạo Dự Án',
    desc: 'Khởi tạo dự án trong vài giây. Thêm thành viên và phân quyền vai trò ngay lập tức.',
  },
  {
    num: '02',
    icon: Layers,
    title: 'Lập Kế Hoạch Sprint',
    desc: 'Kéo User Stories từ Backlog vào Sprint. Ước lượng story points và phân công thành viên.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Theo Dõi & Cải Thiện',
    desc: 'Biểu đồ burndown tự động cập nhật. Retrospective cuối sprint giúp team ngày càng tốt hơn.',
  },
]

const testimonials = [
  {
    quote: 'Kollab giúp team của mình chuyển từ Excel loạn xạ sang Scrum thực sự chỉ trong một tuần. Burndown chart tự động là điểm tôi thích nhất!',
    name: 'Nguyễn Thành Long',
    role: 'Scrum Master · FPT Software',
    avatar: '🦊',
    stars: 5,
  },
  {
    quote: 'Giao diện đẹp, dễ dùng và đầy đủ tính năng. Từ backlog đến ceremonies đều có sẵn — không cần ghép nhiều tool nữa.',
    name: 'Trần Minh Châu',
    role: 'Product Owner · Tiki',
    avatar: '🐼',
    stars: 5,
  },
  {
    quote: 'Team mình 12 người, remote 100%. Kollab giúp Daily Standup nhanh gọn và mọi người luôn nắm được tiến độ dù khác múi giờ.',
    name: 'Lê Phương Anh',
    role: 'Tech Lead · VNG',
    avatar: '🦁',
    stars: 5,
  },
]

const pricing = [
  {
    name: 'Miễn phí',
    price: '0',
    period: 'mãi mãi',
    desc: 'Dành cho team nhỏ và dự án cá nhân',
    features: [
      'Tối đa 3 dự án',
      'Tối đa 5 thành viên/dự án',
      'Sprint Board & Backlog',
      'Báo cáo cơ bản',
    ],
    cta: 'Bắt đầu miễn phí',
    highlight: false,
    variant: 'outline',
  },
  {
    name: 'Pro',
    price: '199.000',
    period: '/tháng/dự án',
    desc: 'Cho team chuyên nghiệp cần đầy đủ tính năng',
    features: [
      'Dự án không giới hạn',
      'Thành viên không giới hạn',
      'Toàn bộ Scrum Ceremonies',
      'Báo cáo nâng cao & xuất PDF',
      'Vai trò tùy chỉnh',
      'Ưu tiên hỗ trợ',
    ],
    cta: 'Dùng thử 14 ngày',
    highlight: true,
    variant: 'primary',
  },
  {
    name: 'Enterprise',
    price: 'Liên hệ',
    period: '',
    desc: 'Giải pháp toàn diện cho doanh nghiệp lớn',
    features: [
      'Tất cả tính năng Pro',
      'SSO / SAML',
      'Triển khai On-premise',
      'SLA 99.9% uptime',
      'Hỗ trợ 24/7 riêng',
      'Custom integrations',
    ],
    cta: 'Liên hệ tư vấn',
    highlight: false,
    variant: 'outline',
  },
]

const stats = [
  { value: 5200, suffix: '+', label: 'Teams đang dùng' },
  { value: 98, suffix: '%', label: 'Hài lòng' },
  { value: 120, suffix: 'K+', label: 'Sprint hoàn thành' },
  { value: 40, suffix: '%', label: 'Năng suất tăng' },
]

const MockupBoard = () => (
  <div className="relative w-full max-w-2xl mx-auto">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-purple-500/10 to-blue-500/20 rounded-3xl blur-3xl" />
    <div className="relative bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-white/15 dark:bg-black/20 px-4 py-3 flex items-center gap-2 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-rose-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-white/60 font-mono">kollab.app/projects/my-product/board</span>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {[
          { title: 'Cần làm', color: 'bg-neutral-400/30', items: ['Thiết kế UI/UX', 'Viết API docs', 'Setup CI/CD'] },
          { title: 'Đang làm', color: 'bg-blue-400/30', items: ['Sprint Board', 'Auth module'] },
          { title: 'Hoàn thành', color: 'bg-emerald-400/30', items: ['Backlog setup', 'Team roles', 'Database schema'] },
        ].map((col) => (
          <div key={col.title} className="flex flex-col gap-2">
            <div className={`${col.color} rounded-lg px-2 py-1 text-center`}>
              <span className="text-white text-[10px] font-bold">{col.title}</span>
            </div>
            {col.items.map((item) => (
              <div key={item} className="bg-white/10 dark:bg-white/5 border border-white/10 rounded-lg px-2.5 py-2">
                <div className="text-white/80 text-[9px] font-medium leading-tight">{item}</div>
                <div className="mt-1.5 flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-rose-400/60 flex items-center justify-center text-[6px]">🦊</div>
                  <div className="h-1 flex-1 rounded bg-white/10">
                    <div className="h-full rounded bg-rose-400/70" style={{ width: `${Math.random() * 60 + 30}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 flex items-center gap-3">
        <div className="flex -space-x-2">
          {['🦊', '🐼', '🦁', '🐯'].map((a) => (
            <div key={a} className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">{a}</div>
          ))}
        </div>
        <div className="flex-1 h-1.5 rounded bg-white/10">
          <div className="h-full rounded bg-gradient-to-r from-rose-500 to-pink-400" style={{ width: '62%' }} />
        </div>
        <span className="text-white/60 text-[10px]">62% Sprint</span>
      </div>
    </div>
  </div>
)

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroSection = useInView(0.1)
  const featuresSection = useInView(0.1)
  const stepsSection = useInView(0.1)
  const statsSection = useInView(0.1)
  const testimonialsSection = useInView(0.1)
  const pricingSection = useInView(0.1)

  const c0 = useCountUp(stats[0].value, 2000, statsSection.inView)
  const c1 = useCountUp(stats[1].value, 1800, statsSection.inView)
  const c2 = useCountUp(stats[2].value, 2200, statsSection.inView)
  const c3 = useCountUp(stats[3].value, 1600, statsSection.inView)
  const counters = [c0, c1, c2, c3]

  const navLinks = [
    { label: 'Tính năng', href: '#features' },
    { label: 'Cách hoạt động', href: '#how-it-works' },
    { label: 'Bảng giá', href: '#pricing' },
  ]

  const scrollTo = (id: string) => {
    document.getElementById(id.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans overflow-x-hidden">

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200/50 dark:border-neutral-800/50 shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
              <Layers className="h-4.5 w-4.5 text-white" size={18} />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Kollab</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Đăng nhập
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-500 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-105 transition-all">
              Bắt đầu miễn phí
              <ArrowRight size={14} />
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 flex flex-col gap-2 animate-slide-up">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => scrollTo(link.href)} className="text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                {link.label}
              </button>
            ))}
            <hr className="border-neutral-200 dark:border-neutral-700 my-1" />
            <Link to="/login" className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Đăng nhập</Link>
            <Link to="/register" className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-500 rounded-xl text-center">Bắt đầu miễn phí</Link>
          </div>
        )}
      </header>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-purple-50/50 dark:from-neutral-950 dark:via-neutral-950 dark:to-purple-950/20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-rose-400/10 dark:bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-rose-300/50 dark:via-rose-700/30 to-transparent" />

        <div ref={heroSection.ref} className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${heroSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <Sparkles size={12} className="animate-pulse" />
              Nền tảng Scrum & Agile cho team Việt
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
              Quản lý dự án{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Agile
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 6 Q50 0 100 6 Q150 12 200 6" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="grad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#e11d48" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {' '}đơn giản{' '}
              <br className="hidden sm:block" />
              <span className="text-neutral-800 dark:text-white">& hiệu quả hơn bao giờ hết</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Kollab tích hợp Sprint Board, Backlog, Ceremonies và báo cáo Scrum trong một nền tảng thống nhất — giúp team của bạn phát hành phần mềm nhanh hơn và phối hợp tốt hơn.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all text-base">
                Bắt đầu miễn phí
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => scrollTo('#how-it-works')}
                className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-6 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-700 transition-all text-base bg-white/50 dark:bg-white/5 backdrop-blur-sm"
              >
                <Play size={16} className="text-rose-500" />
                Xem cách hoạt động
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-neutral-400 dark:text-neutral-500">
              {['Không cần thẻ tín dụng', 'Miễn phí mãi mãi', 'Setup dưới 2 phút'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 px-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MockupBoard />
          </div>

          <div className="mt-8 flex justify-center">
            <button onClick={() => scrollTo('#features')} className="flex flex-col items-center gap-1 text-neutral-400 hover:text-rose-500 transition-colors animate-bounce">
              <span className="text-xs">Khám phá</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700">
        <div ref={statsSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center transition-all duration-700 ${statsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl lg:text-5xl font-black text-white mb-1">
                  {counters[i]}{stat.suffix}
                </div>
                <div className="text-rose-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white dark:bg-neutral-950">
        <div ref={featuresSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Shield size={12} />
              Tính năng toàn diện
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white mb-4 leading-tight">
              Mọi thứ team Scrum cần,<br />
              <span className="bg-gradient-to-r from-violet-600 to-rose-600 bg-clip-text text-transparent">tất cả trong một nơi</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
              Từ backlog đến retrospective, Kollab đi cùng team bạn qua toàn bộ vòng đời Scrum.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={`group ${f.bg} border ${f.border} rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div ref={stepsSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${stepsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Clock size={12} />
              Bắt đầu trong 2 phút
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white mb-4">
              3 bước đơn giản để{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">ship faster</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-rose-300 to-emerald-300 dark:from-rose-700 dark:to-emerald-700" />
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className={`relative text-center transition-all duration-700 ${stepsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full blur-lg opacity-30" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-xl shadow-rose-500/30">
                        <Icon className="text-white" size={28} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-black flex items-center justify-center border-2 border-white dark:border-neutral-900">
                        {step.num.slice(-1)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-neutral-950 overflow-hidden">
        <div ref={testimonialsSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${testimonialsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Star size={12} />
              5.0 ★ từ hàng nghìn team
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white">
              Đồng đội của bạn{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">yêu thích</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${testimonialsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div ref={pricingSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${pricingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Globe size={12} />
              Bảng giá minh bạch
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white mb-4">
              Chọn gói phù hợp với{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">team của bạn</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {pricing.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition-all duration-700 ${pricingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${plan.highlight
                  ? 'bg-gradient-to-b from-rose-600 to-pink-700 text-white shadow-2xl shadow-rose-500/30 scale-105'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                    ⭐ Phổ biến nhất
                  </div>
                )}
                <h3 className={`text-xl font-black mb-1 ${plan.highlight ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-rose-200' : 'text-neutral-500 dark:text-neutral-400'}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>{plan.price}</span>
                  {plan.price !== 'Liên hệ' && <span className={`text-sm ml-1 ${plan.highlight ? 'text-rose-200' : 'text-neutral-500 dark:text-neutral-400'}`}>₫{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-white/20' : 'bg-emerald-50 dark:bg-emerald-900/30'}`}>
                        <Check size={11} className={plan.highlight ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
                      </div>
                      <span className={plan.highlight ? 'text-rose-100' : 'text-neutral-700 dark:text-neutral-300'}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Enterprise' ? 'mailto:hello@kollab.app' : '/register'}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${plan.highlight
                    ? 'bg-white text-rose-600 hover:bg-rose-50 shadow-lg hover:shadow-xl'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
                  }`}
                >
                  {plan.cta}
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-purple-950 dark:from-neutral-950 dark:to-purple-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
            Team của bạn xứng đáng có{' '}
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">công cụ tốt hơn</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Tham gia cùng 5.000+ team đang dùng Kollab để sprint thành công hơn mỗi ngày. Bắt đầu miễn phí, không cần thẻ tín dụng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all text-lg">
              Bắt đầu ngay — Miễn phí
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="mt-4 text-neutral-500 text-sm">Setup dưới 2 phút · Không cần thẻ tín dụng · Hủy bất kỳ lúc nào</p>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-neutral-900 dark:bg-neutral-950 border-t border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <Layers size={16} className="text-white" />
                </div>
                <span className="text-lg font-extrabold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Kollab</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">Nền tảng Agile & Scrum cho team Việt Nam phát triển phần mềm hiệu quả.</p>
            </div>
            {[
              { title: 'Sản phẩm', links: ['Tính năng', 'Bảng giá', 'Changelog', 'Lộ trình'] },
              { title: 'Tài nguyên', links: ['Tài liệu', 'Blog', 'Hướng dẫn Scrum', 'Hỗ trợ'] },
              { title: 'Công ty', links: ['Về chúng tôi', 'Liên hệ', 'Điều khoản', 'Bảo mật'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-neutral-400 hover:text-rose-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">© 2026 Kollab. Được xây dựng với ❤️ tại Việt Nam.</p>
            <p className="text-neutral-600 text-xs">Made with React + Supabase + Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
