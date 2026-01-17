# Brainstorm: Điều chỉnh Chiến lược dựa trên "Best Practice"
**Ngày:** 2026-01-17
**Tham chiếu:** `walrus-sites-deploy` (Best Practice Project)

## 1. Tóm tắt vấn đề
Chúng ta đã có một dự án mẫu (`walrus-sites-deploy`) đã deploy thành công thực tế. Dự án này sử dụng cách tiếp cận cực kỳ đơn giản (KISS): wrap binary `site-builder` và dùng `.env` để quản lý trạng thái.
Kế hoạch hiện tại của chúng ta (WalrusCLI) đang có xu hướng phức tạp hóa (Over-engineering) một số phần như "Smart Diffing" tự viết và quản lý config phức tạp.

## 2. Các điểm cần điều chỉnh (Alignment Strategy)

### 2.1 Deployment Logic: "Wrap, Don't Reinvent"
*   **Hiện tại**: Định tự viết logic diff file và upload từng phần.
*   **Best Practice**: Gọi thẳng binary `site-builder publish` và `site-builder update`. Binary này đã được Mysten Labs tối ưu việc diffing và merkle tree construction.
*   **Quyết định**: Chuyển sang wrapper approach.
    *   `walrus deploy` sẽ gọi `site-builder update --force [id]` nếu tìm thấy ID.
    *   Chỉ khi binary gốc thiếu tính năng nghiêm trọng mới tự implement.

### 2.2 Configuration & State: "Hybrid Approach"
*   **Hiện tại**: `walrus.config.json` cho mọi thứ.
*   **Best Practice**: `.env.local` cho Site ID.
*   **Quyết định**:
    *   Vẫn dùng `walrus.config.json` cho các cấu hình tĩnh (dir, epochs, rules).
    *   **Thêm tính năng**: Tự động đọc/ghi `WALRUS_SITE_OBJECT_ID` vào file `.env` của người dùng. Điều này cực kỳ quan trọng cho Developer Experience (DX) vì frontend code thường đọc ID từ biến môi trường này.

### 2.3 Binary Management: "Smart Resolution"
*   **Hiện tại**: Luôn tải binary về `~/.walrus/bin`.
*   **Best Practice**: Dựa vào `PATH` (Suibase).
*   **Quyết định**:
    1.  Kiểm tra xem `site-builder` có trong `PATH` không? (Hỗ trợ người dùng đã cài Suibase/Walrus).
    2.  Nếu có -> Dùng luôn.
    3.  Nếu không -> Tự tải về `~/.walrus/bin` (Giữ tính năng Zero-setup của chúng ta).

### 2.4 Error Handling & Parsing
*   **Quyết định**: Implement Regex parser để bắt Output từ binary (đặc biệt là `New site object ID`). Đây là cách giao tiếp đáng tin cậy nhất với công cụ dòng lệnh này hiện tại.

## 3. Kế hoạch hành động (Action Plan)

1.  **Cập nhật `CLAUDE.md`**:
    *   Thêm nguyên tắc: **"Prefer wrapping official binaries over reimplementing core logic"**.
    *   Thêm yêu cầu về **Regex Parsing** cho CLI output.

2.  **Cập nhật `AGENTS.md`**:
    *   Bổ sung pattern: `ChildProcess Wrapper` thay vì chỉ là API Client.

3.  **Cập nhật Plan Phase 2**:
    *   Xóa task: "Implement custom file diffing logic".
    *   Thêm task: "Implement `.env` reader/writer".
    *   Sửa task: "Implement deploy command" thành "Implement binary wrapper for publish/update".

## 4. Kết luận
Việc điều chỉnh này sẽ giúp chúng ta:
*   **Giảm rủi ro**: Dùng logic core của Mysten Labs (đã kiểm chứng).
*   **Tiết kiệm thời gian**: Bớt code logic phức tạp.
*   **Tăng tương thích**: Integrate tốt hơn với các dự án frontend (qua `.env`).
