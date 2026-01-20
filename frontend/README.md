# Performix

Performix is a powerful web application designed to track, analyze, and optimize individual and organizational performance. By leveraging advanced machine learning algorithms, Performix provides actionable insights to help users reach their full potential.

## 🚀 Key Features

*   **Organization Management**: Easily create and manage organizations. Add members and assign roles to streamline performance tracking.
*   **Performance Dashboard**: A comprehensive dashboard that visualizes key performance indicators (KPIs) and trends over time.
*   **Intelligent Analysis**: Built-in analytics engine that interprets data to identify strengths and areas for improvement.
*   **Secure & Scalable**: Robust authentication and database management powered by Supabase.

### 🧠 Machine Learning Integration
Performix utilizes a suite of advanced machine learning models to provide deep insights:

*   **K-Nearest Neighbors (KNN)**: For clustering similar performance profiles and recommending peer-based improvements.
*   **Linear & Logistic Regression**: To predict future performance trends and outcomes based on historical data.
*   **Decision Tree & Random Forest Classifiers**: For classifying performance metrics and identifying critical success factors.

## 🛠️ Tech Stack

*   **Frontend**: [Next.js](https://nextjs.org/) (React Framework), TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth)

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/davidvensilinr/Performix.git
    cd Performix
    ```

2.  **Navigate to the frontend directory**
    ```bash
    cd frontend
    ```

3.  **Install dependencies**
    ```bash
    npm install
    ```

4.  **Set up Environment Variables**
    Create a `.env.local` file in the `frontend` directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.
