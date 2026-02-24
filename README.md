Certainly! Here is a professionally formatted, modern README for your repository. I’ve refined the language to be more descriptive and structured it for high scannability, while ensuring your specific repository links are front and center.

---

# 💸 TSender UI

A high-performance, **100% client-side** interface built for interacting with the **TSender** smart contract ecosystem. This UI allows users to manage bulk transfers and interact with the protocol directly from their browser without a centralized backend.

* **Original Smart Contracts:** [Cyfrin/TSender](https://github.com/Cyfrin/TSender/)
* **Source Reference:** [Cyfrin/TSender-UI](https://github.com/cyfrin/tsender-ui)

---

## 🚀 Quick Start

### 1. System Requirements

Before you begin, ensure you have the following tools installed and verified:

| Requirement | Command to Verify | Expected Output (Min) |
| --- | --- | --- |
| **Node.js** | `node --version` | `v23.0.0+` |
| **pnpm** | `pnpm --version` | `10.0.0+` |
| **Git** | `git --version` | `2.33.0+` |

### 2. Environment Configuration

Create a file named `.env.local` in the root directory. You will need a Project ID from [Reown Cloud](https://cloud.reown.com/):

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

```

### 3. Installation & Local Development

Follow these steps to get your local environment running:

```bash
# Clone your specific repository
git clone https://github.com/kazbek-d/cyfrin.ts-tsender-ui-cu.git
cd cyfrin.ts-tsender-ui-cu

# Install dependencies
pnpm install

# Start the local Anvil blockchain
pnpm anvil

```

> **Pro Tip:** Connect your MetaMask or Rabby wallet to your local Anvil instance. Use the accounts provided by Anvil to access mock tokens for testing.

In a **separate terminal tab**, launch the web application:

```bash
pnpm run dev

```

---

## 🧪 Testing Suite

### Unit Testing

To run logic and component-level tests:

```bash
pnpm test:unit

```

### End-to-End (e2e) Testing

We use Playwright and Synpress to simulate real user interactions.

1. **Initialize Cache:**
```bash
pnpm cache

```


2. **Handle Cache Hash:**
If `pnpm test:e2e` throws an error regarding a missing cache (e.g., `Error: Cache for [HASH] does not exist`):
* Open the `.cache-synpress` folder.
* Find the folder that is **not** named `metamask-chrome-***`.
* Rename that folder to match the `[HASH]` displayed in your error message.


3. **Run Tests:**
```bash
pnpm test:e2e

```



---

## 🛠 Features & Architecture

* **Zero Backend:** All logic is executed via the browser and the blockchain.
* **Modern Stack:** Built with Next.js, Tailwind CSS, and Viem/Wagmi.
* **Wallet Integration:** Seamless connection via Reown (WalletConnect).

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
