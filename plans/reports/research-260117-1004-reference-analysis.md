# Báo cáo Phân tích Dự án Tham khảo: walrus-sites-deploy
**Ngày:** 2026-01-17
**Tệp nguồn phân tích:** `repomix-output.xml` (Project: `walrus-sites-deploy`)

## 1. Kiến trúc Dự án Tham khảo

Dự án tham khảo là một CLI wrapper đơn giản, hiệu quả được xây dựng bằng TypeScript. Mục tiêu chính là trừu tượng hóa sự phức tạp khi sử dụng các binary gốc (`site-builder`, `walrus`) và tích hợp chặt chẽ với hệ sinh thái Suibase.

### Đặc điểm chính:
*   **Minimalist**: Không có quá nhiều lớp abstraction. Logic tập trung vào việc gọi CLI con và xử lý I/O.
*   **Suibase-centric**: Dựa hoàn toàn vào công cụ `Suibase` để quản lý môi trường (localnet, testnet, mainnet) và binary.
*   **Environment-based Config**: Sử dụng file `.env.local` như nguồn chân lý (Source of Truth) cho trạng thái deploy (lưu `WALRUS_SITE_OBJECT_ID`).

## 2. Cơ chế Config & Binary

### Quản lý Config
*   **Thư viện**: Sử dụng `env-file-rw` để đọc/ghi file `.env.local` mà không làm mất định dạng file.
*   **Logic**:
    *   Trước khi chạy, kiểm tra biến `WALRUS_SITE_OBJECT_ID` trong `.env.local`.
    *   Nếu chưa có -> Chế độ **Publish** (Tạo mới).
    *   Nếu đã có -> Chế độ **Update** (Cập nhật).
    *   Sau khi Publish thành công, tự động ghi `WALRUS_SITE_OBJECT_ID` mới vào file `.env.local`.

### Quản lý Binary
*   **Cách tiếp cận**: "Bring Your Own Binary" (BYOB) thông qua Suibase.
*   **Command Mapping**:
    *   Testnet: Gọi `tsite` (site-builder) và `twalrus` (walrus CLI).
    *   Mainnet: Gọi `msite` và `mwalrus`.
    *   Localnet: Gọi `local-site` và `local-walrus`.
*   **Lợi ích**: Không cần logic tải/cập nhật binary phức tạp trong code dự án.

## 3. Quy trình Deploy (The "Secret Sauce")

File `src/deploy.ts` tiết lộ quy trình chuẩn đã được kiểm chứng thực tế:

1.  **Preparation**:
    *   Kiểm tra số dư WAL (qua `get-wal`).
    *   Xác định môi trường (testnet/mainnet).
2.  **Execution**:
    *   Sử dụng `child_process.spawn` để gọi lệnh binary.
    *   **Publish Command**: `[binary] publish --epochs [n] [path_to_dist]`
    *   **Update Command**: `[binary] update --force --epochs [n] [path_to_dist] [object_id]`
3.  **Parsing Output**:
    *   Lắng nghe luồng `stdout` của tiến trình con.
    *   Sử dụng Regex để bắt Object ID mới: `/New site object ID: (.+)/`.
    *   Bỏ qua các cảnh báo (warnings) từ `stderr` để tránh báo lỗi giả.
4.  **State Persistence**:
    *   Ghi ngay lập tức Object ID bắt được vào config file.

## 4. So sánh & Đề xuất Điều chỉnh cho WalrusCLI

Dưới đây là bảng phân tích khoảng cách (Gap Analysis) và các hành động cần thiết để điều chỉnh WalrusCLI theo hướng "Best Practice".

| Hạng mục | Dự án Tham khảo (Best Practice) | Kế hoạch WalrusCLI Hiện tại | Đề xuất Điều chỉnh |
| :--- | :--- | :--- | :--- |
| **Quản lý Binary** | Dựa vào Suibase (User phải cài trước) | Tự tải và quản lý version (như CCS) | **Giữ nguyên hướng tự quản lý (Self-managed)**. Đây là điểm mạnh của WalrusCLI (Zero setup). Tuy nhiên, nên thêm logic kiểm tra nếu máy user đã có `site-builder` thì dùng luôn. |
| **Lưu trạng thái** | `.env.local` | File config JSON riêng (`walrus.config.json`) | **Áp dụng Hybrid**. `walrus.config.json` để cấu hình build, nhưng **Object ID nên hỗ trợ ghi vào .env** để code frontend dễ dàng access. |
| **Logic Update** | Gọi `update` command của binary | Đang định tự implement logic diffing | **Học theo Reference**. Giai đoạn đầu, hãy wrap lệnh `site-builder update` thay vì tự viết lại logic diffing phức tạp. **KISS & YAGNI**. |
| **UX Flow** | Tự động chuyển đổi Publish/Update dựa trên config | Người dùng chọn lệnh | **Tự động hóa**. Lệnh `walrus deploy` nên thông minh: nếu chưa có ID -> Publish, có rồi -> Update. |
| **Output Parsing** | Regex trên stdout | (Chưa chi tiết) | **Áp dụng Regex**. Đây là cách đáng tin cậy nhất để lấy ID từ CLI tool hiện tại. |

### Các thay đổi cụ thể cần thực hiện:

1.  **Cập nhật `CLAUDE.md`**:
    *   Thêm quy tắc ưu tiên sử dụng `site-builder` binary cho các tác vụ publish/update thay vì tự implement API calls.
    *   Nhấn mạnh vào việc parse output CLI bằng Regex.

2.  **Điều chỉnh Phase 2 Plan**:
    *   Thay đổi task "Implement Smart Diffing" thành "Integrate `site-builder update` command".
    *   Thêm task "Implement `.env` file integration" để đọc/ghi Object ID.
    *   Thêm task "Implement stdout parsing logic" cho binary wrapper.

3.  **Kiến trúc Binary Manager**:
    *   Thêm logic `resolveBinary`: Kiểm tra `PATH` hệ thống trước -> nếu không có mới tải về thư mục local.
