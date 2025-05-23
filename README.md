# MB-Backend


# 🛠️ Blog App Backend (Node.js + MySQL)

This is the backend of my blog application where users can register, login, create posts, edit their own posts, and view public posts. It is built using Node.js, Express, and MySQL.

---

## 💡 My Approach

To solve the problem statement, I decided to keep the backend RESTful and secure. I created a token-based authentication system using JWT. Each user can create, update, and delete their own blog posts only. The post data includes title, content, and status (public/private). Public posts are accessible to anyone.

I handled permissions strictly — only post owners can update or delete their posts. I also used parameterized queries with MySQL to avoid SQL injection.

---

## 🤖 How I used AI

While building the backend, I used **ChatGPT** for:

- Generating structure and logic for auth middleware
- Handling async/await and error messages
- Clarifying how JWT and route protection works
- Refactoring routes and queries
- Getting help when stuck with edge cases

I used **GitHub Copilot** inside VS Code to speed up writing repetitive code like error handling, route structures, and response formats.

---

📌 API Reference
Check the mindAPI.pdf file in the root folder for the Postman collection with all available routes, methods, request formats, and required headers.
