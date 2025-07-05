# 💼 Storeify

A fully responsive e-commerce web app built with **HTML**, **CSS**, and **JavaScript**, designed to simulate a modern online store using live product data from [FakeStoreAPI](https://fakestoreapi.com/).



---

## 🔗 Live Demo

👉 [View the Demo](https://elkbany.github.io/Storeify/HTML/Home.html)\
*(Replace with your deployed URL once available)*

---

## 📦 Project Overview

Storeify is a client-side web application that simulates an e-commerce experience. It fetches product data dynamically from an external API and renders it using vanilla JavaScript. The app includes features like product browsing, detail views, and cart management — all handled on the front end.

---

## 🚀 Features

- 🔄 **Dynamic product fetching** from a REST API
- 📱 **Responsive design** for desktop, tablet, and mobile
- 🛙️ **Add to cart** functionality with a persistent mini-cart sidebar
- 🛁 **Single-page navigation** behavior using JavaScript
- 💡 Clean UI with CSS transitions and animations
- ✅ Formatted prices and descriptions with intuitive layout
- 📦 Modular file structure

---

## 🤩 Technologies Used

| Tech                                      | Purpose                                  |
| ----------------------------------------- | ---------------------------------------- |
| **HTML5**                                 | Structure and semantics                  |
| **CSS3**                                  | Layout, responsiveness, animations       |
| **JavaScript**                            | Logic, API integration, DOM manipulation |
| [FakeStoreAPI](https://fakestoreapi.com/) | Simulated product data                   |

---

## 📁 Project Structure

```
Storeify/
├── assets/               # Images, icons, and screenshots
│   └── screenshots/      # Optional - for GitHub README
├── CSS/                  # All styling files
│   └── styles.css
├── JS/                   # All JavaScript modules
│   ├── main.js
│   ├── api.js
│   └── cart.js
├── HTML/
│   └── index.html        # Entry point
├── README.md
└── LICENSE
```

---

## ⚙️ Installation & Setup

To run the project locally:

### Prerequisites

- A modern web browser
- A simple local server (recommended for API access)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/elkbany/Storeify.git
   cd Storeify
   ```

2. **Serve the Project**

   Option A: Open `index.html` directly in your browser (basic testing)

   Option B: Use a local server for full functionality

   ```bash
   # Option 1: Using npx
   npx http-server .

   # Option 2: Using Live Server extension (VS Code)
   ```

3. Open your browser and go to `http://localhost:8080` (or provided URL)

---

## 🛙️ Usage Guide

1. Visit the homepage to view all products.
2. Click a product card to view its details.
3. Click **Add to Cart** to add the item.
4. Access the **mini-cart sidebar** to view and remove items.
5. All data resets on refresh (no backend storage).

---

## 🧐 How It Works

- JavaScript fetches product data from `https://fakestoreapi.com/products`.
- Products are rendered dynamically into HTML cards.
- When you click "Add to Cart", it updates an in-memory cart object.
- The cart UI is updated immediately using DOM manipulation.
- There's no backend; it's a purely front-end simulation.

---

## 🔧 To-Do / Roadmap

-

---

## 🧪 Testing

Currently no automated testing is included. For testing purposes:

- Ensure products load successfully from API.
- Try adding/removing items from cart.
- Check layout across screen sizes.

---

## 🤝 Contributing

We welcome contributions from the community!

### Steps to Contribute:

1. Fork this repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.\
See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

Made with ❤️ by the team:

- [Mahmoud Elkbany](https://github.com/elkbany)
- [3laamobarak](https://github.com/3laamobarak)
- [Doha Ahmed Ezzat](https://github.com/doha-98)
- [Mai Abdallah](https://github.com/MaiAbdallah)

---

## 📸 Screenshots

> Add these images in the `assets/screenshots/` folder

| Homepage | Product Details | Mini Cart |
| -------- | --------------- | --------- |
|          |                 |           |

---

## ⭐️ Show Your Support

If you found this project helpful, give it a ⭐️ on [GitHub](https://github.com/elkbany/Storeify)!

