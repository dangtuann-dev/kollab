import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { LogoIcon } from '../../components/ui/Logo'
import {
  Layers, Kanban, ListChecks, Users, BarChart3, Zap,
  ChevronRight, Check, Star, ArrowRight, Menu, X,
  Calendar, Target, TrendingUp, Clock,
  Play, ChevronDown
} from 'lucide-react'

const useInView = (threshold = 0.1) => {
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
    title: 'Sprint Board',
    desc: 'Kanban board kéo-thả trực quan. Theo dõi tiến độ từng task trong Sprint theo thời gian thực.',
  },
  {
    icon: ListChecks,
    title: 'Product Backlog',
    desc: 'Quản lý User Stories, phân loại độ ưu tiên MoSCoW và kéo vào Sprint Planning cực dễ dàng.',
  },
  {
    icon: Calendar,
    title: 'Scrum Ceremonies',
    desc: 'Sprint Planning, Daily Standup, Sprint Review và Retrospective — tất cả tích hợp sẵn trong một nơi.',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo & Biểu đồ',
    desc: 'Burndown chart, velocity chart và báo cáo Sprint tự động — không cần nhập liệu thủ công.',
  },
  {
    icon: Users,
    title: 'Quản lý Thành viên',
    desc: 'Phân quyền linh hoạt: Product Owner, Scrum Master, Developer và vai trò tùy chỉnh.',
  },
  {
    icon: Zap,
    title: 'Đồng bộ Thời gian Thực',
    desc: 'Mọi thay đổi đồng bộ ngay lập tức — không cần tải lại trang, không bao giờ lỗi thời.',
  },
]

const steps = [
  {
    num: '01',
    icon: Target,
    title: 'Tạo dự án',
    desc: 'Khởi tạo dự án trong vài giây. Thêm thành viên và phân quyền vai trò ngay lập tức.',
  },
  {
    num: '02',
    icon: Layers,
    title: 'Lập kế hoạch Sprint',
    desc: 'Kéo User Stories từ Backlog vào Sprint. Ước lượng story points và phân công thành viên.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Theo dõi & Cải thiện',
    desc: 'Biểu đồ burndown cập nhật tự động. Retrospective giúp team liên tục cải thiện mỗi Sprint.',
  },
]

const testimonials = [
  {
    quote: 'Kollab giúp team chúng tôi chuyển từ Excel sang Scrum thực sự chỉ trong một tuần. Burndown chart tự động là điểm chúng tôi thích nhất.',
    name: 'Nguyễn Thành Long',
    role: 'Scrum Master',
    company: 'FPT Software',
    initial: 'N',
  },
  {
    quote: 'Giao diện sạch, dễ dùng và đầy đủ tính năng. Từ backlog đến ceremonies đều có sẵn — không cần ghép nhiều tool nữa.',
    name: 'Trần Minh Châu',
    role: 'Product Owner',
    company: 'Tiki',
    initial: 'T',
  },
  {
    quote: 'Team chúng tôi làm việc remote 100%. Kollab giúp Daily Standup nhanh gọn và mọi người luôn nắm được tiến độ dù khác múi giờ.',
    name: 'Lê Phương Anh',
    role: 'Tech Lead',
    company: 'VNG',
    initial: 'L',
  },
]

const pricing = [
  {
    name: 'Free',
    price: '0',
    desc: 'Dành cho team nhỏ và dự án cá nhân',
    features: [
      'Tối đa 3 dự án',
      'Tối đa 5 thành viên/dự án',
      'Sprint Board & Backlog',
      'Báo cáo cơ bản',
    ],
    cta: 'Bắt đầu miễn phí',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '199.000',
    priceUnit: '₫/tháng',
    desc: 'Cho team chuyên nghiệp cần đầy đủ tính năng',
    features: [
      'Dự án không giới hạn',
      'Thành viên không giới hạn',
      'Toàn bộ Scrum Ceremonies',
      'Báo cáo nâng cao & xuất PDF',
      'Vai trò tùy chỉnh',
      'Hỗ trợ ưu tiên',
    ],
    cta: 'Dùng thử 14 ngày',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Liên hệ',
    desc: 'Giải pháp toàn diện cho doanh nghiệp',
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
  },
]

const stats = [
  { value: 5200, suffix: '+', label: 'Teams đang dùng' },
  { value: 98, suffix: '%', label: 'Hài lòng' },
  { value: 120, suffix: 'K+', label: 'Sprint hoàn thành' },
  { value: 40, suffix: '%', label: 'Năng suất tăng' },
]

