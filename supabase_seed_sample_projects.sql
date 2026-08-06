-- =========================================================================
--  Kollab - Script Seed 4 Dự án Mẫu vào Cơ sở Dữ liệu Supabase (Đầy đủ Báo cáo/Biểu đồ)
--  Hướng dẫn: Chạy script này trong Supabase SQL Editor.
--  Script sẽ khởi tạo 4 dự án mẫu (E-Commerce, SwiftGo, HRM, AI Chatbot)
--  kèm đầy đủ Completed Sprints, Active Sprints, User Stories & Tasks để 
--  hiển thị tất cả biểu đồ (Velocity, Burndown, Task Status, Workload).
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
    v_p2_s13 uuid;
    v_p2_s14 uuid;
    v_p3_s2 uuid;
    v_p3_s3 uuid;
    v_p4_s0 uuid;
    v_p4_s1 uuid;
    
    v_us1_1 uuid;
    v_us1_2 uuid;
    v_us1_3 uuid;
    v_us2_1 uuid;
    v_us2_2 uuid;
    v_us3_1 uuid;
    v_us3_2 uuid;
    v_us4_1 uuid;
    v_us4_2 uuid;
BEGIN
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

    -- Sprints
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

    -- Stories Sprint 0 (Completed)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES 
    (v_p1_id, v_p1_s0, 'Khởi tạo DB Schema & Cấu hình Docker Compose', 'Cấu hình Postgres, Redis và S3 Storage.', 8, 'critical', 'done', v_user_id, v_user_id, 1, 'DevOps, Docker'),
    (v_p1_id, v_p1_s0, 'Xây dựng API OAuth2 & Supabase Auth', 'Đăng nhập Google/Facebook và JWT token.', 8, 'high', 'done', v_user_id, v_user_id, 2, 'Backend, Auth'),
    (v_p1_id, v_p1_s0, 'Thiết kế Giao diện Homepage & Catalog Sản phẩm', 'Layout responsive và banner khuyến mại.', 8, 'medium', 'done', v_user_id, v_user_id, 3, 'Frontend, UI');

    -- Stories & Tasks Sprint 1 (Active)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p1_id, v_p1_s1, 'Tích hợp cổng thanh toán VNPAY & MoMo Sandbox', 'Thanh toán qua thẻ ATM, QR Code MoMo.', 8, 'critical', 'done', v_user_id, v_user_id, 1, 'Backend, Payment') RETURNING id INTO v_us1_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us1_1, 'Tạo API Endpoint tiếp nhận Webhook kết quả thanh toán', 'Kiểm tra checksum HMAC-SHA512 từ VNPAY.', 'in_progress', v_user_id, 8.0, 4.0, 'high', 'API, Node.js'),
    (v_us1_1, 'Giao diện popup chọn phương thức thanh toán', 'Modal chọn phương thức thanh toán.', 'done', v_user_id, 6.0, 5.0, 'medium', 'Frontend, UI'),
    (v_us1_1, 'Viết Unit Test cho hàm tính toán phí giao dịch', 'Đảm bảo voucher không bị tính âm đơn hàng.', 'todo', v_user_id, 4.0, 0.0, 'low', 'Testing, Vitest');

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p1_id, v_p1_s1, 'Bộ lọc tìm kiếm sản phẩm thông minh', 'Lọc sản phẩm theo danh mục, khoảng giá.', 5, 'high', 'done', v_user_id, v_user_id, 2, 'Search, Postgres') RETURNING id INTO v_us1_2;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us1_2, 'Tối ưu PostgreSQL Index tsvector cho bảng sản phẩm', 'Tạo GIN Index cho từ khóa tiếng Việt.', 'done', v_user_id, 5.0, 4.0, 'high', 'Database'),
    (v_us1_2, 'Thiết kế Sidebar bộ lọc đa tiêu chí linh hoạt', 'Cho phép tick chọn nhiều thương hiệu.', 'done', v_user_id, 6.0, 6.0, 'medium', 'React, Component');

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p1_id, v_p1_s1, 'Hệ thống khuyến mại & Mã giảm giá Voucher', 'Nhập mã giảm giá khi thanh toán.', 5, 'medium', 'sprint', v_user_id, v_user_id, 3, 'Feature, Voucher') RETURNING id INTO v_us1_3;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us1_3, 'API kiểm tra tính hợp lệ của Voucher', 'Xác thực hạn sử dụng và số lượng.', 'in_progress', v_user_id, 6.0, 2.0, 'high', 'API'),
    (v_us1_3, 'Nhập mã Voucher trên màn hình Checkout', 'Tính toán lại tổng tiền khi áp dụng voucher.', 'todo', v_user_id, 4.0, 0.0, 'medium', 'UI');


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

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date, velocity)
    VALUES (
        v_p2_id,
        'Sprint 13: Đăng ký Tài xế & Tính cước cố định',
        'Upload giấy phép lái xe, xác minh tài xế và tính tiền cước cố định.',
        'completed',
        CURRENT_DATE - INTERVAL '40 days',
        CURRENT_DATE - INTERVAL '16 days',
        21
    ) RETURNING id INTO v_p2_s13;

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p2_id,
        'Sprint 14: Tối ưu bản đồ & Tracking vị trí tài xế Real-time',
        'Tích hợp WebSocket / Socket.io truyền tọa độ GPS 3s/lần và tối ưu đường đi trên Google Maps API.',
        'active',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '5 days'
    ) RETURNING id INTO v_p2_s14;

    -- Stories Sprint 13 (Completed)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES 
    (v_p2_id, v_p2_s13, 'Xác thực sinh trắc học & Đăng nhập OTP SMS', 'Hỗ trợ FaceID và Twilio SMS.', 8, 'high', 'done', v_user_id, v_user_id, 1, 'Auth, SMS'),
    (v_p2_id, v_p2_s13, 'Tính cước cố định & Phụ phí giờ cao điểm', 'Thuật toán tính giá theo quãng đường.', 13, 'critical', 'done', v_user_id, v_user_id, 2, 'Pricing, Algorithm');

    -- Stories & Tasks Sprint 14 (Active)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p2_id, v_p2_s14, 'Truyền và hiển thị tọa độ GPS tài xế thời gian thực', 'Xe dịch chuyển mượt mà trên bản đồ.', 13, 'critical', 'done', v_user_id, v_user_id, 1, 'Mobile, Socket') RETURNING id INTO v_us2_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us2_1, 'Xây dựng Socket.io Server chịu tải 50k connection', 'Clustering & Redis Adapter.', 'done', v_user_id, 12.0, 10.0, 'critical', 'Backend, Socket'),
    (v_us2_1, 'Tính năng smooth animation nội suy vị trí xe trên Google Maps', 'Dùng LatLngInterpolator.', 'done', v_user_id, 10.0, 9.0, 'high', 'Mobile, Flutter');

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p2_id, v_p2_s14, 'Tối ưu mức tiêu thụ pin của GPS trên Android', 'Giảm tần suất GPS khi đứng yên.', 5, 'medium', 'sprint', v_user_id, v_user_id, 2, 'Android, Performance') RETURNING id INTO v_us2_2;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us2_2, 'Chuyển sang FusedLocationProviderClient tiết kiệm pin', 'Tối ưu GPS.', 'in_progress', v_user_id, 6.0, 4.0, 'medium', 'Android'),
    (v_us2_2, 'Background Service tracking GPS khi tắt màn hình', 'Chạy ngầm ổn định.', 'todo', v_user_id, 8.0, 0.0, 'high', 'Background');


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

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date, velocity)
    VALUES (
        v_p3_id,
        'Sprint 2: Chấm công AI & Sơ đồ tổ chức',
        'Chấm công khuôn mặt AI và thiết lập sơ đồ tổ chức phòng ban.',
        'completed',
        CURRENT_DATE - INTERVAL '35 days',
        CURRENT_DATE - INTERVAL '16 days',
        18
    ) RETURNING id INTO v_p3_s2;

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p3_id,
        'Sprint 3: Tự động hóa Bảng lương & Thuế TNCN',
        'Tính toán công tự động từ dữ liệu chấm công, khấu trừ bảo hiểm xã hội và tự động tạo file PaySlip PDF.',
        'active',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '5 days'
    ) RETURNING id INTO v_p3_s3;

    -- Stories Sprint 2 (Completed)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES 
    (v_p3_id, v_p3_s2, 'Chấm công AI khuôn mặt qua Camera IP', 'Nhận diện khuôn mặt nhân viên.', 13, 'critical', 'done', v_user_id, v_user_id, 1, 'AI, Vision'),
    (v_p3_id, v_p3_s2, 'Thiết lập sơ đồ tổ chức phòng ban đa cấp', 'Cây thư mục phòng ban.', 5, 'medium', 'done', v_user_id, v_user_id, 2, 'UI, Organization');

    -- Stories & Tasks Sprint 3 (Active)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p3_id, v_p3_s3, 'Xuất phiếu lương cá nhân định dạng PDF tự động', 'Tổng hợp bảng lương mã hóa PDF.', 8, 'high', 'done', v_user_id, v_user_id, 1, 'Payroll, PDF') RETURNING id INTO v_us3_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us3_1, 'Lập công thức tính thuế TNCN lũy tiến từng phần', 'Tính chính xác khoản giảm trừ.', 'done', v_user_id, 6.0, 6.0, 'high', 'Finance, Logic'),
    (v_us3_1, 'Thiết kế mẫu phiếu lương HTML Template cho Puppeteer PDF Generator', 'Mã hóa mật khẩu PDF.', 'done', v_user_id, 8.0, 7.0, 'medium', 'HTML/CSS, Node.js');

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p3_id, v_p3_s3, 'Đăng ký & Phê duyệt đơn nghỉ phép 2 cấp', 'Tự động trừ quỹ phép năm.', 5, 'medium', 'sprint', v_user_id, v_user_id, 2, 'Leave, Workflow') RETURNING id INTO v_us3_2;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us3_2, 'Xây dựng Workflow duyệt 2 bước Manager -> HR', 'Cấu hình luồng phê duyệt.', 'in_progress', v_user_id, 6.0, 3.0, 'medium', 'Workflow'),
    (v_us3_2, 'Thông báo Email & In-app khi đơn nghỉ phép được duyệt', 'Gửi notification.', 'todo', v_user_id, 4.0, 0.0, 'low', 'Notification');


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

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date, velocity)
    VALUES (
        v_p4_id,
        'Sprint 0: Kết nối OpenAI API & Cấu hình Chat Schema',
        'Tích hợp SDK OpenAI & Claude 3, thiết kế database lưu trữ lịch sử hội thoại.',
        'completed',
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE - INTERVAL '16 days',
        13
    ) RETURNING id INTO v_p4_s0;

    INSERT INTO public.sprints (project_id, name, goal, status, start_date, end_date)
    VALUES (
        v_p4_id,
        'Sprint 1: RAG Engine & Vector DB Pipeline',
        'Tải tài liệu PDF/Word của công ty, Chunking dữ liệu và lưu trữ vào Pinecone Vector DB.',
        'active',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '5 days'
    ) RETURNING id INTO v_p4_s1;

    -- Stories Sprint 0 (Completed)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES 
    (v_p4_id, v_p4_s0, 'Tích hợp OpenAI API & Claude 3 Client', 'Kết nối API LLM và Streaming.', 8, 'critical', 'done', v_user_id, v_user_id, 1, 'LLM, API'),
    (v_p4_id, v_p4_s0, 'Thiết kế Schema cơ sở dữ liệu lưu lịch sử hội thoại', 'Lưu hội thoại khách hàng.', 5, 'medium', 'done', v_user_id, v_user_id, 2, 'Database');

    -- Stories & Tasks Sprint 1 (Active)
    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p4_id, v_p4_s1, 'Pipeline trích xuất & Embedding tài liệu tri thức', 'Tạo Vector Embeddings bằng OpenAI.', 8, 'critical', 'done', v_user_id, v_user_id, 1, 'AI, LLM, VectorDB') RETURNING id INTO v_us4_1;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us4_1, 'Cấu hình Pinecone Database và tích hợp LangChain JS', 'Index 1536 dim.', 'done', v_user_id, 4.0, 3.0, 'high', 'Pinecone, LangChain'),
    (v_us4_1, 'Thuật toán Text Chunking tối ưu cho tài liệu tiếng Việt', 'RecursiveCharacterTextSplitter.', 'done', v_user_id, 6.0, 5.0, 'high', 'Python, NLP');

    INSERT INTO public.user_stories (project_id, sprint_id, title, description, story_points, priority, status, assignee_id, reporter_id, order_index, labels)
    VALUES (v_p4_id, v_p4_s1, 'Phân loại Lead tự động qua nội dung Chat', 'Trích xuất Tên, SĐT, Nhu cầu khách hàng.', 5, 'medium', 'sprint', v_user_id, v_user_id, 2, 'CRM, Lead') RETURNING id INTO v_us4_2;

    INSERT INTO public.tasks (user_story_id, title, description, status, assignee_id, estimate_hours, actual_hours, priority, labels)
    VALUES
    (v_us4_2, 'Prompt Engineering phân loại cảm xúc khách hàng', 'Phân tích Intent.', 'in_progress', v_user_id, 5.0, 3.0, 'high', 'Prompt'),
    (v_us4_2, 'Ghi nhận Lead thông tin sđt vào CRM', 'Lưu bảng Leads.', 'todo', v_user_id, 4.0, 0.0, 'medium', 'CRM');

    RAISE NOTICE 'Đã khởi tạo thành công 4 dự án mẫu đầy đủ dữ liệu Báo cáo & Biểu đồ vào Database!';
END $$;
