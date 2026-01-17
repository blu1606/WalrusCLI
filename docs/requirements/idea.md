# **📑 PROJECT REPORT: WALRUS CLI & ANALYTICS**

Project Name: WalrusCLI

Tagline: The Intelligent Wrapper & Deployment Analytics Engine for Walrus.

Vision: Biến quy trình deploy dApp thành trải nghiệm "Zero-Friction" minh bạch, an toàn và tối ưu chi phí.

---

## **1\. Problem Statement (Phân tích nỗi đau thị trường)**

Developer Experience (DX) của Walrus hiện tại gặp 3 rào cản lớn:

1. **The "Black Box" Problem:** Output JSON thô từ công cụ gốc không cho biết user thực sự tốn bao nhiêu tiền (Net Cost) hay nhận lại bao nhiêu Rebate.  
2. **Environment Fragility (Sự mỏng manh của môi trường):** Các tool hiện tại dễ gãy đổ nếu binary không nằm đúng chỗ, hoặc xung đột phiên bản.  
3. **State Management:** User phải nhớ Site ID thủ công để update, dễ dẫn đến việc tạo site mới thay vì update site cũ (gây lãng phí và mất domain).  
   ---

   ## **2\. Solution: The "Robust Glass Box" Architecture**

**WalrusCLI** là một lớp **Smart Wrapper** được gia cố (hardened), tự động hóa quy trình nhưng đảm bảo sự minh bạch tuyệt đối.

### **Chiến lược cốt lõi:**

* **Adaptive Environment Resolution:** Tự động săn tìm binary site-builder trong hệ thống ($PATH, thư mục cài đặt mặc định) hoặc cho phép trỏ thủ công. Không bao giờ "break" vì lỗi đường dẫn.  
* **Context-Aware Orchestration:** Tự động phát hiện ngữ cảnh (First Deploy vs. Update) để gọi lệnh tối ưu.  
* **📊 Triple-Layer Cost Analysis (New):** Phân tích chi phí theo 3 lớp: Gross Cost (Phí gộp) \-\> Rebate (Hoàn tiền) \-\> Net Cost (Thực trả), giúp User thấy rõ hiệu quả kinh tế.  
  ---

  ## **3\. Key Features (Tính năng trọng tâm)**

  ### **A. Context-Aware Deployment**

* **Cơ chế:** CLI tự động quét walrus.config.toml.  
  * *Auto-Update:* Nếu phát hiện site\_id, tự động chuyển sang mode update để tận dụng cơ chế Incremental Upload của Walrus.  
  * *Safety Check:* Kiểm tra sự tồn tại của binary trước khi chạy, đề xuất cài đặt hoặc fix path nếu thiếu.

  ### **B. On-Chain Log Analytics (The "Wow" Factor)**

Dashboard TUI cung cấp cái nhìn tài chính chuẩn xác (Accuracy First):

* **Gross Cost:** Tổng SUI bị trừ ban đầu (Gas \+ Storage Deposit).  
* **Storage Rebate:** Lượng SUI được hoàn lại do dọn dẹp dữ liệu cũ (cơ chế đặc trưng của Sui/Walrus).  
* **Net Cost:** Số tiền thực tế user mất đi.  
  * *Thông điệp:* "Bạn thấy phí là 1 SUI, nhưng thực tế bạn chỉ mất 0.01 SUI nhờ Rebate".

  ### **C. Hybrid Interface (CLI \+ Tauri Companion)**

* **CLI:** Giao diện chính, hỗ trợ flag \--walrus-binary-path cho các môi trường CI/CD tùy biến.  
* **Tauri UI:** Visual Dashboard để xem biểu đồ chi phí theo thời gian.  
  ---

  ## **4\. Technical Architecture (Kiến trúc kỹ thuật)**

  ### **Stack chi tiết & Cơ chế xử lý lỗi:**

1. **Environment Resolver (Rust):**  
   * Sử dụng crate which để tìm binary trong $PATH.  
   * Fallback: Tìm trong \~/.walrus/bin.  
   * Override: Chấp nhận flag \--bin \<path\> từ user.  
2. **Core Wrapper:**  
   * std::process::Command gọi binary chính chủ.  
   * serde\_json parse output thô.  
3. **Financial Engine:**  
   * Logic tính toán: Net\_Cost \= (Gas\_Computation \+ Storage\_Fee) \- Storage\_Rebate.  
   * Query Sui RPC để lấy dữ liệu này từ TransactionEffects.  
4. **Analytics Module (TUI):**  
   * ratatui render bảng báo cáo.

   ---

   ## **5\. User Workflow: The "Analytics" Experience**

**Step 1: The Command (With flexibility)**

Bash

\# Standard

walrus deploy 

\# Or custom path (for power users/CI)

walrus deploy \--bin /usr/local/custom/walrus

**Step 2: The Orchestration**

Plaintext

\> \[Env\]       Binary found at: /usr/local/bin/site-builder (v0.5.1)

\> \[Context\]   Detected existing Site ID: 0x7a...9f (Update Mode)

\> \[Wrapper\]   Delegating to official binary...

\> \[Chain\]     Transaction executed. Analyzing financial effects...

Step 3: The Insight (Triple-Layer Cost Report)

Terminal hiện bảng báo cáo tài chính minh bạch:

Plaintext

┌────────────────────────────────────────────────────────┐

│  🚀 DEPLOYMENT SUCCESSFUL | v2.1.0 | 2s ago            │

├────────────────────────────────────────────────────────┤

│  🔗 TX Digest: 5Hn8...kP9z (View on Suiscan)           │

├───────────────────────┬────────────────────────────────┤

│  💰 COST BREAKDOWN    │  📦 EFFICIENCY STATS           │

│  • Gross Gas:   1.050 │  • Total Blobs:  45            │

│  • Storage Fee: 0.200 │  • New Blobs:    2  (Uploaded) │

│  • Rebate:     \-1.240 │  • Reused:       43 (Skipped)  │

│  \-------------------- │                                │

│  • NET COST:    0.010 │  ⚡ REBATE COVERED 99% COST    │

└───────────────────────┴────────────────────────────────┘

*Điểm nhấn:* Dòng **"REBATE COVERED 99% COST"** chính là thứ khiến User yêu thích tool này và hiểu được sức mạnh của hệ sinh thái Sui.

---

## **6\. Success Metrics (Chỉ số đo lường)**

| Metric | Mục tiêu | Ý nghĩa |
| :---- | :---- | :---- |
| **Setup Success Rate** | \> 99% | Nhờ cơ chế Auto-detect Path thông minh. |
| **Cost Transparency** | 100% | User luôn biết Net Cost vs Gross Cost. |
| **User Savings** | \> 80% | Tối ưu hóa chi phí nhờ Rebate và Incremental Update. |

---

## **7\. Strategic Advantages (Lợi thế cạnh tranh)**

1. **Best of Both Worlds:** Kết hợp sự ổn định của Official Tool \+ Trải nghiệm người dùng (UX) đỉnh cao của WalrusCLI.  
2. **Educational Value:** Giúp người dùng mới hiểu cách Walrus hoạt động (thông qua việc nhìn thấy số lượng Blobs Reused/New).  
3. **Low Maintenance:** Vì không tự viết logic upload/hashing, team phát triển giảm được 50% gánh nặng bảo trì code khi Walrus update protocol.

