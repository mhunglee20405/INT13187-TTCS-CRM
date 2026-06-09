# GymPro - Hướng dẫn chạy dự án

## Yêu cầu

- **Node.js** >= 18
- **MongoDB** đang chạy local (port 27017)
- **npm** >= 9

---

## Cấu trúc thư mục

```
gym-management/
├── server/              # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── models/      # Mongoose models (9 collections)
│   │   ├── controllers/ # Business logic
│   │   ├── routes/      # Express routes
│   │   ├── middlewares/ # JWT auth + RBAC
│   │   ├── seed.ts      # Seed dữ liệu mặc định
│   │   └── index.ts     # Entry point
│   └── .env             # Cấu hình môi trường
└── client/              # React + Vite + TypeScript + Tailwind CSS v3
    └── src/
        ├── api/         # Axios client + API modules
        ├── components/  # UI components (Layout, Modal, Toast, ...)
        ├── contexts/    # Auth context
        ├── pages/       # All pages
        ├── types/       # TypeScript types
        └── utils/       # Helpers (format currency, date, ...)
```

---

## Bước 1: Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên cổng 27017.

**Cách 1** — MongoDB cài local:
```powershell
# Windows: MongoDB thường chạy tự động dưới dạng service
# Kiểm tra:
Get-Service -Name MongoDB
# Nếu chưa chạy:
Start-Service -Name MongoDB
```

**Cách 2** — Docker:
```powershell
docker run -d -p 27017:27017 --name gym-mongo mongo:latest
```

**Cách 3** — MongoDB Atlas: cập nhật `MONGODB_URI` trong `server/.env`

---

## Bước 2: Seed dữ liệu ban đầu

```powershell
cd server
npm run seed
```

Lệnh này sẽ tạo:
- ✅ **Tiers**: Bronze, Silver, Gold, Diamond
- ✅ **Memberships**: Classic, Plus, Royal, Signature
- ✅ **Gifts**: 4 quà tặng mẫu
- ✅ **Users**:
  - Admin: `admin` / `admin123`
  - Lễ tân: `letanvien` / `letanvien123`

---

## Bước 3: Chạy Backend

```powershell
cd server
npm run dev
```

Server chạy tại: `http://localhost:3000`

Health check: `http://localhost:3000/api/health`

---

## Bước 4: Chạy Frontend

```powershell
cd client
npm run dev
```

Client chạy tại: `http://localhost:5173`

---

## Tài khoản mặc định

| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| `admin` | `admin123` | Quản trị viên (toàn quyền) |
| `letanvien` | `letanvien123` | Lễ tân (quyền giới hạn) |

---

## Tính năng

| Module | Admin | Lễ tân |
|---|---|---|
| Đăng nhập | ✅ | ✅ |
| Dashboard thống kê | ✅ | ✅ |
| Xem/thêm/sửa thành viên | ✅ | ✅ |
| Xóa thành viên | ✅ | ❌ |
| Check-in thành viên | ✅ | ✅ |
| Nâng cấp gói tập | ✅ | ✅ |
| Quản lý gói tập | ✅ | ❌ |
| Quản lý hạng thẻ | ✅ | ❌ |
| Quản lý quà tặng | ✅ | ❌ |
| Đổi quà cho thành viên | ✅ | ✅ |
| Gửi thông báo | ✅ | ❌ |
| Quản lý mẫu thông báo | ✅ | ❌ |

---

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Thông tin user hiện tại |
| GET | `/api/members` | Danh sách thành viên |
| POST | `/api/members` | Thêm thành viên |
| POST | `/api/members/:id/checkin` | Check-in |
| POST | `/api/members/:id/add-membership` | Nâng cấp gói |
| GET | `/api/memberships` | Danh sách gói tập |
| GET | `/api/tiers` | Danh sách hạng thẻ |
| GET | `/api/gifts` | Danh sách quà |
| POST | `/api/gifts/redeem` | Đổi quà |
| POST | `/api/notifications/send` | Gửi thông báo |
| GET | `/api/dashboard/stats` | Thống kê dashboard |
