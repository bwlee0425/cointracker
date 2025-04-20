import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white">
      {/* Vite & React logos */}
      <div className="flex space-x-12 mb-12">
        <a href="https://vite.dev" target="_blank" className="transform transition-all hover:scale-110">
          <img src={viteLogo} className="logo w-32 h-32" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="transform transition-all hover:scale-110">
          <img src={reactLogo} className="logo w-32 h-32" alt="React logo" />
        </a>
      </div>
      {/* Main heading */}
      <h1 className="text-6xl font-extrabold mb-8">Vite + React + TailwindCSS</h1>
      {/* Card with button */}
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Count: {count}</h2>
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 transition-all"
        >
          Increase Count
        </button>
      </div>
      {/* Code snippet */}
      <p className="mt-8 text-lg">Edit <code className="font-mono text-blue-300">src/App.jsx</code> and save to test HMR</p>
      {/* Documentation link */}
      <p className="mt-4 text-lg">
        Click on the Vite and React logos to learn more
      </p>
      {/* Tailwind background section */}
      <div className="mt-12 bg-green-500 p-6 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold">TailwindCSS is working!</h2>
        <p className="mt-4 text-xl">This is a beautiful, customizable component.</p>
      </div>
    </div>
  )
}

export default App
