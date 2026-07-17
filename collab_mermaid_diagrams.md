# Mã nguồn Mermaid.js cho các sơ đồ hệ thống Kollab

Tài liệu này cung cấp toàn bộ mã nguồn biểu đồ dạng **Mermaid.js** để bạn có thể sao chép và dán trực tiếp vào [mermaid.live](https://mermaid.live) hoặc [mermaid.ai](https://mermaid.ai) để tạo ra các sơ đồ cho hệ thống Kollab (Agile/Scrum Project Management System).

---

## 1. Biểu đồ Use - Case Tổng quát (General Use-Case Diagram)

Biểu đồ này biểu diễn các tác nhân (Actor) chính trong hệ thống Kollab và các nhóm chức năng lớn mà họ có thể thực hiện.

```mermaid
flowchart LR
    %% Actors
    Actor_User["👤 Người dùng / Thành viên"]
    Actor_PO["👑 Product Owner"]
    Actor_SM["⏱️ Scrum Master"]
    Actor_Dev["💻 Developer"]

    %% General relationships
    Actor_PO --> Actor_User
    Actor_SM --> Actor_User
    Actor_Dev --> Actor_User

    subgraph Kollab ["Hệ thống Kollab"]
        %% General UCs
        UC_Auth(["Đăng ký, Đăng nhập & Quản lý hồ sơ"])
        UC_Proj(["Quản lý Dự án (Tạo, Sửa, Xóa)"])
        UC_Dash(["Xem Dashboard & Nhận thông báo"])
        
        %% Project-specific UCs
        UC_Backlog(["Quản lý Backlog & User Story"])
        UC_Sprint(["Quản lý Sprint (Lên KH, Kích hoạt, Hoàn thành)"])
        UC_Task(["Quản lý Công việc (Task Board)"])
        UC_Members(["Quản lý Thành viên & Vai trò"])
        UC_Reports(["Xem Báo cáo (Burndown, Velocity)"])
        UC_Ceremonies(["Thực hiện Nghi thức Scrum (Daily, Retro, Review)"])
    end

    %% Connections
    Actor_User --> UC_Auth
    Actor_User --> UC_Dash
    Actor_User --> UC_Task
    Actor_User --> UC_Ceremonies
    Actor_User --> UC_Reports

    Actor_PO --> UC_Proj
    Actor_PO --> UC_Backlog
    Actor_PO --> UC_Members
    Actor_PO --> UC_Sprint

    Actor_SM --> UC_Sprint
```

---

## 2. Biểu đồ Use - Case Chi tiết (Detailed Use-Case Diagram)

Biểu đồ này chia nhỏ các ca sử dụng lớn thành các ca sử dụng chi tiết hơn, mô tả mối quan hệ `<<include>>` và `<<extend>>`.

```mermaid
flowchart LR
    %% Actors
    PO["👑 Product Owner"]
    SM["⏱️ Scrum Master"]
    DEV["💻 Developer"]
    User["👤 Người dùng / Thành viên"]

    PO --> User
    SM --> User
    DEV --> User

    subgraph Auth_Proj ["Quản lý Tài khoản & Dự án"]
        UC_Login(["Đăng nhập"])
        UC_Register(["Đăng ký"])
        UC_Profile(["Chỉnh sửa Hồ sơ"])
        UC_CreateProj(["Tạo Dự án"])
        UC_ManageMembers(["Quản lý Thành viên"])
        UC_Invite(["Mời Thành viên"])
        UC_Role(["Phân vai trò: PO, SM, Dev"])
        
        UC_Login -.->|"<<include>>"| UC_Auth["Xác thực tài khoản"]
        UC_ManageMembers -.->|"<<include>>"| UC_Invite
        UC_ManageMembers -.->|"<<include>>"| UC_Role
    end

    subgraph Backlog_Sprint ["Quản lý Backlog & Sprints"]
        UC_ManageBacklog(["Quản lý Backlog"])
        UC_CreateStory(["Tạo User Story"])
        UC_StoryDetail(["Xem/Sửa User Story"])
        UC_Estimate(["Ước lượng Story Points"])
        UC_AssignStory(["Phân công Story"])
        
        UC_ManageBacklog -.->|"<<include>>"| UC_CreateStory
        UC_ManageBacklog -.->|"<<include>>"| UC_StoryDetail
        UC_StoryDetail -.->|"<<extend>>"| UC_Estimate
        UC_StoryDetail -.->|"<<extend>>"| UC_AssignStory

        UC_PlanSprint(["Lập kế hoạch Sprint"])
        UC_StartSprint(["Bắt đầu Sprint"])
        UC_EndSprint(["Hoàn thành Sprint"])

        UC_PlanSprint -.->|"<<include>>"| UC_AddStoryToSprint["Thêm User Story vào Sprint"]
    end

    subgraph Board_Ceremonies ["Sprint Board & Nghi thức Scrum"]
        UC_ViewBoard(["Xem Bảng Kanban"])
        UC_ManageTask(["Quản lý Task"])
        UC_CreateTask(["Tạo Sub-task"])
        UC_MoveTask(["Cập nhật Trạng thái Task"])
        UC_CommentTask(["Bình luận & Activity Log"])
        UC_LogHours(["Ghi nhận Giờ làm việc"])

        UC_ManageTask -.->|"<<include>>"| UC_CreateTask
        UC_ManageTask -.->|"<<include>>"| UC_MoveTask
        UC_ManageTask -.->|"<<extend>>"| UC_CommentTask
        UC_ManageTask -.->|"<<extend>>"| UC_LogHours

        UC_DailyStandup(["Nộp Daily Standup"])
        UC_SubmitLog(["Báo cáo: Hôm qua, Hôm nay, Trở ngại"])
        UC_Retro(["Họp cải tiến (Retrospective)"])
        UC_Review(["Đánh giá Sprint (Review)"])

        UC_DailyStandup -.->|"<<include>>"| UC_SubmitLog
    end

    %% Connections
    User --> UC_Login
    User --> UC_Register
    User --> UC_Profile
    User --> UC_ViewBoard
    User --> UC_ManageTask
    User --> UC_DailyStandup
    
    PO --> UC_CreateProj
    PO --> UC_ManageMembers
    PO --> UC_ManageBacklog
    PO --> UC_PlanSprint
    
    SM --> UC_PlanSprint
    SM --> UC_StartSprint
    SM --> UC_EndSprint
    SM --> UC_Retro
    SM --> UC_Review
```

---

## 3. Biểu đồ Cơ sở Dữ liệu (Entity Relationship Diagram - ERD)

Dựa trên cấu trúc bảng thực tế từ file `supabase_schema.sql` và `supabase_schema_update.sql`.

```mermaid
erDiagram
    profiles {
        uuid id PK
        text full_name
        text email
        text avatar_url
        text bio
        timestamptz created_at
        timestamptz updated_at
    }

    projects {
        uuid id PK
        text name
        text description
        text color
        uuid owner_id FK
        text status
        date start_date
        date end_date
        timestamptz created_at
        timestamptz updated_at
    }

    project_members {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text role
        timestamptz joined_at
    }

    sprints {
        uuid id PK
        uuid project_id FK
        text name
        text goal
        text status
        date start_date
        date end_date
        integer velocity
        timestamptz created_at
        timestamptz updated_at
    }

    user_stories {
        uuid id PK
        uuid project_id FK
        uuid sprint_id FK
        text title
        text description
        text acceptance_criteria
        integer story_points
        text priority
        text status
        uuid assignee_id FK
        uuid reporter_id FK
        integer order_index
        text labels
        timestamptz created_at
        timestamptz updated_at
    }

    tasks {
        uuid id PK
        uuid user_story_id FK
        text title
        text description
        text status
        uuid assignee_id FK
        numeric estimate_hours
        numeric actual_hours
        integer story_points
        text priority
        text labels
        date deadline
        timestamptz created_at
        timestamptz updated_at
    }

    comments {
        uuid id PK
        uuid user_story_id FK
        uuid task_id FK
        uuid user_id FK
        text content
        timestamptz created_at
        timestamptz updated_at
    }

    standup_logs {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text yesterday
        text today
        text blockers
        date log_date
        timestamptz created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        text type
        text title
        text body
        text link
        timestamptz read_at
        timestamptz created_at
    }

    activity_logs {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        text action
        jsonb old_value
        jsonb new_value
        timestamptz created_at
    }

    profiles ||--o{ projects : "sở hữu"
    profiles ||--o{ project_members : "tham gia"
    profiles ||--o{ user_stories : "được giao / báo cáo"
    profiles ||--o{ tasks : "được giao"
    profiles ||--o{ comments : "bình luận"
    profiles ||--o{ standup_logs : "báo cáo daily"
    profiles ||--o{ notifications : "nhận thông báo"
    profiles ||--o{ activity_logs : "thực hiện hành động"
    
    projects ||--o{ project_members : "có thành viên"
    projects ||--o{ sprints : "chứa"
    projects ||--o{ user_stories : "có backlog"
    projects ||--o{ standup_logs : "chứa các standup log"

    sprints ||--o{ user_stories : "chứa các story"
    
    user_stories ||--o{ tasks : "chứa các sub-task"
    user_stories ||--o{ comments : "có bình luận"
    
    tasks ||--o{ comments : "có bình luận"
    tasks ||--o{ activity_logs : "ghi lịch sử cập nhật"
```

---

## 4. Class Diagram (Biểu đồ Lớp)

Biểu diễn kiến trúc phía Front-end của Kollab (React Typescript) gồm các Entity Types, các Hooks xử lý logic nghiệp vụ và các Zustand State Stores.

```mermaid
classDiagram
    class Profile {
        +string id
        +string full_name
        +string email
        +string avatar_url
        +string bio
        +Date created_at
        +Date updated_at
    }

    class Project {
        +string id
        +string name
        +string description
        +string color
        +string owner_id
        +string status
        +Date start_date
        +Date end_date
    }

    class ProjectMember {
        +string id
        +string project_id
        +string user_id
        +string role
        +Date joined_at
        +Profile profile
    }

    class Sprint {
        +string id
        +string project_id
        +string name
        +string goal
        +string status
        +Date start_date
        +Date end_date
        +number velocity
    }

    class Story {
        +string id
        +string project_id
        +string sprint_id
        +string title
        +string description
        +string acceptance_criteria
        +number story_points
        +string priority
        +string status
        +string assignee_id
        +string reporter_id
        +number order_index
        +string labels
        +Profile assignee
        +Profile reporter
    }

    class Task {
        +string id
        +string user_story_id
        +string title
        +string description
        +string status
        +string assignee_id
        +number estimate_hours
        +number actual_hours
        +number story_points
        +string priority
        +string labels
        +Date deadline
        +Profile assignee
        +Story user_story
    }

    class Comment {
        +string id
        +string user_story_id
        +string task_id
        +string user_id
        +string content
        +Date created_at
        +Profile author
    }

    class AuthState {
        +User user
        +Session session
        +boolean isLoading
        +UserRole role
        +setUser(User user)
        +setSession(Session session)
        +setLoading(boolean isLoading)
        +setProjectRole(UserRole role)
        +clearAuth()
    }

    class ProjectState {
        +Project currentProject
        +Project[] projects
        +Sprint currentSprint
        +setCurrentProject(Project project)
        +setProjects(Project[] projects)
        +setCurrentSprint(Sprint sprint)
    }

    class useProjects {
        +projects: Project[]
        +isLoading: boolean
        +createProject(vars) Promise
        +archiveProject(id) Promise
    }

    class useBacklog {
        +stories: Story[]
        +isLoading: boolean
        +createStory(vars) Promise
        +updateStory(vars) Promise
        +deleteStory(id) Promise
        +moveStory(vars) Promise
        +reorderStories(stories) Promise
    }

    class useSprint {
        +sprints: Sprint[]
        +activeSprint: Sprint
        +isLoading: boolean
        +createSprint(vars) Promise
        +startSprint(vars) Promise
        +updateSprint(vars) Promise
        +completeSprint(id) Promise
    }

    %% Relationships
    ProjectMember --> Profile
    Project --> ProjectMember : "has members"
    Project --> Sprint : "has sprints"
    Story --> Profile : "assignee/reporter"
    Story --> Project : "belongs to"
    Story --> Sprint : "optional sprint"
    Task --> Story : "belongs to story"
    Task --> Profile : "assignee"
    Comment --> Story : "belongs to story"
    Comment --> Task : "optional task"
    Comment --> Profile : "author"

    ProjectState --> Project : "manages"
    ProjectState --> Sprint : "manages"
    AuthState --> Profile : "current user"

    useProjects ..> Project : "queries/mutates"
    useBacklog ..> Story : "queries/mutates"
    useSprint ..> Sprint : "queries/mutates"
```

---

## 5. Biểu đồ Tuần tự cho 10 chức năng của Kollab (Sequence Diagrams)

### Chức năng 1: Đăng nhập & Đăng ký (Authentication)
Mô tả quy trình đăng ký tài khoản mới và đăng nhập vào hệ thống Kollab.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant FE as Frontend (React UI)
    participant Store as AuthStore (Zustand)
    participant SB as Supabase Auth
    participant DB as Database (profiles)

    %% Đăng ký
    Note over User, DB: Quy trình Đăng ký tài khoản mới
    User->>FE: Nhập email, password, full_name & click Đăng ký
    FE->>SB: supabase.auth.signUp(email, password, metadata)
    activate SB
    SB->>SB: Tạo auth.user
    SB->>DB: [Trigger] handle_new_user() tự động tạo profile mới
    SB-->>FE: Trả về thông tin Session & User
    deactivate SB
    FE->>Store: setSession(session), setUser(user)
    FE-->>User: Đăng ký thành công, tự động chuyển hướng vào Dashboard

    %% Đăng nhập
    Note over User, DB: Quy trình Đăng nhập
    User->>FE: Nhập email, password & click Đăng nhập
    FE->>SB: supabase.auth.signInWithPassword(email, password)
    activate SB
    SB-->>FE: Trả về Session & User hợp lệ
    deactivate SB
    FE->>Store: setSession(session), setUser(user)
    FE-->>User: Đăng nhập thành công, chuyển hướng tới Dashboard
```

---

### Chức năng 2: Quản lý Dự án (Project Management)
Mô tả quy trình Product Owner khởi tạo một dự án Agile mới trên hệ thống.

```mermaid
sequenceDiagram
    autonumber
    actor PO as Product Owner
    participant FE as ProjectsPage & CreateProjectModal
    participant Hook as useProjects Hook
    participant SB as Supabase API
    participant DB as Database (projects & project_members)

    PO->>FE: Click "Tạo dự án mới", nhập Tên, Mô tả, Ngày bắt đầu/kết thúc
    FE->>Hook: createProject({ name, description, start_date, end_date })
    activate Hook
    Hook->>SB: Gửi lệnh Insert dự án mới vào bảng `projects`
    activate SB
    SB->>DB: Insert vào bảng `projects` (owner_id = user.id)
    DB-->>SB: Trả về thông tin Project vừa tạo
    SB->>DB: Insert record vào bảng `project_members` (user_id = PO, role = 'product_owner')
    DB-->>SB: Thành công
    SB-->>Hook: Trả về đối tượng Project hoàn chỉnh
    deactivate SB
    Hook->>FE: Kích hoạt onSuccess Toast & Invalidate Query cache
    deactivate Hook
    FE-->>PO: Hiển thị thông báo thành công, cập nhật danh sách dự án
```

---

### Chức năng 3: Quản lý Thành viên (Member Management)
Mô tả quy trình thêm thành viên mới vào dự án và gán vai trò Scrum tương ứng.

```mermaid
sequenceDiagram
    autonumber
    actor PO as Product Owner
    participant FE as MemberManagement (MembersPage)
    participant Hook as useMembers Hook
    participant SB as Supabase API
    participant DB as Database (project_members)

    PO->>FE: Nhập email thành viên cần mời & Chọn vai trò (PO, SM, Developer)
    FE->>Hook: inviteMember({ email, role })
    activate Hook
    Hook->>SB: Truy vấn bảng `profiles` tìm user_id theo email
    SB-->>Hook: Trả về Profile của user tìm thấy
    Hook->>SB: Gửi lệnh Insert vào bảng `project_members`
    activate SB
    SB->>DB: Insert (project_id, user_id, role)
    DB-->>SB: Trả về dòng dữ liệu thành viên mới
    SB-->>Hook: Thành công
    deactivate SB
    Hook->>FE: Invalidate query ['members', projectId]
    deactivate Hook
    FE-->>PO: Hiển thị Toast thông báo mời thành viên thành công, cập nhật danh sách
```

---

### Chức năng 4: Quản lý Backlog & User Story (Backlog Management)
Mô tả quy trình Product Owner quản lý danh sách sản phẩm (Product Backlog), tạo các User Story.

```mermaid
sequenceDiagram
    autonumber
    actor PO as Product Owner
    participant FE as BacklogPage & UserStoryFormModal
    participant Hook as useBacklog Hook
    participant SB as Supabase API
    participant DB as Database (user_stories)

    PO->>FE: Click "Tạo User Story", điền thông tin (Tiêu đề, Story Points, Độ ưu tiên)
    FE->>Hook: createStory(storyData)
    activate Hook
    Hook->>SB: Gửi lệnh Insert vào bảng `user_stories`
    activate SB
    SB->>DB: Insert Story (status = 'backlog', reporter_id = current_user)
    DB-->>SB: Trả về Story vừa lưu
    SB-->>Hook: Thành công
    deactivate SB
    Hook->>FE: Invalidate query ['stories', projectId]
    deactivate Hook
    FE-->>PO: Thông báo tạo thành công, cập nhật giao diện Product Backlog
```

---

### Chức năng 5: Lập kế hoạch & Bắt đầu Sprint (Sprint Planning & Activation)
Mô tả quy trình Scrum Master và Product Owner lập kế hoạch cho Sprint mới và kích hoạt Sprint.

```mermaid
sequenceDiagram
    autonumber
    actor SM_PO as Scrum Master / Product Owner
    participant FE as SprintPlanning Page
    participant Hook as useSprint Hook
    participant SB as Supabase API
    participant DB as Database (sprints, user_stories)

    %% Tạo Sprint Planning
    SM_PO->>FE: Click "Tạo Sprint mới", điền Tên Sprint & Goal
    FE->>Hook: createSprint({ name, goal })
    activate Hook
    Hook->>SB: Gửi lệnh Insert Sprint vào bảng `sprints` (status = 'planning')
    SB-->>Hook: Trả về Sprint vừa tạo
    deactivate Hook
    FE-->>SM_PO: Hiển thị Sprint mới trong trạng thái Lên kế hoạch

    %% Kéo Story vào Sprint
    SM_PO->>FE: Kéo thả các User Story từ Backlog vào Sprint mới
    FE->>Hook: moveStory({ storyId, sprintId })
    activate Hook
    Hook->>SB: Update `sprint_id` & `status = 'sprint'` trong bảng `user_stories`
    SB-->>Hook: Thành công
    deactivate Hook

    %% Bắt đầu Sprint
    SM_PO->>FE: Click "Bắt đầu Sprint", chọn Ngày bắt đầu & Ngày kết thúc
    FE->>Hook: startSprint({ sprintId, start_date, end_date })
    activate Hook
    Hook->>SB: Update status của Sprint thành 'active' và lưu ngày bắt đầu/kết thúc
    activate SB
    SB->>DB: Cập nhật status = 'active'
    DB-->>SB: Trả về Sprint
    SB-->>Hook: Thành công
    deactivate SB
    Hook->>FE: Invalidate queries ['activeSprint'], ['stories']
    deactivate Hook
    FE-->>SM_PO: Bắt đầu Sprint thành công, tự động điều hướng sang Bảng Kanban
```

---

### Chức năng 6: Bảng Kanban & Cập nhật Task (Sprint Board & Task Management)
Mô tả quy trình các Developer quản lý các công việc con (Sub-tasks) trên bảng Kanban, cập nhật trạng thái bằng kéo thả, bình luận, và hệ thống sẽ tự động ghi vết (Activity Log) cũng như gửi thông báo (Notification).

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    actor Other as Thành viên khác
    participant FE as SprintBoardPage & KanbanBoard & TaskDetailModal
    participant Hook as useSprint / useRealtimeBoard
    participant SB as Supabase Client
    participant DB as Database & Triggers

    %% Kéo thả Task cập nhật Trạng thái
    Dev->>FE: Kéo thả Task từ "Todo" sang "In Progress" hoặc "Done"
    FE->>Hook: updateTaskStatus({ taskId, status })
    activate Hook
    Hook->>SB: Update `status` trong bảng `tasks`
    activate SB
    SB->>DB: Cập nhật dòng `tasks`
    
    %% Triggers phía Database hoạt động tự động
    Note over DB: Database Trigger:<br/>on_task_updated -> log_task_updates()
    DB->>DB: Tự động ghi nhận log hành động vào bảng `activity_logs`
    
    DB-->>SB: Trả về kết quả thành công
    SB-->>Hook: Thành công
    deactivate SB
    Hook->>FE: Invalidate query ['tasks']
    deactivate Hook
    FE-->>Dev: Cập nhật giao diện Kanban của Developer
    
    %% realtime broadcast
    Note over SB, Other: Supabase Realtime Channel hoạt động
    SB-->>Other: Broadcast thay đổi trạng thái tới các thành viên khác đang online
    Other->>FE: Tự động cập nhật bảng Kanban của họ mà không cần tải lại trang
```

---

### Chức năng 7: Daily Standup (Daily Standup Ceremony)
Mô tả quy trình gửi báo cáo họp đứng hàng ngày của thành viên dự án.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant FE as DailyStandup Page (Nghi thức Scrum)
    participant SB as Supabase API
    participant DB as Database (standup_logs)

    Dev->>FE: Nhập báo cáo: Công việc hôm qua, Dự kiến hôm nay, Trở ngại
    FE->>SB: Insert báo cáo vào bảng `standup_logs`
    activate SB
    SB->>DB: Ghi log báo cáo (project_id, user_id, log_date = current_date)
    DB-->>SB: Trả về dòng dữ liệu đã lưu thành công
    SB-->>FE: Trả về kết quả thành công
    deactivate SB
    FE-->>Dev: Hiển thị thông báo nộp báo cáo thành công, cập nhật danh sách log trong ngày
```

---

### Chức năng 8: Đánh giá Sprint & Đóng Sprint (Sprint Review & Closure)
Mô tả quy trình Scrum Master / Product Owner xem đánh giá Sprint, xử lý các story chưa hoàn thành và chính thức hoàn thành Sprint hiện tại.

```mermaid
sequenceDiagram
    autonumber
    actor SM_PO as Scrum Master / Product Owner
    participant FE as SprintReview Page
    participant Hook as useCompleteSprint Hook
    participant SB as Supabase API
    participant DB as Database (sprints, user_stories)

    SM_PO->>FE: Xem danh sách Story hoàn thành & chưa hoàn thành. Click "Hoàn thành Sprint"
    FE->>Hook: completeSprint(sprintId)
    activate Hook
    
    %% Xử lý các story chưa hoàn thành
    Hook->>SB: Truy vấn các `user_stories` trong sprint có `status !== 'done'`
    SB-->>Hook: Trả về danh sách incomplete stories
    
    alt Có story chưa hoàn thành
        Hook->>SB: Update `sprint_id = null` & `status = 'backlog'` cho các Story này (Đưa về backlog)
        SB-->>Hook: Thành công
    end

    %% Hoàn thành Sprint
    Hook->>SB: Update `status = 'completed'` cho Sprint trong bảng `sprints`
    activate SB
    SB->>DB: Cập nhật trạng thái Sprint
    DB-->>SB: Trả về Sprint đã cập nhật
    SB-->>Hook: Thành công
    deactivate SB
    
    Hook->>FE: Invalidate queries liên quan và chuyển hướng
    deactivate Hook
    FE-->>SM_PO: Thông báo hoàn thành Sprint thành công, chuyển hướng về Backlog
```

---

### Chức năng 9: Họp Cải tiến Sprint (Sprint Retrospective)
Mô tả quy trình cả đội thực hiện nghi thức họp cải tiến Sprint. Chức năng này được lưu trữ và đồng bộ hóa qua LocalStorage theo đặc tả thực tế của Kollab.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant FE as Retrospective Page
    participant LS as LocalStorage (retro-notes-projectId)

    %% Load notes
    FE->>LS: getItem() khi khởi tạo Component
    LS-->>FE: Trả về danh sách ghi chú hiện có
    FE-->>Dev: Hiển thị 3 cột: Went Well, To Improve, Action Items

    %% Thêm note mới
    Dev->>FE: Nhập nội dung vào một cột & Click thêm
    FE->>FE: Tạo note ID ngẫu nhiên, gán authorName & authorId
    FE->>LS: setItem(Updated Notes)
    FE-->>Dev: Hiển thị note mới trên cột tương ứng

    %% Like note
    Dev->>FE: Click "Like" một ghi chú của đồng nghiệp
    FE->>FE: Cập nhật số lượng like và danh sách user đã like
    FE->>LS: setItem(Updated Notes)
    FE-->>Dev: Cập nhật số lượt thích trên giao diện
```

---

### Chức năng 10: Xem Báo cáo & Biểu đồ (Reports & Analytics)
Mô tả quy trình lấy dữ liệu lịch sử để vẽ biểu đồ Burndown Chart và Velocity Chart của dự án.

```mermaid
sequenceDiagram
    autonumber
    actor User as Thành viên dự án
    participant FE as ReportsPage & BurndownChart & VelocityChart
    participant Hook as useReports Hook
    participant SB as Supabase API
    participant DB as Database

    User->>FE: Truy cập trang "Báo cáo" (Reports)
    FE->>Hook: Lấy dữ liệu báo cáo
    activate Hook
    
    %% Lấy dữ liệu Burndown
    Hook->>SB: Query lịch sử trạng thái của các task trong sprint hiện tại
    SB-->>Hook: Trả về dữ liệu ngày tạo, ngày hoàn thành, story points
    
    %% Lấy dữ liệu Velocity
    Hook->>SB: Query danh sách các Sprint đã hoàn thành (completed) và tổng story points đạt được
    SB-->>Hook: Trả về danh sách Sprints & Story Points tương ứng
    
    deactivate Hook
    FE->>FE: Tính toán tọa độ và render biểu đồ SVG/Canvas (ChartJS/Recharts)
    FE-->>User: Hiển thị Biểu đồ Burndown và Biểu đồ Velocity trực quan
```