const BoardMockup = () => (
  <div className="w-full rounded-2xl border border-neutral-200 overflow-hidden shadow-2xl shadow-neutral-200/60 bg-white">
    <div className="border-b border-neutral-100 px-5 py-3.5 flex items-center gap-3 bg-neutral-50">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-neutral-300" />
        <div className="w-3 h-3 rounded-full bg-neutral-300" />
        <div className="w-3 h-3 rounded-full bg-neutral-300" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          <span className="text-xs text-neutral-400 font-mono tracking-tight">kollab.app / my-project / board</span>
        </div>
      </div>
    </div>

    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-neutral-400 font-medium mb-1">Sprint 4 · 14 ngày còn lại</div>
          <div className="text-sm font-semibold text-neutral-800">My Product · Q3 2026</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-32 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-rose-500" style={{ width: '62%' }} />
          </div>
          <span className="text-xs text-neutral-500">62%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            title: 'To Do', count: 3, dot: 'bg-neutral-300',
            cards: [
              { label: 'Thiết kế UI onboarding', pts: 3, assignee: 'N' },
              { label: 'Viết API documentation', pts: 2, assignee: 'T' },
              { label: 'Setup CI/CD pipeline', pts: 5, assignee: 'L' },
            ]
          },
          {
            title: 'In Progress', count: 2, dot: 'bg-blue-400',
            cards: [
              { label: 'Sprint Board — kéo thả', pts: 8, assignee: 'N' },
              { label: 'Auth module & JWT', pts: 5, assignee: 'T' },
            ]
          },
          {
            title: 'Done', count: 3, dot: 'bg-emerald-400',
            cards: [
              { label: 'Backlog setup', pts: 3, assignee: 'L' },
              { label: 'Team roles & permissions', pts: 2, assignee: 'N' },
              { label: 'Database schema', pts: 5, assignee: 'T' },
            ]
          },
        ].map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className="text-xs font-semibold text-neutral-600">{col.title}</span>
              <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 rounded-md px-1.5 py-0.5">{col.count}</span>
            </div>
            <div className="space-y-2">
              {col.cards.map((card) => (
                <div key={card.label} className="bg-white border border-neutral-150 rounded-xl p-3 shadow-sm hover:shadow-md hover:-translate-y-px transition-all cursor-pointer group">
                  <div className="text-[11px] font-medium text-neutral-700 leading-snug mb-2.5 group-hover:text-neutral-900 transition-colors">{card.label}</div>
                  <div className="flex items-center justify-between">
                    <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-rose-600">{card.assignee}</span>
                    </div>
                    <span className="text-[9px] font-medium text-neutral-400 bg-neutral-50 border border-neutral-100 rounded px-1.5 py-0.5">{card.pts} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroSection = useInView(0.05)
  const featuresSection = useInView(0.05)
  const stepsSection = useInView(0.05)
  const statsSection = useInView(0.1)
  const testimonialsSection = useInView(0.05)
  const pricingSection = useInView(0.05)

  const c0 = useCountUp(stats[0].value, 2000, statsSection.inView)
  const c1 = useCountUp(stats[1].value, 1800, statsSection.inView)
  const c2 = useCountUp(stats[2].value, 2200, statsSection.inView)
  const c3 = useCountUp(stats[3].value, 1600, statsSection.inView)
  const counters = [c0, c1, c2, c3]

  const navLinks = [
    { label: 'Tính năng', href: 'features' },
    { label: 'Cách hoạt động', href: 'how-it-works' },
    { label: 'Bảng giá', href: 'pricing' },
  ]

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans overflow-x-hidden antialiased">

      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 shrink-0">
              <LogoIcon />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900 font-display">Kollab</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Bắt đầu miễn phí
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-100 px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-left px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-neutral-100 my-2" />
            <Link to="/login" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg">Đăng nhập</Link>
            <Link to="/register" className="px-4 py-2.5 text-sm font-semibold text-white bg-neutral-900 rounded-lg text-center">Bắt đầu miễn phí</Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-20">
        <div
          ref={heroSection.ref}
          className={`max-w-6xl mx-auto px-6 lg:px-8 transition-all duration-700 ${heroSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-500 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Nền tảng Scrum & Agile cho team Việt Nam
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-neutral-900 mb-7">
              Quản lý dự án Agile{' '}
              <span className="text-rose-600">đơn giản</span>{' '}
              hơn bao giờ hết
            </h1>

            <p className="text-lg text-neutral-500 max-w-2xl leading-relaxed mb-10">
              Kollab tích hợp Sprint Board, Backlog, Scrum Ceremonies và báo cáo trong một nền tảng thống nhất — giúp team ship phần mềm nhanh hơn và phối hợp hiệu quả hơn.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
              >
                Bắt đầu miễn phí
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium px-4 py-3.5 rounded-xl text-sm border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <Play size={14} className="fill-current opacity-60" />
                Xem cách hoạt động
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-400">
              {['Không cần thẻ tín dụng', 'Miễn phí mãi mãi cho team nhỏ', 'Setup dưới 2 phút'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check size={12} className="text-neutral-400" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-x-0 -bottom-12 h-32 bg-gradient-to-b from-transparent to-white z-10 pointer-events-none" />
            <BoardMockup />
          </div>

          <div className="mt-24 flex justify-center">
            <button
              onClick={() => scrollTo('features')}
              className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <span className="text-xs tracking-widest uppercase">Khám phá</span>
              <ChevronDown size={16} className="animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-neutral-100">
        <div
          ref={statsSection.ref}
          className="max-w-6xl mx-auto px-6 lg:px-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`transition-all duration-700 ${statsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-1 tabular-nums">
                  {counters[i]}{stat.suffix}
                </div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div
          ref={featuresSection.ref}
          className="max-w-6xl mx-auto px-6 lg:px-8"
        >
          <div className={`mb-16 transition-all duration-700 ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-4">Tính năng</div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight max-w-xl">
              Mọi thứ một team Scrum cần
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={`bg-white p-8 hover:bg-neutral-50 transition-all duration-300 group ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-rose-50 flex items-center justify-center mb-5 transition-colors">
                    <Icon className="text-neutral-700 group-hover:text-rose-600 transition-colors" size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 bg-neutral-950 text-white">
        <div
          ref={stepsSection.ref}
          className="max-w-6xl mx-auto px-6 lg:px-8"
        >
          <div className={`mb-20 transition-all duration-700 ${stepsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Quy trình</div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight max-w-xl">
              3 bước để bắt đầu Sprint đầu tiên
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className={`transition-all duration-700 ${stepsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl border border-neutral-800 flex items-center justify-center">
                      <Icon className="text-neutral-400" size={20} />
                    </div>
                    <span className="text-5xl font-bold text-neutral-800 font-display tabular-nums">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-16 pt-16 border-t border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Clock size={14} />
              <span>Setup hoàn chỉnh trong dưới 2 phút</span>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Bắt đầu ngay
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28">
        <div
          ref={testimonialsSection.ref}
          className="max-w-6xl mx-auto px-6 lg:px-8"
        >
          <div className={`mb-16 transition-all duration-700 ${testimonialsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-2 text-sm text-neutral-500">5.0 · Hàng nghìn team tin dùng</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight max-w-xl">
              Team của bạn sẽ yêu thích Kollab
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`border border-neutral-100 rounded-2xl p-7 hover:border-neutral-200 hover:shadow-lg hover:shadow-neutral-100 transition-all duration-300 ${testimonialsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{t.initial}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{t.name}</div>
                    <div className="text-xs text-neutral-400">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 bg-neutral-50">
        <div
          ref={pricingSection.ref}
          className="max-w-6xl mx-auto px-6 lg:px-8"
        >
          <div className={`mb-16 transition-all duration-700 ${pricingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-4">Bảng giá</div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight max-w-xl">
              Giá minh bạch, không bất ngờ
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-700 ${pricingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${plan.highlight
                  ? 'bg-neutral-900 text-white ring-1 ring-neutral-800'
                  : 'bg-white border border-neutral-200'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                    Phổ biến nhất
                  </div>
                )}

                <div className="mb-6">
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${plan.highlight ? 'text-neutral-400' : 'text-neutral-400'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-4xl font-bold font-display ${plan.highlight ? 'text-white' : 'text-neutral-900'}`}>
                      {plan.price === 'Liên hệ' ? plan.price : plan.price === '0' ? 'Miễn phí' : plan.price}
                    </span>
                    {plan.priceUnit && (
                      <span className={`text-sm ${plan.highlight ? 'text-neutral-400' : 'text-neutral-400'}`}>{plan.priceUnit}</span>
                    )}
                  </div>
                  <p className={`text-sm ${plan.highlight ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <Check
                        size={14}
                        className={`mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-rose-400' : 'text-neutral-900'}`}
                        strokeWidth={2.5}
                      />
                      <span className={plan.highlight ? 'text-neutral-300' : 'text-neutral-600'}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Enterprise' ? '#' : '/register'}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {plan.cta}
                  <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-neutral-400 text-center">
            Tất cả các gói đều bao gồm hỗ trợ kỹ thuật và cập nhật tính năng mới. Hủy bất kỳ lúc nào.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Sẵn sàng ship nhanh hơn?
          </h2>
          <p className="text-lg text-neutral-500 mb-10 max-w-lg mx-auto">
            Tham gia cùng hơn 5.000 team đang dùng Kollab để quản lý Sprint hiệu quả mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-4 rounded-xl text-sm transition-colors"
            >
              Bắt đầu miễn phí
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium px-6 py-4 rounded-xl text-sm border border-neutral-200 hover:border-neutral-300 transition-colors"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
          <p className="mt-6 text-xs text-neutral-400">
            Miễn phí vĩnh viễn cho team nhỏ · Không cần thẻ tín dụng · Setup dưới 2 phút
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-100 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 shrink-0">
                  <LogoIcon />
                </div>
                <span className="font-bold tracking-tight text-neutral-900 font-display">Kollab</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Nền tảng Agile & Scrum cho team Việt Nam phát triển phần mềm hiệu quả.
              </p>
            </div>
            {[
              { title: 'Sản phẩm', links: ['Tính năng', 'Bảng giá', 'Changelog', 'Lộ trình'] },
              { title: 'Tài nguyên', links: ['Tài liệu', 'Blog', 'Hướng dẫn Scrum', 'Hỗ trợ'] },
              { title: 'Công ty', links: ['Về chúng tôi', 'Liên hệ', 'Điều khoản', 'Bảo mật'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-400">© 2026 Kollab. Được xây dựng tại Việt Nam.</p>
            <p className="text-xs text-neutral-300">React · TypeScript · Supabase · Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
