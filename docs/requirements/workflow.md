# **🏗️ PART 1: TECHNICAL ARCHITECTURE (Cấu trúc hệ thống)**

Hệ thống WalrusCLI hoạt động như một **Orchestrator** (người điều phối) nằm giữa máy tính người dùng (Local), mạng lưới lưu trữ Walrus (Storage Layer) và mạng lưới Sui (State Layer).

### **1\. High-Level Data Flow**

Đoạn mã

graph LR

    A\[Local Directory\\n(Dist Folder)\] \--\>|1. Scan & Hash| B(WalrusCLI Engine)

    B \--\>|2. Check Diff| C{State Manager\\n(Local DB)}

    C \--\>|3. New Blobs?| D\[Walrus Aggregator\]

    D \--\>|4. Return Blob IDs| B

    B \--\>|5. Construct Resource Map| E\[Sui Blockchain\]

    E \--\>|6. Update Site Object| F\[Walrus Portal\\n(Gateway)\]

### **2\. Core Modules (Các module lõi của CLI)**

#### **A. The Asset Normalizer (Bộ chuẩn hóa)**

Walrus Sites yêu cầu chính xác về Content-Type và Encoding.

* **Input:** Folder `dist/` hoặc `build/`.  
* **Logic:**  
  * Quét toàn bộ file (recursive).  
  * Tự động gán MIME types (ví dụ: `.html` \-\> `text/html`, `.css` \-\> `text/css`) dựa trên extension.  
  * Nén Gzip/Brotli (Optional) để tiết kiệm phí lưu trữ.

  #### **B. The Smart Diff Engine (Bộ so sánh thông minh) \- *Key Feature***

Đây là nơi tiết kiệm tiền cho user. Thay vì upload lại toàn bộ trang web mỗi lần deploy.

* **Bước 1:** Tính SHA-256 Hash của từng file trong local `dist/`.  
* **Bước 2:** Fetch trạng thái `Resource Object` hiện tại trên Sui (nếu đã từng deploy).  
* **Bước 3:** So sánh:  
  * *Match:* Bỏ qua (Dùng lại Blob ID cũ).  
  * *Mismatch/New:* Đánh dấu cần Upload.

  #### **C. The Blob Uploader (Tương tác Walrus)**

* **Giao thức:** HTTP PUT tới Walrus Aggregator (Publisher).  
* **Optimization:** Sử dụng `Parallel Async Requests` (Rust Tokio) để upload nhiều file cùng lúc, thay vì upload tuần tự.  
* **Output:** Nhận về một danh sách mapping: `File Path` \-\> `Blob ID`.

  #### **D. The Sui Transaction Builder (Tương tác Blockchain)**

Đây là bước "Make it live". CLI thay thế việc người dùng phải thao tác ví thủ công.

* **Hành động:** Tạo một Programmable Transaction Block (PTB).  
* **Nhiệm vụ:**  
  1. Tạo mới (hoặc cập nhật) `Site Object` trên Sui.  
  2. Cập nhật trường `resources` của object đó với bản đồ Blob ID mới.  
  3. Ký giao dịch bằng Private Key (lấy từ Keystore an toàn).

  ---

  # **🚀 PART 2: USER WORKFLOW (Trải nghiệm người dùng)**

Mục tiêu: Người dùng không cần biết "Blob ID" hay "Sui Object ID" là gì. Họ chỉ quan tâm đến Folder Code và Link Website.

### **Workflow 1: The "Zero-to-Hero" Setup (Lần đầu tiên)**

*Giả định: User có source code React/Vue/Static HTML.*

**Initialize:**  
Bash  
walrus init

1.   
   * *System Action:*  
     * Quét thư mục, phát hiện `package.json`.  
     * Hỏi: "Bạn muốn deploy folder nào?" (Gợi ý: `./dist`).  
     * Tạo file `walrus.toml` (Lưu config) và `.walrus/` (Lưu keystore cục bộ).  
     * Tạo ví mới hoặc Import ví (Private key/Seed phrase) an toàn.

   **Deploy:**  
       Bash  
       walrus deploy

2.   
   * *System Action (Hiển thị UI trong Terminal):*  
     * `[Building]` Chạy `npm run build` (nếu cấu hình).  
     * `[Diffing]` "Found 15 files. 15 new files need upload."  
     * `[Uploading]` Progress bar: \[████████░░\] 80% (Upload lên Walrus).  
     * `[Publishing]` Ký transaction cập nhật Sui Object.

   *Result:*  
       Plaintext  
       ✅ Deployment Success\!

   Site ID: 0x123...abc

   Preview: https://0x123...abc.walrus.site

   * 

   ### **Workflow 2: The "Iterative" Update (Cập nhật code hàng ngày)**

*Kịch bản: User sửa 1 file CSS và 1 ảnh logo.*

**Execute:**  
Bash  
walrus deploy

1.   
   * *System Action:*  
     * `[Diffing]` "Found 15 files. **2 changed files** detected." (Tiết kiệm phí upload 13 file kia).  
     * `[Uploading]` Chỉ upload 2 file thay đổi.  
     * `[Publishing]` Cập nhật pointer trên Sui.

   ### **Workflow 3: Domain & Identity (Gắn tên miền)**

*Kịch bản: Thay thế cái link dài ngoằng `0x...` bằng `mysite.sui`.*

**Search & Link:**  
Bash  
walrus domain link mysite.sui

1.   
   * *System Action:*  
     * Check quyền sở hữu `mysite.sui` trong ví người dùng.  
     * Tạo transaction cập nhật trường `content` trong SuiNS Name Object trỏ về `Site ID` của Walrus.

   *Result:*  
       Plaintext  
       🔗 Linked mysite.sui to 0x123...abc

   Access at: https://mysite.walrus.site

   * 

   ---

   # **💡 TECHNICAL DEEP DIVE: The "Resource Map" Structure**

Để tuân thủ chuẩn Walrus Sites, CLI cần tạo ra cấu trúc dữ liệu JSON chính xác để đẩy lên Sui. Đây là cấu trúc mà `walrus deploy` sẽ âm thầm xây dựng:

JSON

// Đây là Resource Map mà CLI sẽ tạo ra và lưu trong Site Object trên Sui

{

  "headers": {

    "/index.html": {

      "Content-Type": "text/html",

      "Content-Encoding": "gzip"

    },

    "/css/style.css": {

      "Content-Type": "text/css"

    }

  },

  "blobs": {

    "/index.html": "blob\_id\_A...", // Blob ID từ Walrus

    "/css/style.css": "blob\_id\_B...",

    "/images/logo.png": "blob\_id\_C..."

  }

}

### **Điểm tối ưu của bạn so với Manual:**

1. **Auto-MIME:** Người dùng hay quên set `Content-Type`, dẫn đến việc browser không render được (download file thay vì hiển thị). CLI sẽ tự động xử lý việc này.  
2. **SPA Routing:** Nếu là React/Vue App, CLI có thể tự động cấu hình quy tắc "Fallback" (tất cả route 404 đều trỏ về `index.html`) \- điều mà làm thủ công rất hay sai.  
   

