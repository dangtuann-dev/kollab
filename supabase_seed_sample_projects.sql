-- =========================================================================
--  Kollab - Script Seed 4 Dự án Mẫu vào Cơ sở Dữ liệu Supabase
--  Hướng dẫn: Chạy script này trong Supabase SQL Editor.
--  Script sẽ khởi tạo 4 dự án mẫu (E-Commerce, SwiftGo, HRM, AI Chatbot)
--  cho tất cả người dùng hiện tại hoặc gán vào Profile đầu tiên tìm thấy.
-- =========================================================================

DO $$
DECLARE
    v_user_id uuid;
    v_p1_id uuid;
    v_p2_id uuid;
    v_p3_id uuid;
    v_p4_id uuid;
    
    v_p1_s0 uuid;
    v_p1_s1 uuid;
    v_p1_s2 uuid;
    
    v_p2_s14 uuid;
    v_p3_s3 uuid;
    v_p4_s1 uuid;
    
    v_us1_1 uuid;
    v_us1_2 uuid;
    v_us2_1 uuid;
    v_us3_1 uuid;
    v_us4_1 uuid;
BEGIN
    -- Lấy ID người dùng đầu tiên từ bảng profiles (hoặc auth.users)
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Chưa có user nào trong bảng profiles. Vui lòng đăng ký tài khoản trước!';
        RETURN;
    END IF;

    -- =========================================================================
    -- DỰ ÁN 1: Hệ thống Thương mại Điện tử Kollab Mart
    -- =========================================================================
    INSERT INTO public.projects (name, description, color, owner_id, status, start_date, end_date)
    VALUES (
        'Hệ thống Thương mại Điện tử Kollab Mart',
        'Nền tảng thương mại điện tử bán lẻ đa kênh với tích hợp thanh toán tự động VNPAY/MoMo, gợi ý sản phẩm bằng AI và quản lý kho hàng thời gian thực.',
        '#3b82f6',
        v_user_id,
        'active',
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '60 days'
    ) RETURNING id INTO v_p1_id;

    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_p1_id, v_user_id, 'product_owner');

    -- Sprints cho Dự án 1
    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date, velocity)
    VALUES (
        v_p1_id,
        'Sprint 0: Hạ tầng & Xác thực Auth',
        'Khởi tạo DB Schema, cấu hình Docker và tích hợp OAuth2/Supabase Auth.',
        'completed',
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE - INTERVAL '16 days',
        24
    ) RETURNING id INTO v_p1_s0;

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p1_id,
        'Sprint 1: Thanh toán & Tích hợp Cổng VNPAY / MoMo',
        'Hoàn thiện luồng checkout, thanh toán trực tuyến qua VNPAY/MoMo và xử lý Webhook hoàn tiền.',
        'active',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '5 days'
    ) RETURNING id INTO v_p1_s1;

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p1_id,
        'Sprint 2: Đánh giá sản phẩm & Tích điểm Loyalty',
        'Xây dựng hệ thống review kèm hình ảnh, câu hỏi Q&A và chương trình tích điểm thưởng cho khách hàng thân thiết.',
        'planning',
        CURRENT_DATE + INTERVAL '6 days',
        CURRENT_DATE + INTERVAL '20 days'
    ) RETURNING id INTO v_p1_s2;

    -- User Stories cho Dự án 1
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, acceptance_criteria, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (
        v_p1_id,
        v_p1_s1,
        'Tích hợp cổng thanh toán VNPAY & MoMo Sandbox',
        'Cho phép người mua hàng lựa chọn thanh toán qua thẻ ATM, QR Code MoMo và xử lý callback bảo mật từ ngân hàng.',
        '1. Quét QR thanh toán thành công. 2. Đơn hàng tự động chuyển Paid.',
        8,
        'critical',
        'sprint',
        v_user_id,
        v_user_id,
        1,
        'Backend, Payment, Security'
    ) RETURNING id INTO v_us1_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us1_1, 'Tạo API Endpoint tiếp nhận Webhook kết quả thanh toán', 'Kiểm tra checksum HMAC-SHA512 từ VNPAY.', 'in_progress', v_user_id, 8.0, 4.0, 'high', 'API, Node.js'),
    (v_us1_1, 'Giao diện popup chọn phương thức thanh toán', 'Modal chọn phương thức thanh toán.', 'done', v_user_id, 6.0, 5.0, 'medium', 'Frontend, UI'),
    (v_us1_1, 'Viết Unit Test cho hàm tính toán phí giao dịch', 'Đảm bảo không bị âm giá trị đơn hàng.', 'todo', v_user_id, 4.0, 0.0, 'low', 'Testing, Vitest');

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (
        v_p1_id,
        v_p1_s1,
        'Bộ lọc tìm kiếm sản phẩm thông minh',
        'Lọc sản phẩm theo danh mục, khoảng giá, thương hiệu và đánh giá sao.',
        5,
        'high',
        'sprint',
        v_user_id,
        v_user_id,
        2,
        'Search, Postgres, Fulltext'
    ) RETURNING id INTO v_us1_2;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us1_2, 'Tối ưu PostgreSQL Index tsvector cho bảng sản phẩm', 'Tạo GIN Index cho từ khóa tiếng Việt.', 'done', v_user_id, 5.0, 4.0, 'high', 'Database'),
    (v_us1_2, 'Thiết kế Sidebar bộ lọc đa tiêu chí linh hoạt', 'Cho phép tick chọn nhiều thương hiệu.', 'in_progress', v_user_id, 6.0, 3.0, 'medium', 'React, Component');


    -- =========================================================================
    -- DỰ ÁN 2: Ứng dụng Di động Đặt xe SwiftGo App
    -- =========================================================================
    INSERT INTO public.projects (name, description, color, owner_id, status, start_date, end_date)
    VALUES (
        'Ứng dụng Di động Đặt xe SwiftGo App',
        'Ứng dụng di động iOS/Android kết nối tài xế, khách hàng và nhà hàng. Định vị GPS real-time, thuật toán tự động điều xe và tính cước giờ cao điểm.',
        '#10b981',
        v_user_id,
        'active',
        CURRENT_DATE - INTERVAL '90 days',
        CURRENT_DATE + INTERVAL '90 days'
    ) RETURNING id INTO v_p2_id;

    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_p2_id, v_user_id, 'scrum_master');

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p2_id,
        'Sprint 14: Tối ưu bản đồ & Tracking vị trí tài xế Real-time',
        'Tích hợp WebSocket / Socket.io truyền tọa độ GPS 3s/lần và tối ưu đường đi trên Google Maps API.',
        'active',
        CURRENT_DATE - INTERVAL '10 days',
        CURRENT_DATE + INTERVAL '4 days'
    ) RETURNING id INTO v_p2_s14;

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (
        v_p2_id,
        v_p2_s14,
        'Truyền và hiển thị tọa độ GPS tài xế theo thời gian thực',
        'Xe dịch chuyển mượt mà trên bản đồ ứng dụng người dùng không bị giật lag.',
        13,
        'critical',
        'sprint',
        v_user_id,
        v_user_id,
        1,
        'Mobile, Socket, Maps'
    ) RETURNING id INTO v_us2_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us2_1, 'Xây dựng Socket.io Server chịu tải 50k connection', 'Cấu hình Clustering & Redis Adapter.', 'in_progress', v_user_id, 12.0, 8.0, 'critical', 'Backend, Socket'),
    (v_us2_1, 'Tính năng smooth animation nội suy vị trí xe trên Google Maps SDK', 'Dùng LatLngInterpolator.', 'todo', v_user_id, 10.0, 0.0, 'high', 'Mobile, Flutter'),
    (v_us2_1, 'Tối ưu mức tiêu thụ pin của GPS trên thiết bị Android', 'Chuyển sang FusedLocationProviderClient.', 'done', v_user_id, 6.0, 5.0, 'medium', 'Android, Performance');


    -- =========================================================================
    -- DỰ ÁN 3: Nền tảng Quản lý Nhân sự & KPI Enterprise
    -- =========================================================================
    INSERT INTO public.projects (name, description, color, owner_id, status, start_date, end_date)
    VALUES (
        'Nền tảng Quản lý Nhân sự & KPI Enterprise',
        'Hệ thống SaaS HRM toàn diện cho doanh nghiệp: Chấm công AI khuôn mặt, tự động hóa bảng tính lương, quản lý mục tiêu OKR/KPI và đơn nghỉ phép.',
        '#8b5cf6',
        v_user_id,
        'active',
        CURRENT_DATE - INTERVAL '45 days',
        CURRENT_DATE + INTERVAL '120 days'
    ) RETURNING id INTO v_p3_id;

    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_p3_id, v_user_id, 'product_owner');

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p3_id,
        'Sprint 3: Tự động hóa Bảng lương & Thuế TNCN',
        'Tính toán công tự động từ dữ liệu chấm công, khấu trừ bảo hiểm xã hội và tự động tạo file PaySlip PDF.',
        'active',
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '7 days'
    ) RETURNING id INTO v_p3_s3;

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (
        v_p3_id,
        v_p3_s3,
        'Xuất phiếu lương cá nhân định dạng PDF tự động gửi Email',
        'Mỗi cuối tháng, hệ thống tổng hợp bảng lương và tự động mã hóa PDF gửi qua Email nhân viên.',
        8,
        'high',
        'sprint',
        v_user_id,
        v_user_id,
        1,
        'Payroll, PDF, Email'
    ) RETURNING id INTO v_us3_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us3_1, 'Lập công thức tính thuế TNCN lũy tiến từng phần theo quy định mới', 'Tính chính xác khoản giảm trừ.', 'done', v_user_id, 6.0, 6.0, 'high', 'Finance, Logic'),
    (v_us3_1, 'Thiết kế mẫu phiếu lương HTML Template cho Puppeteer PDF Generator', 'Mã hóa mật khẩu cho file PDF.', 'in_progress', v_user_id, 8.0, 5.0, 'medium', 'HTML/CSS, Node.js');


    -- =========================================================================
    -- DỰ ÁN 4: AI Customer Care Bot
    -- =========================================================================
    INSERT INTO public.projects (name, description, color, owner_id, status, start_date, end_date)
    VALUES (
        'AI Customer Care Bot (Trợ lý AI Đa kênh)',
        'Trợ lý ảo thông minh tích hợp LLM (OpenAI/Claude) & RAG Vector Search để tự động trả lời thắc mắc khách hàng 24/7 trên Website và Fanpage.',
        '#f59e0b',
        v_user_id,
        'active',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '45 days'
    ) RETURNING id INTO v_p4_id;

    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_p4_id, v_user_id, 'developer');

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p4_id,
        'Sprint 1: RAG Engine & Vector DB Pipeline',
        'Tải tài liệu PDF/Word của công ty, Chunking dữ liệu và lưu trữ vào Pinecone Vector DB.',
        'active',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '9 days'
    ) RETURNING id INTO v_p4_s1;

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (
        v_p4_id,
        v_p4_s1,
        'Pipeline trích xuất & Embedding tài liệu tri thức doanh nghiệp',
        'Đọc tài liệu quy trình, sản phẩm (.pdf, .docx) và tạo Vector Embeddings bằng OpenAI text-embedding-3-small.',
        8,
        'critical',
        'sprint',
        v_user_id,
        v_user_id,
        1,
        'AI, LLM, VectorDB'
    ) RETURNING id INTO v_us4_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us4_1, 'Cấu hình Pinecone Database và tích hợp LangChain JS', 'Khởi tạo Index 1536 dim.', 'done', v_user_id, 4.0, 3.0, 'high', 'Pinecone, LangChain'),
    (v_us4_1, 'Xây dựng thuật toán Text Chunking tối ưu cho tài liệu tiếng Việt', 'Dùng RecursiveCharacterTextSplitter.', 'in_progress', v_user_id, 6.0, 3.0, 'high', 'Python, NLP');

    RAISE NOTICE 'Đã khởi tạo thành công 4 dự án mẫu vào Database Supabase!';
END $$;
