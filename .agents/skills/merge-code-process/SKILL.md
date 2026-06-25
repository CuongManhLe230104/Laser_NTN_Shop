---
name: merge-code-process
description: >-
  Sử dụng quy trình này để xử lý lỗi không thể push code từ nhánh DEV lên main do bị kẹt rebase hoặc hai nhánh có lịch sử không liên quan (unrelated histories).
---

# Quy trình xử lý Merge Code (Merge Code Process)

## Overview
Quy trình này hướng dẫn giải quyết trường hợp không thể push code từ nhánh `DEV` lên nhánh `main` khi:
1. Nhánh `main` và nhánh `DEV` có lịch sử commit không liên quan (unrelated histories).
2. Git bị kẹt ở trạng thái rebase dở dang (`You are currently editing a commit while rebasing...`).

## Workflow
Quy trình thực hiện bao gồm các bước sau:

### 1. Hủy trạng thái Rebase đang bị treo
- Chạy lệnh sau để giải phóng Git khỏi trạng thái rebase đang bị kẹt:
  ```bash
  git rebase --abort
  ```

### 2. Chuyển sang nhánh main local
- Di chuyển sang nhánh `main` để chuẩn bị nhận code mới:
  ```bash
  git checkout main
  ```

### 3. Gộp code từ nhánh DEV vào main
- Chạy lệnh gộp nhánh với tùy chọn cho phép gộp các lịch sử không liên quan (`--allow-unrelated-histories`) và tự động giải quyết xung đột bằng cách ưu tiên code của nhánh `DEV` (`-X theirs`):
  ```bash
  git merge DEV --allow-unrelated-histories -X theirs
  ```
- **Lưu ý**: Nếu muốn xem trước các thay đổi trước khi commit chính thức, có thể thêm cờ `--no-commit`.

### 4. Push code lên Remote main
- Đẩy các thay đổi đã gộp từ nhánh `main` local lên remote GitHub/GitLab:
  ```bash
  git push origin main
  ```

### 5. Quay trở lại nhánh phát triển DEV
- Sau khi hoàn tất push code lên `main`, chuyển lại về nhánh `DEV` để tiếp tục làm việc:
  ```bash
  git checkout DEV
  ```

## Common Mistakes
- **Quên hủy Rebase dở dang**: Cố gắng chạy lệnh `git checkout` hoặc `git merge` khi chưa chạy `git rebase --abort` sẽ bị Git báo lỗi và từ chối.
- **Sử dụng cờ push force (`--force`) bừa bãi**: Nếu nhánh `main` trên remote bị thiết lập là nhánh bảo vệ (protected branch), việc push force sẽ bị từ chối. Sử dụng merge với `--allow-unrelated-histories` là giải pháp an toàn hơn nhiều.
