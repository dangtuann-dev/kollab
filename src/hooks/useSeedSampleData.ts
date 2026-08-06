import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, damBaoHoSoNguoiDung } from '../lib/supabase'
import { useAuthStore } from '../stores'
import { useToast } from '../stores/toastStore'

export function useSeedSampleData() {
  const [isSeeding, setIsSeeding] = useState(false)
  const { user } = useAuthStore()
  const toast = useToast()
  const queryClient = useQueryClient()

  const seedSampleProjects = async () => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để khởi tạo dữ liệu mẫu.')
      return
    }

    setIsSeeding(true)
    try {
      // Đảm bảo profile người dùng đã có trong bảng profiles
      await damBaoHoSoNguoiDung(user)

      const userId = user.id

      // Ngày hiện tại làm mốc
      const today = new Date()
      const formatDate = (d: Date) => d.toISOString().split('T')[0]

      const dateMinusDays = (days: number) => {
        const d = new Date()
        d.setDate(d.getDate() - days)
        return formatDate(d)
      }

      const datePlusDays = (days: number) => {
        const d = new Date()
        d.setDate(d.getDate() + days)
        return formatDate(d)
      }

      // =========================================================================
      // DỰ ÁN 1: Hệ thống Thương mại Điện tử (Kollab Mart)
      // =========================================================================
      const { data: p1, error: p1Err } = await (supabase
        .from('projects') as any)
        .insert({
          name: 'Hệ thống Thương mại Điện tử Kollab Mart',
          description: 'Nền tảng thương mại điện tử bán lẻ đa kênh với tích hợp thanh toán tự động, gợi ý sản phẩm bằng AI và quản lý kho hàng thời gian thực.',
          color: '#3b82f6',
          owner_id: userId,
          status: 'active',
          start_date: dateMinusDays(30),
          end_date: datePlusDays(60),
        })
        .select()
        .single()

      if (p1Err) throw p1Err

      await (supabase.from('project_members') as any).insert({
        project_id: p1.id,
        user_id: userId,
        role: 'product_owner',
      })

      // Sprints cho Dự án 1
      const { data: p1s0 } = await (supabase.from('sprints') as any)
        .insert({
          project_id: p1.id,
          name: 'Sprint 0: Hạ tầng & Xác thực Auth',
          goal: 'Khởi tạo DB Schema, cấu hình Docker và tích hợp OAuth2/Supabase Auth.',
          status: 'completed',
          start_date: dateMinusDays(30),
          end_date: dateMinusDays(16),
          velocity: 24,
        })
        .select()
        .single()

      const { data: p1s1 } = await (supabase.from('sprints') as any)
        .insert({
          project_id: p1.id,
          name: 'Sprint 1: Thanh toán & Tích hợp Cổng VNPAY / MoMo',
          goal: 'Hoàn thiện luồng checkout, thanh toán trực tuyến qua VNPAY/MoMo và xử lý Webhook hoàn tiền.',
          status: 'active',
          start_date: dateMinusDays(15),
          end_date: datePlusDays(5),
        })
        .select()
        .single()

      const { data: p1s2 } = await (supabase.from('sprints') as any)
        .insert({
          project_id: p1.id,
          name: 'Sprint 2: Đánh giá sản phẩm & Tích điểm Loyalty',
          goal: 'Xây dựng hệ thống review kèm hình ảnh, câu hỏi Q&A và chương trình tích điểm thưởng cho khách hàng thân thiết.',
          status: 'planning',
          start_date: datePlusDays(6),
          end_date: datePlusDays(20),
        })
        .select()
        .single()

      // User Stories & Tasks cho Dự án 1
      const { data: story1_1 } = await (supabase.from('user_stories') as any)
        .insert({
          project_id: p1.id,
          sprint_id: p1s1?.id,
          title: 'Tích hợp cổng thanh toán VNPAY & MoMo Sandbox',
          description: 'Cho phép người mua hàng lựa chọn thanh toán qua thẻ ATM, QR Code MoMo và xử lý callback bảo mật từ ngân hàng.',
          acceptance_criteria: '1. Người dùng quét mã QR thanh toán thành công.\n2. Trạng thái đơn hàng tự động chuyển sang "Paid".\n3. Gửi email xác nhận thanh toán.',
          story_points: 8,
          priority: 'critical',
          status: 'sprint',
          assignee_id: userId,
          reporter_id: userId,
          order_index: 1,
          labels: 'Backend, Payment, Security',
        })
        .select()
        .single()

      if (story1_1) {
        await (supabase.from('tasks') as any).insert([
          {
            user_story_id: story1_1.id,
            title: 'Tạo API Endpoint tiếp nhận Webhook kết quả thanh toán',
            description: 'Kiểm tra chữ ký số HMAC-SHA512 từ VNPAY để xác thực tính toàn vẹn của giao dịch.',
            status: 'in_progress',
            assignee_id: userId,
            estimate_hours: 8,
            actual_hours: 4,
            priority: 'high',
            labels: 'API, Node.js',
            deadline: datePlusDays(2),
          },
          {
            user_story_id: story1_1.id,
            title: 'Giao diện popup chọn phương thức thanh toán',
            description: 'Thiết kế Modal lựa chọn giữa Thẻ nội địa, Thẻ quốc tế Visa/Mastercard và Ví MoMo.',
            status: 'done',
            assignee_id: userId,
            estimate_hours: 6,
            actual_hours: 5,
            priority: 'medium',
            labels: 'Frontend, UI',
            deadline: dateMinusDays(1),
          },
          {
            user_story_id: story1_1.id,
            title: 'Viết Unit Test cho hàm tính toán phí giao dịch và mã giảm giá',
            description: 'Đảm bảo áp dụng voucher không bị tính âm giá trị đơn hàng.',
            status: 'todo',
            assignee_id: userId,
            estimate_hours: 4,
            actual_hours: 0,
            priority: 'low',
            labels: 'Testing, Vitest',
            deadline: datePlusDays(4),
          },
        ])
      }

      const { data: story1_2 } = await (supabase.from('user_stories') as any)
        .insert({
          project_id: p1.id,
          sprint_id: p1s1?.id,
          title: 'Bộ lọc tìm kiếm sản phẩm thông minh',
          description: 'Hỗ trợ lọc sản phẩm theo danh mục, khoảng giá, thương hiệu và đánh giá sao.',
          acceptance_criteria: 'Tốc độ phản hồi tìm kiếm < 200ms khi bộ lọc thay đổi.',
          story_points: 5,
          priority: 'high',
          status: 'sprint',
          assignee_id: userId,
          reporter_id: userId,
          order_index: 2,
          labels: 'Search, Postgres, Fulltext',
        })
        .select()
        .single()

      if (story1_2) {
        await (supabase.from('tasks') as any).insert([
          {
            user_story_id: story1_2.id,
            title: 'Tối ưu PostgreSQL Index tsvector cho bảng sản phẩm',
            description: 'Tạo GIN Index trên tên và mô tả sản phẩm để tăng tốc tìm kiếm từ khóa tiếng Việt.',
            status: 'done',
            assignee_id: userId,
            estimate_hours: 5,
            actual_hours: 4,
            priority: 'high',
            labels: 'Database',
          },
          {
            user_story_id: story1_2.id,
            title: 'Thiết kế Sidebar bộ lọc đa tiêu chí linh hoạt',
            description: 'Cho phép tick chọn nhiều thương hiệu cùng lúc.',
            status: 'in_progress',
            assignee_id: userId,
            estimate_hours: 6,
            actual_hours: 3,
            priority: 'medium',
            labels: 'React, Component',
          },
        ])
      }

      // Backlog stories cho Dự án 1
      await (supabase.from('user_stories') as any).insert([
        {
          project_id: p1.id,
          sprint_id: p1s2?.id,
          title: 'Hệ thống đánh giá sản phẩm có đính kèm hình ảnh và video',
          description: 'Khách hàng đã mua hàng có thể đăng bài review 5 sao kèm hình ảnh thực tế.',
          story_points: 5,
          priority: 'medium',
          status: 'backlog',
          reporter_id: userId,
          order_index: 3,
          labels: 'Feature, Review',
        },
        {
          project_id: p1.id,
          sprint_id: p1s0?.id,
          title: 'Khởi tạo DB Schema & Cấu hình Docker Compose',
          description: 'Cấu hình Postgres, Redis và S3 Storage chạy trong môi trường Container.',
          story_points: 3,
          priority: 'critical',
          status: 'done',
          assignee_id: userId,
          reporter_id: userId,
          order_index: 4,
          labels: 'DevOps, Docker',
        },
      ])

      // Standup log cho Dự án 1
      await (supabase.from('standup_logs') as any).insert({
        project_id: p1.id,
        user_id: userId,
        yesterday: 'Hoàn tất giao diện popup thanh toán VNPAY và tạo GIN Index cho DB.',
        today: 'Tiếp tục hoàn thiện API Webhook xử lý HMAC-SHA512 checksum.',
        blockers: 'Cần phía VNPAY cấp thêm tài khoản thử nghiệm Test Merchant ID.',
        log_date: formatDate(today),
      })

      // =========================================================================
      // DỰ ÁN 2: Ứng dụng Di động Đặt xe & Giao đồ ăn (SwiftGo App)
      // =========================================================================
      const { data: p2, error: p2Err } = await (supabase
        .from('projects') as any)
        .insert({
          name: 'Ứng dụng Di động Đặt xe SwiftGo App',
          description: 'Ứng dụng di động iOS/Android kết nối tài xế, khách hàng và nhà hàng. Định vị GPS real-time, thuật toán tự động điều xe và tính cước giờ cao điểm.',
          color: '#10b981',
          owner_id: userId,
          status: 'active',
          start_date: dateMinusDays(90),
          end_date: datePlusDays(90),
        })
        .select()
        .single()

      if (p2Err) throw p2Err

      await (supabase.from('project_members') as any).insert({
        project_id: p2.id,
        user_id: userId,
        role: 'scrum_master',
      })

      const { data: p2s14 } = await (supabase.from('sprints') as any)
        .insert({
          project_id: p2.id,
          name: 'Sprint 14: Tối ưu bản đồ & Tracking vị trí tài xế Real-time',
          goal: 'Tích hợp WebSocket / Socket.io truyền tọa độ GPS 3s/lần và tối ưu đường đi trên Google Maps API.',
          status: 'active',
          start_date: dateMinusDays(10),
          end_date: datePlusDays(4),
        })
        .select()
        .single()

      const { data: story2_1 } = await (supabase.from('user_stories') as any)
        .insert({
          project_id: p2.id,
          sprint_id: p2s14?.id,
          title: 'Truyền và hiển thị tọa độ GPS tài xế theo thời gian thực',
          description: 'Xe dịch chuyển mượt mà trên bản đồ ứng dụng người dùng không bị giật lag.',
          acceptance_criteria: 'Tọa độ cập nhật mỗi 3 giây. Icon tài xế xoay đúng góc theo hướng di chuyển.',
          story_points: 13,
          priority: 'critical',
          status: 'sprint',
          assignee_id: userId,
          reporter_id: userId,
          order_index: 1,
          labels: 'Mobile, Socket, Maps',
        })
        .select()
        .single()

      if (story2_1) {
        await (supabase.from('tasks') as any).insert([
          {
            user_story_id: story2_1.id,
            title: 'Xây dựng Socket.io Server chịu tải 50k connection',
            description: 'Cấu hình Clustering và Redis Adapter cho Node.js Socket Server.',
            status: 'in_progress',
            assignee_id: userId,
            estimate_hours: 12,
            actual_hours: 8,
            priority: 'critical',
            labels: 'Backend, Socket',
          },
          {
            user_story_id: story2_1.id,
            title: 'Tính năng smooth animation nội suy vị trí xe trên Google Maps SDK',
            description: 'Sử dụng thuật toán LatLngInterpolator để icon xe di chuyển trơn tru.',
            status: 'todo',
            assignee_id: userId,
            estimate_hours: 10,
            actual_hours: 0,
            priority: 'high',
            labels: 'Mobile, Flutter',
          },
          {
            user_story_id: story2_1.id,
            title: 'Tối ưu mức tiêu thụ pin của GPS trên thiết bị Android',
            description: 'Chuyển sang FusedLocationProviderClient với chế độ tiết kiệm pin.',
            status: 'done',
            assignee_id: userId,
            estimate_hours: 6,
            actual_hours: 5,
            priority: 'medium',
            labels: 'Android, Performance',
          },
        ])
      }

      // =========================================================================
      // DỰ ÁN 3: Nền tảng Quản lý Nhân sự & KPI Enterprise (HRM Portal)
      // =========================================================================
      const { data: p3, error: p3Err } = await (supabase
        .from('projects') as any)
        .insert({
          name: 'Nền tảng Quản lý Nhân sự & KPI Enterprise',
          description: 'Hệ thống SaaS HRM toàn diện cho doanh nghiệp: Chấm công AI khuôn mặt, tự động hóa bảng tính lương, quản lý mục tiêu OKR/KPI và đơn nghỉ phép.',
          color: '#8b5cf6',
          owner_id: userId,
          status: 'active',
          start_date: dateMinusDays(45),
          end_date: datePlusDays(120),
        })
        .select()
        .single()

      if (p3Err) throw p3Err

      await (supabase.from('project_members') as any).insert({
        project_id: p3.id,
        user_id: userId,
        role: 'product_owner',
      })

      const { data: p3s3 } = await (supabase.from('sprints') as any)
        .insert({
          project_id: p3.id,
          name: 'Sprint 3: Tự động hóa Bảng lương & Thuế TNCN',
          goal: 'Tính toán công tự động từ dữ liệu chấm công, khấu trừ bảo hiểm xã hội và tự động tạo file PaySlip PDF.',
          status: 'active',
          start_date: dateMinusDays(7),
          end_date: datePlusDays(7),
        })
        .select()
        .single()

      const { data: story3_1 } = await (supabase.from('user_stories') as any)
        .insert({
          project_id: p3.id,
          sprint_id: p3s3?.id,
          title: 'Xuất phiếu lương cá nhân định dạng PDF tự động gửi Email',
          description: 'Mỗi cuối tháng, hệ thống tổng hợp bảng lương và tự động mã hóa PDF gửi qua Email nhân viên.',
          acceptance_criteria: 'PDF chứa chi tiết lương căn bản, phụ cấp, BHXH và công thức Thuế TNCN.',
          story_points: 8,
          priority: 'high',
          status: 'sprint',
          assignee_id: userId,
          reporter_id: userId,
          order_index: 1,
          labels: 'Payroll, PDF, Email',
        })
        .select()
        .single()

      if (story3_1) {
        await (supabase.from('tasks') as any).insert([
          {
            user_story_id: story3_1.id,
            title: 'Lập công thức tính thuế TNCN lũy tiến từng phần theo quy định mới',
            description: 'Đảm bảo trừ các khoản giảm trừ gia cảnh chính xác.',
            status: 'done',
            assignee_id: userId,
            estimate_hours: 6,
            actual_hours: 6,
            priority: 'high',
            labels: 'Finance, Logic',
          },
          {
            user_story_id: story3_1.id,
            title: 'Thiết kế mẫu phiếu lương HTML Template cho thư viện Puppeteer PDF Generator',
            description: 'Định dạng đẹp mắt, bảo mật bằng mật khẩu mã nhân viên.',
            status: 'in_progress',
            assignee_id: userId,
            estimate_hours: 8,
            actual_hours: 5,
            priority: 'medium',
            labels: 'HTML/CSS, Node.js',
          },
        ])
      }

      // =========================================================================
      // DỰ ÁN 4: AI Customer Care Bot (Hệ thống Chatbot AI Chăm sóc Khách hàng)
      // =========================================================================
      const { data: p4, error: p4Err } = await (supabase
        .from('projects') as any)
        .insert({
          name: 'AI Customer Care Bot (Trợ lý AI Đa kênh)',
          description: 'Trợ lý ảo thông minh tích hợp LLM (OpenAI/Claude) & RAG Vector Search để tự động trả lời thắc mắc khách hàng 24/7 trên Website và Fanpage.',
          color: '#f59e0b',
          owner_id: userId,
          status: 'active',
          start_date: dateMinusDays(15),
          end_date: datePlusDays(45),
        })
        .select()
        .single()

      if (p4Err) throw p4Err

      await (supabase.from('project_members') as any).insert({
        project_id: p4.id,
        user_id: userId,
        role: 'developer',
      })

      const { data: p4s1 } = await (supabase.from('sprints') as any)
        .insert({
          project_id: p4.id,
          name: 'Sprint 1: RAG Engine & Vector DB Pipeline',
          goal: 'Tải tài liệu PDF/Word của công ty, Chunking dữ liệu và lưu trữ vào Pinecone Vector DB.',
          status: 'active',
          start_date: dateMinusDays(5),
          end_date: datePlusDays(9),
        })
        .select()
        .single()

      const { data: story4_1 } = await (supabase.from('user_stories') as any)
        .insert({
          project_id: p4.id,
          sprint_id: p4s1?.id,
          title: 'Pipeline trích xuất & Embedding tài liệu tri thức doanh nghiệp',
          description: 'Đọc tài liệu quy trình, sản phẩm (.pdf, .docx) và tạo Vector Embeddings bằng OpenAI text-embedding-3-small.',
          acceptance_criteria: 'Tìm kiếm semantic search truy xuất thông tin chính xác > 92%.',
          story_points: 8,
          priority: 'critical',
          status: 'sprint',
          assignee_id: userId,
          reporter_id: userId,
          order_index: 1,
          labels: 'AI, LLM, VectorDB',
        })
        .select()
        .single()

      if (story4_1) {
        await (supabase.from('tasks') as any).insert([
          {
            user_story_id: story4_1.id,
            title: 'Cấu hình Pinecone Database và tích hợp LangChain JS',
            description: 'Tạo Index với vector dimension 1536 và cosine metric.',
            status: 'done',
            assignee_id: userId,
            estimate_hours: 4,
            actual_hours: 3,
            priority: 'high',
            labels: 'Pinecone, LangChain',
          },
          {
            user_story_id: story4_1.id,
            title: 'Xây dựng thuật toán Text Chunking tối ưu cho tài liệu tiếng Việt',
            description: 'Sử dụng RecursiveCharacterTextSplitter với chunkSize = 800 và chunkOverlap = 150.',
            status: 'in_progress',
            assignee_id: userId,
            estimate_hours: 6,
            actual_hours: 3,
            priority: 'high',
            labels: 'Python, NLP',
          },
        ])
      }

      toast.success('Đã tạo thành công 4 dự án mẫu đầy đủ dữ liệu vào Database!')
      // Invalidate query dự án để UI cập nhật tức thì
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
    } catch (err: any) {
      console.error('Lỗi khi khởi tạo dự án mẫu:', err)
      toast.error(err.message || 'Không thể tạo dữ liệu mẫu. Vui lòng kiểm tra lại kết nối Database.')
    } finally {
      setIsSeeding(false)
    }
  }

  return {
    seedSampleProjects,
    isSeeding,
  }
}
