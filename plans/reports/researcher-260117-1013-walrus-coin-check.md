# Nghiên cứu Logic kiểm tra số dư WAL (Pre-flight Balance Check)

Dựa trên phân tích mã nguồn từ `walrus-sites-deploy`, đây là cách logic xử lý token WAL đang hoạt động và cách chúng ta sẽ áp dụng vào WalrusCLI.

## 1. Cơ chế hiện tại trong `walrus-sites-deploy`

- **Công cụ sử dụng**: Sử dụng các lệnh wrapper của Suibase là `twalrus get-wal` (testnet) và `mwalrus get-wal` (mainnet).
- **Logic mua WAL**:
    - Lệnh `get-wal` sẽ tự động đổi một lượng SUI sang WAL (mặc định khoảng 0.5 WAL).
    - Logic này chỉ chạy khi người dùng thêm flag `-b` hoặc `--buy-wal-before-run`.
    - Nếu lệnh mua thất bại, script chỉ hiển thị cảnh báo (warning) và vẫn tiếp tục quá trình deploy.
- **Thiếu sót**: Hiện tại chưa có bước kiểm tra số dư (balance check) thực tế trước khi chạy lệnh deploy. Nó chỉ "thử vận may" bằng cách chạy lệnh mua WAL.

## 2. Đề xuất cho WalrusCLI (MVP)

Để cải thiện trải nghiệm người dùng (UX), WalrusCLI nên thực hiện "Pre-flight Balance Check" thông minh hơn:

1.  **Kiểm tra số dư trước**: Sử dụng `sui client balance` hoặc các lệnh tương đương của Suibase (`tsui client balance`) để lấy số dư WAL hiện tại.
2.  **Cảnh báo chủ động**: Nếu WAL = 0, thông báo cho người dùng và hỏi xem họ có muốn tự động mua WAL (nếu có SUI) hoặc hướng dẫn họ cách nạp tiền.
3.  **Tích hợp vào `walrus deploy`**:
    - Bước 1: Kiểm tra cấu hình wallet.
    - Bước 2: Kiểm tra số dư WAL.
    - Bước 3: Nếu thiếu WAL, thử thực hiện `get-wal` (nếu người dùng cho phép).
    - Bước 4: Nếu vẫn không đủ WAL, dừng lại và thông báo lỗi rõ ràng thay vì để binary của Walrus Sites báo lỗi khó hiểu.

## 3. Các lệnh cần sử dụng (Suibase)

- Lấy địa chỉ ví: `tsui client active-address`
- Kiểm tra số dư: `tsui client balance`
- Đổi SUI sang WAL: `twalrus get-wal`

## Câu hỏi còn tồn tại
1. Chúng ta có nên mặc định tự động mua WAL nếu thiếu không, hay luôn yêu cầu flag `-b`?
2. Mức phí (gas) ước tính cho một lần publish/update là bao nhiêu để đưa ra cảnh báo chính xác?
