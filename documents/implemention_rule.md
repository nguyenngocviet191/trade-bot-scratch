# Implementation Rule

Bạn nên kiểm tra và tiếp tục công việc chưa được check trước. Vui lòng xin phép xác nhận trước khi triển khai.

2.  **Review Technical Design document (TDD) và Task:**
    *   Cẩn thận review các sections liên quan của <technical_design_document>.md, chú ý đặc biệt đến:
        *   Overview
        *   Requirements (Functional và Non-Functional)
        *   Technical Design (Data Model Changes, API Changes, Logic Flow, Dependencies, Security, Performance)
    *   Hiểu rõ mô tả task cụ thể từ checklist.
    *   Đặt câu hỏi làm rõ nếu *bất cứ điều gì* không rõ ràng. *Không* tiến hành cho đến khi bạn hiểu đầy đủ task và mối quan hệ của nó với TDD.

3.  **Triển khai Task:**
    *   Viết code tuân thủ TDD và coding standards.
    *   Tuân theo Domain-Driven Design principles.
    *   Sử dụng tên biến và method mô tả.

    *   Viết unit tests cho tất cả functionality mới.
    *   Sử dụng appropriate design patterns (CQRS, v.v.).
    *   Tham chiếu relevant files và classes sử dụng file paths.
    *   Nếu TDD không hoàn chỉnh hoặc không chính xác, *dừng lại* và yêu cầu làm rõ hoặc đề xuất cập nhật TDD *trước khi* tiến hành.
    *   Nếu bạn gặp phải issues hoặc roadblocks không mong đợi, *dừng lại* và yêu cầu hướng dẫn.

4.  **Cập nhật Checklist:**
    *   *Ngay lập tức* sau khi hoàn thành task và verify tính chính xác của nó (bao gồm tests), đánh dấu item tương ứng trong <task_file>.md là done. Sử dụng syntax sau:
        ```markdown
        - [x] Task 1: Description (Completed)
        ```
        Thêm "(Completed)" vào task.
    *   *Không* đánh dấu task là done cho đến khi bạn tự tin rằng nó được triển khai đầy đủ và tested theo TDD.

5.  **Commit Changes (Prompt):**
    * Sau khi hoàn thành task *và* cập nhật checklist, thông báo rằng task đã sẵn sàng để commit. Sử dụng prompt như:
      ```
      Task [Task Number] is complete and the checklist has been updated. Ready for commit.
      ```
    * Bạn sau đó sẽ được prompt cho commit message. Cung cấp commit message mô tả tuân theo Conventional Commits format:
        *   `feat: Add new feature`
        *   `fix: Resolve bug`
        *   `docs: Update documentation`
        *   `refactor: Improve code structure`
        *   `test: Add unit tests`
        *   `chore: Update build scripts`

6.  **Lặp lại:** Lặp lại steps 1-5 cho mỗi task trong checklist.

## Coding Standards và Conventions (Nhắc nhở)

- tuân theo (`./coding-standarts.md`)

## Nguyên tắc chung

*   **Accuracy:** Code *phải* chính xác phản ánh TDD. Nếu có mâu thuẫn, *dừng lại* và làm rõ.
* **Checklist Discipline:** *Luôn luôn* cập nhật checklist ngay lập tức khi hoàn thành task.